# Xác nhận bản MVP 0.2 — 14/10/2026

- `npm run build`: thành công, tạo FE production.
- `npm test`: 13/13 test pass (12 trường hợp con và test tổng). Cùng bộ test đạt trên SQLite local và driver libSQL với database file; chưa thay thế kiểm tra database Turso thật.
- `npm run test:ui`: pass trên Edge chạy ẩn, kiểm tra portal/workspace ở 320/390/768/1440 px; ảnh desktop 1440×1050, mobile 390×844. Các luồng: tìm kiếm/xóa bộ lọc → mất mạng/tải lại → đăng ký/đồng ý → sửa số chỗ → kiểm tra portal → gửi/nhận yêu cầu tư vấn → tạo việc/chuyển hoàn thành → phản hồi. Menu mobile đóng bằng Escape. Không có lỗi JavaScript hoặc tràn ngang trong các màn hình kiểm tra.
- API đã xác minh: tách workspace; public response không chứa email/công việc; chống vượt sức chứa và ghi đè phiên bản cũ; phản hồi lưu một bản mỗi tài khoản; CSV có phân quyền; logout; persistence sau restart; xóa tài khoản; xóa dữ liệu quá 180 ngày. Reviewer không sửa/xóa được dữ liệu và không tính vào số người khảo sát.
- `npm run data:backup`: tạo được SQLite backup bằng backup API.
- Dữ liệu QA đã xóa. Sau kiểm thử: **0 tài khoản tester, 0 feedback, 0 interaction event** trong database local. Tour/công việc mẫu còn lại phục vụ demo và không được tính là khảo sát thật.
- Ảnh QA trong `work/`; không phải bằng chứng người dùng thật.
- Đã kiểm tra 20 lượt đọc workspace đồng thời, phân tách đúng từng tài khoản; hai lượt đăng ký trùng đồng thời chỉ tạo một tài khoản và trả 409 cho lượt còn lại. Đây là request tự động, không phải 20 người khảo sát thật, và chưa đo tải/độ trễ trên hosting.
- UI đã thử phản hồi mạng chậm hơn chu kỳ 5 giây: không chồng thêm lượt tải nền. Yêu cầu API quá 20 giây được báo chậm; không tự gửi lại thao tác ghi. Truy vấn cloud ngoài transaction được xử lý song song; database file vẫn dùng hàng đợi để giữ transaction an toàn.
- Có Dockerfile/Compose, nhưng Docker daemon trên máy hiện chưa chạy nên **chưa build hoặc chạy container**.
- **Chưa deploy công khai**. Đã chuẩn bị Render Free + Turso Free, CI và hướng dẫn deploy. Chờ chủ tài khoản đăng nhập/cấu hình hai dịch vụ; cần kiểm tra Turso thật, HTTPS và redeploy giữ dữ liệu trước khi phát link khảo sát.
- Đợt chỉnh giao diện 14/10: bảng màu xanh dương nhạt, độ tương phản chữ rõ hơn, hướng dẫn dùng thử ngay tổng quan, trạng thái tải lại/mất kết nối và empty search riêng. Đã rà ảnh portal, dashboard, tasks, feedback và reviewer trên desktop/mobile.
- API nghiên cứu đã kiểm tra: phản hồi chưa có đủ 4 thao tác không được tính vào bộ đếm đối chiếu; thao tác xảy ra sau phản hồi không làm đủ điều kiện cho phản hồi cũ; gửi cập nhật phản hồi sau khi thử thì được tính. Bộ đếm này không xác nhận cá nhân độc lập.
- GitHub Actions: run cũ `38436404455` không khởi chạy do lỗi billing tại thời điểm đó. Repo đã chuyển sang `skunlainro3-glitch`; lúc rà ngày 14/10 chưa có run mới, nên chưa xác nhận CI trên tài khoản mới. Không dùng test local để ghi CI đã pass; giữ điều kiện `Validate` trên dev.

Link AI đã dùng: https://openai.com/codex/
