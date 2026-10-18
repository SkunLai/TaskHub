import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,writeFileSync,readFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,resolve,sep} from 'node:path';
import {testerFields,featureFields,summarizeSurvey,surveyMarkdown,runSurvey} from '../scripts/survey-report.mjs';
const csv=(headers,rows=[])=>[headers,...rows.map(r=>headers.map(k=>r[k]??''))].map(r=>r.map(v=>'"'+String(v).replaceAll('"','""')+'"').join(',')).join('\r\n');
const tester=(extra={})=>({email:'one@sample.invalid',consent_at:'2026-10-18T09:00:00+07:00',consent_version:'CP3-2026.10.18',monthly_price_vnd:0,price_status:'provided',liked:'Private comment',observer_note:'Private identity',...extra});
const feature=(extra={})=>({email:'one@sample.invalid',feature:'pooling',mode:'Tự dùng',result:'Tự hoàn thành',importance:4,ease:5,intent:'Cân nhắc',observed_at:'2026-10-18T09:30:00+07:00',comment:'Private quote',...extra});
const summary=(testers=[],features=[])=>summarizeSurvey(csv(testerFields,testers),csv(featureFields,features));

test('survey empty templates produce no ratings, price or invented participants',()=>{
 const s=summary();assert.equal(s.experiencedEmailRecords,0);assert.equal(s.minimum20EmailRecords,false);
 assert.equal(s.features.length,6);assert.ok(s.features.every(f=>f.importance.mean===null&&f.easeSelf.mean===null));
 assert.equal(s.willingnessToPay.median,null);assert.match(surveyMarkdown(s),/CHƯA CÓ DỮ LIỆU/);
 assert.throws(()=>summarizeSurvey('email\nx',csv(featureFields)),/thiếu cột/);
});
test('survey keeps demo intent separate and never treats an untried/missing score as zero',()=>{
 const s=summary([tester(),tester({email:'two@sample.invalid'})],[feature(),feature({email:'two@sample.invalid',mode:'Xem demo',result:'Chỉ xem demo',importance:'',ease:'',intent:'Không'}),feature({feature:'portal',mode:'demo',result:'untried',importance:'',ease:'',intent:'na'})]);
 const p=s.features.find(f=>f.id==='pooling');assert.equal(p.self,1);assert.equal(p.demo,1);assert.equal(p.importance.n,1);assert.equal(p.importance.mean,4);assert.equal(p.easeSelf.n,1);assert.equal(p.easeSelf.mean,5);assert.equal(p.intentSelf.maybe,1);assert.equal(p.intentDemo.no,1);assert.equal(s.excluded.untried,1);
});
test('survey flags invalid calendar/consent, demo usability and contradictory outcomes',()=>{
 const t=[tester(),tester({email:'two@sample.invalid',consent_at:'2026-02-30T09:00:00Z'}),tester({email:'qa@example.test'})];
 const f=[feature({observed_at:'2026-10-18T08:59:59+07:00'}),feature({email:'two@sample.invalid'}),feature({email:'qa@example.test'}),feature({feature:'portal',mode:'demo',result:'viewed',ease:4}),feature({feature:'import',result:'viewed'}),feature({feature:'sync',importance:0}),feature({feature:'operations',observed_at:'2026-02-30T09:30:00Z'})];
 const s=summary(t,f);assert.equal(s.experiencedEmailRecords,0);assert.equal(s.excluded.testerInvalid,1);assert.equal(s.excluded.testerQa,1);assert.equal(s.excluded.withoutConsentedTester,1);assert.equal(s.excluded.featureQa,1);assert.equal(s.excluded.featureInvalid,5);
});
test('survey duplicate corrections cannot fall back to an older favorable answer',()=>{
 let s=summary([tester(),tester({email:' ONE@SAMPLE.INVALID ',consent_at:''})],[feature()]);
 assert.equal(s.experiencedEmailRecords,0);assert.equal(s.excluded.testerDuplicates,1);
 s=summary([tester()],[feature(),feature({ease:0,observed_at:'2026-10-18T10:00:00+07:00'})]);assert.equal(s.experiencedEmailRecords,0);assert.equal(s.excluded.featureDuplicates,1);
 s=summary([tester()],[feature(),feature({mode:'demo',result:'viewed',ease:'',importance:1,intent:'no',observed_at:'2026-10-18T10:00:00+07:00'})]);assert.equal(s.features.find(f=>f.id==='pooling').self,0);assert.equal(s.features.find(f=>f.id==='pooling').intentDemo.no,1);
 s=summary([tester()],[feature({observed_at:''}),feature()]);assert.equal(s.experiencedEmailRecords,1);
});
test('survey preserves price zero, excludes undecided prices and omits private text',()=>{
 const rows=[tester(),tester({email:'two@sample.invalid',monthly_price_vnd:100}),tester({email:'three@sample.invalid',monthly_price_vnd:0,price_status:'Chưa xác định'})];
 const s=summary(rows,rows.map(r=>feature({email:r.email})));assert.equal(s.willingnessToPay.n,2);assert.equal(s.willingnessToPay.zero,1);assert.equal(s.willingnessToPay.median,50);assert.equal(s.excluded.priceInvalid,1);
 const out=JSON.stringify(s)+surveyMarkdown(s);for(const secret of [rows[0].email,rows[0].liked,rows[0].observer_note,feature().comment])assert.ok(!out.includes(secret));
});
test('survey twenty emails are never reported as twenty verified people',()=>{
 const rows=Array.from({length:20},(_,i)=>tester({email:'tester'+i+'@sample.invalid'}));const s=summary(rows,rows.map(r=>feature({email:r.email})));
 assert.equal(s.minimum20EmailRecords,true);assert.equal(s.independentPeopleVerified,false);assert.match(surveyMarkdown(s),/CHƯA xác minh 20 cá nhân/);
});
test('survey CLI writes aggregate-only output and protects the raw source files',()=>{
 const root=resolve(tmpdir()),dir=mkdtempSync(join(root,'taskhub-survey-'));
 try{const a=join(dir,'Raw_testers.csv'),b=join(dir,'Raw_features.csv');writeFileSync(a,csv(testerFields,[tester()]));writeFileSync(b,csv(featureFields,[feature()]));
  const s=runSurvey([a,b,join(dir,'out')]);assert.equal(s.experiencedEmailRecords,1);assert.ok(!readFileSync(join(dir,'out','survey-summary.json'),'utf8').includes(tester().email));
  const protectedInput=join(dir,'survey-summary.json');writeFileSync(protectedInput,readFileSync(a));assert.throws(()=>runSurvey([protectedInput,b,dir]),/ghi đè/);
 }finally{if(!resolve(dir).startsWith(root+sep))throw Error('Unsafe cleanup path');rmSync(dir,{recursive:true,force:true});}
});
