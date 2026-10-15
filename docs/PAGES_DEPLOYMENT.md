# Địa chỉ Cloudflare Pages cho TaskHub

Trạng thái 15/10/2026: bản Pages đã chuẩn bị và build được; **chưa có URL Pages được cấp**, đang chờ chủ tài khoản đăng nhập Cloudflare. Tên yêu cầu là `taskhub-travel`; Cloudflare quyết định hostname khi tạo project. Web đang hoạt động vẫn là https://taskhub.ninaninohihi.chatgpt.site. Backend đã phát hành hỗ trợ gateway trong Site version 2; ID/SHA ở `cloud/site.json`.

Pages phục vụ giao diện React/Vite của repo. `/api/*` đi qua gateway có chữ ký tới backend Sites hiện tại; dữ liệu vẫn ở cùng D1. Không tạo database thứ hai hoặc nhập/xóa dữ liệu khảo sát khi đổi địa chỉ. Cả Pages và backend đều chạy trên cloud, độc lập với máy chủ repo. URL cũ vẫn truy cập được; đăng nhập lại khi chuyển sang hostname mới vì cookie được giới hạn theo hostname.

## Tạo và phát hành

1. Chủ dự án đăng nhập tài khoản Cloudflare Free của mình. Wrangler cần các scope `account:read`, `user:read`, `pages:write` để triển khai. Chủ tài khoản tự chấp thuận OAuth; không chia sẻ mật khẩu/OTP qua chat.
2. Đảm bảo backend Sites đã phát hành adapter hỗ trợ gateway và có secret runtime `TASKHUB_PROXY_SECRET`. Giữ nguyên Site ID và D1 trong `cloud/site.json`. Bản export nằm trong `scripts/export-sites.mjs`; không đổi database hoặc migration đã áp dụng.
3. Tại repo TaskHub, dùng Node.js 24:

   ```powershell
   npm ci
   npm test
   npm run build:pages
   npx wrangler@4.92.0 login --scopes account:read user:read pages:write
   npx wrangler@4.92.0 pages project create taskhub-travel --production-branch dev
   ```

4. Dùng `wrangler pages secret bulk` để đặt **cùng** secret trong project Pages trước khi deploy. Bản private trên máy chủ repo là `work/pages-proxy/secrets.json`, được bỏ khỏi Git. Không in giá trị ra chat, không commit, không đưa secret vào build/frontend. Khi dùng CI, lưu token triển khai trong GitHub Actions secrets và giới hạn theo account/Pages; chưa cấu hình CI tự deploy khi chưa có quyền tài khoản.

   ```powershell
   Get-Content -Raw -LiteralPath 'work/pages-proxy/secrets.json' | npx wrangler@4.92.0 pages secret bulk --project-name taskhub-travel
   npx wrangler@4.92.0 pages deploy dist-pages --project-name taskhub-travel --branch dev
   ```

5. Dùng URL **do Cloudflare trả về** để kiểm tra UI/API. Thử đăng ký → sửa tour → cổng khách hàng → gửi yêu cầu → công việc → phản hồi; kiểm tra reviewer và CSV. Chạy `npm run test:cloud` với `TEST_URL` trỏ tới Pages và admin/reviewer credentials lấy từ môi trường private. Dọn tài khoản QA của mình sau kiểm thử. Chỉ sau khi pass mới thay link khảo sát/README và thông báo URL mới.

Direct Upload không chuyển trực tiếp sang Git integration được. Có thể dùng GitHub Actions + Wrangler để deploy nhánh `dev` đã duyệt, hoặc chọn Git integration ngay từ đầu nếu chủ tài khoản muốn cấp quyền ứng dụng GitHub. Không cần mua domain, thêm thẻ hoặc nâng gói để làm bước này.

## Bảo vệ đường API

- Gateway kiểm tra Origin của trình duyệt **trước** khi chuyển tới backend, chỉ chuyển cookie `taskhub_session`, giữ Secure/HttpOnly/SameSite và trạng thái lỗi API.
- IP từ Cloudflare được ký HMAC cùng method/path/query/thời gian; backend chỉ dùng IP đó khi chữ ký còn hạn và đúng secret. Cách này tránh gom mọi tester vào một IP Worker chung và không tin header IP do trình duyệt tự gửi.
- Request body tối đa 32 KiB. API không cache và không tự gửi lại thao tác ghi khi mạng lỗi. Admin/reviewer secret vẫn chỉ nằm ở backend Sites.
- Không tắt backend Sites khi Pages còn dùng gateway này. Dữ liệu và khả năng phục vụ API vẫn phụ thuộc backend đó; đổi hostname không phải chuyển quyền sở hữu D1 sang tài khoản Cloudflare của chủ repo.

Tài liệu chính thức: [Direct Upload](https://developers.cloudflare.com/pages/get-started/direct-upload/), [Pages advanced mode](https://developers.cloudflare.com/pages/functions/advanced-mode/).

## Kiểm thử bản chuẩn bị

Ngày 15/10: 20 kiểm tra Node/SQLite + gateway đều pass; bản Pages build thành công và Worker biên dịch được bằng Wrangler 4.92.0. API chạy qua Pages runtime cục bộ tới backend D1 thật đã pass (consent, duplicate signup, tenant isolation, optimistic writes, feedback, CSV và reviewer). UI qua Pages đã pass đăng ký, sync tour/portal, yêu cầu tư vấn, công việc và phản hồi trên desktop/mobile; không có lỗi JS hoặc tràn ngang, phục hồi lỗi mạng và request chậm hoạt động. Tài khoản QA được dọn sau test. Backend live từ chối chữ ký gateway giả. Kiểm thử bằng runtime dùng compatibility date 2026-05-15 phù hợp với bản Wrangler đã ghim; không khai báo ngày mới hơn runtime hỗ trợ.

Đây là kiểm thử trước triển khai. Cần kiểm tra lại hostname HTTPS và cookie trên Pages production sau khi Cloudflare cấp địa chỉ; chưa thay link khảo sát bằng hostname dự kiến.

AI tool used: https://openai.com/codex/
