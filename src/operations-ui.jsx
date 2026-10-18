import React, {useState,useRef} from 'react';
import {Upload,Download,Check,Users,Plus,Handshake} from 'lucide-react';
import {readTourFile,downloadTourTemplate} from './import-tours.mjs';

// Reuse TaskHub's accessible controls and API client in these bounded workflows.
export function createOperationsUI({Modal,Button,Field,ErrorBox,Empty,Badge,api,money,date}) {
  function ImportTours({onClose,onSave}) {
    const [rows,setRows]=useState(null),[preview,setPreview]=useState(null),[error,setError]=useState(''),[busy,setBusy]=useState(false),[saved,setSaved]=useState(false);
    const importId=useRef(crypto.randomUUID());
    async function choose(e) {
      const file=e.target.files[0];if(!file)return;
      setBusy(true);setRows(null);setPreview(null);setError('');setSaved(false);importId.current=crypto.randomUUID();
      try {
        const data=await readTourFile(file);
        if(new TextEncoder().encode(JSON.stringify({rows:data})).byteLength>250000)throw Error('Nội dung quá dài. Chia nhỏ thành nhiều đợt nhập.');
        const result=await api('/tours/import','POST',{rows:data,preview:true});setRows(data);setPreview(result);
      }catch(e){setError(e.message);}finally{setBusy(false);}
    }
    async function save() {
      setBusy(true);setError('');
      try {const result=await api('/tours/import','POST',{rows,import_id:importId.current});setSaved(true);await onSave(result.count);onClose();}
      catch(e){setError(e.message);}finally{setBusy(false);}
    }
    return <Modal title="Nhập tour từ Excel" subtitle="Chọn tệp, kiểm tra rồi nhập một lần. Tour mới là bản nháp." onClose={onClose} wide>
      <div className="import-guide"><Upload size={25}/><div><strong>.xlsx hoặc .csv · tối đa 20 tour</strong><p>Tệp tối đa 2 MB. Ngày dạng YYYY-MM-DD hoặc DD/MM/YYYY; tiền VND và số khách là số nguyên, không có dấu phân cách hàng nghìn.</p></div></div>
      <Button variant="ghost" onClick={downloadTourTemplate}><Download size={16}/>Tải mẫu CSV cho Excel</Button>
      <Field label="Tệp tour Excel hoặc CSV"><input type="file" accept=".xlsx,.csv" disabled={busy||saved} onChange={choose} data-track="tour:import-file"/></Field><ErrorBox error={error}/>
      {busy&&!rows&&<p className="loading">Đang đọc và kiểm tra tệp…</p>}
      {preview&&<><div className={'import-result '+(preview.errors.length?'invalid':'valid')}><strong>{preview.count} / {rows.length} dòng hợp lệ</strong><p>{preview.errors.length?'Chưa nhập dữ liệu. Sửa các dòng lỗi và chọn lại tệp.':'Ngày, số chỗ và các trường bắt buộc đã được kiểm tra. Tour chưa được công khai.'}</p></div>
        {!!preview.errors.length&&<ul className="import-errors">{preview.errors.map(e=><li key={e.row}>Dòng {e.row}: {e.message}</li>)}</ul>}
        <div className="import-preview">{rows.slice(0,5).map((t,i)=><div key={i}><strong>{t.title||`Dòng ${i+2}`}</strong><span>{t.destination} · {t.departure} · {t.capacity??'?'} chỗ</span></div>)}{rows.length>5&&<p>Và {rows.length-5} tour khác.</p>}</div></>}
      <div className="modal-actions"><Button variant="ghost" onClick={onClose}>Đóng</Button><Button disabled={busy||saved||!preview||preview.errors.length>0} onClick={save}>{busy?'Đang nhập…':saved?'Đã nhập':'Nhập '+(rows?.length||0)+' tour'}<Check size={16}/></Button></div>
    </Modal>;
  }
  function SeatEditor({tour,minimumReserved,onClose,onSave}) {
    const [error,setError]=useState(''),[busy,setBusy]=useState(false);
    async function submit(e){e.preventDefault();setBusy(true);setError('');try{await api('/tours/'+tour.id,'PUT',{...tour,published:!!tour.published,reserved:Number(new FormData(e.target).get('reserved'))});await onSave();onClose();}catch(e){setError(e.message);}finally{setBusy(false);}}
    return <Modal title="Cập nhật số khách" subtitle={tour.title} onClose={onClose}><form onSubmit={submit}><ErrorBox error={error}/><p className="muted">Khởi hành {date(tour.departure)} · Sức chứa {tour.capacity} khách.</p><Field label="Khách đã giữ chỗ" hint={`Bao gồm ${minimumReserved} khách ghép đã xác nhận. Portal sẽ cập nhật số chỗ còn lại.`}><input type="number" name="reserved" defaultValue={tour.reserved} min={minimumReserved} max={tour.capacity} required autoFocus/></Field><div className="modal-actions"><Button type="button" variant="ghost" onClick={onClose}>Hủy</Button><Button disabled={busy}>{busy?'Đang lưu…':'Lưu số khách'}<Check size={16}/></Button></div></form></Modal>;
  }
  function PoolingEditor({tours,pool,onClose,onSave}) {
    const [error,setError]=useState(''),[busy,setBusy]=useState(false);
    async function submit(e){e.preventDefault();setBusy(true);setError('');const b=Object.fromEntries(new FormData(e.target));try{if(pool)await api('/pooling/'+pool.id,'PATCH',{action:'payment',paid:Number(b.paid),version:pool.version});else await api('/pooling','POST',{...b,seats:Number(b.seats),unit_price:Number(b.unit_price)});await onSave();onClose();}catch(e){setError(e.message);}finally{setBusy(false);}}
    return <Modal title={pool?'Đối soát tiền đã thu':'Tạo phiếu ghép tour'} subtitle={pool?pool.partner+' · '+pool.tour_title:'Ghi nhận thỏa thuận với đối tác; xác nhận chỗ ở bước tiếp theo.'} onClose={onClose}><form onSubmit={submit}><ErrorBox error={error}/>
      {pool?<><div className="pool-payment-summary"><span>{pool.seats} khách × {money(pool.unit_price)}</span><strong>Phải thu: {money(pool.seats*pool.unit_price)}</strong></div><Field label="Tổng tiền đã ghi nhận thu (VND)" hint="Nhập tổng lũy kế đã đối chiếu. Đây là sổ theo dõi, không xử lý giao dịch thanh toán."><input name="paid" type="number" min="0" max={pool.seats*pool.unit_price} defaultValue={pool.paid} required/></Field></>:<>
        <Field label="Tour ghép"><select name="tour_id" required defaultValue=""><option value="" disabled>Chọn tour đã có lịch và số chỗ</option>{tours.map(t=><option key={t.id} value={t.id}>{t.title} · {date(t.departure)} · còn {t.capacity-t.reserved} chỗ</option>)}</select></Field>
        <Field label="Tên đối tác"><input name="partner" required maxLength="120" placeholder="Nhập tên đơn vị đã thỏa thuận"/></Field><div className="form-grid"><Field label="Số khách ghép"><input type="number" name="seats" min="1" max="1000" required/></Field><Field label="Giá net thỏa thuận / khách (VND)"><input type="number" name="unit_price" min="0" max="1000000000" required/></Field></div><Field label="Ghi chú thỏa thuận"><textarea name="note" rows="3" maxLength="1000"/></Field>
      </>}
      <div className="modal-actions"><Button type="button" variant="ghost" onClick={onClose}>Hủy</Button><Button disabled={busy}>{busy?'Đang lưu…':pool?'Lưu đối soát':'Tạo phiếu ghép'}<Check size={16}/></Button></div>
    </form></Modal>;
  }
  const status={pending:'Chờ xác nhận',confirmed:'Đã xác nhận',cancelled:'Đã hủy'};
  function Pooling({data,readOnly,onNew,onPayment,reload,notify}) {
    const [busy,setBusy]=useState(''),[cancel,setCancel]=useState(null);
    const pools=data.pooling||[],confirmed=pools.filter(p=>p.status==='confirmed'),tours=Object.fromEntries(data.tours.map(t=>[t.id,t]));
    async function action(row,kind){setBusy(row.id);try{await api('/pooling/'+row.id,'PATCH',{action:kind,version:row.version,tour_version:tours[row.tour_id]?.version});setCancel(null);await reload();notify(kind==='confirm'?'Đã xác nhận ghép. Số chỗ tour đã cập nhật.':'Đã hủy phiếu. Chỗ đã giữ được trả lại.');}catch(e){notify(e.message,'error');await reload().catch(()=>{});}finally{setBusy('');}}
    return <><div className="pooling-notice"><Handshake size={21}/><div><strong>Ghép tour và đối soát tập trung</strong><p>Điều hành ghi nhận thỏa thuận với đối tác. Phiếu chờ chưa giữ chỗ; xác nhận sẽ cộng số khách vào tour. Bản này chưa có đăng nhập hoặc phê duyệt từ phía đối tác.</p></div></div>
      <div className="pool-stats"><div><span>Phiếu chờ xác nhận</span><strong>{pools.filter(p=>p.status==='pending').length}</strong></div><div><span>Khách ghép đã xác nhận</span><strong>{confirmed.reduce((s,p)=>s+p.seats,0)}</strong></div><div><span>Còn phải thu theo sổ</span><strong>{money(confirmed.reduce((s,p)=>s+p.seats*p.unit_price-p.paid,0))}</strong></div></div>
      <div className="pool-toolbar"><span className="muted">{pools.length} phiếu · trong không gian này</span><a className="btn ghost" href="/api/pooling/export" data-track="pooling:export"><Download size={16}/>Đối soát CSV</a></div>
      {!pools.length?<Empty title="Chưa có phiếu ghép tour">Tạo phiếu từ thỏa thuận với đối tác. Không cần nhập dữ liệu khách hàng cá nhân.{!readOnly&&<Button disabled={!data.tours.length} onClick={onNew}>Tạo phiếu ghép<Plus size={16}/></Button>}</Empty>:<div className="pool-list">{pools.map(p=><article className="pool-card" key={p.id}><div className="pool-card-heading"><div><strong>{p.partner}</strong><p>{p.tour_title} · {date(p.departure)}</p></div><Badge tone={p.status==='confirmed'?'blue':'gray'}>{status[p.status]}</Badge></div><div className="pool-card-facts"><div><span>Khách ghép</span><strong>{p.seats} khách</strong></div><div><span>Giá net / khách</span><strong>{money(p.unit_price)}</strong></div><div><span>Đã ghi nhận thu</span><strong>{money(p.paid)}</strong></div><div><span>Còn phải thu</span><strong>{p.status==='cancelled'?'—':money(p.seats*p.unit_price-p.paid)}</strong></div></div>{p.note&&<p className="pool-note">{p.note}</p>}
        {!readOnly&&p.status!=='cancelled'&&<div className="pool-card-actions">{p.status==='pending'?<Button disabled={!!busy} onClick={()=>action(p,'confirm')} data-track="pooling:confirm">Xác nhận ghép<Check size={16}/></Button>:<Button variant="ghost" onClick={()=>onPayment(p)} data-track="pooling:payment">Ghi nhận thu</Button>}<Button variant="ghost" disabled={!!busy||p.paid>0} onClick={()=>setCancel(p)} data-track="pooling:cancel">Hủy phiếu</Button>{p.paid>0&&<small>Đối soát số tiền về 0 trước khi hủy.</small>}</div>}
      </article>)}</div>}
      {cancel&&<Modal title="Hủy phiếu ghép tour?" subtitle={cancel.partner} onClose={()=>setCancel(null)}><p>{cancel.status==='confirmed'?`${cancel.seats} chỗ đã giữ sẽ được trả lại cho tour.`:'Phiếu chờ chưa giữ chỗ nên số chỗ tour không thay đổi.'} Thỏa thuận với đối tác cần được xử lý riêng.</p><div className="modal-actions"><Button variant="ghost" onClick={()=>setCancel(null)}>Giữ phiếu</Button><Button variant="danger" disabled={!!busy} onClick={()=>action(cancel,'cancel')}>Xác nhận hủy phiếu</Button></div></Modal>}
    </>;
  }
  return {ImportTours,SeatEditor,PoolingEditor,Pooling};
}
