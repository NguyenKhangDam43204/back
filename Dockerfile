# Bước 1: Môi trường build
FROM node:20-alpine AS builder
WORKDIR /app

# Copy package và cài đặt dependencies
COPY package*.json ./
RUN npm install

# Copy toàn bộ source code
COPY . .

# Khai báo biến APP_NAME để biết cần build app nào (tmdt hay auth-service)
ARG APP_NAME
RUN npm run build ${APP_NAME}

# Bước 2: Môi trường chạy (Production)
FROM node:20-alpine
WORKDIR /app
ARG APP_NAME

# Chỉ copy node_modules và thư mục dist (đã build) của app tương ứng
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist/apps/${APP_NAME} ./dist

# Lệnh chạy app
CMD ["node", "dist/main.js"]