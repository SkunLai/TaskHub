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
