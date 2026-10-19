# P1–P3 và S-1–S-4 — bản demo 18/10/2026

Web: https://taskhub-travel.pages.dev/ · Bản 0.5.0, cập nhật 19/10/2026. Các tag demo đã phát hành giữ nguyên.

## Pain → tính năng → cách chứng minh

| Pain CP2 | Tính năng để demo trực tiếp | Thao tác và dấu hiệu đúng | Giới hạn |
| --- | --- | --- | --- |
| **P1: thông tin rời rạc, thất lạc, khó theo dõi** | Nguồn tour dùng chung, công việc gắn tour, nhập Excel, thao tác nhanh | Nhập XLSX/CSV hoặc dùng danh mục đã có nguồn; đổi số khách ngay trên thẻ tour; tạo việc và đổi trạng thái. Ngày, giá và số chỗ trên portal khớp dữ liệu điều hành. | Người phụ trách là tên nhập; đã có nhân viên chỉ xem/được sửa; chưa tích hợp Zalo. |
| **P2: khách cần thông tin ngoài giờ** | Public Tour Portal trên cloud; tìm/lọc, chi tiết, yêu cầu tư vấn | Mở cổng riêng của tour đã công khai, tra cứu và gửi yêu cầu; điều hành nhìn thấy yêu cầu mới. Web không phụ thuộc máy của Tuấn bật. | Không phải booking, không giữ chỗ, không thanh toán hoặc tự gửi email. Không cam kết SLA. |
| **P3: lệch số khách và đối soát khi ghép tour** | Sổ B2B tối giản: phiếu đối tác, xác nhận chỗ, tiền đã thu/còn phải thu, CSV | Tạo phiếu: chỗ chưa đổi. Xác nhận: số khách trong tour tăng, chỗ trên portal giảm. Ghi nhận tổng tiền đã thu: số còn phải thu thay đổi. Hủy phiếu đã đối soát về 0: trả lại đúng số chỗ một lần. | Điều hành nhập thỏa thuận; chưa có đối tác đăng nhập/tự duyệt, mạng lưới ghép liên doanh nghiệp hoặc xác nhận dịch vụ hai phía. |

## Mức hoàn thành các giải pháp CP2

| Giải pháp | Mức hoàn thành của MVP | Còn thiếu để giải pháp đầy đủ |
| --- | --- | --- |
| **S-1 — Public Tour Portal** | Đã có luồng cốt lõi: tra cứu ngoài giờ, lịch/giá/chỗ, yêu cầu tư vấn. Có 13 nội dung tour Én Việt tham khảo, tách biệt với lịch khởi hành đã xác nhận. | Booking/thanh toán tự động, chatbot và các tình huống cần con người. |
| **S-2 — Điều hành tập trung** | Đã có tour/lịch/chỗ, tạo/sửa/xóa việc có kiểm tra phiên bản, lọc quá hạn/ưu tiên, nhập XLSX/CSV và thao tác nhanh trên thẻ. | Thông báo tự gửi; quản lý nhà cung cấp và net price/markup toàn bộ tour. Giá net B2B hiện chỉ nằm trên từng phiếu ghép. |
| **S-3 — Tour-pooling và đối soát B2B** | **Đã có bản tối giản để demo P3:** tạo phiếu → xác nhận → giữ chỗ → ghi nhận thu/còn phải thu → lịch sử ai/lúc nào/số trước-sau → CSV/hủy hoàn chỗ. | Đối tác tự xác nhận, hồ sơ/hợp đồng, hóa đơn và thanh toán/hoàn tiền thực tế; không gọi đây là B2B hoàn chỉnh. |
| **S-4 — Điều chỉnh chiến lược thu phí** | Đã có thu willingness-to-pay và công cụ tổng hợp; bộ câu hỏi đánh giá từng tính năng được bàn giao cho An. | Tối thiểu 20 cá nhân thật, phân tích mẫu, phỏng vấn người quyết định, paid pilot và chốt giá/Iterate–Persevere. Không có kết luận thị trường từ dữ liệu QA. |

## Các thao tác gần 1–2 chạm

- Chọn nội dung tour: mở **Danh mục Én Việt** → **Dùng tour**. Ngày/chỗ/lịch từng ngày vẫn phải nhập vì nguồn chưa có.
- Cập nhật khách: **Đổi số chỗ** → nhập số → **Lưu số khách**. Hai nút thao tác, không tính việc gõ dữ liệu.
- Giao việc: nút **Giao việc** ngay trên thẻ tour, tour đã được chọn sẵn.
- Đổi trạng thái công việc hoặc xác nhận phiếu ghép: một điều khiển.
- Nhập hàng loạt: **Nhập Excel** → chọn tệp → xem lỗi/xem trước → **Nhập**. Cố ý giữ bước xem trước để tránh ghi sai hàng loạt; không tuyên bố mọi form chỉ cần hai chạm.

## Log để đối chiếu

Tài khoản người thử đã đồng ý có log nghiệp vụ và `ui_click`/`ui_change` cho nút, menu, lựa chọn. CSV riêng có email và thời gian server; trường `entity` của log UI chứa mã điều khiển, khu vực và thời gian thiết bị (có thể lệch đồng hồ). Không ghi giá trị gõ, mật khẩu, tên tệp hoặc nội dung biểu mẫu. Admin/reviewer/nhân viên không tính vào khảo sát. Log UI có thể bị thiếu khi mất mạng/đóng trình duyệt đột ngột; không dùng số lần bấm thay cho số người thử.

## Bổ sung bản 0.5

- Bộ mẫu tùy chọn 3 tour/3 việc/3 phiếu; hai phiếu xác nhận đã gồm trong số khách 22/18, phiếu thứ ba chờ chưa giữ chỗ. Tất cả là giả lập.
- Bài thử có nút bắt đầu/kết thúc và thời gian máy chủ, kết quả tự khai; CSV giữ riêng với phản hồi. Thời gian có thể gồm đọc/suy nghĩ/tạm dừng, không phải độ trễ API hay bằng chứng danh tính.
- Ảnh minh họa có nguồn/giấy phép; fallback trung tính khi thiếu ảnh.
- Xác minh email/khôi phục đã có logic an toàn; gửi thư thực tế còn cần kết nối nhà cung cấp.
