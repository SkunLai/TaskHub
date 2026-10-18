import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,resolve,sep} from 'node:path';
import {openDatabase} from '../server/db.mjs';
import {createPooling,updatePooling} from '../server/operations.mjs';
import {qaTour} from './fixtures.mjs';

async function fixture(run){
  const root=resolve(tmpdir()),dir=mkdtempSync(join(root,'taskhub-history-'));
  const previous={url:process.env.TURSO_DATABASE_URL,required:process.env.REQUIRE_REMOTE_DB};
  // The libSQL client can retain native file handles until process teardown on
  // Windows. These transaction tests need no persistence, so use an isolated
  // in-memory database while still exercising the real libSQL adapter.
  process.env.TURSO_DATABASE_URL=process.env.TEST_DATABASE_DRIVER==='libsql'?'file::memory:':'';
  process.env.REQUIRE_REMOTE_DB='0';
  let db;
  try{
    db=await openDatabase(dir);
    for(const workspace of ['one','two'])await db.prepare('INSERT INTO workspaces VALUES (?,?)').run(workspace,workspace);
    const at=new Date().toISOString();
    const admin={id:'history-admin',workspace:'one',role:'admin'};
    const participant={id:'history-user',workspace:'one',role:'operations'};
    const outsider={id:'history-other',workspace:'two',role:'operations'};
    for(const u of [admin,participant,outsider])await db.prepare('INSERT INTO users VALUES (?,?,?,?,?,?,?,?,?)').run(u.id,u.id+'@example.test',u.id,'not-a-login-credential',u.workspace,u.role,'10to30',at,'QA');
    await db.prepare('INSERT INTO tours VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)').run('history-tour','one',qaTour.title,qaTour.destination,qaTour.departure,qaTour.duration,qaTour.price,10,2,qaTour.description,qaTour.itinerary,qaTour.theme,1,1,at);
    await run({db,admin,participant,outsider});
  }finally{
    db?.close();
    if(previous.url===undefined)delete process.env.TURSO_DATABASE_URL;else process.env.TURSO_DATABASE_URL=previous.url;
    if(previous.required===undefined)delete process.env.REQUIRE_REMOTE_DB;else process.env.REQUIRE_REMOTE_DB=previous.required;
    assert.ok(dir.startsWith(root+sep+'taskhub-history-'));
    rmSync(dir,{recursive:true,force:true,maxRetries:10,retryDelay:100});
  }
}

const make=(db,u)=>createPooling(db,u,{tour_id:'history-tour',partner:'QA partner',seats:3,unit_price:100,note:'Automated test only'});
const row=(db,id)=>db.prepare('SELECT * FROM pooling WHERE id=?').get(id);
const count=(db,table)=>db.prepare('SELECT COUNT(*) AS n FROM '+table).get().then(r=>r.n);
const audit=(db,id)=>db.prepare('SELECT * FROM pooling_audit WHERE pooling_id=? ORDER BY rowid').all(id);

test('B2B history records admin changes and cumulative corrections without research events',async()=>fixture(async({db,admin})=>{
  const {id}=await make(db,admin);
  let entries=await audit(db,id);
  assert.equal(entries.length,1);assert.equal(entries[0].actor_id,admin.id);assert.equal(entries[0].workspace,'one');
  assert.equal(entries[0].action,'pooling_created');assert.equal(entries[0].status_before,'');assert.equal(entries[0].status_after,'pending');
  await updatePooling(db,admin,id,{action:'confirm',version:1,tour_version:1});
  assert.equal((await db.prepare('SELECT reserved FROM tours WHERE id=?').get('history-tour')).reserved,5);
  for(const paid of [250,100,0]){
    const current=await row(db,id);
    await updatePooling(db,admin,id,{action:'payment',version:current.version,paid});
  }
  const current=await row(db,id);await updatePooling(db,admin,id,{action:'cancel',version:current.version});
  entries=await audit(db,id);
  assert.deepEqual(entries.map(e=>e.action),['pooling_created','pooling_confirmed','pooling_reconciled','pooling_reconciled','pooling_reconciled','pooling_cancelled']);
  assert.deepEqual(entries.slice(2,5).map(e=>[e.paid_before,e.paid_after]),[[0,250],[250,100],[100,0]]);
  assert.deepEqual(entries.at(-1)&&[entries.at(-1).status_before,entries.at(-1).status_after],['confirmed','cancelled']);
  assert.ok(entries.every(e=>e.actor_id===admin.id&&Number.isFinite(Date.parse(e.created))));
  assert.equal((await db.prepare('SELECT reserved FROM tours WHERE id=?').get('history-tour')).reserved,2);
  assert.equal(await count(db,'events'),0,'Admin operational audit must not become participant research data');
}));

test('B2B stale, concurrent and foreign-workspace writes cannot add misleading audit or research rows',async()=>fixture(async({db,participant,outsider})=>{
  const {id}=await make(db,participant);
  await assert.rejects(updatePooling(db,outsider,id,{action:'confirm',version:1,tour_version:1}),e=>e.status===404);
  await updatePooling(db,participant,id,{action:'confirm',version:1,tour_version:1});
  const current=await row(db,id),beforeAudit=await count(db,'pooling_audit'),beforeEvents=await count(db,'events');
  const outcomes=await Promise.allSettled([100,200].map(paid=>updatePooling(db,participant,id,{action:'payment',version:current.version,paid})));
  assert.equal(outcomes.filter(o=>o.status==='fulfilled').length,1);
  assert.equal(outcomes.filter(o=>o.status==='rejected'&&o.reason.status===409).length,1);
  assert.equal(await count(db,'pooling_audit'),beforeAudit+1);
  assert.equal(await count(db,'events'),beforeEvents+1);
  const recorded=(await audit(db,id)).at(-1),saved=await row(db,id);
  assert.equal(recorded.paid_before,0);assert.equal(recorded.paid_after,saved.paid);
  await assert.rejects(updatePooling(db,participant,id,{action:'payment',version:current.version,paid:0}),e=>e.status===409);
  assert.equal(await count(db,'pooling_audit'),beforeAudit+1);assert.equal(await count(db,'events'),beforeEvents+1);
  assert.equal((await db.prepare('SELECT COUNT(*) AS n FROM pooling_audit WHERE workspace=?').get('two')).n,0);
}));

test('B2B audit failure rolls back the deal, seat trigger and participant event together',async()=>fixture(async({db,participant})=>{
  const {id}=await make(db,participant);
  await db.exec("CREATE TRIGGER qa_reject_audit BEFORE INSERT ON pooling_audit WHEN NEW.action='pooling_confirmed' BEGIN SELECT RAISE(ABORT,'QA_AUDIT_FAILURE'); END;");
  await assert.rejects(updatePooling(db,participant,id,{action:'confirm',version:1,tour_version:1}),/QA_AUDIT_FAILURE/);
  const current=await row(db,id),tour=await db.prepare('SELECT reserved,version FROM tours WHERE id=?').get('history-tour');
  assert.equal(current.status,'pending');assert.equal(current.version,1);assert.equal(tour.reserved,2);assert.equal(tour.version,1);
  assert.equal((await audit(db,id)).length,1);assert.equal(await count(db,'events'),1);
  await db.exec('DROP TRIGGER qa_reject_audit');
  await updatePooling(db,participant,id,{action:'confirm',version:1,tour_version:1});
  assert.equal((await audit(db,id)).length,2);
}));

test('B2B history follows workspace deletion and retains an honest missing-actor record',async()=>fixture(async({db,participant,admin})=>{
  const {id}=await make(db,participant);
  await updatePooling(db,admin,id,{action:'confirm',version:1,tour_version:1});
  await db.prepare('DELETE FROM users WHERE id=?').run(participant.id);
  const entries=await audit(db,id);
  assert.equal(entries.length,2);assert.equal(entries[0].actor_id,null);assert.equal(entries[1].actor_id,admin.id);
  await db.prepare('DELETE FROM workspaces WHERE id=?').run('one');
  assert.equal(await count(db,'pooling_audit'),0);assert.equal(await count(db,'pooling'),0);
  assert.equal((await db.prepare('SELECT COUNT(*) AS n FROM workspaces WHERE id=?').get('two')).n,1);
}));
