# Rà soát và hoàn thiện web TaskHub

Ngày 18/10/2026. Bản 0.4. Web: https://taskhub-travel.pages.dev/. Code tiếp tục vào `build`; `dev` để chủ repo duyệt. Mốc demo 0.3 cũ được giữ nguyên, không di chuyển tag đã phát hành.

## Đối chiếu phạm vi

Nguồn: CP3 Requirements EXE101FA26, rubric CP3, TaskHub CP2 Paper Report, Business Model Canvas mẫu và [CP3_Task](https://docs.google.com/document/d/13M47fO3BZaCxFwdXpl_ok8idEHb9V_3BMYfDOm0LExM/edit?tab=t.y36z8yf961cz). CP2 xác định ba chức năng cho bản đầu: portal công khai, lịch/số chỗ dùng chung và giao việc. Phân công Task2 bổ sung B2B tối giản, Excel, thao tác nhanh, log, bản đồ demo và câu hỏi đánh giá.

Các phần web đã có luồng để demo. Tài liệu học phần còn yêu cầu người thử thật, phân tích, giá, quyết định sản phẩm, slide và BMC; mã nguồn web không thay cho các kết quả đó. Timeline cuối trong doc nhóm là khảo sát ngày 19/10, phân tích ngày 20/10, slide/BMC/nộp ngày 21/10 và present ngày 23/10; đây là kế hoạch nhóm, chưa chứng minh slot đã đặt.

## Những điểm đã sửa

| Điểm thiếu hoặc chưa tốt | Bản 0.4 |
| --- | --- |
| Form buộc chấm tính năng chưa thử, chỉ có ba tính năng | Sáu nhóm chức năng; chọn tự dùng/xem demo/chưa thử. Điểm có thể để trống, không đổi thành 0; người chỉ xem không chấm dễ thao tác. |
| Giá bắt buộc và con số ví dụ có thể tạo neo | Giá tùy chọn; tách có đề xuất/chưa biết/không quyết định ngân sách/không trả lời. Giá trị 0 khác thiếu dữ liệu; bỏ số gợi ý. |
| Phản hồi và công cụ phân tích chưa cùng cấu trúc | Hai CSV mới đúng Raw_testers/Raw_features của Sheet; công cụ tổng hợp cả 6 nhóm tính năng. Bản cũ được giữ nguyên, không tự suy diễn câu trả lời mới. |
| Việc nhập sai không sửa/xóa được | Sửa tên, tour, người phụ trách, hạn, ưu tiên và trạng thái; xóa có xác nhận; kiểm tra phiên bản. Có lọc quá hạn, hôm nay và ưu tiên cao. |
| Đối soát chỉ có số dư lũy kế | Lịch sử riêng theo phiếu ghi người thực hiện, thời gian, trạng thái và tiền trước/sau; CSV toàn bộ có quyền. Lưu cùng giao dịch, không có lịch sử giả khi thao tác thất bại. |
| Form phiên bản cũ chỉ báo lỗi rồi mắc kẹt | Tour, số khách, công việc và ghi thu giữ nháp khi lỗi; nút Nạp bản mới cho người dùng chủ động thay biểu mẫu. |
| Tour cũ vẫn nhận tư vấn hoặc khách thấy form của tour vừa bị ẩn | Chặn ngày khởi hành đã qua theo giờ Việt Nam; khóa form khi tour đủ khách hoặc rút công khai trong lúc đang xem. Giữ bản lịch sử tại điều hành. |
| Hướng dẫn nói chưa có Excel và bỏ sót B2B | Hướng dẫn 6 nhóm chức năng, mở thẳng màn hình liên quan, quy trình rõ và bảng P1–P3/S-1–S-4 trong app. |
| Khó tìm dữ liệu trong danh sách | Lọc tour nháp/công khai/đã đi/chưa đi; tìm và lọc trạng thái yêu cầu tư vấn. |
| Giao diện chưa thống nhất ở các luồng bổ sung | Giữ bảng màu xanh dương nhạt, trạng thái trống có hướng dẫn, form có vùng hành động dễ thấy, lịch sử và khảo sát đọc được trên điện thoại. |

## Thông tin nhóm cần bổ sung

1. **Tour vận hành được duyệt:** mã/tên tour, ngày đi cụ thể, sức chứa, khách đã giữ, giá áp dụng và lịch trình từng ngày. Danh mục Én Việt có nội dung tham khảo nhưng không có đủ các trường vận hành này. Không tự tạo lịch hoặc tồn chỗ để làm web có vẻ đầy.
2. **Tình huống B2B:** tên đối tác được phép dùng, tour/số khách ghép, giá net và số thu đã được đối chiếu. Không dùng tên đối tác hoặc giao dịch tự tạo.
3. **Công việc demo:** tên việc, người phụ trách và hạn do nhóm quyết định. Không tự gắn thành viên nhóm thành nhân sự doanh nghiệp.
4. **Thông tin công khai của đơn vị:** tên/nhận diện nếu cần xuất hiện trên portal, email hoặc số liên hệ hỗ trợ, giờ tiếp nhận được nhóm duyệt. Không lấy số điện thoại/email chuyên gia trong phụ lục làm liên hệ công khai.
5. **Dữ liệu nghiên cứu giữ riêng:** người thử thật, email đồng ý, vai trò/quy mô, phản hồi và nguồn tuyển. Không đưa các dữ liệu này lên cổng public; cần ít nhất 20 cá nhân thực tế và nhóm đối chiếu danh tính/mẫu.

## Giới hạn chức năng cần nói đúng

- Điều hành hiện theo từng tài khoản/workspace; tên người phụ trách là dữ liệu theo dõi. Chưa có mời nhân viên cùng workspace, quyền từng nhân viên hoặc thông báo tự gửi.
- B2B là sổ nội bộ tối giản. Đối tác chưa đăng nhập/tự duyệt; hệ thống không chuyển/hoàn tiền, xuất hóa đơn hoặc tự ký hợp đồng.
- Tư vấn chưa phải booking/thanh toán. Nhà cung cấp và net/markup toàn bộ tour chưa thuộc bản đầu; net trên phiếu B2B không thay cho hệ thống giá vốn tour.
- Email tự khai chưa được xác minh; chưa có phục hồi mật khẩu qua email hoặc đăng nhập Google. Không coi số tài khoản là số cá nhân độc lập.
- Chưa có dữ liệu để chốt giá, paid pilot hoặc Iterate/Persevere. Không lấy QA tự động làm kết quả thị trường.
- Chủ dự án yêu cầu giữ việc bàn giao giảng viên lại; không gửi thông tin đăng nhập hoặc cấp quyền mới trong đợt này.

## Kiểm chứng

58 kiểm tra tự động đạt trên SQLite/libSQL; build FE, Pages và Sites đạt. Đã thử ba migration trên D1 local riêng, giữ nguyên các migration cũ. API và UI production qua Pages đạt task CRUD/bộ lọc, B2B/audit, form 6 tính năng, giá chưa biết khác 0, tour rút công khai, reviewer và nhập XLSX thật. Các form gặp xung đột đã được kiểm tra giữ nháp rồi nạp lại; CSV production có quyền và đúng schema. Các tài khoản QA được xóa sau kiểm tra. Chi tiết ở [VALIDATION.md](VALIDATION.md).
