# BomRauTFT - Shop Mua Bán Nick Game TFT

## Tổng quan

BomRauTFT là website mua bán tài khoản (nick) game Teamfight Tactics (TFT), được xây dựng bằng React + Vite + Tailwind CSS. Website có giao diện tối (dark theme) với tông màu chủ đạo xanh navy đậm, vàng gold và đỏ.

## Tech Stack

- **Framework**: Next.js 16 (App Router) — SSR/SSG cho SEO tốt
- **Frontend**: React 19, TypeScript
- **Styling**: Tailwind CSS v4
- **Upload ảnh**: Cloudinary (signed upload via API key/secret)
- **Backend**: MySQL (mysql2), Server Actions, JWT session
- **Auth**: bcryptjs + jose (JWT), rate limiting, HTTP-only cookie
- **Payment**: SePay webhook (auto top-up via bank transfer)
- **State**: React useState + Server Components SSR
- **Routing**: Next.js App Router (file-based routing)

## Cấu trúc trang

### Trang công khai (không cần đăng nhập)

1. **Trang chủ** - Hiển thị Thông Báo + Danh Mục sản phẩm
2. **Trang Thông Báo** - Tin tức, khuyến mãi
3. **Trang Shopping (Danh mục)** - Danh sách sản phẩm theo category
4. **Trang Chi tiết sản phẩm** - Thông tin acc: ảnh, giá, giảm giá, pet tím, sàn tím, chưởng + nút MUA NGAY

### Trang yêu cầu đăng nhập

5. **Trang Đăng nhập / Đăng ký** - Form username/password + đăng nhập bằng Google
6. **Trang Profile (User)** - Thông tin tài khoản, nạp tiền, lịch sử mua hàng

### Trang quản trị

7. **Trang Admin** (username: `admin`) - Quản lý toàn bộ hệ thống
8. **Trang Nhà Phân Phối** (username: `npp`) - Xem doanh thu và người mua trên tên miền của mình

## Hệ thống phân quyền (3 role)

| Role | Username | Quyền hạn |
|------|----------|-----------|
| **Admin** | `admin` | CRUD sản phẩm, danh mục, nhà phân phối, xem users, đơn hàng, thống kê |
| **Nhà phân phối (NPP)** | `npp` | Xem doanh thu + người mua hàng trên tên miền của mình. KHÔNG thể CRUD sản phẩm |
| **User** | Bất kỳ | Xem sản phẩm, mua hàng, nạp tiền, xem lịch sử mua |

## Cơ chế Nhà Phân Phối (NPP)

Mỗi NPP được Admin gán một **tên miền riêng** (VD: bomrautft.com, tftstore.vn).

### Luồng hoạt động:

1. Admin tạo NPP trong hệ thống, gán tên miền (VD: `tftstore.vn`)
2. Sản phẩm do Admin quản lý (thêm/sửa/xóa) — NPP không can thiệp được
3. Khi user truy cập website qua tên miền của NPP (VD: `tftstore.vn`) và mua hàng:
   - Đơn hàng được ghi nhận thuộc về NPP sở hữu tên miền đó
   - Doanh thu từ đơn hàng đó thuộc về NPP
4. NPP đăng nhập vào hệ thống để xem:
   - **Doanh thu**: tổng tiền từ các đơn hàng phát sinh trên tên miền của mình
   - **Người mua hàng**: danh sách user đã mua qua tên miền của mình (username, số acc, tổng chi tiêu)

### Tóm tắt:

- NPP = đại lý phân phối, dùng tên miền riêng để bán hàng hộ Admin
- Sản phẩm là chung (Admin quản lý), nhưng doanh số được tách theo tên miền
- NPP chỉ có quyền XEM, không có quyền thay đổi bất kỳ dữ liệu nào

## Trang Admin gồm

- **Thống kê**: Doanh thu, số sản phẩm, người dùng, đơn hàng
- **Sản phẩm**: Bảng CRUD + form thêm mới tích hợp Cloudinary upload ảnh
- **Danh mục**: Thêm/sửa/xóa danh mục, cập nhật số lượng đã bán inline
- **Nhà phân phối**: Quản lý NPP (tên, liên hệ, SĐT, email, **tên miền**, địa chỉ, trạng thái)
- **Người dùng**: Danh sách user
- **Đơn hàng**: Danh sách đơn với trạng thái

## Trang Nhà Phân Phối gồm

- **Doanh thu**: Bảng chi tiết từng acc đã bán trên tên miền của NPP (sản phẩm, người mua, giá, ngày)
- **Người mua hàng**: Danh sách user đã mua qua tên miền NPP (username, số acc, tổng chi tiêu, lần mua cuối)

## Trang User gồm

- **Thông tin**: Username, email, số dư, tổng acc đã mua, ngày tham gia + Đăng xuất
- **Nạp tiền**: Mệnh giá nhanh hoặc nhập tùy ý, phương thức (ngân hàng, MoMo, thẻ cào)
- **Lịch sử mua**: Danh sách acc đã mua

## Giao diện & UX

- **Theme**: Dark navy (#0f172a → #1f2937 gradient), viền vàng gold (#fbbf24), badge đỏ (#dc2626)
- **Font**: Open Sans (body), Nunito (giá, số)
- **Responsive**: Mobile-first, breakpoint md (768px)
- **Hiệu ứng**:
  - Badge giảm giá: nhấp nháy phóng to/thu nhỏ + đổi màu đỏ↔vàng
  - Số đã bán/còn: animate-pulse
  - Chuyển trang: fade-in + slide-up
  - Scroll to top khi navigate

## Navigation

- **Logo** → Về trang chủ
- **Thông Báo** → Trang thông báo riêng
- **Shopping** → Trang danh mục sản phẩm
- **Đăng Nhập** (chưa login) → Trang login
- **Username** (đã login) → Trang profile/admin/npp tùy role

## Ghi chú

- Backend đầy đủ: MySQL (mysql2 + connection pool), Server Actions, SePay webhook tự động nạp tiền
- Cloudinary config trong `src/app/actions/cloudinary.ts` dùng biến môi trường `CLOUDINARY_URL`
- Session JWT hết hạn sau 10 phút, tự động refresh qua middleware khi còn dưới 5 phút
- Dump database mới nhất tại `database/bomrautft.sql`
- Liên hệ mua hàng qua Zalo: 0338180818 (Bờm Râu)
- Social: Facebook + TikTok (footer)
