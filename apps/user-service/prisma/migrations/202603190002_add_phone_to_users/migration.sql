-- AddColumn phone_number to USERS table
ALTER TABLE `USERS` ADD COLUMN `phone_number` VARCHAR(20);

-- Add unique constraint (optional, can remove if not needed)
ALTER TABLE `USERS` ADD UNIQUE INDEX `USERS_phone_number_key`(`phone_number`);
