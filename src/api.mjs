// One browser API wrapper for all screens. Never automatically retry a write:
// after a timeout the server may already have saved it.
export async function api(path, method = "GET", data) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000);
  try {
    const response = await fetch("/api" + path, {
      method,
      credentials: "same-origin",
      headers: { "Content-Type": "application/json", "X-TaskHub": "1" },
      signal: controller.signal,
      ...(data ? { body: JSON.stringify(data) } : {}),
    });
    let body;
    try {
      body = await response.json();
    } catch {
      throw Error("Không kết nối được hệ thống.");
    }
    if (!response.ok) {
      throw Object.assign(
        Error(body.message || "Không thể thực hiện thao tác."),
        {
          status: response.status,
        },
      );
    }
    return body;
  } catch (error) {
    if (error.name === "AbortError") {
      throw Error(
        "Máy chủ phản hồi chậm. Vui lòng thử lại; trước khi gửi lại thay đổi, kiểm tra dữ liệu đã được lưu chưa.",
      );
    }
    if (error instanceof TypeError) {
      throw Error("Mất kết nối. Kiểm tra mạng và thử lại.");
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}
