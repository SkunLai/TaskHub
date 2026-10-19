# Dữ liệu giả lập do nhóm cung cấp — cập nhật 19/10/2026

Web: https://taskhub-travel.pages.dev/. Nguồn là các Sheet tour, B2B, công việc và tester do chủ dự án cung cấp trong cuộc trò chuyện. Không lấy bộ này làm khách hàng, giao dịch hoặc bằng chứng khảo sát thật.

## Quy ước được chủ dự án cho phép tự quyết trong bản 0.5

| Nội dung | Quyết định chỉ dùng cho demo |
| --- | --- |
| TOUR-01, TOUR-02, TOUR-03 | Giữ số khách 22/30, 18/25, 12/20 và ngày/giá/lịch trình nguồn. Số khách này **bao gồm B2B đã xác nhận**. |
| B2B-101 | 8 khách trong TOUR-01, xác nhận; thu giả lập đủ 33.600.000 đồng. |
| B2B-102 | 5 khách trong TOUR-02, xác nhận; tổng 17.000.000 đồng, cọc giả lập 50% = **8.500.000 đồng**. |
| B2B-103 | 4 khách chờ, chưa cộng chỗ và chưa ghi nhận thu. |
| TASK-03 | Gắn TOUR-01, tên “Gửi lịch trình chi tiết đoàn 22 khách”, Lê Hoàng Nam, 14/11/2026 09:00, ưu tiên cao, cần làm. Đổi chữ “Testers” trong nguồn để tránh nhầm với nghiên cứu thật. API hạn chỉ lưu ngày; giờ nguồn giữ trong tên/metadata demo. |

Các phiếu cũ giữ ghi chú nguồn và lịch sử để đối chiếu. Banner giải thích đây là quy ước giả lập mới, không xác nhận số tiền thực tế. Trước thay đổi lưu bản sao riêng trong thư mục work bị Git bỏ qua. Không thay dữ liệu của tài khoản người dùng khác.

## Nguồn

- [Tour](https://docs.google.com/spreadsheets/d/1SPdhi6z_NXESlaMM7okHDlH9Z84GVHj3ZFVzvyTnbWU/edit)
- [B2B](https://docs.google.com/spreadsheets/d/1mJ7Xm7vHXuaSQu7mnMyQaWVOhORMh6sAQDXDk0pZSbw/edit)
- [Công việc](https://docs.google.com/spreadsheets/d/11Bwq9QqiRoijpezP96MS3noeaEylLEjW1lZbIsElEaY/edit)
- [Bảng tester tham khảo](https://docs.google.com/spreadsheets/d/1jgUoMw1o-AESwMCEDZXiDyoN2Sep3jTOXYwxTmY0yI8/edit)
- [BMC](https://docs.google.com/document/d/1kuV82odu9DNvEboxifcWcJnXJsAndOwGMLjEIOyP1IY/edit)

## Những gì không tự tạo

Bảng 22 dòng thiếu email/mã người, consent và thời điểm dùng để xác minh; đơn vị mức giá còn mơ hồ. Không nhập các dòng này thành tài khoản hoặc phản hồi. Không tự chốt giá, paid pilot hay quyết định Iterate/Persevere. Liên hệ hỗ trợ dùng GitHub Issues của chính repo; không bịa hotline/email hoặc lấy số đối tác demo làm số TaskHub. Giảng viên chưa được gửi credential/quyền trong lần này.

Người thử mới vẫn bắt đầu bằng không gian trống. Họ có thể chọn Dùng dữ liệu mẫu để nạp một bộ riêng 3 tour/3 việc/3 phiếu khi không gian trống. Không ghi đè dữ liệu; nạp mẫu không tự đánh dấu đã dùng từng tính năng. Nhân viên/admin/reviewer bị loại khỏi nghiên cứu.
