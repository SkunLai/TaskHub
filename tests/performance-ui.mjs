// Delayed authentication must not block public tours or undo a later sign-in.
import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { qaTour } from './fixtures.mjs';

const base = process.env.TEST_URL || 'http://127.0.0.1:3015';
const catalog = JSON.parse(readFileSync('catalog/enviet-tours.json', 'utf8'));
const browser = await chromium.launch({
  headless: true,
  ...(process.platform === 'win32' ? { channel: 'msedge' } : {}),
});
const context = await browser.newContext();
const page = await context.newPage();
const email = `qa-performance-${Date.now()}@example.test`, password = 'QA-performance-only-2026!';
let registered = false, releaseSession;
const errors = [];
page.on('pageerror', e => errors.push(e.message));
const request = (path, method = 'GET', data) => context.request.fetch(base + '/api' + path, {
  method, headers: { 'X-TaskHub': '1' }, ...(data ? { data } : {}),
});
try {
  const created = await request('/register', 'POST', {
    name: 'QA performance - không phải tester', email, password,
    role: 'other', company_size: 'other', consent: true,
  });
  assert.equal(created.status(), 201);
  registered = true;
  const { user } = await created.json();
  await request('/logout', 'POST', {});
  const held = new Promise(resolve => { releaseSession = resolve; });
  await page.route('**/api/session', async route => {
    await held;
    await route.fulfill({ json: { user: null } });
  });
  await page.route('**/api/public/agency', route => route.fulfill({ json: {
    agency: 'QA performance', tours: [{...qaTour, id: 'qa-public-tour'}], catalog,
  } }));
  await page.goto(base, { waitUntil: 'domcontentloaded' });
  await page.getByRole('heading', { name: 'Lịch trình rõ ràng. Khách hàng yên tâm.' }).waitFor();
  await page.locator('.tour-card:not(.catalog-card)').first().waitFor();
  assert.equal(await page.locator('.sidebar').count(), 0);
  assert.equal(await page.locator('.catalog-card').count(), 0);
  const toggle = page.locator('[data-track="portal:toggle-reference"]');
  await toggle.click();
  assert.equal(await page.locator('.catalog-card').count(), 13);
  await toggle.click();
  assert.equal(await page.locator('.catalog-card').count(), 0);
  await page.getByRole('button', { name: 'Đăng nhập', exact: true }).click();
  await page.locator('.modal input[name="email"]').fill(email);
  await page.locator('.modal input[name="password"]').fill(password);
  await page.locator('.modal').getByRole('button', { name: 'Đăng nhập', exact: true }).click();
  await page.getByRole('heading', { name: 'Tổng quan', exact: true }).waitFor();
  const sessionReturned = page.waitForResponse(r => new URL(r.url()).pathname === '/api/session');
  releaseSession();
  await sessionReturned;
  await page.waitForTimeout(100);
  await page.getByRole('heading', { name: 'Tổng quan', exact: true }).waitFor();
  await page.unroute('**/api/session');

  // The internal workspace still waits for a checked session.
  let releasePrivate;
  const privateHeld = new Promise(resolve => { releasePrivate = resolve; });
  await page.route('**/api/session', async route => {
    await privateHeld;
    await route.fulfill({ json: { user } });
  });
  await page.goto(base + '/app', { waitUntil: 'domcontentloaded' });
  await page.getByText('Đang mở TaskHub…', { exact: true }).waitFor();
  assert.equal(await page.locator('.sidebar').count(), 0);
  releasePrivate();
  await page.getByRole('heading', { name: 'Tổng quan', exact: true }).waitFor();
  assert.deepEqual(errors, []);
  console.log('PASS: public portal usable during session check; late response cannot undo login; private workspace remains gated; closed catalog is not rendered.');
} finally {
  releaseSession?.();
  if (registered) {
    const deleted = await request('/account', 'DELETE');
    assert.ok(deleted.ok(), 'Disposable QA account must be removed');
  }
  await browser.close();
}
