# Dữ liệu giả lập do nhóm cung cấp — 18/10/2026

Web chính: https://taskhub-travel.pages.dev/. Dữ liệu này phục vụ trình diễn, không phải thông tin mở bán, khách hàng hay giao dịch thực tế. Chỉ nhập vào không gian điều hành `agency`; không thêm tài khoản người thử hoặc phản hồi khảo sát.

## Nguồn và cách sử dụng

| Nguồn do chủ dự án cung cấp | Xử lý |
| --- | --- |
| [Danh sách tour](https://docs.google.com/spreadsheets/d/1SPdhi6z_NXESlaMM7okHDlH9Z84GVHj3ZFVzvyTnbWU/edit) | Nhập và công khai 3 tour với nhãn DEMO, giữ nguyên ngày, giá, sức chứa, số khách và lịch trình. |
| [Đối tác B2B](https://docs.google.com/spreadsheets/d/1mJ7Xm7vHXuaSQu7mnMyQaWVOhORMh6sAQDXDk0pZSbw/edit) | Tạo 3 phiếu chờ xác nhận, chưa giữ thêm chỗ và chưa ghi nhận thu. Liên hệ và số nguồn chỉ lưu trong ghi chú nội bộ, không xuất hiện trên portal. |
| [Công việc](https://docs.google.com/spreadsheets/d/11Bwq9QqiRoijpezP96MS3noeaEylLEjW1lZbIsElEaY/edit) | Nhập TASK-01 gắn TOUR-01 và TASK-02 gắn TOUR-02 theo liên hệ rõ trong tên việc. Giữ người phụ trách, hạn ngày, ưu tiên và trạng thái. Giờ hạn được ghi trong tên việc vì trường hạn hiện chỉ lưu ngày. TASK-03 chờ xác định tour liên quan. |
| [Bảng tester](https://docs.google.com/spreadsheets/d/1jgUoMw1o-AESwMCEDZXiDyoN2Sep3jTOXYwxTmY0yI8/edit) | Giữ làm tham khảo riêng; không biến 22 dòng thành tài khoản hoặc phản hồi thật. Thiếu email/mã người thử, thời điểm dùng và đồng ý tham gia để đối chiếu; đơn vị các mức giá cần xác nhận. |
| [BMC](https://docs.google.com/document/d/1kuV82odu9DNvEboxifcWcJnXJsAndOwGMLjEIOyP1IY/edit) | Dùng để đối chiếu định hướng. Các mức phí, tên đối tác tích hợp và hỗ trợ 24/7 trong kế hoạch chưa tự biến thành tính năng, hợp tác hay cam kết công khai. |

## Những điểm chưa được xác nhận

- Chủ dự án chưa biết số khách đã giữ trong tour có gồm khách B2B hay chưa. Giữ nguyên 22/30, 18/25 và 12/20 theo bảng tour; không tự cộng hoặc trừ khách.
- B2B-102 ghi 17 triệu là tổng thu thực tế nhưng trạng thái cọc 50%; chưa có căn cứ chọn 8,5 triệu hay 17 triệu đã nhận. Tất cả phiếu đang chờ, `paid=0` có nghĩa **chưa ghi nhận trên hệ thống**, không khẳng định nguồn thực tế chưa thu tiền.
- Cần nhóm xác nhận hai nội dung trên trước khi bấm xác nhận chỗ hoặc đối soát. Phiếu chờ chưa làm giảm số chỗ hiển thị trên portal.
- TASK-03 cần chỉ rõ tour. Không tự gán từ tên “22 Testers”. Vai trò của người phụ trách trong bảng là mô tả, không tạo thành quyền truy cập nhân viên.
- Các số 150/400/700 trong bảng tester nằm dưới tiêu đề VNĐ trong khi cột khác dùng 1.500.000. Không tự hiểu là nghìn đồng hoặc đưa thành kết luận willingness-to-pay.
- Chưa có liên hệ hỗ trợ công khai được duyệt. Không lấy số điện thoại của đối tác giả lập để làm hotline TaskHub.

## Kiểm tra sau nhập

Đã đối chiếu 3 tour công khai, 3 phiếu B2B chờ với số ghi nhận thu bằng 0, và 2 công việc. Giữ nguyên số khách do nguồn cung cấp. Không gian cũ trống trước khi nhập; không xóa dữ liệu, không sửa dữ liệu cá nhân khác. Các bộ đếm nghiên cứu trước/sau nhập đều là 0 participants, 0 feedback, 0 events và 0 readyToReview.

Mã nguồn và tài liệu được cập nhật ở `build`; không gộp `dev`, không di chuyển tag demo đã phát hành. Các tệp nguồn và manifest ID chi tiết được giữ trong thư mục `work/` bị Git bỏ qua, không công khai liên hệ nội bộ.
