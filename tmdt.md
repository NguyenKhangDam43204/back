# 🎯 Tổng quan dự án (Project Overview)
Hệ thống Web E-commerce bán hàng được xây dựng theo kiến trúc Microservices.
Giao tiếp giữa Client và API Gateway thông qua REST API. Giao tiếp nội bộ giữa các services sử dụng Message Broker (RabbitMQ).

# 🛠 Công nghệ sử dụng (Tech Stack)
- **Front-end:** HTML5, CSS3, Vanilla JavaScript.
- **Back-end:** NestJS (TypeScript).
- **Database:** MySQL.
- **Message Broker:** RabbitMQ.
- **Real-time/Notification:** Firebase.
- **Deployment & Infrastructure:** Docker, Docker Compose.

# 🏗 Kiến trúc Microservices & Database (Architecture)
Hệ thống tuân thủ nguyên tắc độc lập Database. TUYỆT ĐỐI KHÔNG thực hiện query chéo (cross-database queries) giữa các services.
Danh sách các services và database tương ứng:
1. **API Gateway:** Nhận request từ Front-end, route đến các service tương ứng (Không có DB).
2. **User Service** (`db_users`): Quản lý bảng `USERS`, `USER_ROLES`, `ROLES`, `USER_DETAILS`.
3. **Product Service** (`db_products`): Quản lý bảng `CATEGORIES`, `MODEL`, `PRODUCTS`, `PRODUCT_VARIANTS`, `PRICE_HISTORIES`.
4. **Order Service** (`db_orders`): Quản lý bảng `ORDERS`, `ORDER_DETAILS`.
5. **Payment Service** (`db_payments`): Quản lý bảng `PAYMENTS`.
6. **Promotion Service** (`db_promos`): Quản lý bảng `PROMOTIONS`, `PROMOTION_USAGES`.
7. **Review Service** (`db_reviews`): Quản lý bảng `REVIEWS`, `COMMENTS`.
8. **Config Service** (`db_config`): Quản lý bảng `SETTINGS`, `BANNERS`.
9. **Notification Service:** Xử lý đẩy thông báo qua Firebase (Không có DB nội bộ).

# 📐 Quy chuẩn viết code (Coding Conventions)

## 1. Back-end (NestJS)
- **Cấu trúc:** Áp dụng chặt chẽ kiến trúc Controller - Service - Module. 
- **Validation:** Sử dụng `class-validator` và `class-transformer` trong DTOs để validate dữ liệu đầu vào.
- **Giao tiếp:** - API Gateway dùng `@nestjs/axios` hoặc HttpService để gọi REST, hoặc ClientProxy để gọi RPC.
  - Các Microservices giao tiếp bất đồng bộ qua RabbitMQ (sử dụng `@EventPattern` hoặc `@MessagePattern`).
- **Entity & DB:** Định nghĩa rõ quan hệ (Relations) trong các bảng của cùng 1 database.

## 2. Front-end (HTML/CSS/JS)
- Tách biệt rõ ràng cấu trúc (HTML), giao diện (CSS) và logic (JS).
- Giao tiếp API: Sử dụng `fetch` API hoặc `axios` để gọi đến API Gateway.
- Tổ chức code JS theo module (ES6 Modules) để dễ bảo trì.

# 🚀 Lệnh thông dụng (Docker & NestJS CLI)
- Chạy toàn bộ hệ thống (Dev): `docker-compose up -d`
- Cài đặt package cho 1 service cụ thể: `cd <service_folder> && npm install`
- Tạo module NestJS mới: `nest g module <name>`
- Tạo controller/service mới: `nest g controller <name> && nest g service <name>`

# 🤖 Quy tắc đặc biệt dành cho AI (AI Directives)
1. **Bảo vệ ranh giới Service:** Nếu tôi yêu cầu "Lấy thông tin User và Order của họ", bạn PHẢI hiểu rằng API Gateway sẽ gọi User Service và Order Service độc lập, hoặc Order Service phải bắn event qua RabbitMQ. KHÔNG ĐƯỢC viết query JOIN giữa `db_users` và `db_orders`.
2. **RabbitMQ Events:** Luôn định nghĩa rõ tên Event/Message Pattern (ví dụ: `order_created`, `payment_processed`) khi viết logic giao tiếp giữa các service.
3. **Xử lý lỗi phân tán:** Khi viết code cho microservice, luôn thêm logic `try-catch` và RPC Exception handling. Nếu một service (vd: Payment) thất bại, phải có cơ chế fallback hoặc gửi event bù trừ (compensating transaction) về Order Service.
4. **Firebase:** Code liên quan đến Notification Service chỉ tập trung vào việc nhận event từ RabbitMQ (vd: `order_status_changed`) và trigger Firebase Admin SDK, không chứa logic nghiệp vụ khác.