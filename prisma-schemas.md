# Prisma Schema — Apple Shop Microservices

> **Stack:** Prisma ORM · MySQL · NestJS  
> **Kiến trúc:** Mỗi service có `schema.prisma` riêng, database độc lập  
> **Lưu ý FK cross-service:** Prisma không tạo `@relation` cho các field tham chiếu sang DB khác.  
> Các field đó chỉ là `String` thuần, comment `// [REF: ServiceName]` để nhận biết.

---

## Cấu Trúc File Theo Service

```
services/
├── user-service/        prisma/schema.prisma  → DATABASE 1: db_users
├── product-service/     prisma/schema.prisma  → DATABASE 2: db_products
├── inventory-service/   prisma/schema.prisma  → DATABASE 3: db_inventory
├── order-service/       prisma/schema.prisma  → DATABASE 4: db_orders
├── payment-service/     prisma/schema.prisma  → DATABASE 5: db_payments
├── installment-service/ prisma/schema.prisma  → DATABASE 6: db_installments
├── promotion-service/   prisma/schema.prisma  → DATABASE 7: db_promos
├── cart-service/        prisma/schema.prisma  → DATABASE 8: db_carts
├── notification-service/prisma/schema.prisma  → DATABASE 9: db_notifications
├── review-service/      prisma/schema.prisma  → DATABASE 10: db_reviews
└── config-service/      prisma/schema.prisma  → DATABASE 11: db_config
```

---

## DATABASE 1 — `db_users` · User Service

```prisma
// ============================================================
// User Service — db_users
// prisma/schema.prisma
// ============================================================

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL") // mysql://user:pass@host:3306/db_users
}

// ------------------------------------------------------------
// ROLES
// ------------------------------------------------------------
model Role {
  id        String   @id @default(uuid()) @db.Char(36)
  name      String   @db.VarChar(255) // VD: admin, staff, customer
  createdAt DateTime @default(now()) @map("created_at")

  userRoles UserRole[]

  @@map("ROLES")
}

// ------------------------------------------------------------
// USERS
// ------------------------------------------------------------
model User {
  id           String   @id @default(uuid()) @db.Char(36)
  userName     String   @map("user_name") @db.VarChar(255)
  hashPassword String   @map("hash_password") @db.VarChar(255)
  email        String   @unique @db.VarChar(255)
  phoneNumber  String?  @unique @map("phone_number") @db.VarChar(20)
  isActive     Boolean  @default(true) @map("is_active") // Khoá/mở tài khoản
  createdAt    DateTime @default(now()) @map("created_at")
  updatedAt    DateTime @updatedAt @map("updated_at")

  userRoles   UserRole[]
  userDetail  UserDetail?
  addresses   UserAddress[]
  fcmTokens   FcmToken[]

  @@index([email])
  @@index([isActive])
  @@map("USERS")
}

// ------------------------------------------------------------
// USER_ROLES (junction)
// ------------------------------------------------------------
model UserRole {
  userId String @map("user_id") @db.Char(36)
  roleId String @map("role_id") @db.Char(36)

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  role Role @relation(fields: [roleId], references: [id], onDelete: Cascade)

  @@id([userId, roleId])
  @@map("USER_ROLES")
}

// ------------------------------------------------------------
// USER_DETAILS
// ------------------------------------------------------------
model UserDetail {
  id          String    @id @default(uuid()) @db.Char(36)
  userId      String    @unique @map("user_id") @db.Char(36)
  fullName    String?   @map("full_name") @db.VarChar(255)
  avatarUrl   String?   @map("avatar_url") @db.VarChar(500)
  dateOfBirth DateTime? @map("date_of_birth") @db.Date
  gender      Gender?
  createdAt   DateTime  @default(now()) @map("created_at")
  updatedAt   DateTime  @updatedAt @map("updated_at")

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("USER_DETAILS")
}

enum Gender {
  male
  female
  other
}

// ------------------------------------------------------------
// USER_ADDRESSES
// Hỗ trợ address book: nhiều địa chỉ / 1 user
// Order Service sẽ snapshot địa chỉ riêng khi đặt hàng
// ------------------------------------------------------------
model UserAddress {
  id          String   @id @default(uuid()) @db.Char(36)
  userId      String   @map("user_id") @db.Char(36)
  label       String?  @db.VarChar(100) // Nhà, Công ty...
  fullName    String   @map("full_name") @db.VarChar(255)
  phoneNumber String   @map("phone_number") @db.VarChar(20)
  province    String   @db.VarChar(255)
  district    String   @db.VarChar(255)
  ward        String   @db.VarChar(255)
  street      String   @db.VarChar(500)
  isDefault   Boolean  @default(false) @map("is_default")
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, isDefault])
  @@map("USER_ADDRESSES")
}

// ------------------------------------------------------------
// FCM_TOKENS
// Firebase Cloud Messaging token theo thiết bị
// ------------------------------------------------------------
model FcmToken {
  id         String     @id @default(uuid()) @db.Char(36)
  userId     String     @map("user_id") @db.Char(36)
  token      String     @unique @db.VarChar(500)
  deviceType DeviceType @map("device_type")
  createdAt  DateTime   @default(now()) @map("created_at")
  updatedAt  DateTime   @updatedAt @map("updated_at")

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("FCM_TOKENS")
}

enum DeviceType {
  android
  ios
  web
}
```

---

## DATABASE 2 — `db_products` · Product Service

```prisma
// ============================================================
// Product Service — db_products
// prisma/schema.prisma
// ============================================================

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL") // mysql://user:pass@host:3306/db_products
}

// ------------------------------------------------------------
// CATEGORIES
// Hỗ trợ danh mục lồng nhau (self-relation)
// ------------------------------------------------------------
model Category {
  id        String     @id @default(uuid()) @db.Char(36)
  name      String     @db.VarChar(255) // iPhone, iPad, Mac, AirPods, Watch, Phụ kiện
  slug      String     @unique @db.VarChar(255) // URL-friendly
  parentId  String?    @map("parent_id") @db.Char(36)
  sortOrder Int        @default(0) @map("sort_order")
  isActive  Boolean    @default(true) @map("is_active")
  createdAt DateTime   @default(now()) @map("created_at")

  parent   Category?  @relation("CategoryTree", fields: [parentId], references: [id])
  children Category[] @relation("CategoryTree")
  products Product[]

  @@map("CATEGORIES")
}

// ------------------------------------------------------------
// MODEL
// Thông số kỹ thuật chung của một dòng sản phẩm
// ------------------------------------------------------------
model Model {
  id          String   @id @default(uuid()) @db.Char(36)
  modelName   String   @map("model_name") @db.VarChar(255) // iPhone 16 Pro Max
  modelNumber String?  @map("model_number") @db.VarChar(255)
  brand       String   @default("Apple") @db.VarChar(255)
  cpu         String?  @db.VarChar(255)
  screenSize  Decimal? @map("screen_size") @db.Decimal(5, 2)
  operaSystem String?  @map("opera_system") @db.VarChar(255)
  isActive    Boolean  @default(true) @map("is_active")
  deletedAt   DateTime? @map("deleted_at") // Soft delete
  createdAt   DateTime @default(now()) @map("created_at")

  products Product[]

  @@map("MODEL")
}

// ------------------------------------------------------------
// PRODUCTS
// ------------------------------------------------------------
model Product {
  id          String    @id @default(uuid()) @db.Char(36)
  name        String    @db.VarChar(255)
  modelId     String?   @map("model_id") @db.Char(36)
  categoryId  String    @map("category_id") @db.Char(36)
  thumbnail   String?   @db.VarChar(500) // Ảnh đại diện chính
  description String?   @db.Text
  isActive    Boolean   @default(true) @map("is_active")
  deletedAt   DateTime? @map("deleted_at") // Soft delete
  createdAt   DateTime  @default(now()) @map("created_at")
  updatedAt   DateTime  @updatedAt @map("updated_at")

  model    Model?           @relation(fields: [modelId], references: [id])
  category Category         @relation(fields: [categoryId], references: [id])
  variants ProductVariant[]
  images   ProductImage[]

  @@index([categoryId])
  @@index([isActive, deletedAt])
  @@map("PRODUCTS")
}

// ------------------------------------------------------------
// PRODUCT_IMAGES
// Nhiều ảnh / 1 sản phẩm (gallery)
// ------------------------------------------------------------
model ProductImage {
  id        String   @id @default(uuid()) @db.Char(36)
  productId String   @map("product_id") @db.Char(36)
  imageUrl  String   @map("image_url") @db.VarChar(500)
  altText   String?  @map("alt_text") @db.VarChar(255)
  sortOrder Int      @default(0) @map("sort_order")
  createdAt DateTime @default(now()) @map("created_at")

  product Product @relation(fields: [productId], references: [id], onDelete: Cascade)

  @@index([productId, sortOrder])
  @@map("PRODUCT_IMAGES")
}

// ------------------------------------------------------------
// PRODUCT_VARIANTS
// Mỗi variant = 1 SKU (màu + dung lượng + RAM)
// stock_quantity đã TÁCH sang db_inventory
// ------------------------------------------------------------
model ProductVariant {
  id            String    @id @default(uuid()) @db.Char(36)
  productId     String    @map("product_id") @db.Char(36)
  sku           String    @unique @db.VarChar(100)
  color         String?   @db.VarChar(100)
  ram           Int?      // GB
  storage       Int?      // GB: 64, 128, 256, 512, 1024
  importPrice   Decimal   @map("import_price") @db.Decimal(18, 2) // Giá vốn
  originalPrice Decimal?  @map("original_price") @db.Decimal(18, 2) // Giá niêm yết (gạch ngang)
  price         Decimal   @db.Decimal(18, 2) // Giá bán thực tế
  isActive      Boolean   @default(true) @map("is_active")
  deletedAt     DateTime? @map("deleted_at")
  createdAt     DateTime  @default(now()) @map("created_at")

  product       Product        @relation(fields: [productId], references: [id])
  priceHistories PriceHistory[]

  @@index([productId])
  @@map("PRODUCT_VARIANTS")
}

// ------------------------------------------------------------
// PRICE_HISTORIES
// Audit trail thay đổi giá variant
// changedBy: [REF: db_users → User Service] — KHÔNG có @relation
// ------------------------------------------------------------
model PriceHistory {
  id               String    @id @default(uuid()) @db.Char(36)
  productVariantId String    @map("product_variant_id") @db.Char(36)
  changedBy        String    @map("changed_by") @db.Char(36) // [REF: db_users.USERS.id]
  oldImportPrice   Decimal?  @map("old_import_price") @db.Decimal(18, 2)
  newImportPrice   Decimal?  @map("new_import_price") @db.Decimal(18, 2)
  oldOriginalPrice Decimal?  @map("old_original_price") @db.Decimal(18, 2)
  newOriginalPrice Decimal?  @map("new_original_price") @db.Decimal(18, 2)
  oldPrice         Decimal?  @map("old_price") @db.Decimal(18, 2)
  newPrice         Decimal?  @map("new_price") @db.Decimal(18, 2)
  reason           String?   @db.VarChar(500)
  changedAt        DateTime  @default(now()) @map("changed_at")

  variant ProductVariant @relation(fields: [productVariantId], references: [id])

  @@index([productVariantId, changedAt])
  @@map("PRICE_HISTORIES")
}
```

---

## DATABASE 3 — `db_inventory` · Inventory Service

```prisma
// ============================================================
// Inventory Service — db_inventory
// prisma/schema.prisma
// ============================================================

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL") // mysql://user:pass@host:3306/db_inventory
}

// ------------------------------------------------------------
// INVENTORY
// Tồn kho hiện tại theo từng variant
// productVariantId: [REF: db_products → Product Service]
// ------------------------------------------------------------
model Inventory {
  id               String   @id @default(uuid()) @db.Char(36)
  productVariantId String   @unique @map("product_variant_id") @db.Char(36) // [REF: db_products.PRODUCT_VARIANTS.id]
  quantity         Int      @default(0) // Số lượng tồn kho hiện tại
  reservedQuantity Int      @default(0) @map("reserved_quantity") // Đã đặt nhưng chưa xác nhận
  updatedAt        DateTime @updatedAt @map("updated_at")

  transactions InventoryTransaction[]

  @@map("INVENTORY")
}

// ------------------------------------------------------------
// INVENTORY_TRANSACTIONS
// Lịch sử mọi thay đổi tồn kho (nhập / xuất / điều chỉnh)
// productVariantId: [REF: db_products → Product Service]
// createdBy:        [REF: db_users   → User Service]
// ------------------------------------------------------------
model InventoryTransaction {
  id               String              @id @default(uuid()) @db.Char(36)
  productVariantId String              @map("product_variant_id") @db.Char(36) // [REF: db_products.PRODUCT_VARIANTS.id]
  type             InventoryTxnType
  quantityChange   Int                 @map("quantity_change") // Dương = nhập, Âm = xuất
  quantityBefore   Int                 @map("quantity_before")
  quantityAfter    Int                 @map("quantity_after")
  referenceId      String?             @map("reference_id") @db.Char(36) // order_id hoặc import_bill_id
  note             String?             @db.VarChar(500)
  createdBy        String              @map("created_by") @db.Char(36) // [REF: db_users.USERS.id]
  createdAt        DateTime            @default(now()) @map("created_at")

  inventory Inventory @relation(fields: [productVariantId], references: [productVariantId])

  @@index([productVariantId, createdAt])
  @@index([type])
  @@map("INVENTORY_TRANSACTIONS")
}

enum InventoryTxnType {
  import
  export_sale
  export_return
  adjustment
}
```

---

## DATABASE 4 — `db_orders` · Order Service

```prisma
// ============================================================
// Order Service — db_orders
// prisma/schema.prisma
// ============================================================

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL") // mysql://user:pass@host:3306/db_orders
}

// ------------------------------------------------------------
// ORDERS
// userId:      [REF: db_users   → User Service]
// promotionId: [REF: db_promos  → Promotion Service]
// Địa chỉ giao hàng được SNAPSHOT tại thời điểm đặt
// ------------------------------------------------------------
model Order {
  id               String      @id @default(uuid()) @db.Char(36)
  userId           String      @map("user_id") @db.Char(36)           // [REF: db_users.USERS.id]
  promotionId      String?     @map("promotion_id") @db.Char(36)      // [REF: db_promos.PROMOTIONS.id]
  paymentType      PaymentType @default(full) @map("payment_type")
  paymentMethod    PayMethod?  @map("payment_method")                  // null nếu installment
  subtotalPrice    Decimal     @map("subtotal_price") @db.Decimal(18, 2)
  discountAmount   Decimal     @default(0) @map("discount_amount") @db.Decimal(18, 2)
  totalPrice       Decimal     @map("total_price") @db.Decimal(18, 2)
  totalProduct     Int?        @map("total_product")
  status           OrderStatus @default(pending)
  // Snapshot địa chỉ giao hàng
  shippingName     String      @map("shipping_name") @db.VarChar(255)
  shippingPhone    String      @map("shipping_phone") @db.VarChar(20)
  shippingProvince String      @map("shipping_province") @db.VarChar(255)
  shippingDistrict String      @map("shipping_district") @db.VarChar(255)
  shippingWard     String      @map("shipping_ward") @db.VarChar(255)
  shippingStreet   String      @map("shipping_street") @db.VarChar(500)
  note             String?     @db.VarChar(500)
  createdAt        DateTime    @default(now()) @map("created_at")
  updatedAt        DateTime    @updatedAt @map("updated_at")

  details OrderDetail[]

  @@index([userId])
  @@index([status])
  @@index([paymentType])
  @@map("ORDERS")
}

// ------------------------------------------------------------
// ORDER_DETAILS
// productVariantId: [REF: db_products → Product Service]
// Giá được SNAPSHOT — không bị ảnh hưởng khi Product đổi giá sau
// ------------------------------------------------------------
model OrderDetail {
  id               String  @id @default(uuid()) @db.Char(36)
  orderId          String  @map("order_id") @db.Char(36)
  productVariantId String  @map("product_variant_id") @db.Char(36) // [REF: db_products.PRODUCT_VARIANTS.id]
  productName      String  @map("product_name") @db.VarChar(255)   // Snapshot tên SP
  variantLabel     String? @map("variant_label") @db.VarChar(255)  // Snapshot "256GB / Titan"
  quantity         Int
  importPrice      Decimal @map("import_price") @db.Decimal(18, 2) // Snapshot giá vốn
  price            Decimal @db.Decimal(18, 2)                       // Snapshot giá bán
  itemDiscount     Decimal @default(0) @map("item_discount") @db.Decimal(18, 2) // Giảm trực tiếp item (flash sale)

  order Order @relation(fields: [orderId], references: [id], onDelete: Cascade)

  @@unique([orderId, productVariantId])
  @@map("ORDER_DETAILS")
}

enum OrderStatus {
  pending
  processing
  shipped
  completed
  cancelled
}

enum PaymentType {
  full
  installment
}

enum PayMethod {
  cod
  vnpay
  momo
  bank_transfer
}
```

---

## DATABASE 5 — `db_payments` · Payment Service

```prisma
// ============================================================
// Payment Service — db_payments
// prisma/schema.prisma
// ============================================================

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL") // mysql://user:pass@host:3306/db_payments
}

// ------------------------------------------------------------
// PAYMENTS
// orderId: [REF: db_orders → Order Service]
// Payment Service nhận event 'order.created' từ RabbitMQ
// rồi tạo bản ghi PAYMENT tương ứng
// ------------------------------------------------------------
model Payment {
  id               String        @id @default(uuid()) @db.Char(36)
  orderId          String        @map("order_id") @db.Char(36)  // [REF: db_orders.ORDERS.id]
  amount           Decimal       @db.Decimal(18, 2)
  paymentMethod    PaymentMethod @map("payment_method")
  status           PaymentStatus @default(pending)
  transactionCode  String?       @map("transaction_code") @db.VarChar(255) // Mã GD từ VNPay/MoMo
  providerResponse String?       @map("provider_response") @db.Text        // Raw JSON để debug
  paidAt           DateTime?     @map("paid_at")
  createdAt        DateTime      @default(now()) @map("created_at")
  updatedAt        DateTime      @updatedAt @map("updated_at")

  @@index([orderId])
  @@index([status])
  @@map("PAYMENTS")
}

enum PaymentMethod {
  cod
  vnpay
  momo
  bank_transfer
}

enum PaymentStatus {
  pending
  success
  failed
  refunded
}
```

---

## DATABASE 6 — `db_installments` · Installment Service

```prisma
// ============================================================
// Installment Service — db_installments
// prisma/schema.prisma
// ============================================================

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL") // mysql://user:pass@host:3306/db_installments
}

// ------------------------------------------------------------
// INSTALLMENT_PLANS
// Các gói trả góp admin cấu hình (3/6/12 tháng, lãi suất...)
// ------------------------------------------------------------
model InstallmentPlan {
  id              String   @id @default(uuid()) @db.Char(36)
  name            String   @db.VarChar(255)       // Trả góp 12 tháng 0%
  durationMonths  Int      @map("duration_months") // Số kỳ
  interestRate    Decimal  @default(0.00) @map("interest_rate") @db.Decimal(5, 2) // % lãi / tháng
  minOrderValue   Decimal  @default(0) @map("min_order_value") @db.Decimal(18, 2)
  downPaymentPct  Decimal  @default(0) @map("down_payment_pct") @db.Decimal(5, 2) // % đặt cọc trước
  isActive        Boolean  @default(true) @map("is_active")
  createdAt       DateTime @default(now()) @map("created_at")
  updatedAt       DateTime @updatedAt @map("updated_at")

  applications InstallmentApplication[]

  @@map("INSTALLMENT_PLANS")
}

// ------------------------------------------------------------
// INSTALLMENT_APPLICATIONS
// Hồ sơ trả góp của từng đơn hàng
// userId:  [REF: db_users  → User Service]
// orderId: [REF: db_orders → Order Service]
// ------------------------------------------------------------
model InstallmentApplication {
  id                    String            @id @default(uuid()) @db.Char(36)
  userId                String            @map("user_id") @db.Char(36)    // [REF: db_users.USERS.id]
  orderId               String            @unique @map("order_id") @db.Char(36) // [REF: db_orders.ORDERS.id]
  planId                String            @map("plan_id") @db.Char(36)
  // Snapshot thông tin cá nhân
  applicantName         String            @map("applicant_name") @db.VarChar(255)
  applicantPhone        String            @map("applicant_phone") @db.VarChar(20)
  applicantIdNumber     String            @map("applicant_id_number") @db.VarChar(50) // CCCD/CMND
  applicantIdImageFront String?           @map("applicant_id_image_front") @db.VarChar(500)
  applicantIdImageBack  String?           @map("applicant_id_image_back") @db.VarChar(500)
  applicantSelfie       String?           @map("applicant_selfie") @db.VarChar(500)
  monthlyIncome         Decimal?          @map("monthly_income") @db.Decimal(18, 2)
  // Tài chính
  totalAmount           Decimal           @map("total_amount") @db.Decimal(18, 2)
  downPayment           Decimal           @default(0) @map("down_payment") @db.Decimal(18, 2)
  loanAmount            Decimal           @map("loan_amount") @db.Decimal(18, 2)
  monthlyPayment        Decimal           @map("monthly_payment") @db.Decimal(18, 2)
  // Trạng thái duyệt
  status                ApplicationStatus @default(pending)
  reviewedBy            String?           @map("reviewed_by") @db.Char(36) // [REF: db_users.USERS.id]
  reviewedAt            DateTime?         @map("reviewed_at")
  rejectReason          String?           @map("reject_reason") @db.VarChar(500)
  approvedAt            DateTime?         @map("approved_at")
  note                  String?           @db.Text
  createdAt             DateTime          @default(now()) @map("created_at")
  updatedAt             DateTime          @updatedAt @map("updated_at")

  plan      InstallmentPlan       @relation(fields: [planId], references: [id])
  schedules InstallmentSchedule[]
  payments  InstallmentPayment[]

  @@index([userId])
  @@index([orderId])
  @@index([status])
  @@map("INSTALLMENT_APPLICATIONS")
}

// ------------------------------------------------------------
// INSTALLMENT_SCHEDULES
// Lịch trả nợ theo kỳ — tự sinh khi hồ sơ được duyệt
// ------------------------------------------------------------
model InstallmentSchedule {
  id            String           @id @default(uuid()) @db.Char(36)
  applicationId String           @map("application_id") @db.Char(36)
  termNumber    Int              @map("term_number")       // Kỳ thứ mấy (1, 2, 3...)
  dueDate       DateTime         @map("due_date") @db.Date // Ngày đến hạn
  amountDue     Decimal          @map("amount_due") @db.Decimal(18, 2)
  amountPaid    Decimal          @default(0) @map("amount_paid") @db.Decimal(18, 2)
  status        ScheduleStatus   @default(pending)
  paidAt        DateTime?        @map("paid_at")
  lateFee       Decimal          @default(0) @map("late_fee") @db.Decimal(18, 2)
  createdAt     DateTime         @default(now()) @map("created_at")
  updatedAt     DateTime         @updatedAt @map("updated_at")

  application InstallmentApplication @relation(fields: [applicationId], references: [id])
  payments    InstallmentPayment[]

  @@unique([applicationId, termNumber])
  @@index([dueDate, status])
  @@map("INSTALLMENT_SCHEDULES")
}

// ------------------------------------------------------------
// INSTALLMENT_PAYMENTS
// Ghi nhận từng lần thu tiền góp
// collectedBy: [REF: db_users → User Service] (nhân viên thu)
// ------------------------------------------------------------
model InstallmentPayment {
  id             String        @id @default(uuid()) @db.Char(36)
  scheduleId     String        @map("schedule_id") @db.Char(36)
  applicationId  String        @map("application_id") @db.Char(36)
  amount         Decimal       @db.Decimal(18, 2)
  paymentMethod  InstPayMethod @map("payment_method")
  transactionRef String?       @map("transaction_ref") @db.VarChar(255)
  collectedBy    String?       @map("collected_by") @db.Char(36) // [REF: db_users.USERS.id]
  note           String?       @db.VarChar(500)
  createdAt      DateTime      @default(now()) @map("created_at")

  schedule    InstallmentSchedule    @relation(fields: [scheduleId], references: [id])
  application InstallmentApplication @relation(fields: [applicationId], references: [id])

  @@index([applicationId])
  @@map("INSTALLMENT_PAYMENTS")
}

enum ApplicationStatus {
  pending
  reviewing
  approved
  rejected
  active
  completed
  defaulted
}

enum ScheduleStatus {
  pending
  paid
  overdue
  partially_paid
}

enum InstPayMethod {
  cash
  bank_transfer
  vnpay
  momo
}
```

---

## DATABASE 7 — `db_promos` · Promotion Service

```prisma
// ============================================================
// Promotion Service — db_promos
// prisma/schema.prisma
// ============================================================

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL") // mysql://user:pass@host:3306/db_promos
}

// ------------------------------------------------------------
// PROMOTIONS
// type voucher:      nhập mã → giảm đơn hàng
// type product_sale: flash sale → giảm trực tiếp item
// ------------------------------------------------------------
model Promotion {
  id                 String        @id @default(uuid()) @db.Char(36)
  type               PromotionType
  code               String?       @unique @db.VarChar(100)         // Chỉ dùng khi type = voucher
  name               String        @db.VarChar(255)
  description        String?       @db.Text
  discountType       DiscountType  @map("discount_type")
  discountValue      Decimal       @map("discount_value") @db.Decimal(18, 2)
  maxDiscountAmount  Decimal?      @map("max_discount_amount") @db.Decimal(18, 2) // Giảm tối đa khi dùng %
  minOrderValue      Decimal       @default(0) @map("min_order_value") @db.Decimal(18, 2)
  scope              PromoScope    @default(all_products)
  startDate          DateTime      @map("start_date")
  endDate            DateTime      @map("end_date")
  usageLimit         Int?          @map("usage_limit")              // null = không giới hạn
  usageLimitPerUser  Int           @default(1) @map("usage_limit_per_user")
  isActive           Boolean       @default(true) @map("is_active")
  createdAt          DateTime      @default(now()) @map("created_at")
  updatedAt          DateTime      @updatedAt @map("updated_at")

  scopes PromotionScope[]
  usages PromotionUsage[]

  @@index([startDate, endDate, isActive])
  @@index([type, isActive])
  @@map("PROMOTIONS")
}

// ------------------------------------------------------------
// PROMOTION_SCOPES
// Gắn promotion với variant cụ thể khi scope = specific_products
// productVariantId: [REF: db_products → Product Service]
// ------------------------------------------------------------
model PromotionScope {
  id               String @id @default(uuid()) @db.Char(36)
  promotionId      String @map("promotion_id") @db.Char(36)
  productVariantId String @map("product_variant_id") @db.Char(36) // [REF: db_products.PRODUCT_VARIANTS.id]

  promotion Promotion @relation(fields: [promotionId], references: [id], onDelete: Cascade)

  @@unique([promotionId, productVariantId])
  @@map("PROMOTION_SCOPES")
}

// ------------------------------------------------------------
// PROMOTION_USAGES
// Track lượt dùng voucher — tránh race condition
// userId:  [REF: db_users  → User Service]
// orderId: [REF: db_orders → Order Service]
// ------------------------------------------------------------
model PromotionUsage {
  id          String   @id @default(uuid()) @db.Char(36)
  promotionId String   @map("promotion_id") @db.Char(36)
  userId      String   @map("user_id") @db.Char(36)  // [REF: db_users.USERS.id]
  orderId     String   @map("order_id") @db.Char(36) // [REF: db_orders.ORDERS.id]
  usedAt      DateTime @default(now()) @map("used_at")

  promotion Promotion @relation(fields: [promotionId], references: [id])

  @@unique([promotionId, orderId])
  @@index([userId])
  @@map("PROMOTION_USAGES")
}

enum PromotionType {
  voucher
  product_sale
}

enum DiscountType {
  percentage
  fixed_amount
}

enum PromoScope {
  all_products
  specific_products
}
```

---

## DATABASE 8 — `db_carts` · Cart Service

```prisma
// ============================================================
// Cart Service — db_carts
// prisma/schema.prisma
// Guest cart dùng Redis (không lưu DB)
// User cart lưu DB để persistent across devices
// ============================================================

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL") // mysql://user:pass@host:3306/db_carts
}

// ------------------------------------------------------------
// CARTS
// userId: [REF: db_users → User Service]
// 1 user chỉ có 1 cart (unique userId)
// ------------------------------------------------------------
model Cart {
  id        String   @id @default(uuid()) @db.Char(36)
  userId    String   @unique @map("user_id") @db.Char(36) // [REF: db_users.USERS.id]
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  items CartItem[]

  @@map("CARTS")
}

// ------------------------------------------------------------
// CART_ITEMS
// productVariantId: [REF: db_products → Product Service]
// ------------------------------------------------------------
model CartItem {
  id               String   @id @default(uuid()) @db.Char(36)
  cartId           String   @map("cart_id") @db.Char(36)
  productVariantId String   @map("product_variant_id") @db.Char(36) // [REF: db_products.PRODUCT_VARIANTS.id]
  quantity         Int      @default(1)
  addedAt          DateTime @default(now()) @map("added_at")
  updatedAt        DateTime @updatedAt @map("updated_at")

  cart Cart @relation(fields: [cartId], references: [id], onDelete: Cascade)

  @@unique([cartId, productVariantId])
  @@map("CART_ITEMS")
}
```

---

## DATABASE 9 — `db_notifications` · Notification Service

```prisma
// ============================================================
// Notification Service — db_notifications
// prisma/schema.prisma
// ============================================================

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL") // mysql://user:pass@host:3306/db_notifications
}

// ------------------------------------------------------------
// NOTIFICATION_TEMPLATES
// Admin chỉnh nội dung template trong trang admin
// Hỗ trợ placeholder: {{order_id}}, {{amount}}, {{due_date}}...
// ------------------------------------------------------------
model NotificationTemplate {
  id        String   @id @default(uuid()) @db.Char(36)
  type      String   @unique @db.VarChar(100) // order_pending, installment_reminder, promo_flash_sale...
  title     String   @db.VarChar(255)
  body      String   @db.Text
  updatedAt DateTime @updatedAt @map("updated_at")

  @@map("NOTIFICATION_TEMPLATES")
}

// ------------------------------------------------------------
// NOTIFICATIONS
// Lịch sử thông báo đã gửi đến từng user
// userId:      [REF: db_users → User Service]
// referenceId: order_id / application_id / promotion_id tuỳ type
// ------------------------------------------------------------
model Notification {
  id            String           @id @default(uuid()) @db.Char(36)
  userId        String           @map("user_id") @db.Char(36) // [REF: db_users.USERS.id]
  templateType  String           @map("template_type") @db.VarChar(100)
  title         String           @db.VarChar(255) // Nội dung đã render (sau khi thay placeholder)
  body          String           @db.Text
  referenceType NotifRefType?    @map("reference_type") // order | installment | promotion
  referenceId   String?          @map("reference_id") @db.Char(36)
  channel       NotifChannel     @default(push)
  isRead        Boolean          @default(false) @map("is_read")
  sentAt        DateTime         @default(now()) @map("sent_at")
  readAt        DateTime?        @map("read_at")

  @@index([userId, isRead])
  @@index([referenceType, referenceId])
  @@index([sentAt])
  @@map("NOTIFICATIONS")
}

enum NotifRefType {
  order
  installment
  promotion
}

enum NotifChannel {
  push
  email
  sms
}
```

---

## DATABASE 10 — `db_reviews` · Review Service

```prisma
// ============================================================
// Review Service — db_reviews
// prisma/schema.prisma
// ============================================================

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL") // mysql://user:pass@host:3306/db_reviews
}

// ------------------------------------------------------------
// REVIEWS
// userId:    [REF: db_users    → User Service]
// productId: [REF: db_products → Product Service]
// orderId:   [REF: db_orders   → Order Service]
// Chỉ review khi Order Service xác nhận order completed
// ------------------------------------------------------------
model Review {
  id        String   @id @default(uuid()) @db.Char(36)
  userId    String   @map("user_id") @db.Char(36)    // [REF: db_users.USERS.id]
  productId String   @map("product_id") @db.Char(36) // [REF: db_products.PRODUCTS.id]
  orderId   String   @map("order_id") @db.Char(36)   // [REF: db_orders.ORDERS.id]
  rating    Int      // 1–5 sao, validate tại application layer
  content   String?  @db.Text
  images    Json?    // Mảng URL ảnh đính kèm
  isVisible Boolean  @default(true) @map("is_visible")
  createdAt DateTime @default(now()) @map("created_at")

  @@unique([userId, productId, orderId])
  @@index([productId])
  @@map("REVIEWS")
}

// ------------------------------------------------------------
// COMMENTS
// Bình luận sản phẩm, hỗ trợ reply lồng nhau qua parentId
// productId: [REF: db_products → Product Service]
// userId:    [REF: db_users    → User Service]
// ------------------------------------------------------------
model Comment {
  id        String    @id @default(uuid()) @db.Char(36)
  productId String    @map("product_id") @db.Char(36) // [REF: db_products.PRODUCTS.id]
  userId    String    @map("user_id") @db.Char(36)    // [REF: db_users.USERS.id]
  parentId  String?   @map("parent_id") @db.Char(36)  // null = bình luận gốc
  content   String    @db.Text
  isVisible Boolean   @default(true) @map("is_visible")
  createdAt DateTime  @default(now()) @map("created_at")
  updatedAt DateTime  @updatedAt @map("updated_at")

  parent  Comment?  @relation("CommentTree", fields: [parentId], references: [id])
  replies Comment[] @relation("CommentTree")

  @@index([productId, parentId])
  @@map("COMMENTS")
}
```

---

## DATABASE 11 — `db_config` · Config Service

```prisma
// ============================================================
// Config Service — db_config
// prisma/schema.prisma
// ============================================================

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL") // mysql://user:pass@host:3306/db_config
}

// ------------------------------------------------------------
// SETTINGS
// Key-value store cho cấu hình hệ thống
// Nhóm (group): general | contact | social | policy
// VD key: hotline, store_address, facebook_url, return_policy, about_us
// ------------------------------------------------------------
model Setting {
  id           String      @id @default(uuid()) @db.Char(36)
  settingKey   String      @unique @map("setting_key") @db.VarChar(255)
  settingValue String?     @map("setting_value") @db.Text
  settingType  SettingType @default(string) @map("setting_type")
  group        String      @default("general") @db.VarChar(100) // general, contact, social, policy
  description  String?     @db.VarChar(500)
  updatedAt    DateTime    @updatedAt @map("updated_at")

  @@index([settingKey])
  @@index([group])
  @@map("SETTINGS")
}

// ------------------------------------------------------------
// BANNERS
// ------------------------------------------------------------
model Banner {
  id        String   @id @default(uuid()) @db.Char(36)
  title     String?  @db.VarChar(255)
  imageUrl  String   @map("image_url") @db.VarChar(500)
  targetUrl String?  @map("target_url") @db.VarChar(500)
  position  String   @default("home_main") @db.VarChar(100) // home_main | home_sub | category_top | popup
  sortOrder Int      @default(0) @map("sort_order")
  startDate DateTime? @map("start_date") // null = hiển thị ngay
  endDate   DateTime? @map("end_date")   // null = không hết hạn
  isActive  Boolean  @default(true) @map("is_active")
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  @@index([isActive, sortOrder])
  @@index([startDate, endDate])
  @@map("BANNERS")
}

enum SettingType {
  string
  number
  boolean
  json
  html
}
```

---

## Hướng Dẫn Sử Dụng

### 1. Setup từng service

```bash
# Trong mỗi service, copy schema tương ứng vào prisma/schema.prisma
cd services/user-service
npx prisma migrate dev --name init
npx prisma generate
```

### 2. File `.env` mẫu cho từng service

```env
# user-service/.env
DATABASE_URL="mysql://root:password@localhost:3306/db_users"

# product-service/.env
DATABASE_URL="mysql://root:password@localhost:3306/db_products"

# inventory-service/.env
DATABASE_URL="mysql://root:password@localhost:3306/db_inventory"

# order-service/.env
DATABASE_URL="mysql://root:password@localhost:3306/db_orders"

# payment-service/.env
DATABASE_URL="mysql://root:password@localhost:3306/db_payments"

# installment-service/.env
DATABASE_URL="mysql://root:password@localhost:3306/db_installments"

# promotion-service/.env
DATABASE_URL="mysql://root:password@localhost:3306/db_promos"

# cart-service/.env
DATABASE_URL="mysql://root:password@localhost:3306/db_carts"

# notification-service/.env
DATABASE_URL="mysql://root:password@localhost:3306/db_notifications"

# review-service/.env
DATABASE_URL="mysql://root:password@localhost:3306/db_reviews"

# config-service/.env
DATABASE_URL="mysql://root:password@localhost:3306/db_config"
```

### 3. Sử dụng trong NestJS service

```typescript
// Ví dụ: user-service — tìm user theo email
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const user = await prisma.user.findUnique({
  where: { email: 'user@example.com' },
  include: {
    userDetail: true,
    addresses: { where: { isDefault: true } },
    userRoles: { include: { role: true } },
  },
});
```

### 4. Quy tắc cross-service reference

> Tất cả field có comment `// [REF: ServiceName]` là **ID tham chiếu sang service khác**.  
> Prisma **KHÔNG** tạo `@relation` cho các field này.  
> Tính toàn vẹn được đảm bảo tầng **application** qua:
> - RabbitMQ event validation
> - RPC call trước khi ghi dữ liệu

| Field | Thuộc model | Tham chiếu | Cách validate |
|-------|-------------|-----------|---------------|
| `changedBy` | `PriceHistory` | User Service | Gọi User Service API trước khi lưu |
| `userId` | `Order` | User Service | JWT token đã xác thực |
| `promotionId` | `Order` | Promotion Service | Gọi Promotion Service validate trước khi tạo đơn |
| `productVariantId` | `OrderDetail` | Product Service | Gọi Product Service lấy thông tin + snapshot |
| `orderId` | `Payment` | Order Service | Nhận event `order.created` từ RabbitMQ |
| `productVariantId` | `Inventory` | Product Service | Nhận event `product.variant_created` |
| `userId` | `PromotionUsage` | User Service | JWT token đã xác thực |
| `orderId` | `PromotionUsage` | Order Service | Nhận event `order.created` từ RabbitMQ |
| `userId` | `Cart` | User Service | JWT token đã xác thực |
| `productVariantId` | `CartItem` | Product Service | Gọi Product Service kiểm tra tồn tại + tồn kho |
| `userId` | `Notification` | User Service | Nhận từ event payload |
| `userId` | `Review` | User Service | JWT token đã xác thực |
| `productId` | `Review` | Product Service | Gọi Product Service verify trước khi cho review |
| `orderId` | `Review` | Order Service | Gọi Order Service verify order completed |

---

*Prisma Schema — Apple Shop Microservices · v1.0*
