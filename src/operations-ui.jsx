import React, { useState, useRef } from "react";
import {
  Upload,
  Download,
  Check,
  Plus,
  Handshake,
  History,
  RefreshCw,
} from "lucide-react";
import { readTourFile, downloadTourTemplate } from "./import-tours.mjs";
import "./operations-polish.css";

// Reuse TaskHub's accessible controls and API client in these bounded workflows.
export function createOperationsUI({
  Modal,
  Button,
  Field,
  ErrorBox,
  Empty,
  Badge,
  api,
  money,
  date,
}) {
  function ImportTours({ onClose, onSave }) {
    const [rows, setRows] = useState(null),
      [preview, setPreview] = useState(null),
      [error, setError] = useState(""),
      [busy, setBusy] = useState(false),
      [saved, setSaved] = useState(false);
    const importId = useRef(crypto.randomUUID());
    const pending = useRef(false);
    const close = () => {
      if (!pending.current) onClose();
    };
    async function choose(e) {
      if (pending.current) return;
      const file = e.target.files[0];
      if (!file) return;
      e.target.value = "";
      pending.current = true;
      setBusy(true);
      setRows(null);
      setPreview(null);
      setError("");
      setSaved(false);
      importId.current = crypto.randomUUID();
      try {
        const data = await readTourFile(file);
        if (
          new TextEncoder().encode(JSON.stringify({ rows: data })).byteLength >
          250000
        )
          throw Error("Nội dung quá dài. Chia nhỏ thành nhiều đợt nhập.");
        const result = await api("/tours/import", "POST", {
          rows: data,
          preview: true,
        });
        setRows(data);
        setPreview(result);
      } catch (e) {
        setError(e.message);
      } finally {
        pending.current = false;
        setBusy(false);
      }
    }
    async function save() {
      if (pending.current || saved || !preview || preview.errors.length) return;
      pending.current = true;
      setBusy(true);
      setError("");
      try {
        const result = await api("/tours/import", "POST", {
          rows,
          import_id: importId.current,
        });
        setSaved(true);
        await onSave(result.count);
        onClose();
      } catch (e) {
        setSaved(false);
        setError(e.message);
      } finally {
        pending.current = false;
        setBusy(false);
      }
    }
    return (
      <Modal
        title="Nhập tour từ Excel"
        subtitle="Chọn tệp, kiểm tra rồi nhập một lần. Tour mới là bản nháp."
        onClose={close}
        busy={busy}
        wide
      >
        <div className="import-guide">
          <Upload size={25} />
          <div>
            <strong>.xlsx hoặc .csv · tối đa 20 tour</strong>
            <p>
              Tệp tối đa 2 MB. Ngày dạng YYYY-MM-DD hoặc DD/MM/YYYY; tiền VND và
              số khách là số nguyên, không có dấu phân cách hàng nghìn.
            </p>
          </div>
        </div>
        <Button variant="ghost" onClick={downloadTourTemplate}>
          <Download size={16} />
          Tải mẫu CSV cho Excel
        </Button>
        <Field label="Tệp tour Excel hoặc CSV">
          <input
            type="file"
            accept=".xlsx,.csv"
            disabled={busy || saved}
            onChange={choose}
            data-track="tour:import-file"
          />
        </Field>
        <ErrorBox error={error} />
        {busy && !rows && <p className="loading">Đang đọc và kiểm tra tệp…</p>}
        {preview && (
          <>
            <div
              className={
                "import-result " + (preview.errors.length ? "invalid" : "valid")
              }
            >
              <strong>
                {preview.count} / {rows.length} dòng hợp lệ
              </strong>
              <p>
                {preview.errors.length
                  ? "Chưa nhập dữ liệu. Sửa các dòng lỗi và chọn lại tệp."
                  : "Ngày, số chỗ và các trường bắt buộc đã được kiểm tra. Tour chưa được công khai."}
              </p>
            </div>
            {!!preview.errors.length && (
              <ul className="import-errors">
                {preview.errors.map((e) => (
                  <li key={e.row}>
                    Dòng {e.row}: {e.message}
                  </li>
                ))}
              </ul>
            )}
            <div className="import-preview">
              {rows.slice(0, 5).map((t, i) => (
                <div key={i}>
                  <strong>{t.title || `Dòng ${i + 2}`}</strong>
                  <span>
                    {t.destination} · {t.departure} · {t.capacity ?? "?"} chỗ
                  </span>
                </div>
              ))}
              {rows.length > 5 && <p>Và {rows.length - 5} tour khác.</p>}
            </div>
          </>
        )}
        <div className="modal-actions">
          <Button variant="ghost" disabled={busy} onClick={close}>
            Đóng
          </Button>
          <Button
            disabled={busy || saved || !preview || preview.errors.length > 0}
            onClick={save}
          >
            {busy
              ? "Đang nhập…"
              : saved
                ? "Đã nhập"
                : "Nhập " + (rows?.length || 0) + " tour"}
            <Check size={16} />
          </Button>
        </div>
      </Modal>
    );
  }
  function ConflictRecovery({ visible, busy, onRefresh }) {
    if (!visible || !onRefresh) return null;
    return (
      <div className="operation-recovery" role="status">
        <p>
          Dữ liệu có thể đã được cập nhật ở nơi khác. Giá trị bạn vừa nhập vẫn
          được giữ. Nạp bản mới để kiểm tra rồi nhập lại nếu cần.
        </p>
        <Button
          type="button"
          variant="ghost"
          disabled={busy}
          onClick={onRefresh}
          data-track="operation:reload-conflict"
        >
          <RefreshCw size={16} />
          Nạp bản mới
        </Button>
      </div>
    );
  }
  function SeatEditor({
    tour,
    minimumReserved = 0,
    onClose,
    onSave,
    onRefresh,
  }) {
    const [current, setCurrent] = useState(tour),
      [floor, setFloor] = useState(minimumReserved),
      [revision, setRevision] = useState(0);
    const [error, setError] = useState(""),
      [busy, setBusy] = useState(false),
      [conflict, setConflict] = useState(false);
    const pending = useRef(false);
    const close = () => {
      if (!pending.current) onClose();
    };
    async function refresh() {
      if (pending.current || !onRefresh) return;
      pending.current = true;
      setBusy(true);
      setError("");
      try {
        const fresh = await onRefresh(),
          next = fresh?.tours?.find((t) => t.id === current.id);
        if (!next)
          throw Error(
            "Tour không còn trong không gian này. Đóng cửa sổ và kiểm tra danh sách tour.",
          );
        setCurrent(next);
        setFloor(
          (fresh.pooling || [])
            .filter((p) => p.tour_id === next.id && p.status === "confirmed")
            .reduce((sum, p) => sum + p.seats, 0),
        );
        setRevision((n) => n + 1);
        setConflict(false);
      } catch (e) {
        setError(e.message);
      } finally {
        pending.current = false;
        setBusy(false);
      }
    }
    async function submit(e) {
      e.preventDefault();
      if (pending.current) return;
      pending.current = true;
      setBusy(true);
      setError("");
      const reserved = Number(new FormData(e.target).get("reserved"));
      try {
        await api("/tours/" + current.id, "PUT", {
          ...current,
          published: !!current.published,
          reserved,
        });
        await onSave();
        onClose();
      } catch (e) {
        setError(e.message);
        setConflict(e.status === 409);
      } finally {
        pending.current = false;
        setBusy(false);
      }
    }
    return (
      <Modal title="Cập nhật số khách" subtitle={current.title} onClose={close}>
        <form onSubmit={submit}>
          <ErrorBox error={error} />
          <ConflictRecovery
            visible={conflict}
            busy={busy}
            onRefresh={onRefresh ? refresh : null}
          />
          <p className="muted">
            Khởi hành {date(current.departure)} · Sức chứa {current.capacity}{" "}
            khách.
          </p>
          <Field
            label="Khách đã giữ chỗ"
            hint={`Bao gồm ${floor} khách ghép đã xác nhận. Portal sẽ cập nhật số chỗ còn lại.`}
          >
            <input
              key={current.version + ":" + revision}
              type="number"
              name="reserved"
              defaultValue={current.reserved}
              min={floor}
              max={current.capacity}
              required
              autoFocus
              disabled={busy}
            />
          </Field>
          <div className="modal-actions">
            <Button
              type="button"
              variant="ghost"
              disabled={busy}
              onClick={close}
            >
              Hủy
            </Button>
            <Button disabled={busy || conflict}>
              {busy ? "Đang lưu…" : "Lưu số khách"}
              <Check size={16} />
            </Button>
          </div>
        </form>
      </Modal>
    );
  }
  function PoolingEditor({ tours, pool, onClose, onSave, onRefresh }) {
    const [current, setCurrent] = useState(pool),
      [currentTours, setCurrentTours] = useState(tours),
      [revision, setRevision] = useState(0);
    const [error, setError] = useState(""),
      [busy, setBusy] = useState(false),
      [conflict, setConflict] = useState(false);
    const pending = useRef(false);
    const close = () => {
      if (!pending.current) onClose();
    };
    async function refresh() {
      if (pending.current || !onRefresh) return;
      pending.current = true;
      setBusy(true);
      setError("");
      try {
        const fresh = await onRefresh();
        if (!fresh?.tours)
          throw Error("Chưa tải được dữ liệu mới. Vui lòng thử lại.");
        if (current) {
          const next = fresh.pooling?.find((p) => p.id === current.id);
          if (!next)
            throw Error(
              "Phiếu không còn trong không gian này. Đóng cửa sổ và kiểm tra danh sách.",
            );
          setCurrent(next);
        }
        setCurrentTours(fresh.tours);
        setRevision((n) => n + 1);
        setConflict(false);
      } catch (e) {
        setError(e.message);
      } finally {
        pending.current = false;
        setBusy(false);
      }
    }
    async function submit(e) {
      e.preventDefault();
      if (pending.current) return;
      pending.current = true;
      setBusy(true);
      setError("");
      const b = Object.fromEntries(new FormData(e.target));
      try {
        if (current)
          await api("/pooling/" + current.id, "PATCH", {
            action: "payment",
            paid: Number(b.paid),
            version: current.version,
          });
        else
          await api("/pooling", "POST", {
            ...b,
            seats: Number(b.seats),
            unit_price: Number(b.unit_price),
          });
        await onSave();
        onClose();
      } catch (e) {
        setError(e.message);
        setConflict(e.status === 409);
      } finally {
        pending.current = false;
        setBusy(false);
      }
    }
    const inactive = current && current.status !== "confirmed";
    return (
      <Modal
        title={current ? "Đối soát tiền đã thu" : "Tạo phiếu ghép tour"}
        subtitle={
          current
            ? current.partner + " · " + current.tour_title
            : "Ghi nhận thỏa thuận với đối tác; xác nhận chỗ ở bước tiếp theo."
        }
        onClose={close}
      >
        <form onSubmit={submit}>
          <ErrorBox error={error} />
          <ConflictRecovery
            visible={conflict}
            busy={busy}
            onRefresh={onRefresh ? refresh : null}
          />
          {current ? (
            <>
              <div className="pool-payment-summary">
                <span>
                  {current.seats} khách × {money(current.unit_price)}
                </span>
                <strong>
                  Phải thu: {money(current.seats * current.unit_price)}
                </strong>
              </div>
              {inactive && (
                <p className="operation-state-note" role="status">
                  Phiếu hiện{" "}
                  {status[current.status]?.toLocaleLowerCase("vi") ||
                    "không khả dụng"}
                  . Chỉ đối soát phiếu đã xác nhận.
                </p>
              )}
              <Field
                label="Tổng tiền đã ghi nhận thu (VND)"
                hint="Nhập tổng lũy kế đã đối chiếu, không nhập riêng khoản vừa thu."
              >
                <input
                  key={current.version + ":" + revision}
                  name="paid"
                  type="number"
                  min="0"
                  max={current.seats * current.unit_price}
                  defaultValue={current.paid}
                  required
                  disabled={busy || inactive}
                />
              </Field>
              <p className="operation-correction-note">
                Mỗi lần lưu thay thế tổng tiền trên sổ và lưu lịch sử trước/sau.
                Giảm số tiền là chỉnh sửa ghi sổ; hệ thống không thực hiện thanh
                toán hoặc hoàn tiền cho đối tác.
              </p>
            </>
          ) : (
            <fieldset className="operation-fields" disabled={busy}>
              <Field label="Tour ghép">
                <select name="tour_id" required defaultValue="">
                  <option value="" disabled>
                    Chọn tour đã có lịch và số chỗ
                  </option>
                  {currentTours.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.title} · {date(t.departure)} · còn{" "}
                      {t.capacity - t.reserved} chỗ
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Tên đối tác">
                <input
                  name="partner"
                  required
                  maxLength="120"
                  placeholder="Nhập tên đơn vị đã thỏa thuận"
                />
              </Field>
              <div className="form-grid">
                <Field label="Số khách ghép">
                  <input
                    type="number"
                    name="seats"
                    min="1"
                    max="1000"
                    required
                  />
                </Field>
                <Field label="Giá net thỏa thuận / khách (VND)">
                  <input
                    type="number"
                    name="unit_price"
                    min="0"
                    max="1000000000"
                    required
                  />
                </Field>
              </div>
              <Field label="Ghi chú thỏa thuận">
                <textarea name="note" rows="3" maxLength="1000" />
              </Field>
            </fieldset>
          )}
          <div className="modal-actions">
            <Button
              type="button"
              variant="ghost"
              disabled={busy}
              onClick={close}
            >
              Hủy
            </Button>
            <Button disabled={busy || conflict || inactive}>
              {busy ? "Đang lưu…" : current ? "Lưu đối soát" : "Tạo phiếu ghép"}
              <Check size={16} />
            </Button>
          </div>
        </form>
      </Modal>
    );
  }
  const status = {
    pending: "Chờ xác nhận",
    confirmed: "Đã xác nhận",
    cancelled: "Đã hủy",
  };
  function Pooling({ data, readOnly, onNew, onPayment, reload, notify, simulated = false }) {
    const [busy, setBusy] = useState(""),
      [cancel, setCancel] = useState(null),
      [history, setHistory] = useState(null);
    const pending = useRef(false);
    const pools = data.pooling || [],
      confirmed = pools.filter((p) => p.status === "confirmed"),
      tours = Object.fromEntries(data.tours.map((t) => [t.id, t]));
    async function action(row, kind) {
      if (pending.current) return;
      pending.current = true;
      setBusy(row.id);
      try {
        await api("/pooling/" + row.id, "PATCH", {
          action: kind,
          version: row.version,
          tour_version: tours[row.tour_id]?.version,
        });
        setCancel(null);
        await reload();
        notify(
          kind === "confirm"
            ? "Đã xác nhận ghép. Số chỗ tour đã cập nhật."
            : "Đã hủy phiếu. Chỗ đã giữ được trả lại.",
        );
      } catch (e) {
        notify(e.message, "error");
        await reload().catch(() => {});
      } finally {
        pending.current = false;
        setBusy("");
      }
    }
    const historyPool = pools.find((p) => p.id === history);
    const historyRows = (data.poolingHistory || []).filter(
      (row) => row.pooling_id === history,
    );
    const auditLabels = {
      pooling_created: "Tạo phiếu ghép",
      pooling_confirmed: "Xác nhận giữ chỗ",
      demo_seeded: "Khởi tạo dữ liệu giả lập",
      pooling_reconciled: "Điều chỉnh tổng đã thu",
      pooling_cancelled: "Hủy phiếu",
    };
    const stamp = (value) => {
      const d = new Date(value);
      return Number.isNaN(d.valueOf())
        ? "Không rõ thời điểm"
        : d.toLocaleString("vi-VN");
    };
    return (
      <>
        <div className="pooling-notice">
          {simulated && <p><strong>Quy ước demo:</strong> Số khách đã giữ trong tour bao gồm khách B2B đã xác nhận. B2B-101 thu giả lập 33,6 triệu; B2B-102 cọc giả lập 8,5 triệu (50%); B2B-103 vẫn chờ, chưa giữ chỗ hoặc ghi thu. Ghi chú nguồn cũ được giữ để đối chiếu; đây không phải giao dịch thực tế.</p>}
          <Handshake size={21} />
          <div>
            <strong>Ghép tour và đối soát tập trung</strong>
            <p>
              Điều hành ghi nhận thỏa thuận với đối tác. Phiếu chờ chưa giữ chỗ;
              xác nhận sẽ cộng số khách vào tour. Bản này chưa có đăng nhập hoặc
              phê duyệt từ phía đối tác.
            </p>
          </div>
        </div>
        <div className="pool-stats">
          <div>
            <span>Phiếu chờ xác nhận</span>
            <strong>
              {pools.filter((p) => p.status === "pending").length}
            </strong>
          </div>
          <div>
            <span>Khách ghép đã xác nhận</span>
            <strong>{confirmed.reduce((s, p) => s + p.seats, 0)}</strong>
          </div>
          <div>
            <span>Còn phải thu theo sổ</span>
            <strong>
              {money(
                confirmed.reduce(
                  (s, p) => s + p.seats * p.unit_price - p.paid,
                  0,
                ),
              )}
            </strong>
          </div>
        </div>
        <div className="pool-toolbar">
          <span className="muted">
            {pools.length} phiếu · trong không gian này
          </span>
          <div className="pool-export-actions">
            <a
              className="btn ghost"
              href="/api/pooling/export"
              data-track="pooling:export"
            >
              <Download size={16} />
              Đối soát CSV
            </a>
            <a
              className="btn ghost"
              href="/api/pooling/history/export"
              data-track="pooling:history-export"
            >
              <History size={16} />
              Lịch sử CSV
            </a>
          </div>
        </div>
        {!pools.length ? (
          <Empty title="Chưa có phiếu ghép tour">
            <span>
              Tạo phiếu từ thỏa thuận với đối tác. Không cần nhập dữ liệu khách
              hàng cá nhân.
            </span>
            {!readOnly && (
              <span className="pool-empty-action">
                <Button disabled={!data.tours.length} onClick={onNew}>
                  Tạo phiếu ghép
                  <Plus size={16} />
                </Button>
                {!data.tours.length && (
                  <small>Tạo một tour trước khi lập phiếu ghép.</small>
                )}
              </span>
            )}
          </Empty>
        ) : (
          <div className="pool-list">
            {pools.map((p) => (
              <article className="pool-card" key={p.id}>
                <div className="pool-card-heading">
                  <div>
                    <strong>{p.partner}</strong>
                    <p>
                      {p.tour_title} · {date(p.departure)}
                    </p>
                  </div>
                  <Badge tone={p.status === "confirmed" ? "blue" : "gray"}>
                    {status[p.status]}
                  </Badge>
                </div>
                <div className="pool-card-facts">
                  <div>
                    <span>Khách ghép</span>
                    <strong>{p.seats} khách</strong>
                  </div>
                  <div>
                    <span>Giá net / khách</span>
                    <strong>{money(p.unit_price)}</strong>
                  </div>
                  <div>
                    <span>Đã ghi nhận thu</span>
                    <strong>{money(p.paid)}</strong>
                  </div>
                  <div>
                    <span>Còn phải thu</span>
                    <strong>
                      {p.status === "cancelled"
                        ? "—"
                        : money(p.seats * p.unit_price - p.paid)}
                    </strong>
                  </div>
                </div>
                {p.note && <p className="pool-note">{p.note}</p>}
                <div className="pool-card-actions">
                  {!readOnly && p.status !== "cancelled" && (
                    <>
                      {p.status === "pending" ? (
                        <Button
                          disabled={!!busy}
                          onClick={() => action(p, "confirm")}
                          data-track="pooling:confirm"
                        >
                          Xác nhận ghép
                          <Check size={16} />
                        </Button>
                      ) : (
                        <Button
                          variant="ghost"
                          disabled={!!busy}
                          onClick={() => onPayment(p)}
                          data-track="pooling:payment"
                        >
                          Ghi nhận thu
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        disabled={!!busy || p.paid > 0}
                        onClick={() => setCancel(p)}
                        data-track="pooling:cancel"
                      >
                        Hủy phiếu
                      </Button>
                    </>
                  )}
                  <Button
                    variant="ghost"
                    disabled={!!busy}
                    onClick={() => setHistory(p.id)}
                    data-track="pooling:history"
                    data-track-entity={p.id}
                  >
                    <History size={16} />
                    Lịch sử phiếu
                  </Button>
                  {!readOnly && p.paid > 0 && p.status !== "cancelled" && (
                    <small>Đối soát số tiền về 0 trước khi hủy.</small>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
        {cancel && (
          <Modal
            title="Hủy phiếu ghép tour?"
            subtitle={cancel.partner}
            onClose={() => {
              if (!pending.current) setCancel(null);
            }}
          >
            <p>
              {cancel.status === "confirmed"
                ? `${cancel.seats} chỗ đã giữ sẽ được trả lại cho tour.`
                : "Phiếu chờ chưa giữ chỗ nên số chỗ tour không thay đổi."}{" "}
              Thỏa thuận với đối tác cần được xử lý riêng.
            </p>
            <div className="modal-actions">
              <Button
                variant="ghost"
                disabled={!!busy}
                onClick={() => setCancel(null)}
              >
                Giữ phiếu
              </Button>
              <Button
                variant="danger"
                disabled={!!busy}
                onClick={() => action(cancel, "cancel")}
              >
                {busy ? "Đang hủy…" : "Xác nhận hủy phiếu"}
              </Button>
            </div>
          </Modal>
        )}
        {historyPool && (
          <Modal
            title="Lịch sử phiếu ghép"
            subtitle={historyPool.partner + " · " + historyPool.tour_title}
            onClose={() => setHistory(null)}
            wide
          >
            <p className="pool-history-intro">
              Thao tác và số tiền trước/sau được lưu khi phiếu thay đổi. Đây là
              lịch sử ghi sổ nội bộ, không phải chứng từ thanh toán. Hiển thị
              các dòng của phiếu trong 200 thay đổi gần nhất của không gian; tải
              CSV để xem toàn bộ.
            </p>
            {historyRows.length ? (
              <ol
                className="pool-history"
                aria-label="Các thay đổi của phiếu ghép"
              >
                {historyRows.map((row) => (
                  <li key={row.id}>
                    <div className="pool-history-heading">
                      <strong>
                        {auditLabels[row.action] || "Cập nhật phiếu"}
                      </strong>
                      <time dateTime={row.created}>{stamp(row.created)}</time>
                    </div>
                    <p className="pool-history-actor">
                      {row.actor_name || "Không còn thông tin người thực hiện"}
                    </p>
                    <dl>
                      <div>
                        <dt>Trạng thái</dt>
                        <dd>
                          {row.status_before
                            ? status[row.status_before] || row.status_before
                            : "—"}{" "}
                          <span aria-label="chuyển thành">→</span>{" "}
                          {status[row.status_after] || row.status_after}
                        </dd>
                      </div>
                      <div>
                        <dt>Tổng đã thu</dt>
                        <dd>
                          {money(row.paid_before)}{" "}
                          <span aria-label="chuyển thành">→</span>{" "}
                          {money(row.paid_after)}
                        </dd>
                      </div>
                    </dl>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="pool-history-empty" role="status">
                Chưa có lịch sử được ghi cho phiếu này trong 200 thay đổi gần
                nhất. Phiếu có trước khi bổ sung tính năng này không được tạo
                lại lịch sử. Có thể tải CSV để kiểm tra các dòng đã lưu.
              </p>
            )}
            <div className="modal-actions">
              <a
                className="btn ghost"
                href="/api/pooling/history/export"
                data-track="pooling:history-export"
              >
                <Download size={16} />
                Tải toàn bộ lịch sử CSV
              </a>
              <Button onClick={() => setHistory(null)}>Đóng lịch sử</Button>
            </div>
          </Modal>
        )}
      </>
    );
  }
  return { ImportTours, SeatEditor, PoolingEditor, Pooling };
}
