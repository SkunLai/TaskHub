import { featureIds } from "./feature-feedback.mjs";

const excludedRoles = ["admin", "reviewer", "staff"];
const fail = (message, status = 400) => {
  throw Object.assign(Error(message), { status });
};
const trialId = (value) => {
  if (
    typeof value !== "string" ||
    !/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(
      value,
    )
  )
    fail("Mã lượt thử không hợp lệ.");
  return value.toLowerCase();
};
const results = ["completed", "assisted", "incomplete"];
export const trialFields = [
  "email",
  "role",
  "company_size",
  "consent_at",
  "consent_version",
  "trial_id",
  "feature",
  "started_at",
  "finished_at",
  "duration_ms",
  "result",
  "timing_note",
];

async function participant(db, user) {
  const saved = await db
    .prepare(
      "SELECT id,role,workspace,consent_at,consent_version FROM users WHERE id=?",
    )
    .get(user.id);
  if (
    !saved ||
    saved.workspace !== user.workspace ||
    excludedRoles.includes(saved.role) ||
    !saved.consent_at ||
    !saved.consent_version
  )
    fail(
      "Chỉ người tham gia đã đồng ý khảo sát được ghi lượt tự trải nghiệm.",
      403,
    );
  return saved;
}

function rowToTrial(start, finish) {
  const begin = JSON.parse(start.entity),
    end = finish ? JSON.parse(finish.entity) : null;
  const duration = finish
    ? Math.max(0, Date.parse(finish.created) - Date.parse(start.created))
    : null;
  return {
    id: start.id,
    feature: begin.feature,
    started_at: start.created,
    finished_at: finish?.created || null,
    duration_ms: duration,
    result: end?.result || null,
    timing_note:
      duration === null
        ? "Đang thử; chưa có thời gian hoàn thành."
        : duration > 2 * 3600000
          ? "Lượt thử dài hơn 2 giờ; có thể gồm thời gian tạm dừng, cần xem lại trước khi tổng hợp."
          : "Thời gian máy chủ giữa hai lần người dùng bấm bắt đầu và kết thúc; có thể gồm thời gian tạm dừng.",
  };
}

export async function ownFeatureTrials(db, user) {
  await participant(db, user);
  const events = await db
    .prepare(
      "SELECT id,action,entity,created FROM events WHERE user_id=? AND action IN ('feature_trial_started','feature_trial_finished') ORDER BY created,id",
    )
    .all(user.id);
  const finishes = new Map(
    events
      .filter((e) => e.action === "feature_trial_finished")
      .map((e) => [e.id, e]),
  );
  const trials = events
    .filter((e) => e.action === "feature_trial_started")
    .map((e) => rowToTrial(e, finishes.get(e.id + ":finish")));
  return { trials, active: trials.find((row) => !row.finished_at) || null };
}

export async function startFeatureTrial(db, user, body) {
  await participant(db, user);
  if (!body || typeof body !== "object" || Array.isArray(body))
    fail("Thông tin lượt thử không hợp lệ.");
  const id = trialId(body.trial_id),
    feature = body.feature;
  if (!featureIds.includes(feature))
    fail("Chọn một chức năng đã triển khai để thử.");
  const existing = await db
    .prepare("SELECT id,user_id,action,entity,created FROM events WHERE id=?")
    .get(id);
  if (existing) {
    if (
      existing.user_id !== user.id ||
      existing.action !== "feature_trial_started" ||
      JSON.parse(existing.entity).feature !== feature
    )
      fail("Mã lượt thử đã được sử dụng. Hãy bắt đầu một lượt mới.", 409);
    return rowToTrial(
      existing,
      await db
        .prepare(
          "SELECT id,entity,created FROM events WHERE id=? AND user_id=? AND action='feature_trial_finished'",
        )
        .get(id + ":finish", user.id),
    );
  }
  const at = new Date().toISOString();
  await db.batch([
    [
      `INSERT OR IGNORE INTO events(id,user_id,action,entity,created) SELECT ?,?,'feature_trial_started',?,?
    WHERE NOT EXISTS(SELECT 1 FROM events s WHERE s.user_id=? AND s.action='feature_trial_started'
      AND NOT EXISTS(SELECT 1 FROM events f WHERE f.id=s.id||':finish' AND f.user_id=s.user_id AND f.action='feature_trial_finished'))`,
      [id, user.id, JSON.stringify({ feature }), at, user.id],
    ],
  ]);
  const saved = await db
    .prepare("SELECT id,user_id,action,entity,created FROM events WHERE id=?")
    .get(id);
  if (
    !saved ||
    saved.user_id !== user.id ||
    saved.action !== "feature_trial_started" ||
    JSON.parse(saved.entity).feature !== feature
  )
    fail(
      "Anh/chị đang có lượt thử chưa kết thúc. Kết thúc lượt đó trước khi bắt đầu lượt khác.",
      409,
    );
  return rowToTrial(
    saved,
    await db
      .prepare(
        "SELECT id,entity,created FROM events WHERE id=? AND user_id=? AND action='feature_trial_finished'",
      )
      .get(id + ":finish", user.id),
  );
}

export async function finishFeatureTrial(db, user, rawId, body) {
  await participant(db, user);
  const id = trialId(rawId),
    result = body?.result;
  if (!results.includes(result))
    fail("Chọn kết quả: tự hoàn thành, có trợ giúp hoặc chưa hoàn thành.");
  const start = await db
    .prepare(
      "SELECT id,entity,created FROM events WHERE id=? AND user_id=? AND action='feature_trial_started'",
    )
    .get(id, user.id);
  if (!start) fail("Không tìm thấy lượt thử của anh/chị.", 404);
  const at = new Date().toISOString();
  // The fixed finish id makes retries and simultaneous finishes idempotent.
  // Browser clocks, submitted durations and timestamps never determine evidence.
  await db.batch([
    [
      `INSERT OR IGNORE INTO events(id,user_id,action,entity,created)
    SELECT id||':finish',user_id,'feature_trial_finished',?,? FROM events
    WHERE id=? AND user_id=? AND action='feature_trial_started'`,
      [JSON.stringify({ result }), at, id, user.id],
    ],
  ]);
  const finish = await db
    .prepare(
      "SELECT id,entity,created FROM events WHERE id=? AND user_id=? AND action='feature_trial_finished'",
    )
    .get(id + ":finish", user.id);
  if (!finish) fail("Lượt thử đã thay đổi. Vui lòng tải lại.", 409);
  if (JSON.parse(finish.entity).result !== result)
    fail("Lượt thử đã lưu kết quả khác; không ghi đè bằng lần gửi lặp.", 409);
  return rowToTrial(start, finish);
}

export async function trialExportRows(db) {
  const rows = await db
    .prepare(
      `SELECT e.id,e.user_id,e.action,e.entity,e.created,u.email,u.role,u.company_size,u.consent_at,u.consent_version
    FROM events e JOIN users u ON u.id=e.user_id
    WHERE u.role NOT IN ('admin','reviewer','staff') AND u.consent_at!='' AND u.consent_version!=''
    AND e.action IN ('feature_trial_started','feature_trial_finished') ORDER BY e.created,e.id`,
    )
    .all();
  const finishes = new Map(
    rows
      .filter((e) => e.action === "feature_trial_finished")
      .map((e) => [e.id, e]),
  );
  return rows
    .filter((e) => e.action === "feature_trial_started")
    .map((start) => {
      const trial = rowToTrial(start, finishes.get(start.id + ":finish"));
      return {
        email: start.email,
        role: start.role,
        company_size: start.company_size,
        consent_at: start.consent_at,
        consent_version: start.consent_version,
        trial_id: trial.id,
        feature: trial.feature,
        started_at: trial.started_at,
        finished_at: trial.finished_at || "",
        duration_ms: trial.duration_ms ?? "",
        result: trial.result || "",
        timing_note: trial.timing_note,
      };
    });
}

export async function trialResearchSummary(db) {
  const rows = await trialExportRows(db);
  const finished = rows.filter((row) => row.finished_at);
  return {
    participants: new Set(rows.map((row) => row.email)).size,
    started: rows.length,
    finished: finished.length,
    completed: finished.filter((row) => row.result === "completed").length,
    participants_started: new Set(rows.map((row) => row.email)).size,
    participants_finished: new Set(finished.map((row) => row.email)).size,
    trials_started: rows.length,
    trials_finished: finished.length,
    features: featureIds.map((feature) => {
      const ended = finished.filter((row) => row.feature === feature),
        timed = ended.filter((row) => row.duration_ms <= 2 * 3600000);
      return {
        feature,
        trials_finished: ended.length,
        participants: new Set(ended.map((row) => row.email)).size,
        completed: ended.filter((row) => row.result === "completed").length,
        assisted: ended.filter((row) => row.result === "assisted").length,
        incomplete: ended.filter((row) => row.result === "incomplete").length,
        duration_sample_count: timed.length,
        average_duration_ms: timed.length
          ? Math.round(
              timed.reduce((sum, row) => sum + row.duration_ms, 0) /
                timed.length,
            )
          : null,
      };
    }),
    note: "Chỉ đếm lượt người tham gia đã đồng ý và tự bấm bắt đầu/kết thúc. Thời gian gồm cả tạm dừng; dữ liệu này không tự chứng minh đã có đủ 20 tester hoặc đạt mục tiêu hiệu năng.",
  };
}
