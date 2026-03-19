-- ============================================================
-- PHONE SHOP DATABASE - MICROSERVICES ARCHITECTURE
-- ============================================================
-- Tách từ kiến trúc Monolith sang Microservices
-- Mỗi service có database độc lập — KHÔNG cross-database query
--
-- Danh sách databases:
--   1. db_users     → User Service
--   2. db_products  → Product Service
--   3. db_orders    → Order Service
--   4. db_payments  → Payment Service
--   5. db_promos    → Promotion Service
--   6. db_reviews   → Review Service
--   7. db_config    → Config Service
--
-- ⚠️  GHI CHÚ QUAN TRỌNG VỀ FOREIGN KEY CROSS-SERVICE:
-- Trong microservices, các FK trỏ sang DB khác bị XOÁ BỎ hoàn toàn.
-- Tính toàn vẹn dữ liệu giữa services được đảm bảo ở tầng APPLICATION
-- thông qua RabbitMQ events và validation logic trong từng service.
--
-- Các FK cross-service đã bị loại bỏ:
--   • PRICE_HISTORIES.changed_by      (ref db_users.USERS)
--   • PROMOTION_USAGES.user_id        (ref db_users.USERS)
--   • PROMOTION_USAGES.order_id       (ref db_orders.ORDERS)
--   • ORDERS.user_id                  (ref db_users.USERS)
--   • ORDERS.promotion_id             (ref db_promos.PROMOTIONS)
--   • ORDER_DETAILS.product_variant_id (ref db_products.PRODUCT_VARIANTS)
--   • PAYMENTS.order_id               (ref db_orders.ORDERS)
--   • REVIEWS.user_id                 (ref db_users.USERS)
--   • REVIEWS.product_id              (ref db_products.PRODUCTS)
--   • REVIEWS.order_id                (ref db_orders.ORDERS)
--   • COMMENTS.product_id             (ref db_products.PRODUCTS)
--   • COMMENTS.user_id                (ref db_users.USERS)
-- ============================================================


-- ============================================================
-- DATABASE 1: db_users
-- Service: User Service
-- Quản lý: USERS, USER_ROLES, ROLES, USER_DETAILS
-- ============================================================

CREATE DATABASE IF NOT EXISTS `db_users`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `db_users`;

-- ------------------------------------------------------------
-- ROLES
-- ------------------------------------------------------------
CREATE TABLE `ROLES` (
  `id`         CHAR(36)     PRIMARY KEY DEFAULT (UUID()),
  `name`       VARCHAR(255) NOT NULL COMMENT 'VD: Admin, Editor, Customer',
  `created_at` DATETIME     DEFAULT (NOW())
);

-- ------------------------------------------------------------
-- USERS
-- ------------------------------------------------------------
CREATE TABLE `USERS` (
  `id`            CHAR(36)     PRIMARY KEY DEFAULT (UUID()),
  `user_name`     VARCHAR(255) NOT NULL,
  `hash_password` VARCHAR(255) NOT NULL,
  `email`         VARCHAR(255) UNIQUE NOT NULL,
  `is_active`     BOOLEAN      DEFAULT TRUE COMMENT 'Khoá/mở tài khoản',
  `created_at`    DATETIME     DEFAULT (NOW()),
  `updated_at`    DATETIME     DEFAULT (NOW())
);

-- ------------------------------------------------------------
-- USER_ROLES  (junction table — nội bộ db_users)
-- ------------------------------------------------------------
CREATE TABLE `USER_ROLES` (
  `user_id` CHAR(36) NOT NULL,
  `role_id` CHAR(36) NOT NULL,
  PRIMARY KEY (`user_id`, `role_id`)
);

-- ------------------------------------------------------------
-- USER_DETAILS
-- ------------------------------------------------------------
CREATE TABLE `USER_DETAILS` (
  `id`           CHAR(36)     PRIMARY KEY DEFAULT (UUID()),
  `user_id`      CHAR(36)     UNIQUE NOT NULL,
  `name`         VARCHAR(255),
  `avatar_url`   VARCHAR(255),
  `address`      VARCHAR(255),
  `phone_number` VARCHAR(20),
  `created_at`   DATETIME     DEFAULT (NOW()),
  `updated_at`   DATETIME     DEFAULT (NOW())
);

-- Indexes
CREATE INDEX `idx_users_email`    ON `USERS` (`email`);
CREATE INDEX `idx_users_active`   ON `USERS` (`is_active`);

-- Foreign Keys (chỉ trong nội bộ db_users)
ALTER TABLE `USER_ROLES`   ADD FOREIGN KEY (`user_id`) REFERENCES `USERS` (`id`) ON DELETE CASCADE;
ALTER TABLE `USER_ROLES`   ADD FOREIGN KEY (`role_id`) REFERENCES `ROLES` (`id`) ON DELETE CASCADE;
ALTER TABLE `USER_DETAILS` ADD FOREIGN KEY (`user_id`) REFERENCES `USERS` (`id`) ON DELETE CASCADE;


-- ============================================================
-- DATABASE 2: db_products
-- Service: Product Service
-- Quản lý: CATEGORIES, MODEL, PRODUCTS, PRODUCT_VARIANTS, PRICE_HISTORIES
-- ============================================================

CREATE DATABASE IF NOT EXISTS `db_products`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `db_products`;

-- ------------------------------------------------------------
-- CATEGORIES  (hỗ trợ danh mục lồng nhau qua parent_id)
-- ------------------------------------------------------------
CREATE TABLE `CATEGORIES` (
  `id`          CHAR(36)     PRIMARY KEY DEFAULT (UUID()),
  `name`        VARCHAR(255) NOT NULL COMMENT 'VD: Điện thoại, Ốp lưng, Sạc, Tai nghe',
  `slug`        VARCHAR(255) UNIQUE NOT NULL COMMENT 'URL-friendly: dien-thoai, op-lung...',
  `parent_id`   CHAR(36)     DEFAULT NULL COMMENT 'NULL = danh mục gốc, có giá trị = danh mục con',
  `sort_order`  INT          DEFAULT 0,
  `is_active`   BOOLEAN      DEFAULT TRUE,
  `created_at`  DATETIME     DEFAULT (NOW())
);

-- ------------------------------------------------------------
-- MODEL
-- ------------------------------------------------------------
CREATE TABLE `MODEL` (
  `id`           CHAR(36)     PRIMARY KEY DEFAULT (UUID()),
  `model_name`   VARCHAR(255) NOT NULL,
  `model_number` VARCHAR(255),
  `brand`        VARCHAR(255) NOT NULL,
  `cpu`          VARCHAR(255),
  `screen_size`  DECIMAL(5,2),
  `opera_system` VARCHAR(255),
  `is_active`    BOOLEAN      DEFAULT TRUE,
  `deleted_at`   DATETIME     DEFAULT NULL COMMENT 'NULL = chưa xoá, có giá trị = đã xoá mềm',
  `created_at`   DATETIME     DEFAULT (NOW())
);

-- ------------------------------------------------------------
-- PRODUCTS
-- ------------------------------------------------------------
CREATE TABLE `PRODUCTS` (
  `id`          CHAR(36)     PRIMARY KEY DEFAULT (UUID()),
  `name`        VARCHAR(255) NOT NULL,
  `model_id`    CHAR(36),
  `category_id` CHAR(36)     NOT NULL,
  `img_url`     VARCHAR(500),
  `description` TEXT         COMMENT 'Mô tả chi tiết sản phẩm',
  `is_active`   BOOLEAN      DEFAULT TRUE  COMMENT 'true = đang bán, false = tạm ẩn',
  `deleted_at`  DATETIME     DEFAULT NULL  COMMENT 'NULL = chưa xoá, có giá trị = đã xoá mềm',
  `created_at`  DATETIME     DEFAULT (NOW()),
  `updated_at`  DATETIME     DEFAULT (NOW())
);

-- ------------------------------------------------------------
-- PRODUCT_VARIANTS
-- ------------------------------------------------------------
CREATE TABLE `PRODUCT_VARIANTS` (
  `id`             CHAR(36)     PRIMARY KEY DEFAULT (UUID()),
  `product_id`     CHAR(36)     NOT NULL,
  `color`          VARCHAR(100),
  `ram`            INT          COMMENT 'Đơn vị: GB',
  `storage`        INT          COMMENT 'Đơn vị: GB. VD: 64, 128, 256, 512',
  `import_price`   DECIMAL(18,2) NOT NULL   COMMENT 'Giá nhập/Giá vốn',
  `original_price` DECIMAL(18,2)            COMMENT 'Giá niêm yết (gạch ngang)',
  `price`          DECIMAL(18,2) NOT NULL   COMMENT 'Giá bán thực tế',
  `stock_quantity` INT          DEFAULT 0   COMMENT 'Số lượng tồn kho',
  `is_active`      BOOLEAN      DEFAULT TRUE COMMENT 'true = đang bán, false = ngừng bán variant này',
  `deleted_at`     DATETIME     DEFAULT NULL,
  `created_at`     DATETIME     DEFAULT (NOW())
);

-- ------------------------------------------------------------
-- PRICE_HISTORIES
-- Audit trail lịch sử thay đổi giá variant.
-- ⚠️  changed_by lưu user_id từ db_users — KHÔNG có FK vật lý.
--     Application phải tự validate user tồn tại qua User Service
--     trước khi ghi vào bảng này.
-- ------------------------------------------------------------
CREATE TABLE `PRICE_HISTORIES` (
  `id`                  CHAR(36)      PRIMARY KEY DEFAULT (UUID()),
  `product_variant_id`  CHAR(36)      NOT NULL,
  `changed_by`          CHAR(36)      NOT NULL    COMMENT '[REF: db_users.USERS.id] — validate qua User Service',
  `old_import_price`    DECIMAL(18,2),
  `new_import_price`    DECIMAL(18,2),
  `old_original_price`  DECIMAL(18,2),
  `new_original_price`  DECIMAL(18,2),
  `old_price`           DECIMAL(18,2),
  `new_price`           DECIMAL(18,2),
  `reason`              VARCHAR(500)  COMMENT 'Lý do thay đổi giá (tuỳ chọn)',
  `changed_at`          DATETIME      DEFAULT (NOW())
);

-- Indexes
CREATE INDEX `idx_products_category`  ON `PRODUCTS` (`category_id`);
CREATE INDEX `idx_products_active`    ON `PRODUCTS` (`is_active`, `deleted_at`);
CREATE INDEX `idx_variants_product`   ON `PRODUCT_VARIANTS` (`product_id`);
CREATE INDEX `idx_price_history`      ON `PRICE_HISTORIES` (`product_variant_id`, `changed_at`);

-- Foreign Keys (chỉ nội bộ db_products)
ALTER TABLE `CATEGORIES`      ADD FOREIGN KEY (`parent_id`)         REFERENCES `CATEGORIES` (`id`);
ALTER TABLE `PRODUCTS`        ADD FOREIGN KEY (`model_id`)          REFERENCES `MODEL` (`id`);
ALTER TABLE `PRODUCTS`        ADD FOREIGN KEY (`category_id`)       REFERENCES `CATEGORIES` (`id`);
ALTER TABLE `PRODUCT_VARIANTS` ADD FOREIGN KEY (`product_id`)       REFERENCES `PRODUCTS` (`id`);
ALTER TABLE `PRICE_HISTORIES`  ADD FOREIGN KEY (`product_variant_id`) REFERENCES `PRODUCT_VARIANTS` (`id`);
-- ❌ PRICE_HISTORIES.changed_by KHÔNG có FK vì trỏ sang db_users


-- ============================================================
-- DATABASE 3: db_orders
-- Service: Order Service
-- Quản lý: ORDERS, ORDER_DETAILS
-- ============================================================

CREATE DATABASE IF NOT EXISTS `db_orders`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `db_orders`;

-- ------------------------------------------------------------
-- ORDERS
-- ⚠️  Cross-service references (lưu ID, không có FK vật lý):
--   • user_id       → db_users.USERS        (validate qua User Service)
--   • promotion_id  → db_promos.PROMOTIONS  (validate qua Promotion Service)
-- ------------------------------------------------------------
CREATE TABLE `ORDERS` (
  `id`               CHAR(36)     PRIMARY KEY DEFAULT (UUID()),
  `user_id`          CHAR(36)     NOT NULL    COMMENT '[REF: db_users.USERS.id]',
  `promotion_id`     CHAR(36)     DEFAULT NULL COMMENT '[REF: db_promos.PROMOTIONS.id] — NULL nếu không dùng voucher',
  `subtotal_price`   DECIMAL(18,2) NOT NULL   COMMENT 'Tiền hàng trước khi giảm',
  `discount_amount`  DECIMAL(18,2) DEFAULT 0  COMMENT 'Tiền trừ đi từ voucher',
  `total_price`      DECIMAL(18,2) NOT NULL   COMMENT 'Tiền khách thực trả',
  `total_product`    INT,
  `status`           ENUM('pending', 'processing', 'shipped', 'completed', 'cancelled') DEFAULT 'pending',
  `shipping_name`    VARCHAR(255) NOT NULL,
  `shipping_phone`   VARCHAR(20)  NOT NULL,
  `shipping_address` VARCHAR(500) NOT NULL,
  `note`             VARCHAR(500) COMMENT 'Ghi chú của khách khi đặt hàng',
  `created_at`       DATETIME     DEFAULT (NOW()),
  `updated_at`       DATETIME     DEFAULT (NOW())
);

-- ------------------------------------------------------------
-- ORDER_DETAILS
-- ⚠️  product_variant_id → db_products.PRODUCT_VARIANTS
--     Giá được SNAPSHOT lại tại thời điểm đặt hàng — không phụ thuộc
--     vào giá hiện tại của Product Service sau này.
-- ------------------------------------------------------------
CREATE TABLE `ORDER_DETAILS` (
  `id`                 CHAR(36)      PRIMARY KEY DEFAULT (UUID()),
  `order_id`           CHAR(36)      NOT NULL,
  `product_variant_id` CHAR(36)      NOT NULL    COMMENT '[REF: db_products.PRODUCT_VARIANTS.id]',
  `quantity`           INT           NOT NULL,
  `import_price`       DECIMAL(18,2) NOT NULL COMMENT 'Snapshot giá nhập lúc bán',
  `price`              DECIMAL(18,2) NOT NULL COMMENT 'Snapshot giá bán lúc bán'
);

-- Indexes
CREATE UNIQUE INDEX `uq_order_details` ON `ORDER_DETAILS` (`order_id`, `product_variant_id`);
CREATE INDEX `idx_orders_user`         ON `ORDERS` (`user_id`);
CREATE INDEX `idx_orders_status`       ON `ORDERS` (`status`);
CREATE INDEX `idx_orders_promotion`    ON `ORDERS` (`promotion_id`);

-- Foreign Keys (chỉ nội bộ db_orders)
ALTER TABLE `ORDER_DETAILS` ADD FOREIGN KEY (`order_id`) REFERENCES `ORDERS` (`id`) ON DELETE CASCADE;
-- ❌ ORDER_DETAILS.product_variant_id  KHÔNG có FK (trỏ sang db_products)
-- ❌ ORDERS.user_id                    KHÔNG có FK (trỏ sang db_users)
-- ❌ ORDERS.promotion_id               KHÔNG có FK (trỏ sang db_promos)


-- ============================================================
-- DATABASE 4: db_payments
-- Service: Payment Service
-- Quản lý: PAYMENTS
-- ============================================================

CREATE DATABASE IF NOT EXISTS `db_payments`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `db_payments`;

-- ------------------------------------------------------------
-- PAYMENTS
-- ⚠️  order_id → db_orders.ORDERS — validate qua Order Service.
--     Payment Service nhận event 'order_created' từ RabbitMQ,
--     sau đó tạo bản ghi PAYMENT tương ứng.
-- ------------------------------------------------------------
CREATE TABLE `PAYMENTS` (
  `id`                CHAR(36)     PRIMARY KEY DEFAULT (UUID()),
  `order_id`          CHAR(36)     NOT NULL    COMMENT '[REF: db_orders.ORDERS.id]',
  `amount`            DECIMAL(18,2) NOT NULL   COMMENT 'Số tiền giao dịch thực tế',
  `payment_method`    ENUM('cod', 'vnpay', 'momo', 'credit_card') NOT NULL,
  `status`            ENUM('pending', 'success', 'failed', 'refunded') DEFAULT 'pending',
  `transaction_code`  VARCHAR(255)             COMMENT 'Mã GD từ VNPay/MoMo...',
  `provider_response` TEXT                     COMMENT 'Log JSON trả về để debug',
  `created_at`        DATETIME     DEFAULT (NOW()),
  `updated_at`        DATETIME     DEFAULT (NOW())
);

-- Indexes
CREATE INDEX `idx_payments_order`  ON `PAYMENTS` (`order_id`);
CREATE INDEX `idx_payments_status` ON `PAYMENTS` (`status`);
-- ❌ PAYMENTS.order_id KHÔNG có FK vật lý (trỏ sang db_orders)


-- ============================================================
-- DATABASE 5: db_promos
-- Service: Promotion Service
-- Quản lý: PROMOTIONS, PROMOTION_USAGES
-- ============================================================

CREATE DATABASE IF NOT EXISTS `db_promos`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `db_promos`;

-- ------------------------------------------------------------
-- PROMOTIONS
-- ------------------------------------------------------------
CREATE TABLE `PROMOTIONS` (
  `id`                  CHAR(36)     PRIMARY KEY DEFAULT (UUID()),
  `code`                VARCHAR(100) UNIQUE NOT NULL COMMENT 'Mã voucher khách nhập',
  `name`                VARCHAR(255),
  `discount_type`       ENUM('percentage', 'fixed_amount') NOT NULL,
  `discount_value`      DECIMAL(18,2) NOT NULL  COMMENT 'Mức giảm (% hoặc tiền)',
  `max_discount_amount` DECIMAL(18,2)            COMMENT 'Mức giảm tối đa (nếu dùng %)',
  `min_order_value`     DECIMAL(18,2) DEFAULT 0  COMMENT 'Đơn tối thiểu để áp dụng',
  `start_date`          DATETIME     NOT NULL,
  `end_date`            DATETIME     NOT NULL,
  `usage_limit`         INT                      COMMENT 'Tổng lượt dùng tối đa (NULL = không giới hạn)',
  `is_active`           BOOLEAN      DEFAULT TRUE,
  `created_at`          DATETIME     DEFAULT (NOW()),
  `updated_at`          DATETIME     DEFAULT (NOW())
);

-- ------------------------------------------------------------
-- PROMOTION_USAGES
-- Track từng lượt dùng voucher — tránh race condition.
-- ⚠️  Cross-service references:
--   • user_id  → db_users.USERS      (validate qua User Service)
--   • order_id → db_orders.ORDERS    (validate qua Order Service)
--     Promotion Service nhận event 'order_created' qua RabbitMQ,
--     sau đó ghi nhận usage. Nếu order bị huỷ, nhận event
--     'order_cancelled' để rollback (xoá bản ghi usage này).
-- ------------------------------------------------------------
CREATE TABLE `PROMOTION_USAGES` (
  `id`           CHAR(36)  PRIMARY KEY DEFAULT (UUID()),
  `promotion_id` CHAR(36)  NOT NULL,
  `user_id`      CHAR(36)  NOT NULL    COMMENT '[REF: db_users.USERS.id]',
  `order_id`     CHAR(36)  NOT NULL    COMMENT '[REF: db_orders.ORDERS.id]',
  `used_at`      DATETIME  DEFAULT (NOW())
);

-- Indexes
CREATE UNIQUE INDEX `uq_promotion_usage` ON `PROMOTION_USAGES` (`promotion_id`, `order_id`);
CREATE INDEX `idx_promo_usage_user`       ON `PROMOTION_USAGES` (`user_id`);

-- Foreign Keys (chỉ nội bộ db_promos)
ALTER TABLE `PROMOTION_USAGES` ADD FOREIGN KEY (`promotion_id`) REFERENCES `PROMOTIONS` (`id`);
-- ❌ PROMOTION_USAGES.user_id  KHÔNG có FK (trỏ sang db_users)
-- ❌ PROMOTION_USAGES.order_id KHÔNG có FK (trỏ sang db_orders)


-- ============================================================
-- DATABASE 6: db_reviews
-- Service: Review Service
-- Quản lý: REVIEWS, COMMENTS
-- ============================================================

CREATE DATABASE IF NOT EXISTS `db_reviews`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `db_reviews`;

-- ------------------------------------------------------------
-- REVIEWS
-- ⚠️  Cross-service references:
--   • user_id    → db_users.USERS         (validate qua User Service)
--   • product_id → db_products.PRODUCTS   (validate qua Product Service)
--   • order_id   → db_orders.ORDERS       (validate qua Order Service)
--     Chỉ cho phép review khi Order Service xác nhận order có status
--     'completed' và thuộc về user đó — gọi RPC hoặc check qua event.
-- ------------------------------------------------------------
CREATE TABLE `REVIEWS` (
  `id`         CHAR(36)  PRIMARY KEY DEFAULT (UUID()),
  `user_id`    CHAR(36)  NOT NULL    COMMENT '[REF: db_users.USERS.id]',
  `product_id` CHAR(36)  NOT NULL    COMMENT '[REF: db_products.PRODUCTS.id]',
  `order_id`   CHAR(36)  NOT NULL    COMMENT '[REF: db_orders.ORDERS.id] — phải là đơn đã completed',
  `rating`     TINYINT   NOT NULL    COMMENT 'Điểm 1–5 sao',
  `content`    TEXT,
  `is_visible` BOOLEAN   DEFAULT TRUE COMMENT 'Admin có thể ẩn review vi phạm',
  `created_at` DATETIME  DEFAULT (NOW())
);

-- ------------------------------------------------------------
-- COMMENTS
-- Bình luận sản phẩm: khách hỏi, cửa hàng trả lời.
-- Hỗ trợ reply lồng nhau qua parent_id.
-- ⚠️  Cross-service references:
--   • product_id → db_products.PRODUCTS  (validate qua Product Service)
--   • user_id    → db_users.USERS        (validate qua User Service)
-- ------------------------------------------------------------
CREATE TABLE `COMMENTS` (
  `id`         CHAR(36)  PRIMARY KEY DEFAULT (UUID()),
  `product_id` CHAR(36)  NOT NULL    COMMENT '[REF: db_products.PRODUCTS.id]',
  `user_id`    CHAR(36)  NOT NULL    COMMENT '[REF: db_users.USERS.id]',
  `parent_id`  CHAR(36)  DEFAULT NULL COMMENT 'NULL = bình luận gốc, có giá trị = reply',
  `content`    TEXT      NOT NULL,
  `is_visible` BOOLEAN   DEFAULT TRUE COMMENT 'Admin có thể ẩn bình luận vi phạm',
  `created_at` DATETIME  DEFAULT (NOW()),
  `updated_at` DATETIME  DEFAULT (NOW())
);

-- Indexes
CREATE UNIQUE INDEX `uq_reviews`       ON `REVIEWS`  (`user_id`, `product_id`, `order_id`);
CREATE INDEX `idx_reviews_product`     ON `REVIEWS`  (`product_id`);
CREATE INDEX `idx_comments_product`    ON `COMMENTS` (`product_id`, `parent_id`);

-- Foreign Keys (chỉ nội bộ db_reviews)
ALTER TABLE `COMMENTS` ADD FOREIGN KEY (`parent_id`) REFERENCES `COMMENTS` (`id`);
-- ❌ Các FK trỏ sang db_users, db_products, db_orders đều bị loại bỏ


-- ============================================================
-- DATABASE 7: db_config
-- Service: Config Service
-- Quản lý: SETTINGS, BANNERS
-- ============================================================

CREATE DATABASE IF NOT EXISTS `db_config`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `db_config`;

-- ------------------------------------------------------------
-- SETTINGS
-- ------------------------------------------------------------
CREATE TABLE `SETTINGS` (
  `id`            CHAR(36)     PRIMARY KEY DEFAULT (UUID()),
  `setting_key`   VARCHAR(255) UNIQUE NOT NULL COMMENT 'VD: google_map_iframe, hotline, logo',
  `setting_value` TEXT                         COMMENT 'Giá trị cấu hình',
  `setting_type`  ENUM('string', 'number', 'boolean', 'json') DEFAULT 'string'
                               COMMENT 'Giúp client biết cách parse giá trị',
  `description`   VARCHAR(500)                 COMMENT 'Mô tả ý nghĩa cho admin',
  `updated_at`    DATETIME     DEFAULT (NOW())
);

-- ------------------------------------------------------------
-- BANNERS
-- ------------------------------------------------------------
CREATE TABLE `BANNERS` (
  `id`          CHAR(36)     PRIMARY KEY DEFAULT (UUID()),
  `title`       VARCHAR(255)              COMMENT 'Tên banner',
  `image_url`   VARCHAR(500) NOT NULL     COMMENT 'Link ảnh banner',
  `target_url`  VARCHAR(500)              COMMENT 'Link chuyển hướng khi click',
  `position`    VARCHAR(100) DEFAULT 'home_main' COMMENT 'Vị trí đặt trên web',
  `sort_order`  INT          DEFAULT 0,
  `is_active`   BOOLEAN      DEFAULT TRUE,
  `created_at`  DATETIME     DEFAULT (NOW()),
  `updated_at`  DATETIME     DEFAULT (NOW())
);

-- Indexes
CREATE INDEX `idx_banners_active`   ON `BANNERS` (`is_active`, `sort_order`);
CREATE INDEX `idx_settings_key`     ON `SETTINGS` (`setting_key`);


-- ============================================================
-- TỔNG KẾT CÁC RABITMQ EVENTS CẦN ĐỊNH NGHĨA
-- (Thay thế cho các FK cross-database đã bị loại bỏ)
-- ============================================================
--
-- [Order Service] PUBLISH:
--   • order_created          → Payment Service, Promotion Service, Notification Service
--   • order_status_changed   → Notification Service
--   • order_cancelled        → Promotion Service (rollback usage), Notification Service
--
-- [Payment Service] PUBLISH:
--   • payment_processed      → Order Service (cập nhật status đơn hàng)
--   • payment_failed         → Order Service (fallback / compensating transaction)
--   • payment_refunded       → Order Service, Notification Service
--
-- [Review Service] — trước khi cho phép review:
--   • Gọi RPC đến Order Service: verify order completed + thuộc user đó
--   • Gọi RPC đến Product Service: verify product tồn tại
--
-- [Product Service]:
--   • price_updated          → Notification Service (tuỳ chọn)
--
-- ============================================================