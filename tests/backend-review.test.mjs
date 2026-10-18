import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve, sep } from 'node:path';
import { randomUUID } from 'node:crypto';
import { openDatabase } from '../server/db.mjs';
import { insertPublicInquiry, createPooling, updatePooling, recordInteractions } from '../server/operations.mjs';
import { qaTour } from './fixtures.mjs';

async function fixture(run) {
  const root=resolve(tmpdir()),dir=mkdtempSync(join(root,'taskhub-backend-review-'));
  const previous={url:process.env.TURSO_DATABASE_URL,required:process.env.REQUIRE_REMOTE_DB};
  process.env.TURSO_DATABASE_URL=process.env.TEST_DATABASE_DRIVER==='libsql'?'file::memory:':'';
  process.env.REQUIRE_REMOTE_DB='0';
  let db;
  try {
    db=await openDatabase(dir);
    await db.prepare('INSERT INTO workspaces VALUES (?,?)').run('review','QA workspace');
    const user={id:'review-user',workspace:'review',role:'operations'},at=new Date().toISOString();
    await db.prepare('INSERT INTO users VALUES (?,?,?,?,?,?,?,?,?)').run(user.id,'review@example.test','QA user','not-a-login-credential',user.workspace,user.role,'10to30',at,'QA');
    await db.prepare('INSERT INTO tours VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)').run('review-tour',user.workspace,qaTour.title,qaTour.destination,'2026-10-20',qaTour.duration,qaTour.price,10,2,qaTour.description,qaTour.itinerary,qaTour.theme,1,1,at);
    await run({db,user,tour:await db.prepare('SELECT * FROM tours WHERE id=?').get('review-tour')});
  } finally {
    db?.close();
    if(previous.url===undefined)delete process.env.TURSO_DATABASE_URL;else process.env.TURSO_DATABASE_URL=previous.url;
    if(previous.required===undefined)delete process.env.REQUIRE_REMOTE_DB;else process.env.REQUIRE_REMOTE_DB=previous.required;
    assert.ok(dir.startsWith(root+sep+'taskhub-backend-review-'));
    rmSync(dir,{recursive:true,force:true,maxRetries:10,retryDelay:100});
  }
}

const visitor={name:'QA visitor',email:'visitor@example.test',people:2,note:'Automated test only'};
const count=(db,table)=>db.prepare('SELECT COUNT(*) AS n FROM '+table).get().then(r=>r.n);

test('public inquiry rechecks current publication, date, capacity and existence before insertion',async()=>fixture(async({db,tour})=>{
  // The API already read this snapshot. Reproduce changes that can happen before
  // its write, without relying on nondeterministic parallel HTTP timing.
  for(const change of [
    ['UPDATE tours SET published=0 WHERE id=?',[tour.id]],
    ['UPDATE tours SET reserved=9 WHERE id=?',[tour.id]],
    ['UPDATE tours SET departure=? WHERE id=?',['2026-10-18',tour.id]],
  ]) {
    await db.prepare(change[0]).run(...change[1]);
    await assert.rejects(insertPublicInquiry(db,tour,visitor,'2026-10-19'),e=>e.status===409);
    assert.equal(await count(db,'inquiries'),0);
    await db.prepare('UPDATE tours SET published=1,reserved=2,departure=? WHERE id=?').run('2026-10-20',tour.id);
  }
  await db.prepare('DELETE FROM tours WHERE id=?').run(tour.id);
  await assert.rejects(insertPublicInquiry(db,tour,visitor,'2026-10-19'),e=>e.status===409,'Deleted tour must not turn into a foreign-key system error');
  assert.equal(await count(db,'inquiries'),0);
  assert.equal(await count(db,'events'),0,'Rejected inquiries must not create research events');
}));

test('public inquiry accepts today, preserves no-reservation semantics and cannot cross workspaces',async()=>fixture(async({db,tour})=>{
  await db.prepare('UPDATE tours SET departure=? WHERE id=?').run('2026-10-19',tour.id);
  await assert.rejects(insertPublicInquiry(db,{...tour,workspace:'another-workspace'},visitor,'2026-10-19'),e=>e.status===409);
  const result=await insertPublicInquiry(db,tour,visitor,'2026-10-19');
  const saved=await db.prepare('SELECT * FROM inquiries WHERE id=?').get(result.id);
  assert.equal(saved.workspace,tour.workspace);assert.equal(saved.tour_id,tour.id);
  assert.equal(saved.people,2);assert.equal(saved.status,'new');assert.equal(saved.consent_version,'inquiry-v1');
  const current=await db.prepare('SELECT reserved,version FROM tours WHERE id=?').get(tour.id);
  assert.equal(current.reserved,2);assert.equal(current.version,1,'An inquiry is a contact request, not a booking');
}));

test('pooling rejects a future version even if another write makes it match, keeping audit before-values honest',async()=>fixture(async({db,user,tour})=>{
  const {id}=await createPooling(db,user,{tour_id:tour.id,partner:'QA partner',seats:2,unit_price:100});
  await updatePooling(db,user,id,{action:'confirm',version:1,tour_version:tour.version});
  let interleaved=false;
  const interleavedDb={...db,prepare:sql=>{
    const statement=db.prepare(sql);
    return {...statement,get:async(...args)=>{
      const snapshot=await statement.get(...args);
      if(sql==='SELECT * FROM pooling WHERE id=? AND workspace=?'&&!interleaved) {
        interleaved=true;
        await updatePooling(db,user,id,{action:'payment',version:snapshot.version,paid:25});
      }
      return snapshot;
    }};
  }};
  await assert.rejects(updatePooling(interleavedDb,user,id,{action:'payment',version:3,paid:75}),e=>e.status===409);
  const saved=await db.prepare('SELECT * FROM pooling WHERE id=?').get(id);
  assert.equal(saved.paid,25);assert.equal(saved.version,3);
  const history=await db.prepare('SELECT * FROM pooling_audit WHERE pooling_id=? ORDER BY rowid').all(id);
  assert.equal(history.length,3);assert.equal(history.at(-1).paid_before,0);assert.equal(history.at(-1).paid_after,25);
  assert.equal(await count(db,'events'),3,'Rejected write must not add an audit or research event');
}));

test('invalid interaction objects return a validation error and roll back the whole batch',async()=>fixture(async({db,user})=>{
  const valid={id:randomUUID(),kind:'click',control:'nav:tour',area:'nav:dashboard',at:new Date().toISOString()};
  for(const invalid of [null,[],false,'click',42]) {
    await assert.rejects(recordInteractions(db,user,{events:[valid,invalid]}),e=>e.status===400);
    assert.equal(await count(db,'events'),0);
  }
  assert.deepEqual(await recordInteractions(db,user,{events:[valid]}),{count:1});
  assert.equal(await count(db,'events'),1);
}));
