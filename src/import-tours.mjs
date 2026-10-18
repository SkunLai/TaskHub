export const importColumns=['title','destination','departure','duration','price','capacity','reserved','description','itinerary'];
const aliases={ten_tour:'title',diem_den:'destination',ngay_khoi_hanh:'departure',khoi_hanh:'departure',thoi_luong:'duration',gia:'price',gia_khach:'price',suc_chua:'capacity',khach_da_giu_cho:'reserved',mo_ta:'description',lich_trinh:'itinerary'};
const key=s=>String(s??'').trim().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').replace(/Đ/g,'D').toLowerCase().replace(/[^a-z0-9]+/g,'_').replace(/^_|_$/g,'');
export function csvRows(input) {
  const text=String(input).replace(/^\uFEFF/,''),first=text.split(/\r?\n/,1)[0];
  const delimiter=first.includes(';')?';':first.includes('\t')?'\t':',';
  const rows=[];let row=[],v='',quoted=false,closed=false;
  for(let i=0;i<text.length;i++) {
    const c=text[i];
    if(quoted){if(c==='"'&&text[i+1]==='"'){v+='"';i++;}else if(c==='"'){quoted=false;closed=true;}else v+=c;continue;}
    if(c==='"'){if(v||closed)throw Error('Dấu nháy trong CSV không hợp lệ.');quoted=true;}
    else if(c===delimiter||c==='\n'||c==='\r') {row.push(v);v='';closed=false;if(c!==delimiter){if(c==='\r'&&text[i+1]==='\n')i++;if(row.some(x=>x!==''))rows.push(row);row=[];}}
    else {if(closed)throw Error('Ký tự thừa sau dấu nháy CSV.');v+=c;}
  }
  if(quoted)throw Error('CSV thiếu dấu nháy đóng.');
  if(v||row.length){row.push(v);if(row.some(x=>x!==''))rows.push(row);}
  return rows;
}
export function rowsToTours(matrix) {
  if(!Array.isArray(matrix)||matrix.length<2)throw Error('Tệp chưa có dòng tour. Điền dữ liệu dưới hàng tiêu đề.');
  const headers=matrix[0].map(c=>aliases[key(c)]||key(c));
  if(new Set(headers).size!==headers.length)throw Error('Tiêu đề cột bị trùng.');
  const missing=importColumns.filter(c=>!headers.includes(c));
  if(missing.length)throw Error('Thiếu cột: '+missing.join(', ')+'. Tải mẫu để đối chiếu.');
  const values=matrix.slice(1).map((cells,index)=>({cells,row:index+2})).filter(r=>r.cells.some(v=>v!==null&&v!==undefined&&v!==''));
  if(!values.length||values.length>20)throw Error('Mỗi đợt nhập từ 1 đến 20 tour.');
  return values.map(({cells,row:rowNumber},index)=>{
    if(cells.length>headers.length)throw Error('Dòng '+(index+2)+' có nhiều ô hơn tiêu đề.');
    const row=Object.fromEntries(importColumns.map(k=>[k,cells[headers.indexOf(k)]??'']));
    row._row=rowNumber;
    for(const k of ['price','capacity','reserved']) {
      const s=String(row[k]).trim();
      row[k]=typeof row[k]==='number'?row[k]:/^\d+$/.test(s)?Number(s):null;
    }
    if(row.departure instanceof Date)row.departure=row.departure.toISOString().slice(0,10);
    else {const s=String(row.departure).trim(),m=/^(\d{2})\/(\d{2})\/(\d{4})$/.exec(s);row.departure=m?`${m[3]}-${m[2]}-${m[1]}`:s;}
    for(const k of ['title','destination','duration','description','itinerary'])row[k]=typeof row[k]==='string'?row[k].trim():'';
    return row;
  });
}
function checkZip(buffer) {
  const d=new DataView(buffer);let end=-1;
  for(let i=buffer.byteLength-22;i>=Math.max(0,buffer.byteLength-65557);i--)if(d.getUint32(i,true)===0x06054b50){end=i;break;}
  if(end<0)throw Error('Tệp XLSX không hợp lệ.');
  const count=d.getUint16(end+10,true);let offset=d.getUint32(end+16,true),total=0;
  if(count>500)throw Error('Tệp có quá nhiều thành phần. Dùng mẫu tour gọn hơn.');
  for(let i=0;i<count;i++) {
    if(offset+46>buffer.byteLength||d.getUint32(offset,true)!==0x02014b50)throw Error('Cấu trúc XLSX không hợp lệ.');
    total+=d.getUint32(offset+24,true);
    if(total>10*1024*1024)throw Error('Nội dung XLSX quá lớn sau khi giải nén.');
    offset+=46+d.getUint16(offset+28,true)+d.getUint16(offset+30,true)+d.getUint16(offset+32,true);
  }
}
export async function readTourFile(file) {
  if(file.size>2*1024*1024)throw Error('Chọn tệp tối đa 2 MB, tối đa 20 tour.');
  let matrix;
  if(/\.xlsx$/i.test(file.name)) {
    const buffer=await file.arrayBuffer();checkZip(buffer);
    const {readSheet}=await import('read-excel-file/browser');
    matrix=await readSheet(buffer,{sheet:1});
  } else if(/\.csv$/i.test(file.name)) matrix=csvRows(await file.text());
  else throw Error('Chọn tệp .xlsx hoặc .csv. Tệp .xls cũ cần lưu lại thành .xlsx.');
  return rowsToTours(matrix);
}
export function downloadTourTemplate() {
  const blob=new Blob(['\uFEFF'+importColumns.join(',')+'\r\n'],{type:'text/csv;charset=utf-8'});
  const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='taskhub-tour-template.csv';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
