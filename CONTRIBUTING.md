# Quy trình team

`dev` là nhánh chính và là nguồn deploy. `build` là nhánh làm việc của team.
Quyền ghi repo được cấp sau khi chủ repo mời từng GitHub username.

```powershell
git clone https://github.com/SkunLai/TaskHub.git
cd TaskHub
git switch build
npm ci
npm run dev
```

Trước khi sửa, chạy `git pull --ff-only origin build`. Khi hoàn tất:

```powershell
npm test
npm run build
git add <cac-file-da-sua>
git commit -m "Mo ta thay doi"
git push origin build
```

Mở Pull Request: base **dev**, compare **build**. SkunLai review và merge khi
CI đạt. Team không push thẳng vào `dev` và không force-push nhánh chung.
Trao đổi trước khi hai người sửa cùng một file; có thể dùng nhánh tính năng
riêng từ `build` để giảm xung đột.

Sau khi PR merge, đồng bộ `build` trước khi bắt đầu việc tiếp theo:

```powershell
git fetch origin
git switch build
git pull --ff-only origin build
git merge origin/dev
git push origin build
```

Không commit `.env`, database, dữ liệu khảo sát hoặc khóa tài khoản.
Mật khẩu trên web được cấu hình trong hosting, không nằm trong code.
