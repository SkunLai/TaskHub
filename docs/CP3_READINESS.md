# Đối chiếu TaskHub với CP3 — 18/10/2026

**FE/BE của Tuấn đã có bản public và tài liệu bàn giao. Toàn bộ CP3 chưa hoàn thành.** Kiểm tra ngày 17/10: 0 tài khoản người thử, 0 phản hồi, 0 interaction event; chưa có bằng chứng 20 cá nhân đã thử thật.

Web: https://taskhub-travel.pages.dev/. Code mới tiếp tục đẩy lên `build`; giữ `dev` để chủ repo duyệt sau.

Đợt 18/10 đã bổ sung B2B tối giản, nhập XLSX/CSV, thao tác nhanh và log nút/menu. Xem [bảng P1–P3/S-1–S-4](CP2_FEATURE_MAP.md), [tag và kịch bản demo](CP3_DEMO_RELEASE.md) và [bộ câu hỏi/Sheet bàn giao An](CP3_SURVEY_QUESTIONS.md). Các bản ghi khảo sát không được điền sẵn.

## Căn cứ và phạm vi

- CP3 Requirements EXE101FA26.pdf: Uses, Specs, Interface, Packaging, Price/strategy, Special Features/AI-proof, Support; tối thiểu 20 cá nhân thử; RAW interactions có email ở phụ lục; Iterate/Persevere sau feedback; demo trực tiếp và cấp quyền xem cho Thanhntl2@fpt.edu.vn; BMC đúng một trang. Van Westendorp là phần nâng cao tùy chọn.
- CP3 MVP Presentation & BMC Write-up Rubric: chất lượng và ý nghĩa validation, giải quyết pain CP2, demo chức năng/UI/UX, lập luận quyết định và BMC.
- TaskHub_CP2_Paper_Report.pdf: khách hàng mục tiêu doanh nghiệp lữ hành 10–50 nhân sự, người dùng điều hành/Sales; phạm vi bản đầu gọn. Giải pháp B2B đầy đủ chưa được triển khai.
- Business Model Canvas (4).docx là mẫu trống, không phải BMC đã điền.
- Đọc lại CP3_context ngày 17/10: vẫn là các mục tên thành viên/nội dung giữ chỗ, chưa có đặc tả mới trong “Thống Nhất”. Không coi nội dung giữ chỗ là phê duyệt yêu cầu.

Chủ dự án xác nhận đợt này chỉ làm FE/BE và bàn giao. Không làm thay slide, BMC, quyết định giá hoặc kết luận khảo sát. Không tự đưa tour, giá, lịch trình, tên nhân sự, kênh hỗ trợ hoặc lời chứng thực chưa được cung cấp lên web.

## Phần đã chuẩn bị trong phạm vi FE/BE

| Yêu cầu | Đã có | Giới hạn/bằng chứng còn thiếu |
| --- | --- | --- |
| Uses | Tour/lịch/giá/chỗ, công việc, tư vấn; nhập XLSX/CSV; B2B tối giản với phiếu, xác nhận chỗ, ghi nhận thu/còn phải thu và CSV | Chưa có tài khoản nhân viên hoặc đối tác tự duyệt; không gọi đây là B2B đầy đủ hoặc P3 được giải quyết hoàn toàn. |
| Specs | SQLite local; public Pages/gateway và Workers/D1; kiểm tra phiên bản, sức chứa, phân quyền và timeout | Polling 5 giây khi tab hiển thị, không phải WebSocket. QA không phải chứng nhận SLA hoặc tải thương mại. |
| Interface/Packaging | Web tiếng Việt, xanh dương nhạt, responsive; đã rà 320/390/768/1440 px và luồng lỗi mạng | Cần phản hồi và thử trên thiết bị/mạng của người dùng thực tế. |
| Special Features/AI-proof | Có thể demo dữ liệu tour và việc dùng chung với cổng khách hàng | Nhóm phải đối chiếu CP1, giải thích lợi thế và nguy cơ thay thế; code không chứng minh độc nhất thị trường. |
| Support | Hướng dẫn trong app, Phản hồi MVP, README và tài liệu bàn giao | Chưa được cung cấp kênh công khai/người trực hoặc mức dịch vụ. Không tự thêm SLA. |
| Giá | Form thu willingness-to-pay đơn giản, cho phép 0; tool tổng hợp mô tả dữ liệu thật | Chưa chốt chiến lược/giá. 500.000 VND/tháng ở CP2 là giả định, không phải giá đã kiểm chứng. Không có Price Map/Van Westendorp. |
| MVP testing | Consent, email tự nhập, vai trò/quy mô, log và form 6 nhóm tính năng với tự dùng/xem demo/chưa thử, quan trọng/dễ dùng/ý định theo tính năng, giá tùy chọn và ý kiến mở | Chưa xác minh email/20 người thật. Phản hồi phiên bản cũ giữ riêng, không tự chuyển thang đo. |
| RAW data | Xuất interactions/feedback CSV có email theo quyền quản trị/reviewer | Nhóm phải xuất bản gốc, đối chiếu người thật và cấp quyền phụ lục; không đưa raw data lên repo public. |
| Nút/menu | `ui_click`/`ui_change` cho tài khoản người thử đã đồng ý; mã điều khiển, khu vực, thời gian thiết bị/server; chống ghi trùng lô gửi lại | Không ghi nội dung gõ/mật khẩu. Mất mạng/đóng trình duyệt đột ngột có thể thiếu log; admin/reviewer không tính. |
| Bộ câu hỏi cho An | 12 câu, 6 nhóm tính năng; đánh giá quan trọng, ý định dùng và dễ dùng theo từng tính năng; Sheet raw để trống | Chưa phải kết quả khảo sát hoặc bằng chứng đã có 20 người. |
| Tổng hợp dữ liệu | `npm run research:report` kiểm tra CSV, loại QA/trùng email, tổng hợp mọi phản hồi hợp lệ và báo riêng tập đủ log trước feedback | Không tự loại người xem demo vì thiếu log. Báo cáo không xác minh người thật, chọn giá, tự mã hóa ý kiến mở hoặc tự kết luận Iterate/Persevere. |
| Demo và reviewer | Kịch bản demo trực tiếp, tài khoản reviewer chỉ xem/xuất | Nhóm cung cấp dữ liệu demo được duyệt, chuyển thông tin reviewer qua kênh riêng và cấp quyền phụ lục cho giảng viên. |

Hướng dẫn chi tiết: [bàn giao FE/BE](CP3_FE_BE_HANDOFF.md), [khảo sát và tổng hợp CSV](CP3_TESTING_GUIDE.md), [chạy trên máy](../README.md), [vận hành public](PAGES_DEPLOYMENT.md).

## Kiểm chứng ngày 17–18/10

- 40 kiểm tra Node/API, gateway và công cụ tổng hợp đạt trên SQLite và libSQL ở đợt 18/10, gồm B2B giữ/hoàn chỗ, đối soát, nhập tệp và quyền/giới hạn log. UI kiểm tra thêm XLSX thật, thao tác nhanh và luồng B2B. Không dùng QA làm khảo sát.
- Bản 0.4 nâng lên 58 kiểm tra, thêm sửa/xóa việc có phiên bản, khảo sát 6 tính năng/CSV, khóa tư vấn tour đã khởi hành và audit B2B. Hướng dẫn mới có lối mở từng chức năng và bảng P1–P3/S-1–S-4 ngay trong app.
- Đã tải CSV thật từ hệ thống bằng quyền quản trị và chạy tool: 0 dòng phản hồi, 0 dòng tương tác, không có kết quả để kết luận. Raw và báo cáo được giữ riêng dưới `work/research/2026-10-17/`, không commit.
- Ngày 17/10, 20 lần đọc đồng thời cổng công khai lúc đó trống đều trả 200. Mẫu đo từ máy/mạng này: trung vị 643,5 ms; p95 1.093 ms. Đây là một mẫu request, không phải 20 người, phép đo tải đại diện hoặc cam kết hiệu năng.
- Ngày 18/10, API D1 và UI production qua Pages đạt thêm luồng B2B/Excel, thao tác nhanh, log click đã lưu, quyền reviewer và màn hình desktop/mobile; không có lỗi JavaScript trong các luồng đã thử.
- Công cụ tổng hợp xử lý dữ liệu rỗng, nháy/xuống dòng trong CSV, dữ liệu cắt/sai cột, email trùng, QA, thao tác sau phản hồi và mức trả bằng 0. Không xuất email/tên/ý kiến tự do vào báo cáo tổng hợp.

## Việc còn lại cần người thật hoặc quyết định của nhóm

1. Cung cấp dữ liệu tour/công việc để demo đã được nhóm duyệt; thông tin hỗ trợ muốn công khai; GitHub username nếu cần quyền push.
2. Tuyển và xác nhận ít nhất 20 cá nhân thử thật, ưu tiên phân khúc mục tiêu; ghi kênh tuyển, thời gian, tiêu chí và giới hạn mẫu thuận tiện. Mời trên 20 người theo timeline để dự phòng.
3. Đối chiếu logs với phản hồi, đọc/mã hóa ý kiến mở, phân tích kết quả; chốt chiến lược và mức giá có căn cứ.
4. Quyết định Iterate/Persevere sau dữ liệu thật, giải thích thay đổi hoặc lý do giữ sản phẩm.
5. Hoàn thiện slide và BMC đúng một trang. Báo cáo AI riêng đã gỡ theo yêu cầu; disclosure trong bài nộp vẫn là tiêu chí riêng của PDF/rubric, do nhóm xử lý.
6. Chuyển quyền xem MVP/credential reviewer và phụ lục dữ liệu cho giảng viên qua kênh riêng. Có sẵn tài khoản không chứng minh đã chuyển quyền/thông tin.
7. Nhóm trưởng book/xác nhận slot chính thức. Timeline nhóm: 17/10 book; 18–19/10 phân tích/chốt giá/quyết định; 19–20/10 slide/BMC; 21/10 nộp; 23/10 thuyết trình. PDF quy định nộp trước slot tuần 7; chưa có bằng chứng xác nhận các mốc nộp/present này.

Không gửi email, nộp bài, book lịch hoặc thay đổi nội dung của thành viên khác trong đợt hoàn thiện FE/BE này.
