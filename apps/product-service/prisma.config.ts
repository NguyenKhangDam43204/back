// apps/product-service/prisma.config.ts
import "dotenv/config";   // Load .env trước
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "./prisma/schema.prisma",           // đường dẫn tương đối với prisma.config.ts
  migrations: {
    path: "./prisma/migrations",
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
});