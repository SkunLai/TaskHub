# Tập demo TaskHub theo P1 P2 P3

Web: https://taskhub-travel.pages.dev/. Chọn mốc mã nguồn theo [bản demo và các mốc phát hành](CP3_DEMO_RELEASE.md); giữ nguyên các tag đã phát hành. Thời lượng dưới đây là lịch tập dự kiến, chưa phải thời gian Tuấn đã trình bày.

## Dữ liệu cần duyệt trước buổi tập

Không gian điều hành đã có [bộ giả lập nhóm cung cấp](OWNER_DEMO_DATA_2026-10-18.md): 3 tour DEMO, 3 phiếu B2B chờ và 2 công việc. Giữ nguyên số khách trong bảng tour. Chưa xác nhận khách B2B có nằm trong số đã giữ hay khoản thu B2B-102, nên chưa dùng các phiếu này để xác nhận/đối soát. TASK-03 vẫn chờ tour liên quan. Các dữ liệu này không phải thông tin mở bán hoặc giao dịch thực tế.

Để tập toàn bộ luồng ghi dữ liệu mà không làm thay đổi các phiếu còn chờ đối chiếu, dùng tài khoản thử riêng và bộ giả lập đã được Tuấn duyệt cho buổi tập. Chọn nội dung từ danh mục Én Việt hoặc nhập tour; điền ngày đi, sức chứa, khách đã giữ, giá và lịch trình. Chuẩn bị công việc có người phụ trách/hạn, phiếu B2B có tên đối tác/số khách/giá net. Không lấy dữ liệu khách hàng thật hoặc đổi những con số chưa rõ để luồng chạy qua.

Chỉ dùng tài khoản demo riêng do Tuấn kiểm soát. Mở hai cửa sổ: điều hành và portal của cùng không gian. Không dùng reviewer để nhập dữ liệu hoặc chia sẻ tài khoản demo cho người khảo sát. Tag cố định code, không khóa dữ liệu live.

## Kịch bản nói và thao tác khoảng 6 phút

| Mốc dự kiến | Thao tác | Lời dẫn có thể tập |
| --- | --- | --- |
| 0:00–0:45 | Quản lý tour → dùng danh mục hoặc nhập Excel đã duyệt | “P1 là thông tin rời rạc. TaskHub đưa dữ liệu tour và công việc vào một không gian. Nội dung có nguồn được lấy nhanh; lịch và sức chứa phải do điều hành xác nhận.” |
| 0:45–1:30 | Đổi số chỗ ngay trên thẻ; giao một việc và đổi trạng thái | “Các thao tác thường dùng nằm ngay trên thẻ. Hệ thống chặn số khách vượt sức chứa và phiên bản cũ; người phụ trách hiện là tên nhập, chưa có tài khoản nhân viên.” |
| 1:30–2:30 | Mở portal cùng không gian, đối chiếu chỗ; gửi yêu cầu tư vấn | “P2 là nhu cầu tra cứu ngoài giờ. Khách xem lịch, giá, số chỗ trên web cloud. Yêu cầu này được lưu vào điều hành, chưa phải booking hoặc thanh toán.” |
| 2:30–4:00 | Tạo phiếu B2B → xác nhận → đối chiếu số chỗ trên portal | “P3 là rủi ro ghép tour và lệch số khách. Phiếu chờ chưa giữ chỗ. Xác nhận cộng số khách vào cùng nguồn tour. Đây là sổ nội bộ, đối tác chưa tự đăng nhập hoặc duyệt.” |
| 4:00–4:45 | Ghi nhận tổng tiền đã thu, xuất đối soát; về 0 rồi hủy khi phù hợp | “Số thu là giá trị điều hành đã đối chiếu và nhập vào sổ. TaskHub không chuyển tiền hoặc tự hoàn tiền. Hủy phiếu đủ điều kiện trả lại đúng số chỗ một lần.” |
| 4:45–6:00 | Mở bảng P1–P3/S-1–S-4 và giải thích phản hồi/reviewer | “S-1 và S-2 có luồng cốt lõi; S-3 là bản tối giản. S-4 còn cần dữ liệu người thử thật để quyết định giá và Iterate/Persevere. Log QA không phải khảo sát thị trường.” |

## Ba vòng tập

1. Đi chậm qua từng thao tác bằng dữ liệu đã duyệt. Kiểm tra tour, portal và phiếu khớp nhau; tự đánh dấu bước nào cần trợ giúp. Không nhập lặp cùng đợt Excel.
2. Tập liên tục theo lịch 6 phút, tự đo thời gian. Chưa có bằng chứng Tuấn đã tập cho đến khi Tuấn trực tiếp hoàn thành vòng này. Rút lời giải thích trước khi bỏ bước kiểm tra dữ liệu.
3. Tập trả lời lỗi: mất mạng thì tải lại; báo phiên bản cũ thì đọc dữ liệu mới; thiếu chỗ thì giảm khách hoặc chọn tour đúng. Có thể chạy local nếu mạng gián đoạn và nói rõ môi trường, không gọi ảnh/video là demo trực tiếp.

## Tự kiểm trước khi present

- [ ] Tour cần chiếu đã được công khai và ghi rõ DEMO; các phiếu nguồn chưa đối chiếu vẫn giữ chờ. Bộ dữ liệu riêng dùng tập ghi đã được Tuấn duyệt.
- [ ] Hai cửa sổ cùng workspace; tài khoản demo không phải reviewer.
- [ ] Portal đọc đúng lịch/giá/chỗ sau chu kỳ cập nhật 5 giây khi tab hiển thị.
- [ ] Đã tập tạo, xác nhận, đối soát và hủy phiếu; không còn tiền ghi sổ trên phiếu định hủy.
- [ ] Đã tự tập trọn luồng và ghi thời gian thật; giữ bảng giới hạn S-1–S-4 để trả lời.
- [ ] Chỉ chiếu báo cáo tổng hợp; không chiếu CSV/email/mật khẩu lên màn hình công khai.

## Bốn câu hỏi cần trả lời được

- Máy Tuấn tắt có dùng được không? Có, Pages và backend/database đang chạy trên cloud.
- Vì sao chỗ chưa đổi ngay? Portal tải nền mỗi 5 giây khi tab hiển thị; còn phụ thuộc kết nối.
- B2B đã thanh toán và đối tác đồng ý chưa? Bản này ghi thỏa thuận do điều hành nhập và theo dõi tiền đã đối chiếu; không xác nhận giao dịch hoặc phê duyệt hai phía.
- Đã xác minh 20 người chưa? Chỉ nói có sau khi nhóm đối chiếu cá nhân thật; số email/log tự động không xác minh điều đó.
