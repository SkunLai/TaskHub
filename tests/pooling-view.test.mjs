import test from "node:test";
import assert from "node:assert/strict";
import { filterPooling, tourDeletionSummary } from "../src/pooling-view.mjs";
const pools = [
  {
    id: "p1",
    tour_id: "t1",
    partner: "Ánh Dương",
    tour_title: "Hà Nội - Đà Nẵng",
    status: "pending",
    paid: 0,
  },
  {
    id: "p2",
    tour_id: "t1",
    partner: "Mây Travel",
    tour_title: "Hà Nội - Đà Nẵng",
    status: "confirmed",
    paid: 100,
  },
  {
    id: "p3",
    tour_id: "t2",
    partner: "Ánh Dương",
    tour_title: "Phú Quốc",
    status: "cancelled",
    paid: 0,
  },
];
test("B2B filters combine partner/tour accent-free search, status and workspace tour id", () => {
  assert.deepEqual(
    filterPooling(pools, {
      query: "  ANH DUONG  ",
      status: "pending",
      tour: "t1",
    }).map((p) => p.id),
    ["p1"],
  );
  assert.equal(filterPooling(pools, { query: "da nang" }).length, 2);
  assert.equal(
    filterPooling(pools, { query: "anh duong", status: "confirmed" }).length,
    0,
  );
  assert.equal(filterPooling(pools, { tour: "missing" }).length, 0);
  assert.equal(filterPooling(pools).length, 3);
  assert.equal(pools.length, 3);
});
test("tour deletion blocks pending and confirmed ledgers, counts receipts and ignores other tours", () => {
  assert.deepEqual(tourDeletionSummary(pools, "t1"), {
    total: 2,
    blocking: 2,
    withReceipts: 1,
  });
  assert.deepEqual(tourDeletionSummary(pools, "t2"), {
    total: 1,
    blocking: 0,
    withReceipts: 0,
  });
  assert.deepEqual(tourDeletionSummary(pools, "missing"), {
    total: 0,
    blocking: 0,
    withReceipts: 0,
  });
});
test("a cancelled receipt is still blocking and no display helper changes financial records", () => {
  const inconsistent = [{ ...pools[2], paid: 50 }];
  const snapshot = JSON.stringify(inconsistent);
  assert.equal(tourDeletionSummary(inconsistent, "t2").blocking, 1);
  filterPooling(inconsistent, { status: "cancelled" });
  assert.equal(JSON.stringify(inconsistent), snapshot);
});
