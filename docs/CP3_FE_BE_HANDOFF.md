# Bàn giao FE/BE TaskHub cho CP3

Ngày rà soát tài liệu: 19/10/2026. Phạm vi Tuấn: FE/BE, vận hành, dữ liệu hỗ trợ kiểm thử, tài liệu demo và bộ câu hỏi/Sheet bàn giao An theo yêu cầu chủ dự án. Không điền thay kết quả khảo sát, slide, BMC hoặc quyết định giá. Kết quả kiểm thử đã thực hiện được ghi theo mốc ở [VALIDATION.md](VALIDATION.md); chỉnh tài liệu không tạo thêm bằng chứng kiểm thử.

- Web: https://taskhub-travel.pages.dev/
- Code nhóm làm việc: https://github.com/skunlainro3-glitch/TaskHub/tree/build
- Nhóm sửa trên `build`, đưa vào `dev` qua PR và review của chủ repo. Chủ repo đã cho phép agent thực hiện review/merge bằng phiên tài khoản đang có; không đổi quy tắc bảo vệ nhánh.

## 1. Uses — Chức năng và giới hạn

| Nhu cầu | Luồng đã có | Giới hạn phải trình bày đúng |
| --- | --- | --- |
| Thông tin tour tập trung | Tạo/sửa/xóa tour, lịch/giá/chỗ; 13 nội dung Én Việt đã được chủ dự án cung cấp; chọn nhanh hoặc nhập XLSX/CSV tối đa 20 tour/đợt | Không tự đoán ngày/sức chứa. Tour nhập mới là bản nháp; nguồn Én Việt không cập nhật tự động. |
| Khách tra cứu ngoài giờ | Cổng tour công khai, tìm/lọc, xem lịch trình/giá/số chỗ, gửi yêu cầu tư vấn | Yêu cầu không giữ chỗ, xác nhận booking, thanh toán hoặc tự gửi email. Không có chatbot. |
| Theo dõi điều hành | Tạo/sửa/xóa công việc gắn tour, tên phụ trách, hạn, ưu tiên/trạng thái và bộ lọc; có kiểm tra phiên bản | Đã có mời nhân viên vào cùng không gian, quyền chỉ xem/được sửa. Chưa có thông báo giao việc tự gửi. Tên người phụ trách do người dùng nhập. |
| Ghép tour B2B | Phiếu đối tác, xác nhận giữ chỗ, ghi nhận thu/còn phải thu, lịch sử người/thời gian/số trước-sau, hủy hoàn chỗ và CSV | Sổ nội bộ; chưa có đối tác đăng nhập, duyệt hai phía, hóa đơn hoặc xử lý thanh toán/hoàn tiền. |
| Dữ liệu phục vụ CP3 | Consent, vai trò/quy mô tự khai, log và form 6 nhóm tính năng; tự dùng/xem demo/chưa thử, giá tùy chọn, CSV có quyền và công cụ tổng hợp | Không xác minh email, người thật hay mẫu đại diện. Không chuyển thang đo phản hồi cũ hoặc tạo kết luận thị trường. |

## 2. Specs — Có thể chứng minh bằng hệ thống

FE React/Vite; local Node.js 24 + SQLite. Public dùng Cloudflare Pages và gateway ký yêu cầu tới backend Workers/D1 đã có. Dữ liệu nằm trên cloud, không phụ thuộc việc máy của chủ repo bật hay tắt. Không cần người dùng tự cài ứng dụng để truy cập web.

- Cổng và điều hành đọc cùng nguồn dữ liệu; tải nền mỗi 5 giây khi tab đang hiển thị. Đây là polling, không phải cập nhật tức thời bằng WebSocket.
- Kiểm tra số khách không vượt sức chứa; kiểm tra phiên bản khi sửa/xóa để tránh ghi đè thay đổi mới hơn.
- Tách workspace; chỉ công khai tour đã chọn công khai. Không công khai email, yêu cầu tư vấn hoặc công việc nội bộ.
- Cookie phiên HttpOnly/SameSite và Secure khi production; mật khẩu băm bằng scrypt, giới hạn tần suất và kiểm tra origin cho thao tác ghi.
- API timeout và thông báo thử lại khi lỗi mạng; không tự gửi lại thao tác ghi.
- Có kiểm thử đồng thời, lưu sau restart/redeploy, phân quyền và xóa dữ liệu. Kết quả QA chỉ chứng minh các tình huống đã thử, không chứng minh SLA, tải thương mại hoặc 20 người khảo sát.

## 3. Interface và Packaging

Web tiếng Việt, xanh dương nhạt, responsive; đã kiểm tra ở 320/390/768/1440 px. Điều hành có Tổng quan, Quản lý tour, Công việc, Ghép tour B2B, Yêu cầu tư vấn và Phản hồi MVP; hướng dẫn dùng thử nằm ngay tổng quan. Cổng khách hàng tách luồng đăng nhập/điều hành. Nội dung kinh doanh phải do nhóm/người quản lý cung cấp; không có tour, giá, nhân sự hoặc lời chứng thực tự tạo.

## 4. Chứng minh liên hệ với CP2 khi demo

| Pain trong CP2 | Thao tác trình diễn | Bằng chứng và điều chưa giải quyết |
| --- | --- | --- |
| P1: thông tin phân tán, khó theo dõi tiến độ | Chọn nội dung/nhập Excel; đổi số chỗ nhanh; giao và đổi trạng thái việc | Tour và công việc cùng workspace. Đã có nhiều tài khoản nhân viên; chưa tích hợp Zalo. |
| P2: khách hỏi ngoài giờ | Mở cổng khách hàng, tìm/xem tour, gửi yêu cầu và xem ở điều hành | Khách đọc dữ liệu đã công khai. Chưa đo số khách giữ được hoặc doanh thu tăng. |
| P3: sai lệch khi ghép tour giữa doanh nghiệp | Tạo phiếu B2B → xác nhận chỗ → ghi nhận thu/còn phải thu → xuất CSV/hủy hoàn chỗ | Đã có bản tối giản; chưa có đối tác tự duyệt hoặc xác nhận dịch vụ hai phía. Không tuyên bố B2B hoàn chỉnh. |

PDF yêu cầu chứng minh MVP đáp ứng giải pháp CP2 khi demo trực tiếp. Nhóm cần giải thích giới hạn phạm vi bản đầu; không dùng giao diện hiện tại làm bằng chứng B2B đã hoàn chỉnh.

Bảng đầy đủ [P1–P3/S-1–S-4](CP2_FEATURE_MAP.md); [kịch bản và tag demo cố định](CP3_DEMO_RELEASE.md); [câu hỏi cho An](CP3_SURVEY_QUESTIONS.md).

Nhóm mới nhận code có thể bắt đầu từ [hướng dẫn đọc mã nguồn](CODE_GUIDE.md): cách chạy Node.js 24, vị trí sửa giao diện/API, dữ liệu và quá trình xuất bản cloud.

## 5. Kịch bản demo trực tiếp

Chuẩn bị trước: [bộ giả lập do nhóm cung cấp](OWNER_DEMO_DATA_2026-10-18.md) đã có 3 tour, 3 phiếu B2B chờ và 2 công việc tại không gian điều hành. Xác nhận cách tính khách B2B và khoản thu trước khi đổi các phiếu này; TASK-03 còn thiếu tour liên quan. Chọn tài khoản dùng thử riêng cho người thử và giữ một cửa sổ cổng khách hàng. Không dùng tài khoản reviewer để chỉnh dữ liệu. Không đưa CSV có email vào màn chiếu công khai.

1. Giới thiệu người dùng mục tiêu: điều hành/Sales tại doanh nghiệp lữ hành 10–50 nhân sự, theo báo cáo CP2.
2. Vào Quản lý tour, tạo tour bằng thông tin nhóm chuẩn bị; kiểm tra rồi chọn công khai. Giải thích dữ liệu không tự tạo.
3. Mở lại tour, đổi lịch hoặc số khách giữ chỗ, lưu. Đổi sang cổng khách hàng và đợi chu kỳ cập nhật; đối chiếu thông tin.
4. Gửi yêu cầu tư vấn bằng dữ liệu thử được nhóm chuẩn bị, quay về điều hành để thấy yêu cầu. Nói rõ chưa phải xác nhận đặt tour.
5. Tạo việc gắn đúng tour, nhập người phụ trách/hạn, chuyển trạng thái. Có thể trình diễn lời mời nhân viên; tên giao việc vẫn nhập tay, chưa tự gửi thông báo.
6. Demo P3 bằng bộ giả lập riêng đã được Tuấn duyệt: tạo phiếu B2B → xác nhận → đối chiếu số chỗ → ghi nhận thu lũy kế → xem lịch sử/xuất CSV. Không xác nhận hoặc ghi thu trên ba phiếu nguồn đang chờ đối chiếu. Đối soát về 0 trước khi hủy phiếu đã có khoản thu; nói rõ hệ thống không chuyển/hoàn tiền.
7. Mở Phản hồi MVP và giải thích người thử tự đánh giá; quản trị/reviewer xuất dữ liệu gốc. QA dùng để trình diễn phải được tách khỏi khảo sát. Hai CSV mới Người thử/Đánh giá tính năng dùng với `survey:report`; bản phản hồi cũ và tương tác dùng với `research:report`.
8. Nếu mạng gián đoạn: dùng thông báo lỗi/thử tải lại; không dùng ảnh hoặc video thay thế rồi gọi đó là demo live. Có thể chạy bản local bằng README và nói rõ môi trường đang dùng.

Phần chức năng, giải quyết pain và UI/UX được yêu cầu trình diễn trực tiếp trong PDF; không tự biến các phần này thành slide thay thế demo.

## 6. Giá, lợi thế và hỗ trợ — những gì được phép nói

- Giá: chưa có mức bán đã chốt. Mức 500.000 VND/tháng trong CP2 là giả định kịch bản. Tool mới tính thống kê willingness-to-pay từ dữ liệu thật, không tự chọn giá hoặc dựng Price Map. Van Westendorp là phần nâng cao tùy chọn.
- Lợi thế có thể demo: thông tin tour và công việc theo ngành lữ hành dùng chung với cổng khách hàng. Chưa có thử nghiệm đối thủ để chứng minh tính độc nhất, chi phí chuyển đổi hoặc lợi thế thị trường.
- Hỗ trợ hiện tại: hướng dẫn trong app và mục Phản hồi MVP. Chưa được cung cấp email/kênh hỗ trợ công khai, người trực hoặc SLA; không tự thêm lời cam kết.

## 7. Checklist bàn giao

- [x] FE/BE public, địa chỉ cố định, dữ liệu cloud bền vững; giữ nhánh `build` cho nhóm và chưa merge `dev`.
- [x] Form dùng thử, consent, phản hồi, interaction logs, quyền xuất CSV, reviewer chỉ xem.
- [x] Công cụ tổng hợp CSV có kiểm tra dữ liệu, phân biệt QA/trùng/chưa đủ thao tác; không xuất email/nội dung tự do vào báo cáo tổng hợp.
- [x] Hướng dẫn tuyển người thử, xuất bản gốc, tạo báo cáo và demo trực tiếp.
- [x] B2B tối giản, nhập XLSX/CSV, thao tác nhanh trên thẻ tour; ghi log nút/menu cho người tham gia đồng ý.
- [x] Bảng P1–P3/S-1–S-4, kịch bản demo và Google Sheet 12 câu hỏi bàn giao An; các tab raw để trống.
- [x] Đã nhập bộ giả lập nhóm cung cấp: 3 tour DEMO, 3 phiếu B2B chờ và 2 công việc. Không đưa 22 dòng tester mẫu thành phản hồi thật.
- [ ] Hoàn tất phần dữ liệu còn thiếu: khách đã giữ có gồm B2B không, khoản thu B2B-102, tour của TASK-03; duyệt thông tin hỗ trợ công khai và GitHub username nếu cần quyền push.
- [ ] Ít nhất 20 cá nhân thử thật, đối chiếu mẫu và phụ lục dữ liệu có email theo quyền xem.
- [ ] Khi chủ dự án yêu cầu lại, nhóm chuyển thông tin reviewer và cấp quyền xem phụ lục cho đúng người nhận. Hiện **chưa gửi giảng viên**; có tài khoản không đồng nghĩa người nhận đã được cấp quyền/thông tin.
- [ ] Thành viên phụ trách hoàn thiện chiến lược/giá, Iterate/Persevere, BMC đúng một trang và slide.
- [ ] Nhóm trưởng xác nhận slot, hạn nộp và lịch nhóm mới nhất. PDF quy định nộp trước slot tuần 7; mốc 21/10 và 23/10 do nhóm cung cấp chưa phải xác nhận booking.

## 8. Các câu trả lời kỹ thuật cần nắm

1. Tắt máy chủ repo có mất web không? Không; FE và dữ liệu đang chạy trên cloud.
2. Vì sao thông tin chưa đổi ngay? Cổng cập nhật theo chu kỳ 5 giây khi tab hiển thị; còn phụ thuộc kết nối.
3. Hai lượt cùng sửa một tour thì sao? Lượt dùng phiên bản cũ bị từ chối, cần tải lại.
4. Gửi tư vấn có hết chỗ không? Không; đây chỉ là yêu cầu liên hệ, không phải booking.
5. Giao việc có gửi thông báo cho nhân viên không? Chưa; hiện lưu tên phụ trách và tiến độ.
6. 20 tài khoản có phải 20 người không? Không; cần nhóm đối chiếu cá nhân thực tế.
7. Vì sao một phản hồi chưa được đối chiếu đủ thao tác? Có thể thiếu sửa tour, xem cổng, tạo việc hoặc đổi trạng thái trước khi gửi. Tool báo riêng tập có đủ log; không kết luận người thiếu log chắc chắn chưa xem demo. Nhóm kiểm tra bản gốc.
8. Có thể lấy trung vị mức trả làm giá tối ưu không? Không; đây là mô tả mẫu, cần dữ liệu chi phí, cạnh tranh và quyết định của nhóm.
9. Giảng viên sửa được dữ liệu không? Reviewer chỉ xem/xuất, không có quyền chỉnh dữ liệu.
10. Xóa tài khoản có xóa hết file đã tải không? Không; nhóm phải quản lý/xóa riêng CSV, backup và bản chia sẻ.

## Bổ sung 0.5 — 19/10/2026

Xem [tài khoản/nhân viên](ACCOUNTS_AND_TEAM.md), [quy ước demo](OWNER_DEMO_DATA_2026-10-18.md) và [nguồn ảnh](TOUR_IMAGE_CREDITS.md). Người thử tự chọn nạp mẫu vào không gian trống. Bài thử bắt đầu/kết thúc theo hành động thật, có CSV; không tự sinh phản hồi hay tester. UI hiển thị thời gian tải API vừa đo ở chính trình duyệt, không cam kết SLA hoặc số người đồng thời. Gửi email xác minh/khôi phục còn cần kết nối dịch vụ email; lời mời thủ công dùng được ngay.
