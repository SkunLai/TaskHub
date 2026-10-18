// Offline aggregates for An's two protected raw CSV tabs; never invent responses.
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {parseCsv} from './research-report.mjs';
const specification=JSON.parse(readFileSync(new URL('../docs/CP3_SURVEY.json',import.meta.url),'utf8'));
const features=specification.features.map(([id,name])=>({id,name}));
export const testerFields=['email','consent_at','consent_version','role','company_size','features_seen_or_used','test_started_at','test_finished_at','liked','disliked','monthly_price_vnd','price_status','observer_note'];
export const featureFields=['email','feature','mode','result','importance','ease','intent','observed_at','comment'];
const norm=v=>String(v??'').trim().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').replace(/Đ/g,'D').toLowerCase().replace(/[^a-z0-9]+/g,'_').replace(/^_|_$/g,'');
const choice=(v,groups)=>Object.entries(groups).find(([,aliases])=>aliases.some(a=>norm(a)===norm(v)))?.[0];
const emailKey=v=>String(v??'').trim().toLowerCase();
const validEmail=e=>/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
const qaEmail=e=>/@(?:example\.test|example\.com|example\.invalid)$/.test(e)||['admin@taskhub.local','reviewer@taskhub.local'].includes(e);
function timestamp(s){
  const m=String(s||'').match(/^(\d{4})-(\d{2})-(\d{2})T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?(?:Z|[+-]\d{2}:\d{2})$/);
  if(!m||!Number.isFinite(Date.parse(s)))return null;
  const day=new Date(Date.UTC(+m[1],+m[2]-1,+m[3]));
  return day.getUTCFullYear()===+m[1]&&day.getUTCMonth()===+m[2]-1&&day.getUTCDate()===+m[3]?Date.parse(s):null;
}
const rating=v=>String(v??'').trim()===''?null:/^[1-5]$/.test(String(v).trim())?Number(v):undefined;
const score=values=>({n:values.length,mean:values.length?Number((values.reduce((a,b)=>a+b,0)/values.length).toFixed(2)):null,distribution:Object.fromEntries([1,2,3,4,5].map(n=>[n,values.filter(v=>v===n).length]))});
function table(input,headers,label){const t=parseCsv(input);if(t.headers.length&&headers.some(h=>!t.headers.includes(h)))throw Error('Sai loại tệp '+label+' hoặc thiếu cột bắt buộc.');return t.rows;}
const modeOptions={self:['self','Tự dùng','Tự thao tác'],demo:['demo','Xem demo','Chỉ xem demo']};
const resultOptions={completed:['completed','Tự hoàn thành'],assisted:['assisted','Cần trợ giúp'],incomplete:['incomplete','Chưa hoàn thành'],viewed:['viewed','Chỉ xem','Chỉ xem demo'],untried:['untried','Chưa thử']};
const intentOptions={yes:['yes','Có'],maybe:['maybe','Cân nhắc'],no:['no','Không'],na:['na','Không áp dụng','Chưa thử','Không áp dụng/Chưa thử']};

export function summarizeSurvey(testerCsv,featureCsv){
  const testers=table(testerCsv,testerFields,'Raw_testers'),raw=table(featureCsv,featureFields,'Raw_features');
  const excluded={testerInvalid:0,testerQa:0,testerDuplicates:0,featureInvalid:0,featureQa:0,featureDuplicates:0,withoutConsentedTester:0,untried:0,priceInvalid:0};
  const latest=new Map();
  // Raw_testers has no modified_at: last row for an email is authoritative.
  // Validate AFTER deduplication so an old positive row cannot replace a correction.
  for(const r of testers){const email=emailKey(r.email);if(!validEmail(email)){excluded.testerInvalid++;continue;}if(qaEmail(email)){excluded.testerQa++;continue;}if(latest.has(email))excluded.testerDuplicates++;latest.set(email,r);}
  const consented=new Map();
  for(const [email,r]of latest){
    const consent=timestamp(r.consent_at),start=r.test_started_at?timestamp(r.test_started_at):null,end=r.test_finished_at?timestamp(r.test_finished_at):null;
    if(consent===null||!r.consent_version?.trim()||(r.test_started_at&&(start===null||start<consent))||(r.test_finished_at&&(end===null||end<(start??consent)))){excluded.testerInvalid++;continue;}
    consented.set(email,{...r,consent});
  }
  const latestFeatures=new Map();
  for(const r of raw){
    const email=emailKey(r.email),feature=features.find(f=>[f.id,f.name].some(v=>norm(v)===norm(r.feature)))?.id;
    if(!validEmail(email)||!feature){excluded.featureInvalid++;continue;}if(qaEmail(email)){excluded.featureQa++;continue;}
    const key=email+'|'+feature,previous=latestFeatures.get(key);
    if(previous)excluded.featureDuplicates++;
    // Missing/invalid timestamps remain visible as invalid; do not fall back.
    const currentTime=timestamp(r.observed_at),previousTime=previous?timestamp(previous.observed_at):null;
    if(!previous||currentTime===null||previousTime===null||currentTime>=previousTime)latestFeatures.set(key,{...r,email,feature});
  }
  const valid=[];
  for(const r of latestFeatures.values()){
    const tester=consented.get(r.email);if(!tester){excluded.withoutConsentedTester++;continue;}
    const at=timestamp(r.observed_at),mode=choice(r.mode,modeOptions),result=choice(r.result,resultOptions),intent=choice(r.intent,intentOptions),importance=rating(r.importance),ease=rating(r.ease);
    if(at===null||at<tester.consent||!mode||!result||!intent||importance===undefined||ease===undefined||(mode==='demo'&&ease!==null)||(mode==='self'&&result==='viewed')||(mode==='demo'&&!['viewed','untried'].includes(result))){excluded.featureInvalid++;continue;}
    if(result==='untried'){excluded.untried++;continue;}
    valid.push({email:r.email,feature:r.feature,mode,result,intent,importance,ease});
  }
  const experienced=new Set(valid.map(r=>r.email));
  const prices=[];let priceUnknown=0;
  for(const email of experienced){const r=consented.get(email),value=String(r.monthly_price_vnd??'').trim(),state=norm(r.price_status);
    if(!value){priceUnknown++;continue;}
    if(!/^\d+$/.test(value)||!Number.isSafeInteger(Number(value))||!['','provided','value','da_tra_loi'].includes(state)){excluded.priceInvalid++;continue;}
    prices.push(Number(value));
  }
  prices.sort((a,b)=>a-b);
  const intents=rows=>Object.fromEntries(['yes','maybe','no','na'].map(k=>[k,rows.filter(r=>r.intent===k).length]));
  return {testerRows:testers.length,featureRows:raw.length,consentedEmailRecords:consented.size,experiencedEmailRecords:experienced.size,minimum20EmailRecords:experienced.size>=20,independentPeopleVerified:false,excluded,
    features:features.map(f=>{const rows=valid.filter(r=>r.feature===f.id),self=rows.filter(r=>r.mode==='self'),demo=rows.filter(r=>r.mode==='demo');return {...f,self:self.length,demo:demo.length,results:Object.fromEntries(['completed','assisted','incomplete','viewed'].map(k=>[k,rows.filter(r=>r.result===k).length])),importance:score(rows.map(r=>r.importance).filter(v=>v!==null)),easeSelf:score(self.map(r=>r.ease).filter(v=>v!==null)),intentSelf:intents(self),intentDemo:intents(demo)};}),
    willingnessToPay:{n:prices.length,unknown:priceUnknown,zero:prices.filter(v=>v===0).length,min:prices[0]??null,median:prices.length?(prices[Math.floor((prices.length-1)/2)]+prices[Math.floor(prices.length/2)])/2:null,max:prices.at(-1)??null},
    limitations:['Email và consent do nhóm ghi nhận, chưa xác minh 20 cá nhân độc lập hoặc mẫu đại diện.','Tự dùng và xem demo được báo riêng. Chưa thử hoặc không chấm điểm không được đổi thành 0.','Không đối chiếu log web trong lệnh này; ghép với CSV có quyền và người thử thật bằng bản gốc riêng.','Mức trả là mô tả mẫu, không phải giá bán đã chốt; không tự quyết định Iterate/Persevere.','Không xuất email, tên hoặc ý kiến mở; nhóm đọc/mã hóa ý kiến ở bản gốc giới hạn quyền.','Raw_testers trùng email: giữ dòng cuối CSV. Raw_features trùng email/tính năng: giữ observed_at mới nhất, cùng mốc thì dòng cuối; bản mới sai không được thay bằng bản cũ thuận lợi hơn.']};
}

export function surveyMarkdown(s){
  const show=v=>v===null?'Chưa có dữ liệu':new Intl.NumberFormat('vi-VN').format(v);
  return '# Tổng hợp đánh giá tính năng TaskHub\n\n'+(s.experiencedEmailRecords?'Có bản ghi để nhóm đối chiếu người thử thật.':'CHƯA CÓ DỮ LIỆU ĐÁNH GIÁ HỢP LỆ.')+'\n\n'
    +`- Email đồng ý hợp lệ: ${s.consentedEmailRecords}; email có đánh giá tính năng: ${s.experiencedEmailRecords}.\n- Ngưỡng 20 email: ${s.minimum20EmailRecords?'Đủ số bản ghi; CHƯA xác minh 20 cá nhân.':'CHƯA ĐỦ.'}\n\n`
    +'| Tính năng | Tự dùng | Xem demo | Quan trọng /5 (n) | Dễ dùng /5 chỉ tự dùng (n) |\n| --- | ---: | ---: | --- | --- |\n'
    +s.features.map(f=>`| ${f.name} | ${f.self} | ${f.demo} | ${show(f.importance.mean)} (${f.importance.n}) | ${show(f.easeSelf.mean)} (${f.easeSelf.n}) |`).join('\n')
    +'\n\n## Ý định theo tính năng\n\n'
    +s.features.map(f=>`- ${f.name}: tự dùng Có ${f.intentSelf.yes}, Cân nhắc ${f.intentSelf.maybe}, Không ${f.intentSelf.no}, Không áp dụng ${f.intentSelf.na}; xem demo Có ${f.intentDemo.yes}, Cân nhắc ${f.intentDemo.maybe}, Không ${f.intentDemo.no}, Không áp dụng ${f.intentDemo.na}.`).join('\n')
    +`\n\n## Mức sẵn sàng trả\n\nCó giá trị: ${s.willingnessToPay.n}; trả 0: ${s.willingnessToPay.zero}; trung vị: ${show(s.willingnessToPay.median)} VND/tháng.\n\n## Kiểm tra dữ liệu\n\n`
    +Object.entries(s.excluded).map(([key,n])=>`- ${key}: ${n}`).join('\n')+'\n\n## Giới hạn\n\n'+s.limitations.map(t=>'- '+t).join('\n')+'\n';
}
export function runSurvey(args){
  if(args.length!==3)throw Error('Dùng: npm run survey:report -- Raw_testers.csv Raw_features.csv thu-muc-bao-cao');
  const inputs=args.slice(0,2).map(p=>resolve(p)),dir=resolve(args[2]),json=resolve(dir,'survey-summary.json'),md=resolve(dir,'survey-summary.md');
  if(inputs.some(p=>[json,md].some(o=>o.toLowerCase()===p.toLowerCase())))throw Error('Không được ghi đè dữ liệu gốc.');
  const s=summarizeSurvey(...inputs.map(p=>readFileSync(p,'utf8')));mkdirSync(dir,{recursive:true});
  writeFileSync(json,JSON.stringify(s,null,2)+'\n');writeFileSync(md,surveyMarkdown(s));return s;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){try{const s=runSurvey(process.argv.slice(2));console.log(`Đã tạo báo cáo tổng hợp: ${s.experiencedEmailRecords} email có đánh giá; chưa xác minh số người thật.`);}catch(e){console.error(e.message);process.exitCode=1;}}
