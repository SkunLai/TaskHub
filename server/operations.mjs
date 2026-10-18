import {randomUUID} from 'node:crypto';
const fail=(message,status=400)=>{throw Object.assign(new Error(message),{status});};
const integer=(n,label,min,max)=>{if(!Number.isSafeInteger(n)||n<min||n>max)fail(label+' không hợp lệ.');return n;};
const text=(v,label,max)=>{if(typeof v!=='string'||!v.trim()||v.trim().length>max)fail(label+' không hợp lệ.');return v.trim();};
const now=()=>new Date().toISOString();
const event=(u,action,entity)=>['admin','reviewer'].includes(u.role)?[]:[['INSERT INTO events VALUES (?,?,?,?,?)',[randomUUID(),u.id,action,entity,now()]]];

export async function importTours(db,u,b,tourInput) {
  if(!Array.isArray(b.rows)||!b.rows.length||b.rows.length>20)fail('Chọn từ 1 đến 20 dòng tour.');
  if(b.preview!==true) {
    if(typeof b.import_id!=='string'||!/^[a-f0-9-]{36}$/i.test(b.import_id))fail('Mã đợt nhập không hợp lệ.');
    if(await db.prepare('SELECT id FROM tours WHERE id=?').get(b.import_id+'-0'))fail('Đợt này đã được nhập. Tải lại danh sách trước khi thử tiếp.',409);
  }
  const identity = t => [t.title,t.destination,t.departure].map(v=>String(v).trim().toLocaleLowerCase('vi')).join('\u0000');
  const known=new Set((await db.prepare('SELECT title,destination,departure FROM tours WHERE workspace=?').all(u.workspace)).map(identity));
  const errors=[],rows=[];
  for(const [index,row] of b.rows.entries()) {
    try {
      if(!row||typeof row!=='object'||Array.isArray(row))fail('Dòng dữ liệu không hợp lệ.');
      const values=tourInput({...row,theme:row.theme||'danang',published:false});
      if(values[6]>values[5])fail('Số khách đã giữ vượt sức chứa.');
      const key=identity(row);if(known.has(key))fail('Tour cùng tên, điểm đến và ngày đi đã có trong tệp hoặc không gian này.');known.add(key);
      rows.push(values);
    }catch(e){errors.push({row:Number.isSafeInteger(row?._row)&&row._row>=2&&row._row<=1000000?row._row:index+2,message:e.message});}
  }
  if(b.preview===true)return {count:rows.length,errors};
  if(errors.length)fail('Chưa nhập dữ liệu. Sửa dòng '+errors[0].row+': '+errors[0].message);
  const ids=rows.map((_,i)=>b.import_id+'-'+i);
  const statements=[];
  for(const [i,values] of rows.entries())statements.push(['INSERT INTO tours VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',[ids[i],u.workspace,...values,1,now()]]);
  if(!['admin','reviewer'].includes(u.role))statements.push([`INSERT INTO events SELECT id||':created',?,?,id,? FROM tours WHERE workspace=? AND id IN (${ids.map(()=>'?').join(',')})`,[u.id,'tour_created',now(),u.workspace,...ids]]);
  try{await db.batch(statements);}catch(e){if(String(e.message).includes('UNIQUE'))fail('Đợt này đã được nhập. Tải lại danh sách.',409);throw e;}
  return {count:rows.length,ids};
}

export async function createPooling(db,u,b) {
  const partner=text(b.partner,'Tên đối tác',120),seats=integer(b.seats,'Số khách',1,1000),price=integer(b.unit_price,'Giá net / khách',0,1e9);
  const note=typeof b.note==='string'?b.note.trim():'';
  if(note.length>1000)fail('Ghi chú tối đa 1.000 ký tự.');
  if(!await db.prepare('SELECT id FROM tours WHERE id=? AND workspace=?').get(b.tour_id,u.workspace))fail('Tour không tồn tại.',404);
  const id=randomUUID(),at=now();
  await db.batch([['INSERT INTO pooling(id,workspace,tour_id,partner,seats,unit_price,paid,status,note,version,created,updated) VALUES (?,?,?,?,?,?,0,?,?,1,?,?)',[id,u.workspace,b.tour_id,partner,seats,price,'pending',note,at,at]],...event(u,'pooling_created',id)]);
  return {id};
}

export async function updatePooling(db,u,id,b) {
  const version=integer(b.version,'Phiên bản',1,1e9);
  const row=await db.prepare('SELECT * FROM pooling WHERE id=? AND workspace=?').get(id,u.workspace);
  if(!row)fail('Không tìm thấy phiếu ghép tour.',404);
  let sql,args,action;
  if(b.action==='confirm') {
    if(row.status!=='pending')fail('Chỉ xác nhận phiếu đang chờ.',409);
    const tourVersion=integer(b.tour_version,'Phiên bản tour',1,1e9);
    sql="UPDATE pooling SET status='confirmed',version=version+1,updated=? WHERE id=? AND workspace=? AND version=? AND status='pending' AND EXISTS(SELECT 1 FROM tours WHERE id=pooling.tour_id AND workspace=? AND version=?)";
    args=[now(),id,u.workspace,version,u.workspace,tourVersion];action='pooling_confirmed';
  } else if(b.action==='cancel') {
    if(row.status==='cancelled')fail('Phiếu đã hủy.',409);
    if(row.paid>0)fail('Phiếu đã ghi nhận thu. Cần đối soát về 0 trước khi hủy.');
    sql="UPDATE pooling SET status='cancelled',version=version+1,updated=? WHERE id=? AND workspace=? AND version=? AND paid=0";
    args=[now(),id,u.workspace,version];action='pooling_cancelled';
  } else if(b.action==='payment') {
    if(row.status!=='confirmed')fail('Chỉ đối soát thu trên phiếu đã xác nhận.');
    const paid=integer(b.paid,'Số tiền đã ghi nhận thu',0,row.seats*row.unit_price);
    sql="UPDATE pooling SET paid=?,version=version+1,updated=? WHERE id=? AND workspace=? AND version=? AND status='confirmed'";
    args=[paid,now(),id,u.workspace,version];action='pooling_reconciled';
  } else fail('Thao tác không hợp lệ.');
  // Versioned UPDATE + seat triggers execute in the same atomic statement.
  const result=await db.batch([[sql,args],...(['admin','reviewer'].includes(u.role)?[]:[['INSERT INTO events SELECT ?,?,?,?,? WHERE changes()=1',[randomUUID(),u.id,action,id,now()]]])]);
  if(!result[0].changes)fail('Phiếu hoặc tour đã thay đổi. Tải lại trước khi tiếp tục.',409);
  return {ok:true};
}

export async function recordInteractions(db,u,b) {
  if(['admin','reviewer'].includes(u.role))return {count:0};
  if(!Array.isArray(b.events)||!b.events.length||b.events.length>50)fail('Lô tương tác không hợp lệ.');
  const statements=b.events.map(e=>{
    const id=text(e.id,'Mã tương tác',36);
    if(!/^[a-f0-9-]{36}$/i.test(id)||!['click','change'].includes(e.kind))fail('Tương tác không hợp lệ.');
    const control=text(e.control,'Mã điều khiển',120),area=text(e.area,'Vị trí',40);
    if(!/^[a-z0-9_:./-]+$/i.test(control)||!/^[a-z0-9_:/-]+$/i.test(area))fail('Mã điều khiển không hợp lệ.');
    if(typeof e.at!=='string'||!/^\d{4}-\d{2}-\d{2}T/.test(e.at)||!Number.isFinite(Date.parse(e.at)))fail('Thời gian không hợp lệ.');
    const target=typeof e.target==='string'&&/^[a-z0-9_-]{1,100}$/i.test(e.target)?e.target:undefined;
    return ['INSERT OR IGNORE INTO events VALUES (?,?,?,?,?)',[id,u.id,'ui_'+e.kind,JSON.stringify({control,area,client_at:new Date(e.at).toISOString(),target}),now()]];
  });
  await db.batch(statements);return {count:statements.length};
}

export function operationError(e) {
  const messages={POOL_TOUR:'Tour không thuộc không gian này.',POOL_IMMUTABLE:'Điều khoản đã lưu không thể thay đổi. Hủy phiếu và tạo lại nếu cần.',POOL_STATE:'Trạng thái phiếu không hợp lệ.',POOL_PAYMENT:'Cần đối soát tiền đã ghi nhận thu về 0 trước khi hủy.',POOL_NO_SEATS:'Tour không còn đủ chỗ để xác nhận.',POOL_RESERVED_FLOOR:'Số khách đã giữ phải bao gồm các khách ghép tour đã xác nhận.',POOL_ACTIVE:'Tour còn phiếu ghép hoặc số tiền đã ghi nhận. Hoàn tất đối soát và hủy phiếu trước khi xóa tour.'};
  for(const [key,message] of Object.entries(messages))if(String(e.message).includes(key))return {message,status:409};
  return e;
}
