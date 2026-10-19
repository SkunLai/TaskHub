import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve, sep } from 'node:path';
import { randomUUID } from 'node:crypto';
import { openDatabase } from '../server/db.mjs';
import { loadDemoWorkspace, demoScenario } from '../server/demo.mjs';
import { startFeatureTrial, finishFeatureTrial, ownFeatureTrials, trialExportRows, trialResearchSummary } from '../server/trials.mjs';

async function fixture(run) {
  const root = resolve(tmpdir()), dir = mkdtempSync(join(root, 'taskhub-demo-trials-'));
  const previous = { url: process.env.TURSO_DATABASE_URL, required: process.env.REQUIRE_REMOTE_DB };
  process.env.TURSO_DATABASE_URL = process.env.TEST_DATABASE_DRIVER === 'libsql' ? 'file::memory:' : '';
  process.env.REQUIRE_REMOTE_DB = '0';
  let db;
  try {
    db = await openDatabase(dir);
    const addUser = async (id, workspace = id, role = 'operations') => {
      await db.prepare('INSERT OR IGNORE INTO workspaces VALUES (?,?)').run(workspace, 'QA ' + workspace);
      const user = { id, workspace, role };
      await db.prepare('INSERT INTO users VALUES (?,?,?,?,?,?,?,?,?)').run(id, id + '@example.test', 'QA ' + id, 'not-a-password', workspace, role, '10to30', new Date().toISOString(), 'test-consent');
      return user;
    };
    await run({ db, user: await addUser('owner'), other: await addUser('other'), addUser });
  } finally {
    db?.close();
    if (previous.url === undefined) delete process.env.TURSO_DATABASE_URL; else process.env.TURSO_DATABASE_URL = previous.url;
    if (previous.required === undefined) delete process.env.REQUIRE_REMOTE_DB; else process.env.REQUIRE_REMOTE_DB = previous.required;
    assert.ok(dir.startsWith(root + sep + 'taskhub-demo-trials-'));
    rmSync(dir, { recursive: true, force: true, maxRetries: 10, retryDelay: 100 });
  }
}

const count = async (db, table) => (await db.prepare('SELECT COUNT(*) AS n FROM ' + table).get()).n;

test('optional sample data is isolated, explicit, seat-consistent and idempotent under retries', async () => fixture(async ({ db, user, other }) => {
  assert.equal(await count(db, 'tours'), 0, 'Registration must not auto-seed fictional inventory');
  const results = await Promise.all([loadDemoWorkspace(db, user), loadDemoWorkspace(db, user)]);
  assert.equal(results.filter(r => !r.already_loaded).length, 1);
  assert.equal(results.filter(r => r.already_loaded).length, 1);
  const tours = await db.prepare('SELECT * FROM tours WHERE workspace=? ORDER BY departure').all(user.workspace);
  assert.deepEqual(tours.map(t => t.reserved), [22, 18, 12]);
  assert.deepEqual(tours.map(t => t.capacity), [30, 25, 20]);
  assert.ok(tours.every(t => t.title.startsWith('[Demo]') && t.description.includes('giả lập')));
  assert.ok(tours.every(t => ['danang', 'dalat', 'phuquoc'].includes(t.theme)), 'Samples must remain editable through the existing tour form/API');
  const pools = await db.prepare('SELECT * FROM pooling WHERE workspace=? ORDER BY partner').all(user.workspace);
  assert.deepEqual(pools.map(p => [p.status, p.paid]).sort(), [['confirmed', 8500000], ['confirmed', 33600000], ['pending', 0]].sort());
  assert.equal(pools.find(p => p.paid === 8500000).seats * pools.find(p => p.paid === 8500000).unit_price, 17000000);
  const tasks = await db.prepare('SELECT * FROM tasks WHERE workspace=? ORDER BY id').all(user.workspace);
  assert.equal(tasks.length, 3);
  assert.ok(tasks.every(task => /^\d{4}-\d{2}-\d{2}$/.test(task.due)), 'Samples must remain editable through the date-only task form/API');
  assert.equal(tasks[2].tour_id, tours[0].id, 'TASK-03 belongs to the simulated TOUR-01');
  assert.ok(!tasks[2].title.includes('Testers'));
  assert.equal((await db.prepare('SELECT COUNT(*) AS n FROM tours WHERE workspace=?').get(other.workspace)).n, 0);
  const events = await db.prepare('SELECT action,entity FROM events WHERE user_id=?').all(user.id);
  assert.equal(events.length, 1);
  assert.equal(events[0].action, 'demo_loaded');
  assert.equal(JSON.parse(events[0].entity).simulated, true);
  assert.equal(await count(db, 'pooling_audit'), 3);
  await db.prepare('UPDATE tours SET title=? WHERE id=?').run('Owner edit to keep', tours[0].id);
  assert.equal((await loadDemoWorkspace(db, user)).already_loaded, true);
  assert.equal((await db.prepare('SELECT title FROM tours WHERE id=?').get(tours[0].id)).title, 'Owner edit to keep');
  assert.equal((await trialResearchSummary(db)).participants_started, 0, 'Loading examples is not a timed trial or tester evidence');
}));

test('sample loading rejects existing business records and system/staff/consent bypasses', async () => fixture(async ({ db, user, addUser }) => {
  await db.prepare('INSERT INTO tours VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)').run('existing', user.workspace, 'Real input to keep', 'Hà Nội', '2026-12-01', '1 ngày', 1, 10, 0, 'Existing record', 'N1', 'danang', 0, 1, new Date().toISOString());
  await assert.rejects(loadDemoWorkspace(db, user), e => e.status === 409);
  assert.equal(await count(db, 'tours'), 1);
  assert.equal(await count(db, 'events'), 0);
  for (const role of ['admin', 'reviewer', 'staff']) {
    const restricted = await addUser('restricted-' + role, 'agency', role);
    await assert.rejects(loadDemoWorkspace(db, restricted), e => e.status === 403);
  }
  const noConsent = await addUser('no-consent');
  await db.prepare('UPDATE users SET consent_version=? WHERE id=?').run('', noConsent.id);
  await assert.rejects(loadDemoWorkspace(db, noConsent), e => e.status === 403);
  await assert.rejects(loadDemoWorkspace(db, { ...noConsent, workspace: user.workspace }), e => e.status === 403);
}));

test('sample data batch rolls back all inventory, audit and marker if any write fails', async () => fixture(async ({ db, user }) => {
  await db.exec("CREATE TRIGGER qa_demo_failure BEFORE INSERT ON tasks WHEN NEW.title LIKE '%Gửi lịch trình%' BEGIN SELECT RAISE(ABORT,'QA_DEMO_FAILURE'); END;");
  await assert.rejects(loadDemoWorkspace(db, user), /QA_DEMO_FAILURE/);
  for (const table of ['tours', 'tasks', 'pooling', 'pooling_audit', 'events']) assert.equal(await count(db, table), 0, table + ' must roll back');
  await db.exec('DROP TRIGGER qa_demo_failure');
  assert.equal((await loadDemoWorkspace(db, user)).already_loaded, false);
  assert.equal(await count(db, 'tours'), demoScenario.tours.length);
}));

test('trial timing uses server timestamps, is private, and rejects invalid/overwritten outcomes', async () => fixture(async ({ db, user, other }) => {
  const id = randomUUID();
  const started = await startFeatureTrial(db, user, { trial_id: id, feature: 'pooling', started_at: '2000-01-01', duration_ms: 99999 });
  assert.ok(Date.parse(started.started_at) > Date.parse('2026-01-01'));
  assert.equal(started.duration_ms, null);
  assert.equal((await ownFeatureTrials(db, user)).active.id, id);
  assert.equal((await ownFeatureTrials(db, other)).trials.length, 0);
  assert.equal((await startFeatureTrial(db, user, { trial_id: id, feature: 'pooling' })).started_at, started.started_at);
  await assert.rejects(startFeatureTrial(db, user, { trial_id: randomUUID(), feature: 'operations' }), e => e.status === 409);
  await assert.rejects(startFeatureTrial(db, other, { trial_id: id, feature: 'pooling' }), e => e.status === 409);
  await assert.rejects(finishFeatureTrial(db, other, id, { result: 'completed' }), e => e.status === 404);
  await assert.rejects(finishFeatureTrial(db, user, id, { result: 'success' }), e => e.status === 400);
  const completed = await finishFeatureTrial(db, user, id, { result: 'assisted', duration_ms: 99999, finished_at: '2000-01-01' });
  assert.equal(completed.result, 'assisted');
  assert.equal(completed.duration_ms, Date.parse(completed.finished_at) - Date.parse(started.started_at));
  assert.notEqual(completed.duration_ms, 99999);
  assert.equal((await finishFeatureTrial(db, user, id, { result: 'assisted' })).finished_at, completed.finished_at);
  await assert.rejects(finishFeatureTrial(db, user, id, { result: 'completed' }), e => e.status === 409);
  assert.equal((await ownFeatureTrials(db, user)).active, null);
  assert.equal(await count(db, 'events'), 2);
  const exported = await trialExportRows(db);
  assert.equal(exported.length, 1);
  assert.equal(exported[0].email, 'owner@example.test');
  assert.equal(exported[0].result, 'assisted');
}));

test('parallel trial starts/finishes keep one active trial and one immutable result', async () => fixture(async ({ db, user }) => {
  const starts = await Promise.allSettled(['portal', 'sync'].map(feature => startFeatureTrial(db, user, { trial_id: randomUUID(), feature })));
  assert.equal(starts.filter(r => r.status === 'fulfilled').length, 1);
  assert.equal(starts.filter(r => r.status === 'rejected' && r.reason.status === 409).length, 1);
  const active = (await ownFeatureTrials(db, user)).active;
  const finishes = await Promise.allSettled(['completed', 'incomplete'].map(result => finishFeatureTrial(db, user, active.id, { result })));
  assert.equal(finishes.filter(r => r.status === 'fulfilled').length, 1);
  assert.equal(finishes.filter(r => r.status === 'rejected' && r.reason.status === 409).length, 1);
  assert.equal(await count(db, 'events'), 2);
  await assert.rejects(startFeatureTrial(db, user, { trial_id: 'invalid', feature: 'portal' }), e => e.status === 400);
  await assert.rejects(startFeatureTrial(db, user, { trial_id: randomUUID(), feature: 'future-feature' }), e => e.status === 400);
}));

test('trial reports count participants separately from attempts and exclude staff/system/long idle timings', async () => fixture(async ({ db, user, other, addUser }) => {
  const runs = [];
  for (const [actor, result] of [[user, 'completed'], [user, 'incomplete'], [other, 'assisted']]) {
    const id = randomUUID();
    await startFeatureTrial(db, actor, { trial_id: id, feature: 'portal' });
    await finishFeatureTrial(db, actor, id, { result });
    runs.push(id);
  }
  const early = '2026-01-01T00:00:00.000Z', late = '2026-01-01T03:00:00.000Z';
  await db.prepare('UPDATE events SET created=? WHERE id=?').run(early, runs[2]);
  await db.prepare('UPDATE events SET created=? WHERE id=?').run(late, runs[2] + ':finish');
  const summary = await trialResearchSummary(db);
  assert.equal(summary.participants_started, 2);
  assert.equal(summary.participants_finished, 2);
  assert.equal(summary.trials_finished, 3);
  const portal = summary.features.find(f => f.feature === 'portal');
  assert.equal(portal.participants, 2);
  assert.equal(portal.duration_sample_count, 2, 'Long idle trial retained, excluded from mean');
  assert.deepEqual([portal.completed, portal.assisted, portal.incomplete], [1, 1, 1]);
  assert.ok((await trialExportRows(db)).find(row => row.trial_id === runs[2]).timing_note.includes('2 giờ'));
  await db.prepare("UPDATE users SET role='staff' WHERE id=?").run(other.id);
  assert.equal((await trialResearchSummary(db)).participants_finished, 1);
  for (const role of ['admin', 'reviewer', 'staff']) {
    const actor = await addUser('excluded-' + role, 'agency', role);
    for (const fn of [() => startFeatureTrial(db, actor, { trial_id: randomUUID(), feature: 'portal' }), () => ownFeatureTrials(db, actor), () => finishFeatureTrial(db, actor, runs[0], { result: 'completed' })])
      await assert.rejects(fn(), e => e.status === 403);
  }
}));
