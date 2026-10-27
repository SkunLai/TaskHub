# Xác nhận bản MVP 0.2 — 14/10/2026

## Bổ sung 0.6.0 — 27/10/2026

- `npm test`: **95/95** đạt; cùng bộ kiểm tra đạt với driver libSQL. Bổ sung kiểm tra phân vai/API trái quyền, ẩn dữ liệu/CSV theo bộ phận, kế hoạch theo workspace, lưu cạnh tranh trả 409, số 0/ô trống/kết quả âm và ngưỡng dữ liệu cũ.
- `tests/cp4-ui.mjs` đạt trên Node local, preview Workers/D1 và **https://taskhub-travel.pages.dev**: workflow 5 bước; phân vai/đổi quyền khi đang đăng nhập; bảng tính/lưu/xung đột và giữ bản nhập; cảnh báo bỏ bản nháp; mất mạng/phục hồi. Rà bố cục 320/390/768/1440 px, không tràn ngang hoặc lỗi JavaScript trong các luồng đã chạy. Bài QA chờ dữ liệu/response trước khi kiểm tra, không giả định mạng public nhanh như local.
- Các bài hồi quy `v05-ui`, `ux051-ui`, `performance-ui` đạt local; GitHub Actions [run 40474237999](https://github.com/skunlainro3-glitch/TaskHub/actions/runs/40474237999) đạt unit/libSQL/build/Pages và toàn bộ các luồng browser, gồm CP4, cho commit runtime `d3bcba1`.
- Build Vite/Pages và Sites Vinext thành công. Backend Sites phiên bản 18 triển khai thành công; migration 0004 chỉ thêm cột/bảng. Pages deployment `ce4bd834-0c29-4f86-a4f4-8a9e55926dbb` trỏ source `d3bcba1`. Thông tin đầy đủ ở `cloud/site.json` và `cloud/pages/deployment.json`.
- `/api/health` public trả 200/version 0.6.0. Checksum trước/sau giống nhau cho workspace trình diễn: 3 tour, 3 công việc, 3 phiếu B2B, 2 yêu cầu tư vấn, 7 bản ghi lịch sử B2B. Kế hoạch mới có version 0 và chưa có giả định giá/doanh thu.
- Các tài khoản/workspace QA bị xóa. Không dùng kết quả tự động làm bằng chứng người thử thật, kết quả thị trường, SLA hoặc chấp thuận Path 2. Xem [phạm vi và thông tin còn thiếu](CP4_MENTOR_REVIEW.md).

Các mục phía dưới là lịch sử kiểm tra theo thời điểm, không phải trạng thái phát hành hiện tại.

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
- GitHub Actions: run cũ `38436404455` lỗi billing trên tài khoản cũ. Run mới `38620884849` đã thành công trên tài khoản mới, đúng commit `22f3f24`; PR #1 đã được chủ repo duyệt và merge ngày 15/10 thành `811004d`. Hai nhánh dev/build được đồng bộ.

## Cloud — 15/10/2026

- Web chính: https://taskhub-travel.pages.dev/; Pages gateway nối tới backend Sites tại https://taskhub.ninaninohihi.chatgpt.site và cùng D1, độc lập với máy chủ repo. Không import dữ liệu cá nhân local/CP2.
- D1 API local và cloud đều đạt suite `tests/cloud-api.mjs`, gồm atomic signup, optimistic concurrency, tenant isolation, chính xác interaction logs, feedback upsert/đủ thao tác, CSV có quyền/an toàn công thức và reviewer chỉ xem.
- UI qua URL cloud đạt các luồng và màn hình trong suite hiện có. Sau redeploy, phiên/công việc/phản hồi QA vẫn còn. QA đã xóa; trước bàn giao có 0 tester, 0 feedback, 0 event. Các test này không chứng minh 20 người thử thật.

## Rà nội dung — 15/10/2026

- Bản này bỏ seed tour/công việc và tên nhân sự tự điền; tour mới mặc định chưa công khai. Form đăng ký yêu cầu người dùng chọn vai trò/quy mô.
- 22/22 kiểm tra API và gateway đạt trên SQLite và driver libSQL. Có kiểm tra không gian mới trống, quyền sở hữu/phiên bản khi xóa tour và dữ liệu phụ thuộc.
- UI local đạt tạo tour bằng thông tin tự nhập, cập nhật/tra cứu, tư vấn, công việc, phản hồi, xác nhận/hủy xóa tour; responsive 320/390/768/1440 px, phục hồi lỗi mạng, tải chậm và quyền reviewer.
- Đây là QA tự động, không phải phản hồi khảo sát người thật. Xem `CONTENT_REVIEW.md` để đối chiếu nội dung với dữ liệu chủ dự án cung cấp.
- Đã triển khai bản rà nội dung lên Pages và backend hiện có. Bộ API cloud và UI production đều đạt, gồm chọn nhân khẩu học, tạo từ form trống và xác nhận/hủy xóa tour. Ba tour cùng sáu việc mẫu cũ được đối chiếu đầy đủ với seed nguyên bản, sao lưu riêng rồi gỡ; không xóa dữ liệu người tham gia.

## Bàn giao và công cụ dữ liệu — 17/10/2026

- Bổ sung `research:report`: đọc hai CSV có quyền xuất, chỉ tạo báo cáo tổng hợp; không thay đổi API, giao diện, schema, dữ liệu public hoặc báo cáo AI.
- 30 kiểm tra đã đạt, gồm dữ liệu CSV rỗng/sai/cắt, email trùng và QA, mốc consent/feedback, mức trả 0, không nhận email là người đã xác minh, không xuất dữ liệu nhận diện/nội dung tự do vào báo cáo, không ghi đè bản gốc.
- Chạy trên CSV thật tại thời điểm rà: 0 phản hồi, 0 tương tác; không tạo kết quả khảo sát. Không có tài khoản QA mới được tạo trên cloud trong đợt này.
- 20 request đọc public đồng thời trả 200; không phải 20 người khảo sát và không được dùng làm bằng chứng SLA.

## Danh mục tour được chủ dự án cung cấp — 17/10/2026

- Nhập 13 nội dung tour Én Việt, có mã nguồn, tuyến đi, thời lượng, giá tham khảo, điểm nổi bật và ngày ghi nhận. 1 tour giữ giá “Liên hệ”. Không tạo ngày đi hoặc tồn chỗ không có nguồn; không seed tour vận hành hay công việc.
- Rà 13 ảnh nguồn: loại 5 ảnh sai/không phù hợp; 8 ảnh còn lại gắn nhãn minh họa. Có trạng thái thay thế khi ảnh thiếu hoặc tải lỗi.
- 33/33 kiểm tra đạt trên SQLite và libSQL. Bao gồm danh mục chỉ đọc, nguồn/giá chưa xác định, không trộn vào tour đã công khai của không gian khác và từ chối yêu cầu đặt chỗ vào mã tham khảo.
- Build Vite, Pages gateway và Sites backend đạt. UI local đạt trên 320/390/768/1440 px; đã thử mở chi tiết, tìm mã tour, dùng nội dung có/không có giá và xác nhận các trường ngày/sức chứa/khách/lịch trình vẫn trống, chưa công khai. Các luồng tour/tư vấn/công việc/phản hồi/reviewer hiện có tiếp tục đạt.
- Đã triển khai lên backend Sites version 4 và Pages production `d0c1eadc-fb1e-4e30-95fb-6c6bddbdb3bb`. API public trả đúng 13 bản ghi tham khảo, 1 giá chưa xác định và 0 tour vận hành tại lúc rà. Bộ API D1 và UI qua URL Pages đều đạt; các tài khoản QA tạm đã xóa. Rà giao diện thực tế: 13 thẻ, 8 ảnh nguồn, 5 trạng thái chờ ảnh, không tràn chiều ngang. Không thay schema hoặc đặt lại dữ liệu; không sửa nhánh Git `dev`.

## MVP 0.3 — B2B, Excel, thao tác nhanh và bàn giao An — 18/10/2026

- 40/40 kiểm tra đạt trên SQLite và driver libSQL; bổ sung giữ/hoàn chỗ B2B đồng thời, phiên bản cũ, tách workspace, giới hạn thanh toán ghi sổ, chặn xóa tour còn phiếu hoạt động và xóa tài khoản có phiếu. XLSX/CSV kiểm tra ngày/số/cột bắt buộc, nhập nguyên lô, chống gửi lặp; log UI không nhận nội dung biểu mẫu. `npm audit --omit=dev`: 0 lỗ hổng tại lúc rà.
- Build FE, Pages gateway và Sites backend đạt. Migration D1 mới chỉ bổ sung bảng/index/trigger B2B; migration 0000 đã áp dụng được giữ nguyên. Đã chạy cả hai migration trên D1 local riêng trước khi triển khai; không đặt lại database production.
- UI local đạt: file XLSX thật nhập thành tour nháp, chọn nội dung trong hai lần chạm, đổi số khách nhanh, giao việc; B2B tạo → xác nhận giữ chỗ → ghi nhận thu → đưa số ghi sổ về 0 → hủy hoàn chỗ. Log bấm nút của participant đã xuất hiện trên server. Reviewer vẫn chỉ xem. Rà ảnh B2B desktop/mobile, không tràn ngang và không có lỗi JavaScript trong các luồng đã thử.
- Backend Sites version 5 và Pages production `5a4876dc-0f28-4b2e-9119-ea53f91b2663` đã triển khai thành công, giữ nguyên binding D1 và revision secrets 2. Bộ API production `tests/cloud-api.mjs` đạt sau migration. UI qua URL Pages đạt thêm B2B giữ/hoàn chỗ, ghi sổ thu, XLSX thật, thao tác nhanh và xác nhận log UI đã đến server; reviewer chỉ xem và không có lỗi JavaScript. Các tài khoản QA tạm đã xóa.
- Google Sheet khảo sát đã tạo và kiểm tra 6 tab, 12 câu, múi giờ Việt Nam, điểm 1–5 và raw trống. Đã thực hiện thao tác chia sẻ theo email anh cung cấp cho An; đọc lại quyền cho thấy email đó đã là chủ sở hữu và có quyền chỉnh sửa. Không mở bảng raw công khai hoặc tạo phản hồi mẫu.
- Bảng P1–P3/S-1–S-4 và kịch bản demo nêu rõ phạm vi B2B sổ nội bộ, log UI có thể thiếu khi mất mạng, giới hạn thao tác 1–2 chạm và S-4 còn cần người thử/dữ liệu thật.
- Sau QA production: API health trả phiên bản 0.3.0; 0 participant, 0 feedback, 0 event, 0 phản hồi đủ log để đối chiếu. Không tạo kết quả khảo sát; dữ liệu demo của nhóm vẫn cần được duyệt và ít nhất 20 người thật còn phải thử.

## Hoàn thiện các việc trong file tiến độ — 18/10/2026

- Bổ sung `survey:report` cho hai tab raw của An, đánh giá riêng 6 nhóm tính năng. 47/47 kiểm tra đạt trên SQLite và libSQL, gồm tách self/demo, không lấy điểm dễ dùng của người chỉ xem, chống dùng dữ liệu trước consent, sửa câu trả lời trùng, giá 0 và không xuất email/ý kiến mở vào báo cáo. Nguồn CSV được bảo vệ khỏi ghi đè.
- Đọc lại web và toàn bộ 1000 dòng khả dụng của hai tab Raw_testers/Raw_features: web vẫn 0 participant/feedback/event; Sheet chỉ có hàng tiêu đề. Chạy lệnh mới trên các CSV tương ứng cho kết quả 0, không tạo thống kê hoặc giá giả.
- Hoàn thiện kịch bản lời dẫn theo P1–P3, ba vòng tập, checklist trình bày và bảng thông tin demo cần nhóm duyệt. Chưa đánh dấu Tuấn đã tập hoặc dữ liệu demo đã được duyệt khi chưa có xác nhận thực tế.
- Chủ dự án yêu cầu chưa gửi giảng viên: không gửi email, thông tin đăng nhập hoặc cấp quyền mới. Bản hướng dẫn bàn giao giữ lại cho lúc anh yêu cầu tiếp.
- Đợt này chỉ bổ sung công cụ offline và tài liệu, không thay giao diện/API/schema/dữ liệu production; tag demo đã phát hành được giữ nguyên.

## Rà soát toàn bộ web và tài liệu nhóm bản 0.4 — 18/10/2026

- Đọc CP3_Task mới, requirements/rubric và phạm vi first release trong CP2. Giữ ba chức năng cốt lõi cùng các phần Task2 đã phân công; không tự điền thông tin kinh doanh còn thiếu.
- 58/58 kiểm tra đạt trên SQLite và libSQL. Thêm khảo sát 6 tính năng với self/demo/untried, giá thiếu khác 0, quyền xuất CSV và giữ phản hồi cũ; task CRUD có phiên bản; lịch sử B2B nguyên tử, rollback khi audit lỗi, tách khỏi research; chặn tư vấn tour đã khởi hành theo ngày Việt Nam.
- Build FE, Pages và Sites đạt. Migration 0002 chỉ tạo feature_feedback, pooling_audit và thêm tasks.version; migration 0000/0001 không đổi. Cả ba migration đã chạy thành công trên D1 QA riêng được xác nhận trống.
- UI local đạt tạo/sửa/xóa việc và bộ lọc, tour rút công khai rồi khôi phục, lịch sử B2B, form 6 tính năng, giá chưa biết/null rồi cập nhật 0, 3 CSV reviewer, XLSX thật và log nút/menu. Không có lỗi JavaScript/tràn ngang trong các luồng kiểm tra ở 320/390/768/1440px.
- Kiểm tra riêng tour editor, đổi số khách, task editor và đối soát: sau 409 giữ giá trị nháp, nút Nạp bản mới lấy đúng dữ liệu/version mới và có thể lưu lại. Hướng dẫn mới có đủ 6 nhóm chức năng, lối mở trực tiếp và bảng P1–P3/S-1–S-4.
- Tài khoản QA được xóa sau từng lần thử. Kết quả production và mã deployment được ghi tiếp sau khi phát hành; chưa dùng QA làm bằng chứng người thử thật.
- Đã phát hành backend Sites version 6, deployment `appgdep_6ad4c2cce484819194a4ff2560c32726`, giữ nguyên revision secrets 2; Pages production `93a2ff2b-c832-4bad-a409-ecf63a43cf02`. Các migration bổ sung chạy trên cùng D1, không đặt lại dữ liệu hoặc sửa migration cũ.
- Production API legacy đạt. UI đầy đủ qua Pages đạt: rút/khôi phục tour trong lúc mở chi tiết, task CRUD/bộ lọc, B2B có audit, khảo sát 6 tính năng/giá null→0, reviewer/CSV, XLSX và logs; không có lỗi JavaScript hoặc tràn ngang trong các màn hình kiểm tra. Kiểm tra riêng 4 form xung đột cũng đạt qua URL production.
- Hai CSV khảo sát production đã kiểm schema/quyền reviewer, bỏ mục chưa thử, không gán điểm dễ dùng cho người chỉ xem, giữ giá thiếu khác 0 và chống công thức trong nội dung tự do. Mọi tài khoản QA riêng của các bộ kiểm tra đều xóa thành công.
- Sau khi dọn QA: health trả `0.4.0`; bộ đếm nghiên cứu trả 0 participants, 0 feedback, 0 events và 0 readyToReview. Những lần thử kỹ thuật không được tính thành người tham gia nghiên cứu.

## Bộ dữ liệu demo do chủ dự án cung cấp — 18/10/2026

- Nhập 3 tour có lịch/giá/sức chứa/số khách theo nguồn; portal hiển thị còn 8, 7 và 8 chỗ. Tạo 3 phiếu B2B chờ xác nhận với `paid=0`, không tự cộng khách hoặc suy diễn khoản đã thu từ nguồn mâu thuẫn.
- Nhập TASK-01 và TASK-02 với tour liên quan rõ, giữ người phụ trách/trạng thái/hạn. TASK-03 chưa có tour liên quan nên chưa nhập. [Bàn giao dữ liệu và điểm cần xác nhận](OWNER_DEMO_DATA_2026-10-18.md).
- Kiểm tra production chỉ đọc đạt: portal agency có nhãn giả lập, form yêu cầu thử nghiệm, 3 tour, 3 phiếu chờ và 2 công việc; không tràn ngang ở 320/390/768px, không lỗi JavaScript. Nhãn không thay đổi luồng của không gian người thử riêng.
- Bảng tester không được nhập thành phản hồi hoặc tài khoản. Sau nhập và kiểm tra, các bộ đếm nghiên cứu vẫn bằng 0; liên hệ B2B không xuất hiện trong API công khai.
- UI CI ban đầu vướng câu thông báo reviewer cũ. Cập nhật assertion theo thông báo dữ liệu giả lập mới và giữ nguyên toàn bộ kiểm tra chặn quyền sửa/xóa/xuất dữ liệu.
- Full UI regression production đã đạt lại với bộ dữ liệu demo hiện hữu: người thử riêng, portal, tư vấn, task CRUD, B2B/audit, phản hồi, XLSX và reviewer; tài khoản QA được xóa. Pages deployment `996531fa-b887-4523-ba56-cfbbc81267fe`; Sites version 7 deployment `appgdep_6ad4e342e2448191b393df7ba7345532` thành công, secrets revision 2 giữ nguyên.

## Hoàn thiện MVP 0.4.1 — 19/10/2026

- 66/66 kiểm tra tự động đạt trên SQLite và libSQL: thêm các tình huống inquiry vừa ẩn/đầy/qua ngày/xóa, B2B phiên bản tương lai và log sai cấu trúc; lọc ngày/chỗ/tìm không dấu và mốc ngày Việt Nam.
- UI local đạt bộ lọc ngày bao gồm biên, khoảng ngày đảo ngược, hết chỗ/đã đi, danh mục chưa có lịch được giải thích riêng và reset. Hero mobile 390px rộng khoảng 361px cao; không có tràn ngang ở 320/390/768/1440px trong màn hình đã thử.
- Full UI local đạt network recovery/slow polling, tour ẩn khi đang mở, task CRUD, B2B/history, khảo sát sáu tính năng, reviewer và nhập XLSX thành nháp. Lần nhập cố ý bị giữ response để kiểm modal không đóng khi Escape/nền/nút Đóng; tiếp tục response vẫn nhập đúng một lần.
- Build Vite, Pages và Sites đạt. Không thêm dependency ứng dụng, schema hoặc migration. Source cloud dùng các module chung mới qua exporter, không sửa riêng hai bản logic.
- Chi tiết thay đổi và thông tin nhóm còn cần cung cấp: [rà soát 19/10](WEB_REVIEW_2026-10-19.md). Kết quả production được ghi tiếp sau phát hành.
- Đã phát hành Sites version 8 (`appgdep_6ad507f051688191a18bd61376671ed2`) và Pages (`0ed61021-f452-475e-a3b9-8969fd3329a2`); health production trả `0.4.1`. Secrets revision 2, D1 và các migration cũ giữ nguyên.
- Sau khi cả FE/BE mới đều live, production API và full browser regression đã đạt lại, gồm log sai trả 400, các luồng lõi, bộ lọc lịch/chỗ, reviewer và nhập XLSX cố ý giữ response để kiểm khóa đóng. Không có lỗi JavaScript/tràn ngang trong màn hình kiểm tra; tài khoản QA đã xóa.
- Readback sau rollout vẫn đúng 3 tour, 3 phiếu chờ `paid=0`, 2 việc và số khách 22/30, 18/25, 12/20. Bộ đếm nghiên cứu sau dọn QA vẫn 0 participants, 0 feedback, 0 events, 0 readyToReview; không đưa bộ tester mẫu vào dữ liệu nghiên cứu.

## Phát hành 0.5 — 19/10/2026

86/86 kiểm tra trên SQLite và libSQL đạt. API production và cả hai bộ browser cũ/mới đạt; QA tạm được xóa. Đã kiểm tra 3 tour công khai với ảnh, 3 công việc, B2B xác nhận2/chờ1, số khách22/18/12 và thu giả lập33,6tr/8,5tr/0. Admin không làm tăng khảo sát. Bộ demo quản trị không tràn ngang320/390/1440px, không lỗi JS.

Migration0003 bổ sung bảng tài khoản; Sites version10 và Pages sourcef695f2d đã phát hành, D1 và secrets revision2 giữ nguyên. Chi tiết ở RELEASE_0_5.md; metadata deployment ở cloud/site.json và cloud/pages/deployment.json. Xác minh email/gửi khôi phục còn chờ nhà cung cấp; không có tester thật hay giao dịch thật tự phát sinh.

## UX 0.5.1 - 23/10/2026

89/89 kiểm tra trên SQLite và libSQL đạt. Các bộ trình duyệt local/public kiểm tra luồng cũ, tài khoản/nhân viên và sáu cải thiện UX; không ghi nhận lỗi JavaScript hoặc tràn ngang trong màn hình kiểm tra ở 320/390 px. Ẩn tour giữ nguyên số khách, phiếu, số thu và phiên bản phiếu. Không tự đổi số tiền để xóa tour. API production đạt sau phát hành; dữ liệu QA được xóa.

Sites version11 và Pages runtime source96109bd đã phát hành; schema/migration/secrets và dữ liệu nghiệp vụ hiện có giữ nguyên. Xem RELEASE_0_5_1.md và metadata cloud để truy nguyên.

## Giảm thời gian chờ giao diện — 24/10/2026

- Một lần đo trên Pages trước sửa: tiêu đề hiện sau 2.831 ms, tour sau 3.665 ms; riêng GET session mất 2.105 ms. Điều hướng nội bộ trong cùng lần thử mất khoảng 128–193 ms gồm 100 ms chờ của bộ đo. Đây là số đo quan sát trên một thiết bị/kết nối, không phải SLA hay benchmark đại diện.
- Cổng public tải song song với kiểm tra phiên. Điều hành và liên kết tài khoản vẫn đợi kiểm tra phiên; phản hồi phiên cũ không thể ghi đè đăng nhập vừa hoàn thành. Danh mục tham khảo chưa mở không dựng các thẻ vào DOM.
- Đồng bộ đọc vẫn có nhịp cơ bản 5 giây sau khi lần trước kết thúc; không chồng yêu cầu, tạm ngưng khi tab ẩn/offline, tải ngay khi quay lại/online và giãn nhịp lỗi tối đa 30 giây. Không tự gửi lại thao tác ghi.
- 93/93 kiểm tra tự động đạt; thêm kiểm tra lịch đồng bộ bằng đồng hồ giả. Full UI và UX 0.5.1 local đạt lại, gồm mạng chậm, khôi phục kết nối, tour/công việc/B2B/XLSX và mobile. Bộ performance-ui mới đạt: cố ý giữ response session, portal vẫn dùng được; đăng nhập mới không bị response cũ hủy; workspace chưa hiện khi phiên chưa được kiểm tra.
- Không thêm dependency, đổi schema/migration hoặc sửa dữ liệu nghiệp vụ. Kết quả và mã triển khai public được ghi sau khi phát hành.
- Sau phát hành: Sites version13 và Pages source88c5606 thành công, secrets revision2 giữ nguyên. Cả performance-ui, full UI và UX 0.5.1 trên public đều đạt; dữ liệu QA đã được xóa. Trang chủ không tràn ngang ở 320/390/1440px, không có lỗi JavaScript trong các luồng đã thử. GitHub CI của source88c5606 đạt.
- Lần đo lại trên cùng máy: tiêu đề 835 ms, tour 1.271 ms, workspace 222 ms; không thấy long task trong lần đo này. Với CPU giả lập chậm4x và cache sẵn: tiêu đề 294 ms, tour508 ms (trước sửa1.075/1.088 ms). Cache và mạng giữa các lần đo có thể khác; không suy ra phần trăm cải thiện hoặc cam kết thời gian cho mọi người dùng. Các phép thử giữ session bằng route interception xác nhận độc lập rằng portal không còn phụ thuộc thời gian phản hồi session.

## Tách cổng khách hàng và điều hành — 24/10/2026

- Cổng `/` và `/portal/<workspace>` vào thẳng tra cứu tour: bỏ toàn bộ hero/khối mô tả công cụ điều hành, CTA doanh nghiệp và khẩu hiệu chân trang theo bốn ảnh của chủ dự án. Logo chung đổi từ `taskhub` thành `TaskHub`. Giữ nhãn dữ liệu giả lập, nguồn ảnh, lịch/giá/chỗ, bộ lọc, chi tiết và gửi yêu cầu.
- `/app` khi chưa đăng nhập hiển thị trang vào riêng cho điều hành; CTA doanh nghiệp chỉ còn ở khu vực này. Đăng nhập hoặc dùng thử được mở từ đây. Tài khoản đã có giữ nguyên workspace, quyền chỉnh sửa/xem, log và dữ liệu; khách xem tour không cần tạo tài khoản. Vai trò nghề nghiệp trong survey khác quyền truy cập hệ thống.
- 93/93 kiểm tra tự động đạt. Full UI, v0.5 và UX 0.5.1 local đạt lại. Performance-ui kiểm cả hai giao diện ở 320/390/1440px, khách chưa đăng nhập gửi yêu cầu vào workspace QA thật và API nội bộ vẫn trả401; phản hồi phiên chậm/cũ không làm hỏng đăng nhập, và workspace đợi phiên được kiểm tra. Phiếu yêu cầu QA, tour và tài khoản tạm được xóa cùng workspace.
- Không đổi schema, migration, mật khẩu hay quyền của tài khoản hiện có. Thông tin triển khai public được cập nhật sau khi kiểm tra.
- Public Pages sourcef32bc6f và Sites version15 đã phát hành, giữ D1/migration/secrets revision2. Full UI và v0.5 trên Pages đạt lại; bộ performance-ui đạt trên cả Pages và Sites, gồm khách gửi yêu cầu không có session, API nội bộ401 và các kiểm tra giao diện theo hai vai trò. QA được xóa sau kiểm tra.
- Kiểm tra mở trực tiếp `/app` ở Sites phát hiện React418 do SPA đọc đường dẫn trình duyệt khác HTML SSR. Exporter nay dựng một trạng thái tải chung rồi mount SPA trên trình duyệt; kiểm tra lại không còn lỗi console/hydration. Pages không cần thay bản build vì thay đổi này chỉ ở exporter cho Sites. GitHub CI của sourcefc80251 đã đạt.

## Thu gọn tài khoản và dừng xác minh email — 24/10/2026

- Theo yêu cầu chủ dự án, thẻ Tài khoản & bảo mật chỉ còn tiêu đề/icon, tên/email của người đang đăng nhập và quyền hiện tại. Bỏ badge/nút xác minh, mô tả email provider và đoạn thời hạn lưu tại thẻ này. Thông báo dữ liệu tại đăng ký/Hướng dẫn vẫn giữ đúng thực tế.
- Dừng hai API xác minh cũ bằng410, không gửi thư hay sửa trạng thái tài khoản; bỏ màn hình xác nhận và xóa tham số verify cũ khỏi URL. Giữ dữ liệu/cột lịch sử, không đánh dấu toàn bộ tài khoản là đã xác minh và không thay đổi quyền hoặc mật khẩu. Lời mời/khôi phục mật khẩu là luồng riêng, giữ hành vi hiện có.
- 94/94 kiểm tra tự động đạt. V0.5 UI local đạt: đúng hai dòng nội dung trong thẻ, không badge/nút/mô tả, tên/email động, không tràn ở320/390px; mời, nhận, thu hồi quyền nhân viên và xử lý reset vẫn đúng. Performance-ui local đạt lại, khách và điều hành vẫn tách biệt. QA được xóa sau kiểm tra.
- Đã phát hành Sites version16 và Pages sourcec877478, giữ nguyên D1/migration/secrets revision2. V0.5 UI production đạt lại, gồm thẻ tài khoản tối giản, API xác minh trả410, liên kết cũ không mở dialog và luồng nhân viên/reset. QA được xóa; GitHub CI sourcec877478 đạt.

## Xóa chức năng ngoài phạm vi được yêu cầu — 24/10/2026

- Đối chiếu trực tiếp CP3 Requirements mục 2.1–2.3 và CP3_Task/phần Tuấn: cần ít nhất 20 người thử, đánh giá tính năng và raw user interaction data; không yêu cầu giao diện bấm bắt đầu/kết thúc, tính thời gian bài thử hoặc CSV thời gian riêng. Do chủ dự án yêu cầu bỏ, đã xóa frontend, CSS, backend, API, thống kê và exporter của tính năng này. Nạp dữ liệu mẫu được tách thành demo-ui/demo.css riêng.
- Xóa các hàm tạo thư/xác nhận email, truy vấn profile và cờ trạng thái khỏi API tài khoản; đường dẫn cũ không còn route (404). Lời mời nhân viên và reset mật khẩu vẫn có kiểm tra token một lần/hết hạn, không dùng chung với xác minh email nữa. Giữ nguyên schema/migration lịch sử và dữ liệu hiện có, không drop bảng để xóa chức năng.
- Xóa thêm 48 selector CSS của hero/khối giới thiệu khách hàng đã bị bỏ trước đó; slogan đã bỏ không còn trong sidebar. Khối giới thiệu doanh nghiệp vẫn ở cửa vào điều hành đúng yêu cầu tách hai cách xem.
- 91/91 kiểm tra hiện hành đạt; bỏ ba kiểm tra dành riêng cho tính năng thời gian đã xóa, giữ và cập nhật kiểm tra reset/lời mời/quyền. Full UI, UX 0.5.1, v0.5 và performance-ui local đạt. Xác nhận API cũ không còn hoạt động và log nút/menu, khảo sát, CSV, B2B, Excel, mobile vẫn đúng. QA được xóa sau kiểm tra.
- Đã phát hành Sites version17 và Pages source42d2262; database, migration và secrets revision2 giữ nguyên. Full UI, v0.5 và performance-ui public đạt lại, gồm các API bị xóa trả404, log nút/menu vẫn được lưu và quyền khách/điều hành vẫn đúng. QA được xóa, GitHub CI source42d2262 đã đạt. Các tệp trial cũ cũng đã bị xóa khỏi repository cloud, không chỉ khỏi bundle giao diện.
