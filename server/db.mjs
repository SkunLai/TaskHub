import { connectDatabase } from "./connection.mjs";
import { mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { randomUUID } from "node:crypto";

export async function openDatabase(dir = process.env.DATA_DIR || "./data") {
  mkdirSync(dir, { recursive: true });
  const db = connectDatabase(resolve(dir, "taskhub.sqlite"));
  await db.exec(`PRAGMA foreign_keys=ON;
    CREATE TABLE IF NOT EXISTS workspaces(id TEXT PRIMARY KEY, name TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS users(id TEXT PRIMARY KEY,email TEXT UNIQUE NOT NULL,name TEXT NOT NULL,password TEXT NOT NULL,workspace TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,role TEXT NOT NULL,company_size TEXT NOT NULL,consent_at TEXT NOT NULL,consent_version TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS sessions(token TEXT PRIMARY KEY,user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,expires INTEGER NOT NULL);
    CREATE TABLE IF NOT EXISTS tours(id TEXT PRIMARY KEY,workspace TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,title TEXT NOT NULL,destination TEXT NOT NULL,departure TEXT NOT NULL,duration TEXT NOT NULL,price INTEGER NOT NULL CHECK(price>=0),capacity INTEGER NOT NULL CHECK(capacity>0),reserved INTEGER NOT NULL CHECK(reserved>=0 AND reserved<=capacity),description TEXT NOT NULL,itinerary TEXT NOT NULL,theme TEXT NOT NULL,published INTEGER NOT NULL,version INTEGER NOT NULL DEFAULT 1,updated TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS tasks(id TEXT PRIMARY KEY,workspace TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,tour_id TEXT NOT NULL REFERENCES tours(id) ON DELETE CASCADE,title TEXT NOT NULL,assignee TEXT NOT NULL,due TEXT NOT NULL,priority TEXT NOT NULL,status TEXT NOT NULL,created TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS inquiries(id TEXT PRIMARY KEY,workspace TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,tour_id TEXT NOT NULL REFERENCES tours(id) ON DELETE CASCADE,name TEXT NOT NULL,email TEXT NOT NULL,people INTEGER NOT NULL,note TEXT NOT NULL,status TEXT NOT NULL,created TEXT NOT NULL,consent_version TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS events(id TEXT PRIMARY KEY,user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,action TEXT NOT NULL,entity TEXT NOT NULL,created TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS feedback(user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,portal INTEGER NOT NULL,operations INTEGER NOT NULL,sync INTEGER NOT NULL,ease INTEGER NOT NULL,intent TEXT NOT NULL,price INTEGER NOT NULL,liked TEXT NOT NULL,disliked TEXT NOT NULL,created TEXT NOT NULL);
    CREATE INDEX IF NOT EXISTS tours_workspace ON tours(workspace); CREATE INDEX IF NOT EXISTS events_user ON events(user_id);`);
  if (!db.remote)
    await db.exec("PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000;");
  return db;
}

export async function transaction(db, fn) {
  return db.transaction(fn);
}
export async function purgeExpired(db) {
  const cutoff = new Date(Date.now() - 180 * 86400000).toISOString();
  return await transaction(db, async () => {
    const old = await db
      .prepare(
        "SELECT workspace FROM users WHERE role NOT IN ('admin','reviewer') AND workspace!='agency' AND consent_at<?",
      )
      .all(cutoff);
    for (const row of old)
      await db.prepare("DELETE FROM workspaces WHERE id=?").run(row.workspace);
    await db.prepare("DELETE FROM inquiries WHERE created<?").run(cutoff);
    await db.prepare("DELETE FROM sessions WHERE expires<?").run(Date.now());
    return old.length;
  });
}
export const now = () => new Date().toISOString();
export async function seedWorkspace(db, id, name) {
  await db.prepare("INSERT INTO workspaces VALUES (?,?)").run(id, name);
  const day = (offset) => {
    const d = new Date();
    d.setUTCDate(d.getUTCDate() + offset);
    return d.toISOString().slice(0, 10);
  };
  const tours = [
    [
      "Đà Nẵng – Hội An",
      "Đà Nẵng",
      7,
      "3 ngày 2 đêm",
      3490000,
      30,
      22,
      "danang",
      "Một chuyến đi, hai nhịp sống. Biển Mỹ Khê trong xanh, phố Hội về đêm và những trải nghiệm miền Trung gần gũi.",
      "Ngày 1: Đón đoàn, biển Mỹ Khê và bữa tối địa phương.\nNgày 2: Tham quan Hội An, làng nghề và phố cổ.\nNgày 3: Mua sắm đặc sản, tiễn đoàn.",
    ],
    [
      "Đà Lạt · Một chút bình yên",
      "Đà Lạt",
      10,
      "3 ngày 2 đêm",
      2890000,
      25,
      14,
      "dalat",
      "Rời thành phố, tìm một khoảng xanh. Cà phê giữa đồi thông, vườn hoa và không khí se lạnh của Đà Lạt.",
      "Ngày 1: Di chuyển đến Đà Lạt, tham quan trung tâm.\nNgày 2: Đồi chè, vườn hoa, trải nghiệm cà phê.\nNgày 3: Chợ Đà Lạt, trở về.",
    ],
    [
      "Phú Quốc · Chạm vào mùa nắng",
      "Phú Quốc",
      14,
      "4 ngày 3 đêm",
      5990000,
      35,
      27,
      "phuquoc",
      "Ngày dài bên biển, hoàng hôn trên đảo. Khám phá Nam đảo, thưởng thức hải sản và dành thời gian nghỉ ngơi.",
      "Ngày 1: Đón tại sân bay, nhận phòng.\nNgày 2: Tham quan Nam đảo và biển.\nNgày 3: Ngày tự do nghỉ dưỡng.\nNgày 4: Trả phòng, tiễn sân bay.",
    ],
  ];
  for (const [index, t] of tours.entries()) {
    const tourId = randomUUID();
    await db
      .prepare("INSERT INTO tours VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)")
      .run(
        tourId,
        id,
        t[0],
        t[1],
        day(t[2]),
        t[3],
        t[4],
        t[5],
        t[6],
        t[8],
        t[9],
        t[7],
        1,
        1,
        now(),
      );
    const items =
      index === 0
        ? [
            ["Xác nhận danh sách khách", "Minh Tuấn", "high", "doing"],
            ["Chốt phòng với khách sạn", "Quốc Huy", "high", "todo"],
            ["Gửi lịch trình cho đoàn", "Tấn Lợi", "normal", "todo"],
          ]
        : index === 1
          ? [
              ["Xác nhận xe đưa đón", "Thành Đạt", "normal", "done"],
              ["Kiểm tra thực đơn", "Duy An", "normal", "doing"],
            ]
          : [["Kiểm tra vé máy bay", "Minh Tuấn", "high", "todo"]];
    for (const [title, assignee, priority, status] of items)
      await db
        .prepare("INSERT INTO tasks VALUES (?,?,?,?,?,?,?,?,?)")
        .run(
          randomUUID(),
          id,
          tourId,
          title,
          assignee,
          day(t[2] - 2),
          priority,
          status,
          now(),
        );
  }
}

// Both private cost information and customer contacts are excluded from public output.
export async function publicTours(db, workspace) {
  return await db
    .prepare(
      "SELECT id,title,destination,departure,duration,price,capacity,reserved,description,itinerary,theme,version,updated FROM tours WHERE workspace=? AND published=1 ORDER BY departure",
    )
    .all(workspace);
}
