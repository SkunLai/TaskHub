# TaskHub — CP3 MVP

Web app hỗ trợ doanh nghiệp du lịch nhỏ và vừa. FE React/Vite, BE Node.js 24, SQLite local hoặc Turso cloud. Không cần dịch vụ AI/API key để chạy MVP. Hosting miễn phí dùng Render + Turso; xem hướng dẫn cuối trang.

## Chạy trên máy anh

Máy hiện tại đã cài thư viện. Trong terminal ở thư mục TaskHub:

```powershell
npm run dev
```

Mở http://127.0.0.1:5173. Frontend dùng port 5173; API port 3001. Dừng bằng Ctrl+C.

- **Dùng thử MVP**: tạo tài khoản và không gian mẫu riêng. Mỗi tester có 3 tour và 6 công việc mẫu; không sửa dữ liệu của tester khác.
- **Điều hành**: bấm Đăng nhập. Tài khoản local mặc định `admin@taskhub.local`, mật khẩu `TaskHub-Local-2026!`. Mặc định chỉ bind localhost. Tài khoản này xem kết quả và tải CSV.
- Mật khẩu trên chỉ dành cho local. Khi deploy phải đặt mật khẩu riêng ít nhất 12 ký tự trong biến môi trường `ADMIN_PASSWORD`; production không có mật khẩu mặc định.
- Nếu chuyển sang máy khác: cài Node.js **24 LTS**, chạy `npm ci` trước. Không dùng Node 18/20 vì backend dùng `node:sqlite`.
- Dữ liệu nằm trong `data/taskhub.sqlite` (và tệp WAL/SHM khi chạy). `data/` và `.env` đã được bỏ khỏi Git.

## Phạm vi bản 0.2

| CP2 / CP3                         | MVP chạy được                                                                                     | Cách kiểm tra                                  |
| --------------------------------- | ------------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| P1: thông tin rời rạc             | Tour và công việc gắn chung tour; người phụ trách, hạn và trạng thái                              | Tạo việc → chuyển Đang thực hiện → Hoàn thành  |
| P2: khách cần thông tin ngoài giờ | Cổng tour công khai: ngày, giá, lịch trình, số chỗ; gửi yêu cầu tư vấn                            | Mở cổng khách hàng, xem tour và gửi yêu cầu    |
| Lịch / số chỗ dùng chung          | API điều hành và portal dùng cùng SQLite; portal đọc lại mỗi 5 giây khi tab đang hiển thị         | Sửa số khách hoặc ngày, kiểm tra portal        |
| Tránh cập nhật sai                | Kiểm tra số khách không vượt sức chứa; phiên bản tour để từ chối ghi đè bản cũ                    | Thử vượt sức chứa hoặc sửa đồng thời ở hai tab |
| CP3: người dùng thử thật          | Đăng ký tự nguyện; lịch sử thao tác; đánh giá 3 tính năng, độ dễ dùng, ý định và mức sẵn sàng trả | Tester dùng MVP rồi gửi phản hồi               |
| CP3: dữ liệu gốc                  | Quản trị xuất `taskhub-interactions.csv` và `taskhub-feedback.csv` có email                       | Phản hồi MVP → tải CSV                         |

CP2 mục 6.2 giới hạn bản đầu ở cổng tour, lịch/số chỗ và giao việc. Đối soát B2B đầy đủ, net price/markup, thanh toán, chatbot, Excel import, Google login/xác minh email và gửi email tự động **chưa được xây**. Người phụ trách là tên nhập trong demo, chưa có tài khoản nhân viên riêng hoặc thông báo đến người đó. Chưa có reset mật khẩu. Đây là các giới hạn cần nói rõ khi demo.

Yêu cầu tư vấn không giữ chỗ hoặc xác nhận booking; chưa có tiền giao dịch thật. Tour, giá và nhân sự được tạo mẫu, không phải dữ liệu đối tác thật. Giá SaaS chưa chốt; 500.000 VND/tháng trong CP2 là giả định, không dùng làm kết quả khảo sát. MVP thu mức sẵn sàng trả đơn giản, **không** triển khai mô hình Van Westendorp.

## Kịch bản demo khoảng 5 phút

1. Đăng nhập / tạo không gian dùng thử. Chỉ ba mục: quản lý tour, công việc và cổng khách hàng.
2. Mở tour Đà Nẵng – Hội An. Đổi số khách giữ chỗ từ 22 sang 24 và lưu.
3. Mở cổng khách hàng: còn 6/30 chỗ, cùng ngày và giá vừa cập nhật. Xem lịch trình.
4. Gửi yêu cầu tư vấn bằng **email giả**; về điều hành xem yêu cầu mới. Giải thích chưa xác nhận booking.
5. Tạo việc “Chốt danh sách khách”, chỉ định người phụ trách và hạn. Chuyển sang hoàn thành.
6. Tester vào Phản hồi MVP để gửi đánh giá. Quản trị xem / tải dữ liệu gốc.

## Thử với ít nhất 20 người

CP3 Requirements mục 2.1 yêu cầu ít nhất **20 cá nhân**, xem/dùng MVP rồi đánh giá tính năng. Mời >20 người theo lịch nhóm để dự phòng. Gửi **link gốc của web** (nút Dùng thử MVP), không gửi link `/portal/<id>` riêng của người khác.

- Mỗi người tự tạo tài khoản bằng email và đồng ý thông báo dữ liệu. Email do người dùng nhập, **chưa xác minh**; không suy luận số email = số người độc lập.
- Yêu cầu sửa tour, xem portal, tạo/đổi trạng thái việc rồi đánh giá. Tải lại tự động không ghi nhận thêm lượt xem.
- `interactions.csv`: email, vai trò, quy mô, consent timestamp/version, action, entity và thời gian UTC. `feedback.csv`: cùng thông tin đối chiếu và điểm từng tính năng, ý định, mức trả, câu trả lời mở.
- Admin chỉ đếm tài khoản / phản hồi. Nhóm phải đối chiếu người thử thật và thao tác trước khi chốt mẫu; đăng ký đơn thuần chưa phải core-feature validation. Không tính dữ liệu tự động/QA vào khảo sát.
- Không tự quyết định Iterate/Persevere hoặc giá khi chưa có dữ liệu thật. Phần slide, BMC và phân tích giá thuộc phân công riêng; repo chỉ cung cấp dữ liệu phục vụ các phần đó.

## Bảo vệ / lưu dữ liệu

Cookie phiên đăng nhập HttpOnly/SameSite; production dùng Secure. Mật khẩu người thử được salt/hash bằng scrypt. SQL dùng prepared statements. API điều hành giới hạn theo workspace; export chỉ cho quản trị và reviewer được cấp quyền. Public portal chỉ đọc tour đã công khai và không trả email/khách hàng/công việc. Có kiểm tra origin và header riêng cho thao tác thay đổi, giới hạn tần suất đăng ký/đăng nhập/gửi yêu cầu.

Thông báo đồng ý xuất hiện trước khi đăng ký; consent v1 được ghi cùng thời gian. Người thử xóa tài khoản và dữ liệu tại Hướng dẫn & hỗ trợ. Dữ liệu khảo sát/yêu cầu tư vấn quá **180 ngày** được xóa khi server khởi động và mỗi 12 giờ server chạy. `npm run data:purge` có thể chạy thủ công. Nhóm cần xóa riêng CSV, bản backup và bản đã chia sẻ; chức năng này không thể xóa bản ngoài hệ thống. Không tuyên bố quy trình đã được kiểm toán tuân thủ pháp luật.

## Kiểm tra và build

```powershell
npm test
npm run build
npm start
```

`npm start` phục vụ cả FE build và API tại http://127.0.0.1:3001. Không cần Vite trên production. Test tích hợp dùng SQLite tạm, kiểm tra consent, phân tách tenant, sync, sức chứa, ghi đồng thời, task, inquiry, CSV, lưu sau restart và xóa dữ liệu. Test không nhập email hoặc dữ liệu CP2 thật.

Kiểm thử UI: để `npm run dev` đang chạy trong terminal thứ nhất, chạy `npm run test:ui` trong terminal thứ hai. Windows dùng Edge chạy ẩn; hệ điều hành khác cần `npx playwright install chromium`. Có thể đặt `PLAYWRIGHT_CHANNEL` hoặc `TEST_URL` nếu dùng môi trường khác. Script tạo tài khoản/email giả, thử tour → portal → inquiry → task → feedback, kiểm tra màn hình 1440px và 390px, rồi xóa tài khoản test. Ảnh QA lưu trong `work/`. Không chạy với dữ liệu sản xuất.

## Deploy

Phương án miễn phí đã chuẩn bị: **Render Free + Turso Free**, xem [hướng dẫn deploy](docs/DEPLOYMENT.md). Turso lưu database riêng để dữ liệu không mất khi Render ngủ hoặc redeploy. Cần tài khoản của chủ repo và cấu hình biến môi trường; chưa có URL public đã xác minh.

Cũng có Dockerfile/Compose cho VPS hoặc hosting có persistent disk, dùng một instance Node + SQLite volume. Các bước dưới đây chỉ áp dụng khi tự host với ổ đĩa bền vững:

1. Copy `.env.example` thành `.env`, đặt `ADMIN_EMAIL` và mật khẩu mạnh riêng trong `ADMIN_PASSWORD`. Không commit `.env`.
2. Máy có Docker: `docker compose up -d --build`. App ở `127.0.0.1:3001`; dữ liệu trong named volume `taskhub_data`.
3. Đặt reverse proxy HTTPS phía trước app, giữ nguyên Host/origin. Khi `NODE_ENV=production`, cookie Secure cần trình duyệt truy cập qua HTTPS để đăng nhập. Compose không tự cấu hình domain/chứng chỉ.
4. Với platform deploy trực tiếp Node: Build `npm ci && npm run build`, Start `npm start`; đặt `NODE_ENV=production`, `HOST=0.0.0.0`, `PORT` do platform cấp, `DATA_DIR` tới persistent disk và admin credentials. Chỉ chạy **một instance** với SQLite này.
5. Kiểm tra `/api/health`, đăng ký thử, sửa tour, refresh portal và restart service để xác minh disk giữ dữ liệu. Xóa tài khoản QA trước khi mời tester.

**Chưa deploy công khai** và chưa có URL cho tester bên ngoài. Dockerfile là cấu hình chuẩn bị, chỉ tuyên bố đã build container khi đã kiểm tra Docker thực tế.

Sao lưu SQLite đang chạy bằng `node --env-file-if-exists=.env scripts/backup.mjs` (dùng SQLite backup API, không copy mỗi tệp `.sqlite` khi WAL đang hoạt động). Bản backup chứa dữ liệu cá nhân; nhóm giữ riêng và quản lý thời hạn. Để restore: dừng app, xác minh thư mục dữ liệu, sao lưu hiện trạng, thay DB bằng bản backup bằng thao tác file có chủ đích; không xóa volume để restart/deploy.

## AI disclosure

Codex hỗ trợ đọc yêu cầu CP2/CP3, đề xuất phạm vi và stack, viết FE/BE, tài liệu chạy, kịch bản demo và kiểm thử bằng dữ liệu giả. Nhóm cần đọc, chạy và hiểu code trước khi dùng để khảo sát hoặc thuyết trình. Không dùng AI để tạo phản hồi tester hay kết quả willingness-to-pay. Mẫu prompt và ghi chú làm việc trong `docs/AI_DISCLOSURE.md`.

**Link AI đã dùng:** https://openai.com/codex/ (công cụ Codex; không phải link chia sẻ hội thoại).
## GitHub và web công khai

Repo: https://github.com/SkunLai/TaskHub. Nhánh chính `dev`; team sửa trên
`build` rồi mở PR vào `dev` cho SkunLai review. Xem [CONTRIBUTING.md](CONTRIBUTING.md).
Cấu hình hosting và các bước kiểm tra nằm trong [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md).
Giảng viên đăng nhập bằng `REVIEWER_EMAIL` / `REVIEWER_PASSWORD` do chủ hệ thống
cấu hình riêng: chỉ xem tour, công việc, yêu cầu và báo cáo; không được chỉnh sửa.
