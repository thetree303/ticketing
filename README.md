# Online Ticketing System - Hệ thống bán vé trực tuyến

Ứng dụng web full-stack dành cho việc quản lý và mua vé sự kiện. Nền tảng hỗ trợ ba vai trò người dùng: Khách hàng (Customer), Nhà tổ chức (Organizer) và Quản trị viên (Admin), mỗi vai trò có giao diện và tính năng riêng biệt.

---

## Mục lục

- [Tổng quan](#tổng-quan)
- [Công nghệ sử dụng](#công-nghệ-sử-dụng)
- [Cấu trúc dự án](#cấu-trúc-dự-án)
- [Tính năng](#tính-năng)
- [Yêu cầu môi trường](#yêu-cầu-môi-trường)
- [Bắt đầu](#bắt-đầu)
  - [Cài đặt Backend](#cài-đặt-backend)
  - [Cài đặt Frontend](#cài-đặt-frontend)
- [Biến môi trường](#biến-môi-trường)
- [Tổng quan API](#tổng-quan-api)
- [Vai trò người dùng](#vai-trò-người-dùng)

---

## Tổng quan

Hệ thống cho phép nhà tổ chức sự kiện tạo và quản lý sự kiện, khách hàng duyệt và mua vé, đồng thời quản trị viên giám sát toàn bộ hệ thống. Thanh toán được xử lý thông qua cổng thanh toán VNPay Sandbox. Vé sau khi mua được tạo kèm mã QR duy nhất và có thể check-in tại địa điểm tổ chức sự kiện thông qua công cụ check-in tích hợp sẵn.

---

## Công nghệ sử dụng

### Backend

| Công nghệ | Mô tả |
|---|---|
| NestJS (v11) | Framework Node.js để xây dựng ứng dụng phía server có khả năng mở rộng |
| TypeORM (v0.3) | ORM để tương tác với cơ sở dữ liệu |
| PostgreSQL | Cơ sở dữ liệu quan hệ |
| Passport.js + JWT | Xác thực và phân quyền |
| VNPay (Sandbox) | Tích hợp cổng thanh toán VNPay (môi trường giả lập) |
| @nestjs/schedule | Cron job tự động hủy đơn hàng hết hạn |
| @nestjs/throttler | Giới hạn tốc độ truy cập (rate limiting) |
| Multer | Xử lý upload file |
| QRCode | Tạo mã QR cho vé |
| class-validator / class-transformer | Xác thực và chuyển đổi dữ liệu đầu vào |

### Frontend

| Công nghệ | Mô tả |
|---|---|
| React 19 | Thư viện giao diện người dùng |
| Vite | Công cụ build và server phát triển |
| TypeScript | Kiểm tra kiểu tĩnh |
| React Router DOM v6 | Điều hướng phía client |
| TanStack Query (React Query v5) | Quản lý trạng thái server và fetch dữ liệu |
| Zustand | Quản lý trạng thái phía client |
| React Hook Form + Zod | Xử lý form và xác thực dữ liệu |
| Tailwind CSS v4 | Framework CSS theo hướng tiện ích |
| Radix UI | Các thành phần UI có khả năng truy cập cao |
| Recharts | Biểu đồ và trực quan hóa dữ liệu |
| Axios | HTTP client |
| html5-qrcode | Quét mã QR cho check-in |
| jsPDF / @react-pdf/renderer | Tạo và tải vé dưới dạng PDF |

---

## Cấu trúc dự án

```
ticketing/
├── ticketing-backend/       # NestJS REST API
│   ├── src/
│   │   ├── auth/            # Xác thực (JWT, Guards, Decorators)
│   │   ├── users/           # Quản lý người dùng
│   │   ├── events/          # CRUD sự kiện và luồng phê duyệt
│   │   ├── event-categories/# Quản lý danh mục sự kiện
│   │   ├── ticket-types/    # Định nghĩa loại vé theo sự kiện
│   │   ├── orders/          # Tạo đơn hàng và quản lý vòng đời đơn hàng
│   │   ├── tickets/         # Phát hành vé và xác thực check-in
│   │   ├── payment/         # Tích hợp cổng thanh toán VNPay
│   │   ├── transactions/    # Lưu trữ giao dịch thanh toán
│   │   ├── organizer-banks/ # Quản lý tài khoản ngân hàng của nhà tổ chức
│   │   ├── payouts/         # Quản lý thanh toán cho nhà tổ chức
│   │   ├── reviews/         # Đánh giá sự kiện từ khách hàng
│   │   ├── stats/           # Thống kê và báo cáo
│   │   ├── upload/          # Upload ảnh sự kiện
│   │   ├── common/          # Hằng số và tiện ích dùng chung
│   │   └── config/          # Cấu hình ứng dụng (VNPay, v.v.)
│   ├── .env.example
│   └── package.json
│
└── ticketing-frontend/      # React + Vite SPA
    ├── src/
    │   ├── pages/
    │   │   ├── admin/       # Các trang dashboard Admin
    │   │   ├── organizer/   # Các trang dashboard Nhà tổ chức
    │   │   └── customer/    # Các trang dành riêng cho Khách hàng
    │   ├── components/      # Các component UI dùng chung
    │   ├── hooks/           # Custom React hooks
    │   ├── services/        # Tầng gọi API (Axios)
    │   ├── types/           # Định nghĩa kiểu TypeScript
    │   ├── lib/             # Hàm tiện ích
    │   └── styles/          # Styles toàn cục
    ├── .env.example
    └── package.json
```

---

## Tính năng

### Khách hàng (Customer)

- Duyệt và tìm kiếm sự kiện theo danh mục, từ khóa và ngày
- Xem chi tiết sự kiện bao gồm các loại vé và giá vé
- Chọn số lượng vé và tiến hành thanh toán
- Thanh toán đơn hàng qua cổng thanh toán VNPay
- Xem lịch sử đơn hàng kèm theo dõi trạng thái
- Tải vé đã mua dưới dạng PDF hoặc hình ảnh
- Xem mã QR của vé để vào cổng sự kiện

### Nhà tổ chức (Organizer)

- Đăng ký tài khoản nhà tổ chức
- Tạo và quản lý sự kiện với hình ảnh, mô tả và các loại vé
- Gửi sự kiện để Admin phê duyệt
- Hủy sự kiện
- Quản lý check-in vé thông qua công cụ quét mã QR tích hợp
- Xem thống kê doanh thu và số vé đã bán trên dashboard

### Quản trị viên (Admin)

- Phê duyệt hoặc từ chối sự kiện do nhà tổ chức gửi lên
- Quản lý toàn bộ người dùng (khách hàng và nhà tổ chức)
- Xem tất cả sự kiện, đơn hàng và vé trên toàn nền tảng
- Truy cập thống kê và báo cáo toàn hệ thống

### Hệ thống

- Xác thực bằng JWT với kiểm soát truy cập theo vai trò (RBAC)
- Tự động hủy đơn hàng hết hạn bằng cron job (có thể cấu hình, mặc định: 15 phút)
- Khóa pessimistic locking để tránh bán quá số lượng
- Giới hạn tốc độ truy cập (10 request/phút, 100 request/giờ mỗi IP trong môi trường production)
- Xác thực và làm sạch dữ liệu đầu vào trên tất cả các endpoint API

---

## Yêu cầu môi trường

- Node.js >= 18
- npm >= 9
- PostgreSQL >= 14
- Tài khoản merchant VNPay (để sử dụng tính năng thanh toán)

---

## Bắt đầu

### Cài đặt Backend

1. Di chuyển vào thư mục backend:

   ```bash
   cd ticketing-backend
   ```

2. Cài đặt các dependencies:

   ```bash
   npm install
   ```

3. Sao chép file môi trường mẫu và điền các giá trị cần thiết:

   ```bash
   cp .env.example .env
   ```

4. Khởi động server phát triển:

   ```bash
   npm run start:dev
   ```

   API sẽ chạy tại `http://localhost:3000`.

### Cài đặt Frontend

1. Di chuyển vào thư mục frontend:

   ```bash
   cd ticketing-frontend
   ```

2. Cài đặt các dependencies:

   ```bash
   npm install
   ```

3. Sao chép file môi trường mẫu và cấu hình URL của backend API:

   ```bash
   cp .env.example .env
   ```

4. Khởi động server phát triển:

   ```bash
   npm run dev
   ```

   Ứng dụng sẽ chạy tại `http://localhost:5173`.

---

## Biến môi trường

### Backend (`ticketing-backend/.env`)

| Biến | Mô tả | Ví dụ |
|---|---|---|
| `DB_HOST` | Host PostgreSQL | `localhost` |
| `DB_PORT` | Cổng PostgreSQL | `5432` |
| `DB_USER` | Tên người dùng PostgreSQL | `postgres` |
| `DB_PASS` | Mật khẩu PostgreSQL | `password` |
| `DB_NAME` | Tên cơ sở dữ liệu | `ticketing` |
| `JWT_SECRET` | Khóa bí mật để ký JWT token | `your_jwt_secret` |
| `JWT_EXPIRATION` | Thời gian hết hạn JWT token | `7d` |
| `ORDER_EXP` | Thời gian hết hạn đơn hàng (tính bằng phút) | `15` |
| `VNP_TMN_CODE` | Mã Terminal VNPay | Được cấp bởi VNPay |
| `VNP_HASH_SECRET` | Hash Secret VNPay | Được cấp bởi VNPay |
| `VNP_URL` | URL thanh toán VNPay | `https://sandbox.vnpayment.vn/paymentv2/vpcpay.html` |
| `VNP_RETURN_URL` | URL VNPay chuyển hướng về sau khi thanh toán | `http://localhost:5173/payment/success` |
| `VNP_API_URL` | URL API VNPay để truy vấn | Được cấp bởi VNPay |
| `FRONTEND_URL` | URL ứng dụng frontend (dùng cho CORS) | `http://localhost:5173` |

### Frontend (`ticketing-frontend/.env`)

| Biến | Mô tả | Ví dụ |
|---|---|---|
| `VITE_API_URL` | URL gốc của backend API | `http://localhost:3000` |

---

## Tổng quan API

Tất cả các endpoint API đều được đặt tiền tố theo tên tài nguyên. Hầu hết các endpoint yêu cầu xác thực, trừ những endpoint được đánh dấu là public. Quyền truy cập theo vai trò được kiểm soát thông qua guards.

| Tài nguyên | Đường dẫn gốc | Mô tả |
|---|---|---|
| Auth | `/auth` | Đăng ký, đăng nhập, xem hồ sơ, đổi mật khẩu |
| Events | `/events` | CRUD sự kiện, gửi phê duyệt, phê duyệt/từ chối/hủy |
| Ticket Types | `/ticket-types` | Quản lý loại vé theo sự kiện |
| Orders | `/orders` | Tạo đơn hàng, xem lịch sử đơn hàng |
| Payment | `/payment` | Tạo URL thanh toán VNPay, xử lý callback IPN |
| Tickets | `/tickets` | Xem vé, xác thực check-in |
| Users | `/users` | Quản lý người dùng (Admin) |
| Reviews | `/reviews` | Gửi và xem đánh giá sự kiện |
| Payouts | `/payouts` | Quản lý thanh toán cho nhà tổ chức |
| Stats | `/stats` | Thống kê toàn nền tảng và theo nhà tổ chức |
| Upload | `/upload` | Upload ảnh sự kiện |

---

## Vai trò người dùng

| Vai trò | Mô tả |
|---|---|
| `CUSTOMER` | Vai trò mặc định khi đăng ký. Có thể duyệt sự kiện và mua vé. |
| `ORGANIZER` | Có thể tạo và quản lý sự kiện, xem dữ liệu doanh số và thực hiện check-in vé. |
| `ADMIN` | Quyền truy cập toàn nền tảng. Phê duyệt sự kiện và quản lý toàn bộ người dùng và dữ liệu. |

Vai trò được xác định khi đăng ký. Nhà tổ chức đăng ký thông qua form riêng biệt, bổ sung thêm thông tin tài khoản ngân hàng để phục vụ việc thanh toán doanh thu.
