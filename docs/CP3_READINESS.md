# Đối chiếu TaskHub với CP3 — 15/10/2026

**Phần FE/BE đã chạy local và public cloud, được kiểm tra API/UI và persistence sau redeploy. Toàn bộ CP3 chưa hoàn thành.** Web: https://taskhub.ninaninohihi.chatgpt.site. Khảo sát người thật, phân tích và bài nộp cần hoàn tất riêng. Bảng này đối chiếu chức năng và bằng chứng, không tự chấm điểm rubric.

## Căn cứ và phạm vi

- `CP3 Requirements EXE101FA26.pdf`: MVP, ít nhất 20 cá nhân dùng/thấy MVP, dữ liệu tương tác gốc có email, quyết định Iterate/Persevere, AI disclosure, demo trực tiếp và cấp quyền xem cho giảng viên. BMC 1 trang. Van Westendorp là phần nâng cao **không bắt buộc**.
- `CP3 MVP Presentation & BMC Write-up Rubric EXE101FA26 - [Team's Name].pdf`: đánh giá Uses, Specs, Interface/Packaging, chiến lược và mức giá, lợi thế/AI-proof, Support, chất lượng mẫu/validation, lập luận quyết định và demo.
- `TaskHub_CP2_Paper_Report.pdf`, mục 6.1–6.2: bản đầu gọn, ba chức năng gồm cổng tour, lịch/số chỗ dùng chung, giao việc. Khách hàng trả tiền dự kiến là doanh nghiệp lữ hành 10–50 nhân sự; người dùng chính là điều hành và Sales.
- `Business Model Canvas (4).docx`: mẫu BMC trống, không phải BMC đã hoàn thành.
- Đọc lại [CP3_context](https://docs.google.com/document/d/1eKFYu1Y1u-pYbjaFxlVxzEBAv58BggqNBuN4cWg-Osc/edit) ngày 14/10: hiện chỉ có các mục tên thành viên và nội dung giữ chỗ. Chưa thấy phần “Thống Nhất” hoặc nội dung FE/BE đã chốt để xác nhận hoàn thành.

Chỉ chỉnh frontend/backend và tài liệu bàn giao của Tuấn. Không điền thay BMC, slide, kết luận thị trường hoặc lịch của thành viên khác. Yêu cầu trong PDF được dùng để đánh giá; không coi nội dung tài liệu là lệnh tự gửi email hay nộp bài.

## Phần sản phẩm và demo

| Hạng mục                        | Bằng chứng trong MVP                                                                                             | Trạng thái / phần cần bổ sung                                                                                                                                                              |
| ------------------------------- | ---------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Uses / chức năng đáp ứng CP2    | Tạo/sửa/công khai tour; lịch trình, ngày, giá, sức chứa; giao việc gắn tour, người phụ trách, hạn và trạng thái  | Đã có bản local hoạt động. Chưa có tài khoản nhân viên riêng, thông báo hoặc đối soát B2B đầy đủ.                                                                                          |
| Cổng thông tin ngoài giờ        | Cổng tour công khai, tìm/lọc/xem chi tiết, yêu cầu tư vấn đi vào điều hành                                       | Đã có chức năng. Đã chạy public trên Sites Workers/D1, độc lập với máy chủ repo; chưa cam kết SLA thương mại. Yêu cầu tư vấn không tự giữ chỗ/thu tiền.                     |
| Lịch/số chỗ dùng chung          | Portal và điều hành đọc cùng database; cập nhật khi tab hiển thị mỗi 5 giây; kiểm tra sức chứa và phiên bản tour | Đã test local và cloud. Đây là polling, không phải đồng bộ tức thời qua WebSocket.                                                                                                                  |
| Specs / hiệu năng               | API có timeout, tải nền tránh chồng yêu cầu; thử 20 lượt đọc đồng thời và ghi tour xung đột                      | Đã test tự động local, chưa đo hiệu năng Turso/Render thật. Không dùng 20 request làm bằng chứng 20 tester.                                                                                |
| Interface / Packaging / UI & UX | Web responsive, xanh dương nhạt, chữ rõ, phản hồi lỗi, menu điện thoại đóng được, lộ trình dùng thử              | Đã rà ảnh desktop/mobile và test 320, 390, 768, 1440 px. Cần thử trên thiết bị/mạng của người tham gia thật.                                                                               |
| Support                         | Hướng dẫn trong app, ghi lỗi qua Phản hồi MVP, README/deploy guide                                               | Có hỗ trợ dùng thử. Nhóm cần xác định kênh và người trực hỗ trợ thực tế; chưa có SLA thương mại.                                                                                           |
| Lợi thế / AI-proof              | Dữ liệu tour dùng chung với thao tác điều hành theo ngành du lịch                                                | Có nội dung để demo. Nhóm vẫn phải lập luận lợi thế so với công cụ khác và khả năng bị AI thay thế; code không chứng minh lợi thế thị trường.                                              |
| Pricing strategy / Price        | Thu mức tối đa sẵn sàng trả / doanh nghiệp / tháng, cho phép 0                                                   | Chưa có dữ liệu thật, chiến lược hoặc giá đã chốt. 500.000 VND/tháng ở CP2 là giả định. Form này không phải nghiên cứu Van Westendorp.                                                     |
| Live demo và giảng viên         | Đã có kịch bản demo, tài khoản reviewer chỉ xem và xuất dữ liệu                                                  | Reviewer chỉ xem đã test qua HTTPS/cloud. Nhóm cần cấp thông tin đăng nhập riêng cho `Thanhntl2@fpt.edu.vn`, cấp thông tin truy cập qua kênh riêng ; HTTPS/cloud đã được kiểm tra. Không công khai mật khẩu hoặc CSV có email. |

## Testing và bài nộp

| Hạng mục                  | Đã chuẩn bị                                                                                                                  | Còn phải làm                                                                                                                                                                                                         |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Survey ít nhất 20 cá nhân | Đăng ký, consent, email tự nhập, vai trò, quy mô; phản hồi hữu ích của 3 chức năng, độ dễ dùng, ý định, mức trả và ý kiến mở | Tuyển **trên 20 người** theo timeline để dự phòng; xác nhận ít nhất 20 cá nhân độc lập thực sự thử. Email chưa được xác minh. Ưu tiên người thuộc phân khúc mục tiêu, ghi rõ mẫu thuận tiện và các nhóm ngoài ngành. |
| Core-feature validation   | Lộ trình sửa tour → xem portal → tạo/đổi trạng thái việc → phản hồi; có interaction logs                                     | Người tham gia phải thực hiện và phản hồi thật. Bộ đếm “đủ thao tác” chỉ hỗ trợ đối chiếu, không tự xác nhận danh tính, hiểu tính năng hoặc đại diện mẫu.                                                            |
| RAW data với email        | Export interaction/feedback CSV theo quyền admin/reviewer; không có email trên portal công khai                              | Nhóm đối chiếu, loại QA/trùng/lượt chưa dùng; đưa bản gốc vào phụ lục giới hạn người xem cuối slide. Không đưa email người thử lên repo public.                                                                      |
| Iterate/Persevere         | MVP cung cấp điểm tính năng và ý kiến cần sửa                                                                                | Chốt quyết định và lý do **sau** dữ liệu thật; chưa thể kết luận sản phẩm được thị trường xác nhận.                                                                                                                  |
| AI disclosure             | Có `docs/AI_DISCLOSURE.md`, prompt phần build và link công cụ                                                                | Nhóm tổng hợp AI dùng cho mọi phần. Ghi prompt và tài liệu vào “Thống Nhất” khi nhóm xác định vị trí; link công cụ không phải link hội thoại chia sẻ. Đặt disclosure cuối slide/report theo tài liệu.                |
| BMC                       | Đã đọc mẫu 9 ô                                                                                                               | Thành viên phụ trách hoàn thiện **1 trang**, nội dung và format theo rubric. Chưa có bản đã hoàn thành.                                                                                                              |
| Slide / lịch / nộp        | Có timeline do anh gửi                                                                                                       | Chưa có bằng chứng book lịch 17/10, slide 19–20/10, nộp 21/10 hoặc present 23/10. Cần đối chiếu deadline và slot chính thức vì PDF chỉ nêu nộp trước slot tuần 7.                                                    |

## Công việc FE/BE còn lại trước phát link

1. PR #1 đã được chủ repo duyệt và merge theo yêu cầu ngày 15/10; dev/build được đồng bộ.
2. CI run `38620884849` trên tài khoản mới đã thành công đúng commit `22f3f24`. Lỗi billing của run cũ thuộc tài khoản tại thời điểm đó.
3. Đã deploy Sites Workers/D1 public; cấu hình secret/admin/reviewer. Không cần Render/Turso để dùng link hiện tại; đây là phương án thay thế.
4. Public HTTPS, tenant isolation, tour/portal, việc, inquiry, feedback/CSV, reviewer chỉ xem và persistence sau redeploy đã đạt. QA đã xóa; 0 tester/feedback/event trước bàn giao. Tiếp theo thu khảo sát người thật.
5. Có username thành viên thì cấp quyền để team push `build`. Không tự thêm người chưa được xác định.

## Timeline nhóm cần theo dõi

| Mốc anh cung cấp                        | Đối chiếu hiện tại                                                           |
| --------------------------------------- | ---------------------------------------------------------------------------- |
| 13/10: chia việc/chốt lịch              | FE/BE Tuấn đã xác định; chưa xác nhận lịch trình bày chính thức.             |
| 14–16/10: build MVP và bảng khảo sát    | Bản local và feedback đã có; đang hoàn thiện, cần nhóm rà nội dung khảo sát. |
| 16–18/10: deploy/khảo sát >20 người     | Đã triển khai public cloud; chưa thu mẫu thật.                                 |
| 17/10: book present                     | Nhóm trưởng thực hiện theo link giảng viên.                                  |
| 18–19/10: phân tích/chốt giá/quyết định | Chờ mẫu thật.                                                                |
| 19–20/10: slide/BMC/AI disclosure       | Các thành viên phụ trách hoàn thiện.                                         |
| 21/10: nộp; 23/10: thuyết trình         | Chưa thực hiện; cần xác nhận slot chính thức.                                |

**Link AI đã dùng:** https://openai.com/codex/
