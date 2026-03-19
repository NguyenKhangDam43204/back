-- CreateTable
CREATE TABLE `PROMOTIONS` (
    `id` CHAR(36) NOT NULL,
    `code` VARCHAR(100) NOT NULL,
    `name` VARCHAR(255) NULL,
    `discount_type` ENUM('percentage', 'fixed_amount') NOT NULL,
    `discount_value` DECIMAL(18, 2) NOT NULL,
    `max_discount_amount` DECIMAL(18, 2) NULL,
    `min_order_value` DECIMAL(18, 2) NOT NULL DEFAULT 0,
    `start_date` DATETIME(3) NOT NULL,
    `end_date` DATETIME(3) NOT NULL,
    `usage_limit` INTEGER NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `PROMOTIONS_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PROMOTION_USAGES` (
    `id` CHAR(36) NOT NULL,
    `promotion_id` CHAR(36) NOT NULL,
    `user_id` CHAR(36) NOT NULL,
    `order_id` CHAR(36) NOT NULL,
    `used_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `idx_promo_usage_user`(`user_id`),
    UNIQUE INDEX `uq_promotion_usage`(`promotion_id`, `order_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `PROMOTION_USAGES` ADD CONSTRAINT `PROMOTION_USAGES_promotion_id_fkey` FOREIGN KEY (`promotion_id`) REFERENCES `PROMOTIONS`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
