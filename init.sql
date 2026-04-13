-- Tạo tất cả databases cần thiết
CREATE DATABASE IF NOT EXISTS db_users     CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS db_reviews   CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS db_inventory CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Grant quyền cho root
GRANT ALL PRIVILEGES ON db_users.*     TO 'root'@'%';
GRANT ALL PRIVILEGES ON db_reviews.*   TO 'root'@'%';
GRANT ALL PRIVILEGES ON db_inventory.* TO 'root'@'%';

FLUSH PRIVILEGES;