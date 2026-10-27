// Disposable QA only. No sample or feedback is added to the team's agency.
import { chromium } from "playwright";
import assert from "node:assert/strict";
import { mkdirSync, readFileSync } from "node:fs";
import readXlsxFile from "read-excel-file/node";
import { qaTour } from "./fixtures.mjs";
const base = process.env.TEST_URL || "http://127.0.0.1:3015";
const browser = await chromium.launch({
  headless: true,
  ...(process.platform === "win32" ? { channel: "msedge" } : {}),
});
const context = await browser.newContext({
  viewport: { width: 1440, height: 1000 },
  acceptDownloads: true,
});
await context.addInitScript(() => {
  window.__prints = 0;
  window.print = () => window.__prints++;
});
const page = await context.newPage(),
  errors = [];
page.on("pageerror", (e) => errors.push(e.message));
mkdirSync("work/cp4-20261028", { recursive: true });
let made = false;
async function api(path, method = "GET", data) {
  const r = await context.request.fetch(base + "/api" + path, {
    method,
    headers: { "X-TaskHub": "1" },
    ...(data ? { data } : {}),
  });
  const d = await r.json();
  assert.ok(r.ok(), path + ": " + JSON.stringify(d));
  return d;
}
async function nav(name) {
  const b = page
    .locator("aside nav")
    .getByRole("button", { name, exact: true });
  if (!(await b.isVisible()))
    await page.getByRole("button", { name: "Mở menu", exact: true }).click();
  await b.click();
  await page.getByRole("heading", { name, exact: true }).waitFor();
}
async function download(button) {
  const pending = page.waitForEvent("download");
  await button.click();
  const d = await pending;
  assert.match(d.suggestedFilename(), /\.xlsx$/);
  const rows = await readXlsxFile(readFileSync(await d.path()));
  return rows[0].data;
}
async function layout(label) {
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    const fits = await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    );
    if (!fits) {
      await page.screenshot({
        path: `work/cp4-20261028/${label}-overflow-${width}.png`,
        fullPage: true,
      });
      console.log(
        await page.evaluate(() =>
          [...document.querySelectorAll("body *")]
            .filter((e) => e.getBoundingClientRect().right > innerWidth + 1)
            .slice(-14)
            .map((e) => ({
              tag: e.tagName,
              css: e.className,
              width: e.getBoundingClientRect().width,
              right: e.getBoundingClientRect().right,
            })),
        ),
      );
    }
    assert.ok(fits, label + " overflow " + width);
    if (width === 390 || width === 1440)
      await page.screenshot({
        path: `work/cp4-20261028/${label}-${width}.png`,
        fullPage: true,
        animations: "disabled",
      });
  }
}
try {
  const user = (
    await api("/register", "POST", {
      name: "CP4 delivery QA",
      email: `cp4-delivery-${Date.now()}@example.test`,
      password: "CP4-delivery-automated-only!",
      role: "operations",
      company_size: "10to30",
      consent: true,
    })
  ).user;
  made = true;
  const created = await api("/tours", "POST", {
    ...qaTour,
    title: "QA Đà Nẵng delivery",
    destination: "Đà Nẵng",
    departure: "2026-11-06",
    reserved: 0,
    capacity: 20,
    price: 2000000,
    itinerary:
      Array.from(
        { length: 70 },
        (_, i) =>
          `Bước ${i + 1}: Lịch trình QA để kiểm tra bản in nhiều trang.`,
      ).join("\n") + "\nQA_END_SENTINEL",
  });
  const pool = await api("/pooling", "POST", {
    tour_id: created.id,
    partner: "QA B2B delivery",
    seats: 2,
    unit_price: 100000,
    note: "Automated QA only",
  });
  const d = await api("/workspace");
  await api("/pooling/" + pool.id, "PATCH", {
    action: "confirm",
    version: 1,
    tour_version: d.tours[0].version,
  });
  await api("/pooling/" + pool.id, "PATCH", {
    action: "payment",
    version: 2,
    paid: 100000,
  });
  await page.goto(base + "/app");
  await page.getByRole("heading", { name: "Tổng quan", exact: true }).waitFor();
  await nav("Báo cáo vận hành");
  await page.locator(".analytics-bars").waitFor();
  await page.getByLabel("Báo cáo từ ngày", { exact: true }).fill("2026-11-01");
  await page.getByLabel("Báo cáo đến ngày", { exact: true }).fill("2026-11-30");
  const loaded = page.waitForResponse((r) =>
    r.url().includes("/api/analytics?from=2026-11-01"),
  );
  await page.getByRole("button", { name: "Xem báo cáo", exact: true }).click();
  assert.equal((await loaded).status(), 200);
  await page.getByText("2026-11-01 đến 2026-11-30", { exact: false }).waitFor();
  const rows = await download(
    page.getByRole("link", { name: "Báo cáo Excel", exact: true }),
  );
  assert.ok(rows.some((r) => r[1] === "Còn phải thu" && r[2] === 100000));
  await layout("analytics");
  await page.getByRole("button", { name: "In / lưu PDF", exact: true }).click();
  assert.equal(await page.evaluate(() => window.__prints), 1);
  await page.pdf({
    path: "work/cp4-20261028/qa-analytics.pdf",
    printBackground: true,
  });
  await nav("Ghép tour B2B");
  await page.getByText("QA B2B delivery", { exact: true }).waitFor();
  const ledger = await download(
    page.getByRole("link", { name: "Công nợ Excel", exact: true }),
  );
  assert.equal(ledger[1][6], 100000);
  assert.equal(ledger[1][7], 100000);
  await page
    .getByRole("button", { name: "In / lưu công nợ PDF", exact: true })
    .click();
  assert.equal(await page.evaluate(() => window.__prints), 2);
  await page.pdf({
    path: "work/cp4-20261028/qa-pooling.pdf",
    printBackground: true,
  });
  await page.goto(base + "/portal/" + user.workspace);
  await page
    .getByRole("button", { name: "Xem QA Đà Nẵng delivery", exact: true })
    .waitFor();
  await page.setViewportSize({ width: 390, height: 844 });
  const image = page.locator(".tour-card img").first();
  await image.waitFor();
  assert.match(await image.getAttribute("srcset"), /480w/);
  await page
    .getByRole("button", { name: "Xem QA Đà Nẵng delivery", exact: true })
    .click();
  await page.getByRole("dialog").waitFor();
  const quote = await download(
    page.getByRole("button", { name: "Báo giá Excel", exact: true }),
  );
  assert.ok(
    quote.some((r) => r[0] === "Giá / khách (VND)" && r[1] === 2000000),
  );
  await page
    .getByRole("button", { name: "In / lưu báo giá PDF", exact: true })
    .click();
  assert.equal(await page.evaluate(() => window.__prints), 1);
  await page.pdf({
    path: "work/cp4-20261028/qa-quote.pdf",
    printBackground: true,
  });
  await page.emulateMedia({ media: "print" });
  assert.equal(await page.locator(".taskhub-print").isVisible(), true);
  assert.equal(await page.locator("#root").isVisible(), false);
  await page.emulateMedia({ media: "screen" });
  assert.deepEqual(errors, []);
  console.log(
    "CP4 delivery UI PASS: filtered analytics; true XLSX numeric exports; print/PDF for report, B2B and quote; responsive photos; mobile layouts.",
  );
} finally {
  if (made) {
    const r = await context.request.delete(base + "/api/account", {
      headers: { "X-TaskHub": "1" },
    });
    assert.equal(r.status(), 200, "QA cleanup");
  }
  await browser.close();
}
