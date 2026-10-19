import { randomUUID } from 'node:crypto';

export const featureIds = ['portal', 'operations', 'sync', 'pooling', 'import', 'quick_actions'];
export const testerFields = ['email','consent_at','consent_version','role','company_size','features_seen_or_used','test_started_at','test_finished_at','liked','disliked','monthly_price_vnd','price_status','observer_note'];
export const featureFields = ['email','feature','mode','result','importance','ease','intent','observed_at','comment'];
const fail = message => { throw Object.assign(Error(message), { status: 400 }); };
const rating = (value, label) => {
  if (value === null) return null;
  if (!Number.isInteger(value) || value < 1 || value > 5) fail(label + ' cần là 1–5 hoặc Không áp dụng.');
  return value;
};
const answerText = (value, label) => {
  if (value === undefined) return '';
  if (typeof value !== 'string' || value.trim().length > 1500) fail(label + ' tối đa 1.500 ký tự.');
  return value.trim();
};

export function featureFeedbackInput(body) {
  if (!Array.isArray(body.entries) || body.entries.length !== featureIds.length) fail('Đánh dấu trải nghiệm của đủ 6 chức năng.');
  const entries = new Map();
  for (const entry of body.entries) {
    if (!entry || typeof entry !== 'object' || !featureIds.includes(entry.feature) || entries.has(entry.feature)) fail('Danh sách chức năng không hợp lệ hoặc bị trùng.');
    if (!['self','demo','untried'].includes(entry.mode)) fail('Chọn cách trải nghiệm cho từng chức năng.');
    const importance = rating(entry.importance, 'Mức quan trọng'), ease = rating(entry.ease, 'Độ dễ dùng');
    if (!['yes','maybe','no','na'].includes(entry.intent)) fail('Ý định sử dụng không hợp lệ.');
    if (entry.mode === 'untried' && (entry.result !== 'untried' || importance !== null || ease !== null || entry.intent !== 'na')) fail('Chức năng chưa thử không được gán điểm hoặc ý định sử dụng.');
    if (entry.mode === 'demo' && (entry.result !== 'viewed' || ease !== null)) fail('Người chỉ xem demo không chấm độ dễ dùng như người tự thao tác.');
    if (entry.mode === 'self' && !['completed','assisted','incomplete'].includes(entry.result)) fail('Chọn kết quả tự thao tác hợp lệ.');
    entries.set(entry.feature, { feature: entry.feature, mode: entry.mode, result: entry.result, importance, ease, intent: entry.intent });
  }
  if (![...entries.values()].some(e => e.mode !== 'untried')) fail('Hãy thử hoặc xem trình diễn ít nhất một chức năng trước khi gửi.');
  if (!['provided','undecided','not_decider','declined'].includes(body.price_status)) fail('Chọn trạng thái câu trả lời về mức phí.');
  if (body.price_status === 'provided') {
    if (!Number.isSafeInteger(body.price) || body.price < 0 || body.price > 100000000) fail('Mức phí cần là số nguyên từ 0 đến 100.000.000 VND.');
  } else if (body.price !== null) fail('Chưa đưa ra mức phí thì để giá trị tiền trống.');
  return { entries: featureIds.map(id => entries.get(id)), price: body.price, price_status: body.price_status, liked: answerText(body.liked, 'Điểm thích'), disliked: answerText(body.disliked, 'Điểm cần sửa') };
}

export function parseFeatureFeedback(row) {
  if (!row) return null;
  return { ...row, entries: JSON.parse(row.entries) };
}

export async function saveFeatureFeedback(db, user, body) {
  if (['admin','reviewer','staff'].includes(user.role)) throw Object.assign(Error('Tài khoản quản trị/người đánh giá không tham gia khảo sát.'), { status: 403 });
  const answer = featureFeedbackInput(body), created = new Date().toISOString();
  await db.batch([
    ['INSERT INTO feature_feedback(user_id,entries,price,price_status,liked,disliked,created) VALUES (?,?,?,?,?,?,?) ON CONFLICT(user_id) DO UPDATE SET entries=excluded.entries,price=excluded.price,price_status=excluded.price_status,liked=excluded.liked,disliked=excluded.disliked,created=excluded.created', [user.id,JSON.stringify(answer.entries),answer.price,answer.price_status,answer.liked,answer.disliked,created]],
    ['INSERT INTO events VALUES (?,?,?,?,?)', [randomUUID(),user.id,'feedback_submitted','features-v2',created]],
  ]);
  return { ok: true };
}

export async function surveyExportRows(db) {
  const rows = await db.prepare(`SELECT f.*,u.email,u.role,u.company_size,u.consent_at,u.consent_version,
    (SELECT MIN(e.created) FROM events e WHERE e.user_id=u.id AND e.action='test_started') AS test_started_at
    FROM feature_feedback f JOIN users u ON u.id=f.user_id WHERE u.role NOT IN ('admin','reviewer','staff') ORDER BY f.created,u.email`).all();
  const testers = [], features = [];
  for (const raw of rows) {
    const row = parseFeatureFeedback(raw), experienced = row.entries.filter(e => e.mode !== 'untried');
    testers.push({ email:row.email,consent_at:row.consent_at,consent_version:row.consent_version,role:row.role,company_size:row.company_size,
      features_seen_or_used:experienced.map(e=>e.feature+':'+e.mode).join('; '),test_started_at:row.test_started_at || '',test_finished_at:row.created,
      liked:row.liked,disliked:row.disliked,monthly_price_vnd:row.price ?? '',price_status:row.price_status,observer_note:'' });
    // Untried answers stay in the original record; they are not observations of use.
    for (const entry of experienced) features.push({ email:row.email,feature:entry.feature,mode:entry.mode,result:entry.result,importance:entry.importance ?? '',ease:entry.ease ?? '',intent:entry.intent,observed_at:row.created,comment:'' });
  }
  return { testers, features };
}
