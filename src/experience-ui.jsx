import React, { useState, useEffect } from "react";
import {
  Check,
  CheckCircle2,
  ShieldCheck,
  ArrowRight,
  Download,
  RefreshCw,
  Compass,
  Globe,
  ListTodo,
  Handshake,
  Upload,
  MousePointer2,
  MessageSquare,
  Info,
} from "lucide-react";
import "./experience.css";

export const featureList = [
  [
    "portal",
    "Cổng thông tin tour",
    "Tìm, xem lịch/giá/chỗ và gửi yêu cầu tư vấn.",
    Globe,
    "portal",
  ],
  [
    "operations",
    "Giao việc theo tour",
    "Giao việc, sửa người phụ trách/hạn và theo dõi trạng thái.",
    ListTodo,
    "tasks",
  ],
  [
    "sync",
    "Lịch và số chỗ dùng chung",
    "Đổi số khách ở điều hành, đối chiếu chỗ trên portal.",
    RefreshCw,
    "tours",
  ],
  [
    "pooling",
    "Ghép tour và đối soát B2B",
    "Tạo phiếu, xác nhận chỗ, ghi nhận thu và xem lịch sử.",
    Handshake,
    "pooling",
  ],
  [
    "import",
    "Nhập tour Excel/CSV",
    "Chọn tệp, xem trước/lỗi và nhập tour nháp.",
    Upload,
    "tours",
  ],
  [
    "quick_actions",
    "Thao tác nhanh trên thẻ tour",
    "Dùng nội dung tour, đổi số chỗ hoặc giao việc từ thẻ.",
    MousePointer2,
    "tours",
  ],
];
const newEntry = (feature) => ({
  feature,
  mode: "untried",
  result: "untried",
  importance: null,
  ease: null,
  intent: "na",
});
const modes = { untried: "Chưa thử", self: "Tự dùng", demo: "Xem demo" };
const priceLabels = {
  provided: "Có mức giá đề xuất",
  undecided: "Chưa xác định mức giá",
  not_decider: "Tôi không quyết định ngân sách",
  declined: "Không trả lời",
};
const numberOrNull = (value) => (value === "" ? null : Number(value));

export function createExperienceUI({
  Modal,
  Button,
  Field,
  ErrorBox,
  Empty,
  Badge,
  api,
  money,
  date,
  roleNames,
}) {
  function FeatureFeedback({ data, notify, reload }) {
    const saved = data.featureFeedback;
    const [entries, setEntries] = useState(() =>
      featureList.map(
        ([id]) => saved?.entries?.find((e) => e.feature === id) || newEntry(id),
      ),
    );
    const [priceStatus, setPriceStatus] = useState(
        saved?.price_status || "declined",
      ),
      [price, setPrice] = useState(saved?.price ?? "");
    const [liked, setLiked] = useState(saved?.liked || ""),
      [disliked, setDisliked] = useState(saved?.disliked || "");
    const [busy, setBusy] = useState(false),
      [error, setError] = useState("");
    const patch = (id, value) =>
      setEntries((rows) =>
        rows.map((r) => (r.feature === id ? { ...r, ...value } : r)),
      );
    function mode(id, value) {
      patch(
        id,
        value === "untried"
          ? newEntry(id)
          : {
              mode: value,
              result: value === "demo" ? "viewed" : "",
              importance: null,
              ease: null,
              intent: "",
            },
      );
    }
    async function submit(event) {
      event.preventDefault();
      setError("");
      if (!entries.some((e) => e.mode !== "untried")) {
        setError("Chọn ít nhất một chức năng bạn đã tự dùng hoặc xem demo.");
        return;
      }
      setBusy(true);
      try {
        await api("/feedback/features", "POST", {
          entries,
          price:
            priceStatus === "provided" ? numberOrNull(String(price)) : null,
          price_status: priceStatus,
          liked,
          disliked,
        });
        await reload();
        notify("Đã lưu phản hồi theo từng tính năng. Cảm ơn bạn!");
      } catch (e) {
        setError(e.message);
      } finally {
        setBusy(false);
      }
    }
    return (
      <div className="feedback-v2">
        <div className="feedback-intro">
          <div>
            <Badge tone="blue">Ý KIẾN SAU TRẢI NGHIỆM</Badge>
            <h2>Chỉ đánh giá những gì bạn đã thử.</h2>
            <p>
              Chọn tự dùng hoặc xem demo cho từng chức năng. Mục chưa chọn giữ
              “Chưa thử” và không được tính điểm. Ý kiến chưa hài lòng giúp nhóm
              cải thiện sản phẩm.
            </p>
          </div>
          <MessageSquare size={38} />
        </div>
        {data.feedback && !saved && (
          <div className="notice-inline">
            <Info size={18} />
            <p>
              Phản hồi phiên bản trước vẫn được giữ nguyên. Bản mới bổ sung B2B,
              Excel và thao tác nhanh; các điểm cũ không tự chuyển sang câu hỏi
              mới.
            </p>
          </div>
        )}
        <form onSubmit={submit} className="feature-feedback-form">
          <div className="feedback-form-heading">
            <h3>Trải nghiệm theo tính năng</h3>
            {saved && (
              <Badge tone="blue">
                <Check size={13} />
                Đã lưu · có thể cập nhật
              </Badge>
            )}
          </div>
          <ErrorBox error={error} />
          <div className="feature-survey-grid">
            {featureList.map(([id, name, description, Icon], i) => {
              const row = entries.find((e) => e.feature === id);
              return (
                <section
                  className={
                    "feature-survey-card " +
                    (row.mode !== "untried" ? "experienced" : "")
                  }
                  key={id}
                  aria-label={"Đánh giá " + name}
                >
                  <div className="feature-survey-heading">
                    <span className="feature-symbol">
                      <Icon size={20} />
                    </span>
                    <div>
                      <h4>{name}</h4>
                      <p>{description}</p>
                    </div>
                    <small>0{i + 1}</small>
                  </div>
                  <fieldset className="experience-options">
                    <legend>Bạn đã trải nghiệm chức năng này thế nào?</legend>
                    {Object.entries(modes).map(([value, label]) => (
                      <label key={value}>
                        <input
                          type="radio"
                          name={"mode:" + id}
                          data-track={"feedback:" + id + ":" + value}
                          value={value}
                          checked={row.mode === value}
                          onChange={() => mode(id, value)}
                          disabled={busy}
                        />
                        <span>{label}</span>
                      </label>
                    ))}
                  </fieldset>
                  {row.mode !== "untried" && (
                    <div className="feature-rating-fields">
                      {row.mode === "self" && (
                        <Field label="Kết quả thao tác">
                          <select
                            name={"result:" + id}
                            value={row.result}
                            required
                            disabled={busy}
                            onChange={(e) =>
                              patch(id, { result: e.target.value })
                            }
                          >
                            <option value="" disabled>
                              Chọn kết quả thực tế
                            </option>
                            <option value="completed">Tự hoàn thành</option>
                            <option value="assisted">Cần trợ giúp</option>
                            <option value="incomplete">Chưa hoàn thành</option>
                          </select>
                        </Field>
                      )}
                      <Field label="Tầm quan trọng với công việc">
                        <select
                          name={"importance:" + id}
                          value={row.importance ?? ""}
                          disabled={busy}
                          onChange={(e) =>
                            patch(id, {
                              importance: numberOrNull(e.target.value),
                            })
                          }
                        >
                          <option value="">
                            Không áp dụng / chưa đánh giá
                          </option>
                          {[1, 2, 3, 4, 5].map((n) => (
                            <option value={n} key={n}>
                              {n} ·{" "}
                              {
                                [
                                  "Không quan trọng",
                                  "Ít quan trọng",
                                  "Bình thường",
                                  "Quan trọng",
                                  "Rất quan trọng",
                                ][n - 1]
                              }
                            </option>
                          ))}
                        </select>
                      </Field>
                      {row.mode === "self" ? (
                        <Field label="Mức độ dễ thao tác">
                          <select
                            name={"ease:" + id}
                            value={row.ease ?? ""}
                            disabled={busy}
                            onChange={(e) =>
                              patch(id, { ease: numberOrNull(e.target.value) })
                            }
                          >
                            <option value="">Chưa đánh giá</option>
                            {[1, 2, 3, 4, 5].map((n) => (
                              <option value={n} key={n}>
                                {n} ·{" "}
                                {
                                  [
                                    "Rất khó",
                                    "Khó",
                                    "Bình thường",
                                    "Dễ",
                                    "Rất dễ",
                                  ][n - 1]
                                }
                              </option>
                            ))}
                          </select>
                        </Field>
                      ) : (
                        <p className="rating-explanation">
                          Bạn chỉ xem demo nên phần này không thu điểm dễ thao
                          tác.
                        </p>
                      )}
                      <Field label="Bạn có dự định dùng tính năng này?">
                        <select
                          name={"intent:" + id}
                          value={row.intent}
                          required
                          disabled={busy}
                          onChange={(e) =>
                            patch(id, { intent: e.target.value })
                          }
                        >
                          <option value="" disabled>
                            Chọn câu trả lời
                          </option>
                          <option value="yes">Có</option>
                          <option value="maybe">Cân nhắc</option>
                          <option value="no">Không</option>
                          <option value="na">Không áp dụng / chưa biết</option>
                        </select>
                      </Field>
                    </div>
                  )}
                </section>
              );
            })}
          </div>
          <section className="panel feedback-additional">
            <h3>Ý kiến và mức phí đề xuất</h3>
            <p className="muted">
              Không bắt buộc. Câu trả lời về giá là ý kiến khảo sát, chưa phải
              giá bán hoặc cam kết thanh toán.
            </p>
            <div className="form-grid">
              <Field label="Bạn muốn trả lời câu hỏi về giá thế nào?">
                <select
                  name="price_status"
                  value={priceStatus}
                  disabled={busy}
                  onChange={(e) => setPriceStatus(e.target.value)}
                >
                  {Object.entries(priceLabels).map(([value, label]) => (
                    <option value={value} key={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </Field>
              {priceStatus === "provided" && (
                <Field
                  label="Mức phí đề xuất / doanh nghiệp / tháng (VND)"
                  hint="Nhập số nguyên. Giá trị 0 là câu trả lời hợp lệ."
                >
                  <input
                    name="price"
                    type="number"
                    min="0"
                    max="100000000"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    disabled={busy}
                  />
                </Field>
              )}
            </div>
            <Field label="Điều hữu ích nhất (không bắt buộc)">
              <textarea
                name="liked"
                value={liked}
                maxLength="1500"
                rows="2"
                disabled={busy}
                onChange={(e) => setLiked(e.target.value)}
              />
            </Field>
            <Field label="Khó khăn, lỗi hoặc điểm không thích (không bắt buộc)">
              <textarea
                name="disliked"
                value={disliked}
                maxLength="1500"
                rows="3"
                disabled={busy}
                onChange={(e) => setDisliked(e.target.value)}
              />
            </Field>
            <div className="feedback-submit">
              <small>
                Phản hồi chỉ dành cho nhóm và người đánh giá được cấp quyền.
                Không nhập thông tin khách hàng thật.
              </small>
              <Button disabled={busy} data-track="feedback:save">
                {busy
                  ? "Đang lưu…"
                  : saved
                    ? "Cập nhật phản hồi"
                    : "Gửi đánh giá"}
                <Check size={17} />
              </Button>
            </div>
          </section>
        </form>
      </div>
    );
  }

  function Research() {
    const [data, setData] = useState(null),
      [error, setError] = useState(""),
      [busy, setBusy] = useState(false);
    const load = async () => {
      setBusy(true);
      try {
        setData(await api("/research"));
        setError("");
      } catch (e) {
        setError(e.message);
      } finally {
        setBusy(false);
      }
    };
    useEffect(() => {
      void load();
    }, []);
    const rows = data?.featureFeedback || [],
      legacy = data?.feedback || [];
    const mean = (values) =>
      values.length
        ? (values.reduce((a, b) => a + b, 0) / values.length).toFixed(1)
        : "—";
    const selfEase = rows.flatMap((f) =>
      f.entries
        .filter((e) => e.mode === "self" && Number.isInteger(e.ease))
        .map((e) => e.ease),
    );
    const allRows = [
      ...rows,
      ...legacy.filter((f) => !rows.some((r) => r.user_id === f.user_id)),
    ];
    return (
      <>
        <ErrorBox error={error} />
        <div className="research-banner">
          <div>
            <Badge tone="blue">DỮ LIỆU KIỂM THỬ CÓ QUYỀN XEM</Badge>
            <h2>Phản hồi theo đúng trải nghiệm.</h2>
            <p>
              Tách người tự dùng và người xem demo. Điểm chưa đánh giá không
              được đổi thành 0.
            </p>
          </div>
          <Button variant="ghost" onClick={load} disabled={busy}>
            <RefreshCw size={16} />
            {busy ? "Đang tải…" : "Làm mới"}
          </Button>
        </div>
        <div className="stat-grid">
          <div className="stat-card">
            <span>Không gian người thử</span>
            <strong>{data?.participants ?? "—"}</strong>
            <small>Email tự nhập, chưa xác minh danh tính</small>
          </div>
          <div className="stat-card">
            <span>Email có phản hồi</span>
            <strong>
              {data?.uniqueResponseCount ?? allRows.length}
              <small> / 20</small>
            </strong>
            <small>Một người thật có thể có nhiều email</small>
          </div>
          <div className="stat-card">
            <span>Tương tác đã ghi</span>
            <strong>{data?.events ?? "—"}</strong>
            <small>Không gồm tải nền tự động</small>
          </div>
          <div className="stat-card">
            <span>Độ dễ dùng · người tự thao tác</span>
            <strong>
              {mean(selfEase)}
              <small> / 5</small>
            </strong>
            <small>{selfEase.length} lượt đánh giá tính năng</small>
          </div>
        </div>
        <div className="research-readiness">
          <div>
            <strong>
              {data?.readyToReview ?? "—"} tài khoản có phản hồi và log ba luồng
              cốt lõi
            </strong>
            <p>
              Đã sửa tour, xem portal, tạo và đổi trạng thái việc trước phản
              hồi. Đây là thông tin đối chiếu; thiếu log không chứng minh người
              đó chưa xem demo. Nhóm xác nhận cá nhân thật để chốt mẫu.
            </p>
          </div>
        </div>
        <section className="panel">
          <div className="panel-header">
            <div>
              <h3>Xuất dữ liệu gốc</h3>
              <p>
                Bản CSV chứa email chỉ dành cho nhóm và giảng viên được cấp
                quyền.
              </p>
            </div>
            <div className="button-row">
              <a
                className="btn ghost"
                href="/api/export/events"
                data-track="research:events"
              >
                <Download size={16} />
                Tương tác CSV
              </a>
              <a
                className="btn ghost"
                href="/api/export/survey-testers"
                data-track="research:testers"
              >
                <Download size={16} />
                Người thử CSV
              </a>
              <a
                className="btn"
                href="/api/export/survey-features"
                data-track="research:features"
              >
                <Download size={16} />
                Đánh giá tính năng CSV
              </a>
            </div>
          </div>
          <p className="research-export-note">
            Hai CSV khảo sát dùng cùng cấu trúc Raw_testers / Raw_features của
            Sheet. Dữ liệu cũ được giữ riêng; không cộng số email giữa các bản
            để đếm người.
          </p>
          <div className="feature-research-grid">
            {featureList.map(([id, name, , Icon]) => {
              const entries = rows
                  .flatMap((f) => f.entries)
                  .filter((e) => e.feature === id && e.mode !== "untried"),
                self = entries.filter((e) => e.mode === "self"),
                demo = entries.filter((e) => e.mode === "demo");
              return (
                <article className="feature-research-card" key={id}>
                  <div>
                    <Icon size={19} />
                    <h4>{name}</h4>
                  </div>
                  <p>
                    {self.length} tự dùng · {demo.length} xem demo
                  </p>
                  <dl>
                    <div>
                      <dt>Quan trọng</dt>
                      <dd>
                        {mean(
                          entries
                            .filter((e) => Number.isInteger(e.importance))
                            .map((e) => e.importance),
                        )}
                        <small> /5</small>
                      </dd>
                    </div>
                    <div>
                      <dt>Dễ dùng · tự thao tác</dt>
                      <dd>
                        {mean(
                          self
                            .filter((e) => Number.isInteger(e.ease))
                            .map((e) => e.ease),
                        )}
                        <small> /5</small>
                      </dd>
                    </div>
                  </dl>
                  <small>
                    Ý định Có: tự dùng{" "}
                    {self.filter((e) => e.intent === "yes").length}/
                    {self.length}; xem demo{" "}
                    {demo.filter((e) => e.intent === "yes").length}/
                    {demo.length}
                  </small>
                </article>
              );
            })}
          </div>
          {allRows.length ? (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Người tham gia</th>
                    <th>Vai trò</th>
                    <th>Nội dung phản hồi</th>
                    <th>Mức phí đề xuất / tháng</th>
                    <th>Điểm cần cải thiện</th>
                  </tr>
                </thead>
                <tbody>
                  {allRows.map((f) => (
                    <tr key={f.user_id}>
                      <td>{f.name}</td>
                      <td>{roleNames[f.role] || f.role}</td>
                      <td>
                        {f.entries
                          ? `${f.entries.filter((e) => e.mode !== "untried").length} tính năng · bản mới`
                          : "3 tính năng · bản trước"}
                      </td>
                      <td>
                        {f.entries
                          ? f.price_status === "provided"
                            ? money(f.price)
                            : priceLabels[f.price_status]
                          : money(f.price)}
                      </td>
                      <td>{f.disliked || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            !busy && (
              <Empty title="Chưa có phản hồi thực">
                Mời người tham gia trải nghiệm rồi gửi đánh giá. Không lấy tài
                khoản QA hoặc số click để thay cho người thử thật.
              </Empty>
            )
          )}
          {!!legacy.length && (
            <details className="legacy-feedback">
              <summary>
                Dữ liệu phản hồi phiên bản trước ({legacy.length})
              </summary>
              <p>
                Các câu hỏi cũ đo hữu ích của ba tính năng và độ dễ dùng chung,
                không trộn vào điểm quan trọng/dễ dùng theo tính năng của bản
                mới.
              </p>
              <a className="btn ghost" href="/api/export/feedback">
                <Download size={16} />
                Phản hồi bản trước CSV
              </a>
            </details>
          )}
        </section>
      </>
    );
  }

  function Help({ user, onClose, onDelete, onNav }) {
    const viewer = user.role === "reviewer";
    const open = (nav) => {
      onClose();
      onNav?.(nav);
    };
    return (
      <Modal
        title="Hướng dẫn sử dụng TaskHub"
        subtitle="Chọn một việc cần làm để bắt đầu."
        onClose={onClose}
        wide
      >
        <div className="help-content help-v2">
          <div className="guide-grid">
            {featureList.map(([id, name, description, Icon, nav]) => (
              <button
                key={id}
                className="guide-action"
                onClick={() => open(nav)}
                data-track={"help:" + id}
              >
                <Icon size={22} />
                <span>
                  <strong>{name}</strong>
                  <small>{description}</small>
                </span>
                <ArrowRight size={16} />
              </button>
            ))}
          </div>
          <details open>
            <summary>Khởi tạo tour và tiếp nhận tư vấn</summary>
            <p>
              Quản lý tour → chọn nội dung từ danh mục hoặc nhập Excel/CSV → bổ
              sung ngày đi, giá, sức chứa, khách đã giữ và lịch trình → lưu
              nháp. Kiểm tra thông tin rồi bật công khai. Cổng khách hàng cập
              nhật cùng nguồn theo chu kỳ 5 giây khi tab đang mở.
            </p>
            <p>
              Danh mục Én Việt là tham khảo có nguồn, chưa phải lịch bán. Tour
              hết chỗ hoặc đã qua ngày khởi hành không nhận yêu cầu mới. Yêu cầu
              tư vấn không giữ chỗ, không phải booking hoặc thanh toán.
            </p>
          </details>
          <details>
            <summary>Giao việc và theo dõi tiến độ</summary>
            <p>
              Nhấn Giao việc trên thẻ tour, nhập tên người phụ trách và hạn. Tại
              Công việc, sửa thông tin, đổi trạng thái hoặc xóa việc nhập nhầm
              sau xác nhận. Bộ lọc giúp tìm việc quá hạn hoặc ưu tiên cao.
            </p>
            <p>
              Tài khoản & nhóm cho phép chủ không gian mời nhân viên cùng làm việc, cấp quyền chỉ xem hoặc được sửa. Tên người phụ trách công việc vẫn là thông tin tự nhập; chưa có thông báo tự gửi.
            </p>
          </details>
          <details>
            <summary>Ghép tour và đối soát B2B</summary>
            <p>
              Tạo phiếu từ thỏa thuận đã có. Phiếu chờ chưa giữ chỗ; Xác nhận
              ghép mới cộng khách vào tour. Ghi nhận thu là tổng tiền lũy kế đã
              đối chiếu. Xem lịch sử để biết ai sửa, thời gian và số trước/sau;
              tải CSV khi cần.
            </p>
            <p>
              Hủy phiếu đã xác nhận trả chỗ đúng một lần. Phiếu còn số thu phải
              được đối soát về 0 trước khi hủy. Đây là sổ nội bộ, chưa có đối
              tác tự duyệt, chuyển tiền hoặc hoàn tiền.
            </p>
          </details>
          <details>
            <summary>Phạm vi demo P1 P2 P3 và S1 đến S4</summary>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Pain / giải pháp</th>
                    <th>Đã có</th>
                    <th>Giới hạn</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>P1 · S-2</td>
                    <td>Tour, công việc, Excel và thao tác nhanh</td>
                    <td>Đã có nhân viên chỉ xem/được sửa; chưa quản lý nhà cung cấp</td>
                  </tr>
                  <tr>
                    <td>P2 · S-1</td>
                    <td>Portal, lịch/giá/chỗ và tư vấn</td>
                    <td>Chưa phải booking/thanh toán</td>
                  </tr>
                  <tr>
                    <td>P3 · S-3</td>
                    <td>Phiếu B2B, giữ chỗ và đối soát có lịch sử</td>
                    <td>Sổ nội bộ, chưa có duyệt hai phía</td>
                  </tr>
                  <tr>
                    <td>S-4</td>
                    <td>Đánh giá 6 nhóm tính năng và mức phí đề xuất</td>
                    <td>Cần người thử thật để phân tích và chốt giá</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </details>
          <details>
            <summary>Dữ liệu và quyền riêng tư</summary>
            <p>
              Đăng ký tự nguyện. Email và vai trò do người dùng nhập. Xác minh email chỉ hoạt động khi kết nối dịch vụ gửi thư và không thay thế kiểm tra danh tính. Nhóm ghi thao tác nghiệp vụ và mã nút/menu/thời
              gian, không ghi nội dung gõ hoặc mật khẩu. Dữ liệu nghiên cứu chỉ
              dành cho nhóm và người đánh giá được cấp quyền, lưu tối đa khoảng
              6 tháng.
            </p>
            <p>
              CSV, bản sao và Sheet đã xuất cần nhóm xóa riêng khi có yêu cầu.
              Không nhập thông tin khách hàng thật vào không gian dùng thử.
            </p>
            {!["admin", "reviewer"].includes(user.role) && (
              <Button
                variant="danger"
                onClick={onDelete}
                data-track="account:delete"
              >
                {user.role === "staff" ? "Xóa tài khoản nhân viên của tôi" : "Xóa tài khoản và dữ liệu dùng thử"}
              </Button>
            )}
          </details>
          <div className="help-support">
            <MessageSquare size={20} />
            <div>
              <strong>
                {viewer ? "Quyền người đánh giá" : "Góp ý và báo lỗi"}
              </strong>
              <p>
                {viewer
                  ? "Tài khoản này chỉ xem và xuất dữ liệu, không tạo hoặc sửa bản ghi."
                  : user.role === "staff" ? "Báo lỗi cho chủ không gian hoặc tạo yêu cầu trên GitHub. Không đăng dữ liệu cá nhân và thông tin khách hàng." : "Ghi chức năng, thao tác gặp lỗi và điều cần cải thiện trong mục Phản hồi MVP."}
              </p>
              {user.role !== "staff" && <Button variant="ghost" onClick={() => open("research")}>
                {viewer ? "Xem phản hồi và dữ liệu" : "Mở phản hồi MVP"}
                <ArrowRight size={15} />
              </Button>}
              <a className="text-btn" href="https://github.com/skunlainro3-glitch/TaskHub/issues" target="_blank" rel="noopener noreferrer">Báo lỗi / góp ý trên GitHub</a>
            </div>
          </div>
        </div>
      </Modal>
    );
  }
  return { FeatureFeedback, Research, Help };
}
