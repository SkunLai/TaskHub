# Ghi chú AI cho phần build MVP của Tuấn

Ngày: 13/10/2026. Phạm vi: frontend/backend MVP, kịch bản thao tác và hướng dẫn chạy/deploy. Không soạn thay slide, BMC, lịch booking hoặc kết luận khảo sát của các thành viên khác.

## Tài liệu đã đối chiếu

- CP3 Requirements EXE101FA26.pdf: mục 2 (MVP Testing), mục 6 (demo trực tiếp), AI disclosure và BMC 1 trang.
- CP3 MVP Presentation & BMC Write-up Rubric EXE101FA26 - [Team's Name].pdf: core-feature validation, liên hệ CP2 market pains và UI/UX demo.
- TaskHub_CP2_Paper_Report.pdf: mục 6.1–6.2, ba core functions của bản đầu; B2B reconciliation là hướng giải pháp rộng hơn.
- Business Model Canvas (4).docx: mẫu trống; không điền vì phần này ngoài build MVP.
- CP3_context: tại thời điểm đọc chỉ có tên thành viên và nội dung giữ chỗ; chưa có phần “Thống Nhất”. Không diễn giải giữ chỗ thành đặc tả đã được nhóm duyệt.

## Prompt trong trao đổi này

Người dùng cung cấp bốn tài liệu CP3/CP2, timeline 13–23/10, ảnh phân công FE/BE và yêu cầu: “anh cần build mvp theo nhiệm vụ trong ảnh, anh làm cả 2 be fe luôn em hỗ trợ anh nhé”. Khi được hỏi code/stack: “Chưa có code, em chọn stack phù hợp”.

AI dùng nội dung trên để xây MVP React + Node.js + SQLite: public portal, tour/date/seat sync, internal tasks; thêm consent, sandbox riêng, interaction logs và feedback CSV để phục vụ thử nghiệm CP3. Không thu lại dữ liệu CP2 hoặc nhập email người khảo sát CP2 vào ứng dụng.

## Đoạn disclosure dự thảo cho nhóm rà soát

“Nhóm sử dụng Codex (OpenAI) để hỗ trợ đối chiếu yêu cầu CP2/CP3, đề xuất phạm vi MVP, tạo code frontend/backend, hướng dẫn chạy và kịch bản kiểm thử. Prompt cung cấp báo cáo CP2, yêu cầu/rubric CP3, mẫu BMC và nhiệm vụ build FE/BE. Nhóm chịu trách nhiệm rà soát, chạy thử, sửa và hiểu code; dữ liệu khảo sát người dùng thật và quyết định giá/Iterate/Persevere do nhóm thu thập và phân tích. Dữ liệu tạo tự động phục vụ QA được loại khỏi khảo sát.”

Nhóm chỉ dùng đoạn trên sau khi thực sự thực hiện phần trách nhiệm đã nêu. Nếu nhóm dùng thêm công cụ/prompt AI cho slide hoặc BMC, các thành viên ghi riêng rồi tổng hợp disclosure cuối.

**Link AI đã dùng:** https://openai.com/codex/

Đây là link công cụ. Nếu giảng viên/nhóm cần link từng hội thoại, nhóm cung cấp bản chia sẻ đã rà soát thông tin cá nhân; repo không giả lập một URL hội thoại.

## Nguồn kỹ thuật

- React: https://react.dev/learn/installation
- Vite: https://vite.dev/guide/
- Node SQLite: https://nodejs.org/api/sqlite.html (API DatabaseSync dùng trong Node 24; module còn experimental ở runtime Node 24).
- Docker Compose env interpolation: https://docs.docker.com/compose/how-tos/environment-variables/variable-interpolation/

## Trạng thái cần cập nhật trước khảo sát

- Local build và API integration tests có thể chạy bằng lệnh trong README.
- Public deployment, domain/HTTPS, persistent disk và quyền truy cập giảng viên: cần cấu hình hosting; chưa coi là đã triển khai.
- Chưa có dữ liệu người dùng thật, giá chốt hoặc quyết định Iterate/Persevere. Bản MVP không tự tạo các kết luận này.
