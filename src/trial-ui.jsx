import React, { useState, useEffect, useRef } from "react";
import { Play, Check, FlaskConical, Download, Clock } from "lucide-react";
import "./trial.css";
const features = [
  ["portal", "Cổng tour", "portal"],
  ["operations", "Quản lý tour & công việc", "tours"],
  ["sync", "Đồng bộ số chỗ", "tours"],
  ["pooling", "Ghép tour B2B", "pooling"],
  ["import", "Nhập Excel / CSV", "tours"],
  ["quick_actions", "Thao tác nhanh", "tours"],
];
const goals = {
  portal:
    "Tìm một tour, xem lịch trình, ngày đi và số chỗ; thử gửi một yêu cầu bằng thông tin giả.",
  operations:
    "Sửa một tour, tạo công việc gắn tour và đổi trạng thái công việc đó.",
  sync: "Đổi số khách đã giữ, mở cổng khách hàng và đối chiếu số chỗ mới.",
  pooling:
    "Xác nhận một phiếu đang chờ, đối chiếu số chỗ; ghi nhận khoản thu giả lập và xem lịch sử.",
  import:
    "Tải mẫu Excel/CSV, nhập dữ liệu giả và sửa một lỗi trong phần xem trước trước khi lưu nháp.",
  quick_actions:
    "Trên thẻ tour, dùng Đổi số chỗ hoặc Giao việc để hoàn tất một thao tác.",
};
const duration = (ms) => (ms == null ? "—" : Math.round(ms / 1000) + " giây");
export function createTrialUI({ Button, Field, ErrorBox, api }) {
  function DemoLoader({ data, reload, notify }) {
    const [busy, setBusy] = useState(false),
      [error, setError] = useState("");
    const lock = useRef(false);
    if (data.tours.length || data.tasks.length || data.pooling?.length)
      return null;
    return (
      <section className="sample-loader">
        <FlaskConical size={24} />
        <div>
          <h3>Bắt đầu với một bộ dữ liệu mẫu</h3>
          <p>
            3 tour, 3 công việc và 3 phiếu B2B giả lập. Tùy chọn này chỉ thêm
            vào không gian trống của bạn; không tạo phản hồi hoặc người thử giả.
          </p>
          <ErrorBox error={error} />
        </div>
        <Button
          disabled={busy}
          data-track="demo:load"
          onClick={async () => {
            if (lock.current) return;
            if (
              !confirm(
                "Thêm bộ dữ liệu giả lập vào không gian trống của bạn? Sau đó bạn có thể sửa hoặc xóa từng bản ghi.",
              )
            )
              return;
            lock.current = true;
            setBusy(true);
            setError("");
            try {
              await api("/demo/load", "POST", {});
              await reload();
              notify(
                "Đã thêm dữ liệu giả lập. Bạn có thể bắt đầu trải nghiệm.",
              );
            } catch (e) {
              setError(e.message);
              await reload().catch(() => {});
            } finally {
              lock.current = false;
              setBusy(false);
            }
          }}
        >
          {busy ? "Đang thêm…" : "Dùng dữ liệu mẫu"}
        </Button>
      </section>
    );
  }
  function TrialPanel({ onNav, onPortal }) {
    const [data, setData] = useState(null),
      [feature, setFeature] = useState("portal"),
      [busy, setBusy] = useState(false),
      [error, setError] = useState(""),
      [now, setNow] = useState(Date.now());
    const lock = useRef(false),
      attempt = useRef(null);
    const load = () => api("/trials").then(setData);
    useEffect(() => {
      load().catch((e) => setError(e.message));
      const timer = setInterval(() => setNow(Date.now()), 1000);
      return () => clearInterval(timer);
    }, []);
    const active = data?.active;
    async function save(result) {
      if (lock.current) return;
      lock.current = true;
      setBusy(true);
      setError("");
      try {
        if (result) await api("/trials/" + active.id, "PATCH", { result });
        else {
          attempt.current ||= crypto.randomUUID();
          await api("/trials", "POST", { trial_id: attempt.current, feature });
          attempt.current = null;
        }
        await load();
      } catch (e) {
        setError(e.message);
        await load().catch(() => {});
      } finally {
        setBusy(false);
        lock.current = false;
      }
    }
    const go = () => {
      const f = features.find((f) => f[0] === (active?.feature || feature));
      f[2] === "portal" ? onPortal() : onNav(f[2]);
    };
    return (
      <section className="trial-session panel">
        <div className="trial-heading">
          <div>
            <h3>Đo một bài thử thực tế</h3>
            <p>
              Bạn chủ động bắt đầu và kết thúc. Thời gian do máy chủ ghi nhận,
              gồm cả thời gian đọc và suy nghĩ; không phải chỉ số hiệu năng hệ
              thống.
            </p>
          </div>
          <Clock size={23} />
        </div>
        <ErrorBox error={error} />
        <p className="trial-goal">
          <strong>Nhiệm vụ:</strong> {goals[active?.feature || feature]}
        </p>
        {active ? (
          <>
            <div className="active-trial">
              <strong>
                Đang thử: {features.find((f) => f[0] === active.feature)?.[1]}
              </strong>
              <span>
                {duration(
                  Math.max(0, now - new Date(active.started_at).getTime()),
                )}
              </span>
              <Button variant="ghost" onClick={go}>
                Mở chức năng
              </Button>
            </div>
            <p>Kết thúc theo đúng trải nghiệm của bạn:</p>
            <div className="button-row">
              <Button
                disabled={busy}
                data-track="trial:completed"
                onClick={() => save("completed")}
              >
                <Check size={16} /> Tự hoàn thành
              </Button>
              <Button
                disabled={busy}
                variant="ghost"
                onClick={() => save("assisted")}
              >
                Cần hỗ trợ
              </Button>
              <Button
                disabled={busy}
                variant="ghost"
                onClick={() => save("incomplete")}
              >
                Chưa hoàn thành
              </Button>
            </div>
          </>
        ) : (
          <div className="trial-start">
            <Field label="Chức năng muốn thử">
              <select
                value={feature}
                onChange={(e) => setFeature(e.target.value)}
                disabled={busy}
              >
                {features.map(([id, label]) => (
                  <option key={id} value={id}>
                    {label}
                  </option>
                ))}
              </select>
            </Field>
            <Button
              disabled={busy || !data}
              onClick={() => save()}
              data-track="trial:start"
            >
              <Play size={16} />
              {busy ? "Đang bắt đầu…" : "Bắt đầu đo"}
            </Button>
          </div>
        )}
        {!!data?.trials?.filter((t) => t.finished_at).length && (
          <details>
            <summary>Lịch sử bài thử của bạn</summary>
            <div className="trial-history">
              {data.trials
                .filter((t) => t.finished_at)
                .slice(-12)
                .reverse()
                .map((t) => (
                  <p key={t.id}>
                    <strong>
                      {features.find((f) => f[0] === t.feature)?.[1]}
                    </strong>
                    <span>
                      {duration(t.duration_ms)} ·{" "}
                      {t.result === "completed"
                        ? "Tự hoàn thành"
                        : t.result === "assisted"
                          ? "Cần hỗ trợ"
                          : "Chưa hoàn thành"}
                    </span>
                  </p>
                ))}
            </div>
          </details>
        )}
      </section>
    );
  }
  function TrialSummary() {
    const [data, setData] = useState(null),
      [error, setError] = useState("");
    useEffect(() => {
      api("/trials/summary")
        .then(setData)
        .catch((e) => setError(e.message));
    }, []);
    return (
      <section className="panel trial-session">
        <div className="trial-heading">
          <div>
            <h3>Thời gian các bài thử</h3>
            <p>
              Chỉ tính bài thử được người tham gia chủ động bắt đầu. Số tài
              khoản có bài thử chưa phải bằng chứng đã tuyển đủ 20 tester thật.
            </p>
          </div>
          <a className="btn ghost" href="/api/export/trials">
            <Download size={16} /> Bài thử CSV
          </a>
        </div>
        <ErrorBox error={error} />
        {data && (
          <div className="trial-metrics">
            <div>
              <strong>{data.participants ?? 0}</strong>
              <small>Tài khoản có bài thử</small>
            </div>
            <div>
              <strong>{data.started ?? 0}</strong>
              <small>Lượt bắt đầu</small>
            </div>
            <div>
              <strong>{data.finished ?? 0}</strong>
              <small>Lượt kết thúc</small>
            </div>
            <div>
              <strong>{data.completed ?? 0}</strong>
              <small>Tự hoàn thành</small>
            </div>
          </div>
        )}
      </section>
    );
  }
  return { DemoLoader, TrialPanel, TrialSummary };
}
