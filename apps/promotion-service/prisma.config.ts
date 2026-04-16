// apps/promotion-service/prisma.config.ts
//

import { config as loadEnv } from 'dotenv';
import { existsSync } from 'fs';
import { resolve } from 'path';

const rootEnvPath = [
  resolve(process.cwd(), '.env'),
  resolve(process.cwd(), '../../.env'),
  resolve(__dirname, '../../.env'),
  resolve(__dirname, '../../../.env'),
].find((path) => existsSync(path));

if (rootEnvPath) {
  loadEnv({ path: rootEnvPath });
  console.log(`[prisma.config] Loaded env from: ${rootEnvPath}`);
}

// Prisma v5 không hỗ trợ defineConfig — không cần export gì thêm.
// Prisma CLI sẽ tự đọc PROMOTION_DATABASE_URL từ process.env đã load ở trên.