# Bản demo cố định — 19/10/2026

Đây là hướng dẫn bản CP3 theo thời điểm. Dùng [bàn giao Tuấn/Huy CP4](CP4_TUAN_HUY_HANDOFF.md) và [xác nhận phát hành](VALIDATION.md) cho bản hiện hành; các tag CP3 bên dưới chỉ là mốc dự phòng, không bị di chuyển.

- Web: https://taskhub-travel.pages.dev/
- Nhánh làm việc của nhóm: `build`; `dev` giữ để chủ repo duyệt.
- Bản hiện tại: 0.5.0. Có bộ mẫu tùy chọn và nhân viên dùng chung. Các tag cũ là bản dự phòng; không di chuyển.
- Mốc demo 0.4.1: Git tag `demo-cp3-0.4.1-2026-10-19`, tạo sau khi kiểm thử/CI đạt. Mốc 0.4 `demo-cp3-0.4-2026-10-18` và 0.3 `demo-cp3-2026-10-18` giữ làm bản dự phòng. Không di chuyển tag đã tạo.
- Bảng đối chiếu: [P1–P3 và S-1–S-4](CP2_FEATURE_MAP.md).
- Câu hỏi bàn giao An: [khảo sát sau dùng thử](CP3_SURVEY_QUESTIONS.md).

## Chuẩn bị

1. Dùng một tài khoản thử riêng, một cửa sổ điều hành và một cửa sổ portal cùng không gian. Reviewer chỉ dùng để xem/xuất.
2. Nhóm duyệt ít nhất một tour: tên, ngày đi cụ thể, sức chứa, khách đã giữ chỗ, giá và lịch trình. Danh mục Én Việt chỉ cung cấp nội dung tham khảo; không tự biến “hàng tuần” thành một ngày đi hoặc đặt số chỗ giả lên cổng chính.
3. Chuẩn bị tên đối tác, số khách ghép và giá net cho tình huống demo đã được nhóm duyệt. Không chiếu thông tin khách hàng hoặc CSV có email ra công khai.
4. Kiểm tra mạng, đăng nhập và tải trang trước buổi trình bày. Có thể chạy local theo README nếu cần, nói rõ môi trường đang dùng. Không thay demo trực tiếp bằng ảnh/video rồi gọi đó là live.

## Luồng khoảng 5–6 phút

| Thời lượng dự kiến | Luồng | Điều Tuấn giải thích |
| --- | --- | --- |
| 45 giây | P1: dùng danh mục / nhập Excel, giao việc từ thẻ tour | Một nguồn tour; dữ liệu được người quản lý duyệt, chưa tự công khai sau import. |
| 45 giây | Đổi số khách nhanh và đổi trạng thái việc | Ít nút thao tác; phiên bản cũ và số khách vượt sức chứa bị từ chối. |
| 60 giây | P2: portal tra cứu, chi tiết, gửi yêu cầu | Portal cập nhật theo chu kỳ 5 giây khi tab hiển thị; tư vấn chưa phải booking. |
| 90 giây | P3: phiếu B2B, xác nhận, đối chiếu chỗ, ghi nhận thu | Phiếu chờ chưa giữ chỗ. Xác nhận giữ chỗ; công nợ là số theo dõi nhập tay, không phải tiền đã giao dịch qua TaskHub. |
| 45 giây | Hủy phiếu sau khi đối soát về 0, xuất CSV | Chỗ được trả lại đúng một lần; không tự xử lý hoàn tiền hoặc liên hệ đối tác. |
| 45 giây | Mở bảng P1–P3/S-1–S-4, phản hồi và reviewer | Nói rõ S-3 tối giản; S-4 còn cần dữ liệu thật. Không lấy QA làm khảo sát. |

## Khôi phục code khi bạn clone

```powershell
git clone https://github.com/skunlainro3-glitch/TaskHub.git
cd TaskHub
git switch --detach demo-cp3-0.4.1-2026-10-19
npm ci
Copy-Item .env.example .env
npm run dev
```

Cần Node.js 24; đổi mật khẩu local trong `.env` trước khi chia sẻ máy/mạng. Giữ nguyên dữ liệu production. Tag cố định mã nguồn, không khóa dữ liệu live: để tránh người khác thay đổi dữ liệu lúc demo, dùng không gian và tài khoản demo riêng, không gửi tài khoản đó cho tester.

## Luồng mẫu 0.5

Đăng ký tài khoản dùng thử → Dùng dữ liệu mẫu → kiểm tra 3 tour/3 việc/3 phiếu. P1: đổi số chỗ/giao việc; P2: mở portal đối chiếu; P3: xác nhận B2B-103 rồi ghi nhận khoản thu giả lập. Bắt đầu một bài thử trước thao tác và kết thúc sau khi tự dùng; không biến bài QA thành khảo sát thật. Nếu muốn bộ mẫu nguyên vẹn, dùng tài khoản demo riêng; không có nút reset toàn bộ dữ liệu cloud của mọi người.
