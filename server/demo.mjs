import { createHash } from "node:crypto";

const fail = (message, status = 400) => {
  throw Object.assign(Error(message), { status });
};
export const demoScenarioVersion = "demo-v1";

// These are the owner's approved classroom scenarios, never real bookings or
// research responses. Reserved seats include confirmed B2B seats exactly once.
export const demoScenario = {
  assumptions: [
    "Dữ liệu giả lập phục vụ trải nghiệm MVP, không phải giao dịch thật.",
    "Khách đã giữ đã bao gồm các phiếu B2B được xác nhận.",
    "B2B-102 giả lập đã thu 8.500.000 VND, bằng 50% tổng 17.000.000 VND.",
    "B2B-103 đang chờ xác nhận, chưa giữ chỗ và chưa thu tiền.",
    "TASK-03 gắn TOUR-01; đoàn 22 khách là giả lập, không phải bằng chứng 22 tester thật.",
  ],
  tours: [
    {
      code: "TOUR-01",
      title: "[Demo] Hà Nội - Đà Nẵng - Hội An 4N3Đ",
      destination: "Đà Nẵng - Hội An",
      departure: "2026-11-15",
      duration: "4 ngày 3 đêm",
      price: 4850000,
      capacity: 30,
      base_reserved: 14,
      reserved: 22,
      theme: "danang",
      description:
        "Dữ liệu giả lập từ danh sách tour nhóm cung cấp. Hành trình Đà Nẵng - Hội An 4 ngày 3 đêm; thông tin chỉ phục vụ thử chức năng, chưa nhận đặt dịch vụ thật.",
      itinerary:
        "Ngày 1: Bán đảo Sơn Trà.\nNgày 2: Bà Nà Hills - Hội An.\nNgày 3: Cù Lao Chàm.\nNgày 4: Chợ Hàn.",
    },
    {
      code: "TOUR-02",
      title: "[Demo] Phú Quốc 3N2Đ",
      destination: "Phú Quốc",
      departure: "2026-11-20",
      duration: "3 ngày 2 đêm",
      price: 3950000,
      capacity: 25,
      base_reserved: 13,
      reserved: 18,
      theme: "phuquoc",
      description:
        "Dữ liệu giả lập từ danh sách tour nhóm cung cấp. Hành trình Phú Quốc 3 ngày 2 đêm; thông tin chỉ phục vụ thử chức năng, chưa nhận đặt dịch vụ thật.",
      itinerary:
        "Ngày 1: Grand World.\nNgày 2: Tour 4 đảo - Hòn Thơm.\nNgày 3: Chợ đêm Phú Quốc.",
    },
    {
      code: "TOUR-03",
      title: "[Demo] Quy Nhơn - Kỳ Co - Eo Gió 3N2Đ",
      destination: "Quy Nhơn - Kỳ Co - Eo Gió",
      departure: "2026-12-05",
      duration: "3 ngày 2 đêm",
      price: 3200000,
      capacity: 20,
      base_reserved: 12,
      reserved: 12,
      theme: "danang",
      description:
        "Dữ liệu giả lập từ danh sách tour nhóm cung cấp. Hành trình Quy Nhơn - Kỳ Co - Eo Gió 3 ngày 2 đêm; thông tin chỉ phục vụ thử chức năng, chưa nhận đặt dịch vụ thật.",
      itinerary:
        "Ngày 1: Phù Cát - Ghềnh Ráng.\nNgày 2: Kỳ Co - Eo Gió.\nNgày 3: Tháp Bánh Ít.",
    },
  ],
  pooling: [
    {
      code: "B2B-101",
      tour: 0,
      partner: "[Demo] Vietravel Pro Agency",
      seats: 8,
      unit_price: 4200000,
      paid: 33600000,
      status: "confirmed",
      note: "Giả lập: đã xác nhận 8 khách; 8 khách đã nằm trong số khách đã giữ của TOUR-01. Đã thu đủ 33.600.000 VND theo kịch bản demo.",
    },
    {
      code: "B2B-102",
      tour: 1,
      partner: "[Demo] Phu Quoc Sun Travel",
      seats: 5,
      unit_price: 3400000,
      paid: 8500000,
      status: "confirmed",
      note: "Giả lập theo quy ước được chủ dự án duyệt: tổng 17.000.000 VND, đã thu 50% = 8.500.000 VND. 5 khách đã nằm trong số khách đã giữ của TOUR-02.",
    },
    {
      code: "B2B-103",
      tour: 2,
      partner: "[Demo] Sao Vàng Travel",
      seats: 4,
      unit_price: 2800000,
      paid: 0,
      status: "pending",
      note: "Giả lập: phiếu chờ xác nhận, chưa giữ chỗ và chưa thu tiền. Xác nhận trong demo sẽ cộng 4 khách vào TOUR-03 đúng một lần.",
    },
  ],
  tasks: [
    {
      code: "TASK-01",
      tour: 0,
      title: "[Demo] Chốt danh sách đoàn & gửi B2B-101",
      assignee: "Nguyễn Văn Minh",
      due: "2026-11-10",
      deadline_time: "17:00",
      priority: "high",
      status: "doing",
    },
    {
      code: "TASK-02",
      tour: 1,
      title: "[Demo] Đặt cọc nhà hàng & xe tour Phú Quốc",
      assignee: "Trần Thị Thu Hà",
      due: "2026-11-12",
      deadline_time: "12:00",
      priority: "normal",
      status: "done",
    },
    {
      code: "TASK-03",
      tour: 0,
      title: "[Demo] Gửi lịch trình chi tiết đoàn 22 khách",
      assignee: "Lê Hoàng Nam",
      due: "2026-11-14",
      deadline_time: "09:00",
      priority: "high",
      status: "todo",
    },
  ],
};

function demoIds(workspace) {
  const prefix =
    "demo-" + createHash("sha256").update(workspace).digest("hex").slice(0, 32);
  return {
    marker: prefix + "-loaded-v1",
    tour: (i) => prefix + "-tour-" + (i + 1),
    pool: (i) => prefix + "-pool-" + (i + 1),
    task: (i) => prefix + "-task-" + (i + 1),
  };
}

export async function loadDemoWorkspace(db, user) {
  const owner = await db
    .prepare(
      "SELECT id,role,workspace,consent_at,consent_version FROM users WHERE id=?",
    )
    .get(user.id);
  if (
    !owner ||
    owner.workspace !== user.workspace ||
    owner.workspace === "agency" ||
    ["admin", "reviewer", "staff"].includes(owner.role)
  )
    fail(
      "Chỉ chủ không gian dùng thử được nạp dữ liệu mẫu vào không gian của mình.",
      403,
    );
  if (!owner.consent_at || !owner.consent_version)
    fail("Cần đồng ý tham gia trước khi nạp dữ liệu mẫu.", 403);
  const ids = demoIds(owner.workspace),
    at = new Date().toISOString();
  const response = (already_loaded) => ({
    ok: true,
    already_loaded,
    tours: 3,
    tasks: 3,
    pooling: 3,
    scenario_version: demoScenarioVersion,
  });
  if (
    await db
      .prepare("SELECT id FROM events WHERE id=? AND user_id=? AND action=?")
      .get(ids.marker, owner.id, "demo_loaded")
  )
    return response(true);

  // The marker is inserted only while the workspace is empty. Every subsequent
  // statement is gated by that marker, inside a single atomic SQLite/libSQL/D1
  // batch. A racing retry is harmless; existing user records are never erased.
  const guard =
    "EXISTS(SELECT 1 FROM events WHERE id=? AND user_id=? AND action='demo_loaded')";
  const gate = [ids.marker, owner.id];
  const statements = [
    [
      `INSERT OR IGNORE INTO events(id,user_id,action,entity,created)
    SELECT ?,id,'demo_loaded',?,? FROM users WHERE id=? AND workspace=?
    AND NOT EXISTS(SELECT 1 FROM tours WHERE workspace=?)
    AND NOT EXISTS(SELECT 1 FROM tasks WHERE workspace=?)
    AND NOT EXISTS(SELECT 1 FROM pooling WHERE workspace=?)
    AND NOT EXISTS(SELECT 1 FROM inquiries WHERE workspace=?)`,
      [
        ids.marker,
        JSON.stringify({
          scenario_version: demoScenarioVersion,
          simulated: true,
          assumptions: demoScenario.assumptions,
        }),
        at,
        owner.id,
        owner.workspace,
        owner.workspace,
        owner.workspace,
        owner.workspace,
        owner.workspace,
      ],
    ],
  ];
  for (const [i, tour] of demoScenario.tours.entries())
    statements.push([
      `INSERT OR IGNORE INTO tours(id,workspace,title,destination,departure,duration,price,capacity,reserved,description,itinerary,theme,published,version,updated) SELECT ?,?,?,?,?,?,?,?,?,?,?,?,?,?,? WHERE ${guard}`,
      [
        ids.tour(i),
        owner.workspace,
        tour.title,
        tour.destination,
        tour.departure,
        tour.duration,
        tour.price,
        tour.capacity,
        tour.base_reserved,
        tour.description,
        tour.itinerary,
        tour.theme,
        1,
        1,
        at,
        ...gate,
      ],
    ]);
  for (const [i, pool] of demoScenario.pooling.entries()) {
    statements.push([
      `INSERT OR IGNORE INTO pooling(id,workspace,tour_id,partner,seats,unit_price,paid,status,note,version,created,updated) SELECT ?,?,?,?,?,?,0,'pending',?,1,?,? WHERE ${guard}`,
      [
        ids.pool(i),
        owner.workspace,
        ids.tour(pool.tour),
        pool.partner,
        pool.seats,
        pool.unit_price,
        pool.note,
        at,
        at,
        ...gate,
      ],
    ]);
    if (pool.status === "confirmed")
      statements.push([
        `UPDATE pooling SET status='confirmed',paid=?,version=version+1,updated=? WHERE id=? AND workspace=? AND status='pending' AND ${guard}`,
        [pool.paid, at, ids.pool(i), owner.workspace, ...gate],
      ]);
    statements.push([
      `INSERT OR IGNORE INTO pooling_audit(id,workspace,pooling_id,actor_id,action,paid_before,paid_after,status_before,status_after,created) SELECT ?,?,?,?,'demo_seeded',0,?,'',?,? WHERE ${guard}`,
      [
        ids.pool(i) + "-seed",
        owner.workspace,
        ids.pool(i),
        owner.id,
        pool.paid,
        pool.status,
        at,
        ...gate,
      ],
    ]);
  }
  for (const [i, task] of demoScenario.tasks.entries())
    statements.push([
      `INSERT OR IGNORE INTO tasks(id,workspace,tour_id,title,assignee,due,priority,status,created,version) SELECT ?,?,?,?,?,?,?,?,?,1 WHERE ${guard}`,
      [
        ids.task(i),
        owner.workspace,
        ids.tour(task.tour),
        task.title,
        task.assignee,
        task.due,
        task.priority,
        task.status,
        at,
        ...gate,
      ],
    ]);
  const result = await db.batch(statements);
  if (
    !(await db
      .prepare("SELECT id FROM events WHERE id=? AND user_id=? AND action=?")
      .get(ids.marker, owner.id, "demo_loaded"))
  )
    fail(
      "Không gian đã có dữ liệu. Dữ liệu mẫu chỉ được nạp vào không gian trống và sẽ không ghi đè dữ liệu của anh/chị.",
      409,
    );
  return response(!Boolean(result[0].changes));
}
