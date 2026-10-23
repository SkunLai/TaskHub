# TaskHub 0.5.1 - cải thiện thao tác ngày 23/10/2026

1. B2B có định nghĩa dễ hiểu, hướng dẫn ba bước và ví dụ giả lập về số chỗ/tiền. Trường giá ghi rõ giá thỏa thuận với đối tác; khoản thu là tổng lũy kế.
2. Khi xóa tour, giao diện đếm các phiếu B2B đang chặn, cho mở danh sách đã lọc đúng tour và có nút Ngừng công khai tour. Nút ẩn dùng phiên bản bản ghi, giữ số chỗ/tiền/lịch sử và không áp dụng thay đổi chưa lưu trong form. API/database tiếp tục chặn xóa sai; không tự đưa khoản thu về 0.
3. Ghi chú lúc tạo phiếu nằm trong mục thu gọn, phân biệt với trạng thái và khoản thu hiện tại. Ghi chú, giao dịch và lịch sử gốc được giữ nguyên. Đoạn giới thiệu demo không còn khẳng định cố định trạng thái hoặc khoản thu của một phiếu.
4. Logo trên cổng riêng trở về đúng cổng riêng; trang agency vẫn dùng liên kết gốc.
5. Danh mục tour tham khảo thu gọn mặc định; người dùng có thể mở/đóng, tìm kiếm tự mở kết quả. Các tour có lịch vẫn hiện trước. Ngày/chỗ chưa xác nhận của danh mục tiếp tục được tách riêng.
6. Phiếu B2B có tìm kiếm không dấu theo đối tác/tour và bộ lọc tour/trạng thái. Hiện số phiếu phù hợp, trạng thái không có kết quả và nút xóa lọc. Thống kê và CSV được ghi rõ là toàn bộ không gian, không giới hạn theo bộ lọc.

## Kiểm tra

89 kiểm tra đạt trên SQLite và libSQL. Bộ UI cũ, bộ tài khoản/nhân viên 0.5 và bộ UX 0.5.1 đều đạt ở local. Bài UX mới kiểm tra chặn xóa/mở đúng phiếu, ẩn tour giữ nguyên chỗ và khoản thu, logo cổng riêng, danh mục thu gọn/tìm kiếm và không tràn ngang ở 320/390 px. Các tài khoản QA dùng database hoặc workspace riêng và được xóa sau kiểm tra.

Không thêm thư viện, bảng hay migration; không chỉnh tour, số khách, khoản thu hoặc tài khoản hiện có trên production. Email provider và tester thật vẫn là các công việc bên ngoài lần cải thiện này. Các tag demo đã phát hành được giữ nguyên.
