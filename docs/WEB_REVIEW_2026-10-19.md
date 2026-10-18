# Hoàn thiện MVP TaskHub 0.4.1 — 19/10/2026

Phạm vi: frontend, backend, kiểm thử, triển khai và tài liệu bàn giao. Giữ React/Vite và API hiện có, cùng database D1 và hosting miễn phí. Không thêm dependency ứng dụng, bảng hoặc migration. Dữ liệu giả lập và các phiếu B2B chưa đối chiếu được giữ nguyên.

## Thay đổi có thể kiểm tra

| Vấn đề | Đã sửa | Kiểm chứng |
| --- | --- | --- |
| Khó tìm đúng ngày và tình trạng chỗ | Tìm tên/mã/điểm đến có hoặc không dấu; lọc từ/đến ngày, chỉ tour còn chỗ; số kết quả và đặt lại bộ lọc. | Kiểm tra biên ngày, khoảng đảo ngược, tour đầy/đã đi, dữ liệu không rõ chỗ và UI thực tế. |
| Danh mục chưa có ngày dễ bị hiểu là lịch mở bán | Khi lọc lịch/chỗ, không đưa danh mục tham khảo vào kết quả và giải thích cách xem lại. | Route fixture chỉ đọc, không tạo ngày hoặc tồn kho cho danh mục. |
| Giới thiệu dài trên điện thoại | Bỏ bảng giới thiệu trùng ở màn hình nhỏ, rút khoảng cách và cỡ chữ. Giữ đầy đủ trên desktop. | Hero 390px rộng giảm từ khoảng 924px cao xuống khoảng 361px trong lần kiểm tra cùng thiết bị; danh sách/tìm kiếm xuất hiện sớm hơn. Đây là đo bố cục, không phải đo tải mạng. |
| Có thể đóng form khi đang nhập/lưu | Modal bỏ qua Escape/nền, khóa nút đóng/hủy lúc bận; nhập Excel có ref chống bấm trùng và chọn lại tệp được. | UI trì hoãn nhập XLSX để kiểm Escape, nền và nút Đóng; nhập thành bản nháp sau khi tiếp tục. |
| Yêu cầu tư vấn có thể dùng trạng thái tour vừa cũ | Câu lệnh lưu tự kiểm tra lại tour tồn tại/công khai/ngày/chỗ. Không tự giữ chỗ. | Tour vừa ẩn, đầy, qua ngày hoặc xóa không tạo inquiry sai hay lỗi khóa ngoại 500. |
| B2B có thể dùng phiên bản tương lai trùng lúc thay đổi | So sánh phiên bản vừa đọc trước thao tác, giữ số trước/sau của lịch sử đúng. | Kiểm tra can thiệp có kiểm soát giữa đọc và ghi; không tạo dòng lịch sử hoặc log thành công cho lần bị từ chối. |
| Lô log chứa giá trị sai có thể lỗi 500 | Kiểm tra từng đối tượng trước khi ghi, trả lỗi dữ liệu 400, không ghi một phần. | Thử null, mảng, boolean, chuỗi và số trong lô. |
| Nhóm khó tìm phần code cần sửa | Tách HTTP, ngày Việt Nam và tìm/lọc tour thành module nhỏ; trình bày lại JSX rõ dòng; thêm [hướng dẫn mã nguồn](CODE_GUIDE.md). | Build React, Pages và Sites; không thay stack hoặc dựng thêm tầng dịch vụ. |

## Đối chiếu phạm vi

Ba luồng bản đầu của CP2 vẫn là portal, lịch/số chỗ dùng chung và giao việc. B2B nội bộ tối giản, Excel, log, phản hồi và bảng P1–P3/S-1–S-4 đã có luồng để kiểm tra. Không đồng nhất giao việc bằng tên với tài khoản nhân viên, hoặc đối soát sổ với chuyển tiền thật.

Các giới hạn đầy đủ ở [bảng tính năng](CP2_FEATURE_MAP.md). Chưa có các tài khoản cộng tác nhân viên/đối tác, email tự động hoặc booking/thanh toán. Nhóm vẫn cần người thử thật và các quyết định phân tích/giá; không đưa dữ liệu kiểm thử thành kết quả thị trường.

## Dữ liệu đang chờ nhóm

- Xác nhận số khách nguồn đã gồm B2B hay chưa; B2B-102 đã thực nhận bao nhiêu; TASK-03 thuộc tour nào.
- Liên hệ hỗ trợ được phép công khai.
- Đối chiếu người thử thật, đồng ý tham gia, thời điểm thử và đơn vị tiền của bảng tester.

Nguồn và cách xử lý bộ giả lập ở [bàn giao dữ liệu](OWNER_DEMO_DATA_2026-10-18.md). Không tự xác nhận các phiếu đang chờ. Giữ việc gửi giảng viên lại theo yêu cầu chủ dự án.

## Kiểm thử

66 kiểm tra tự động đã đạt trên SQLite và libSQL. Build FE, Pages và Sites đã đạt. API và UI public sau triển khai đã đạt tìm/lọc lịch/chỗ, kết nối chậm/lỗi, task CRUD, B2B/lịch sử, phản hồi sáu tính năng, XLSX chậm/khóa đóng và reviewer; không lỗi JavaScript hoặc tràn ngang trong các màn hình đã thử. Dữ liệu demo giữ nguyên, tài khoản QA đã xóa. Mã triển khai và bằng chứng ở [VALIDATION.md](VALIDATION.md).

Code cập nhật trên `build`; `dev` và các tag demo đã phát hành được giữ nguyên. Nguồn phát hành hiện tại được truy vết qua `cloud/site.json` và `cloud/pages/deployment.json`.
