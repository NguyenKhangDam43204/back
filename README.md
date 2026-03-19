# TMDT - E-Commerce Microservices Platform

<p align="center">
  <strong>A scalable e-commerce platform built with NestJS microservices architecture</strong>
</p>

---

## 📋 Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Services](#services)
- [Tech Stack](#tech-stack)
- [Project Setup](#project-setup)
- [Database Configuration](#database-configuration)
- [Running the Application](#running-the-application)
- [Project Structure](#project-structure)
- [API Endpoints](#api-endpoints)
- [Contributing](#contributing)

---

## Overview

TMDT is a modern e-commerce platform built with **NestJS microservices architecture**. The platform separates concerns across multiple independent services, each with its own database, ensuring scalability and maintainability.

**Key Features:**

- ✅ Microservices architecture with decoupled services
- ✅ API Gateway for unified entry point
- ✅ RabbitMQ message broker for inter-service communication
- ✅ Prisma ORM with independent MySQL databases per service
- ✅ Role-based user management
- ✅ Product catalog with categories and variants
- ✅ Order management and payment processing
- ✅ Promotion and discount system
- ✅ User reviews and comments
- ✅ Real-time notifications with Firebase

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Client / Frontend                         │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTP/REST
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                   API Gateway (tmdt)                         │
│              Port: 3000 / Routes: /api/*                     │
└─────────────┬──────────────────────────────────────────────┘
              │
              │ RPC via RabbitMQ
              │
    ┌─────────┴────────────────────────────────────┐
    │       RabbitMQ Message Broker                │
    │    (amqp://tmdt:tmdt2026@rabbitmq:5672)    │
    └─────────┬────────────────────────────────────┘
              │
    ┌─────────┼────────────────────────────────────┐
    │         │                                    │
    ▼         ▼                                    ▼
[Microservices with Independent Databases]

User Service           Product Service         Order Service
├─ Port: 3001         ├─ Port: 3002           ├─ Port: 3003
├─ db_users           ├─ db_products          ├─ db_orders
└─ user_queue         └─ product_queue        └─ order_queue

Payment Service       Promotion Service        Review Service
├─ Port: 3004         ├─ Port: 3005           ├─ Port: 3006
├─ db_payments        ├─ db_promos            ├─ db_reviews
└─ payment_queue      └─ promotion_queue      └─ review_queue

Config Service        Notification Service
├─ Port: 3007         ├─ Port: 3008
├─ db_config          ├─ No Database
└─ config_queue       └─ notification_queue
```

---

## Services

### 1. **User Service** (Port 3001)

Handles user authentication, registration, roles, and permissions.

**Database:** `db_users`  
**Tables:** ROLES, USERS, USER_ROLES, USER_DETAILS  
**Key Features:**

- User registration & authentication
- Role-based access control (RBAC)
- User profile management

### 2. **Product Service** (Port 3002)

Manages product catalog, categories, variants, and pricing.

**Database:** `db_products`  
**Tables:** CATEGORIES, MODELS, PRODUCTS, PRODUCT_VARIANTS, PRICE_HISTORIES  
**Key Features:**

- Product catalog management
- Category hierarchy with nested structure
- Product variants and pricing tiers
- Price change audit trail

### 3. **Order Service** (Port 3003)

Processes customer orders and order lifecycle management.

**Database:** `db_orders`  
**Tables:** ORDERS, ORDER_DETAILS  
**Key Features:**

- Order creation and management
- Order status tracking
- Line item snapshots for transaction history

### 4. **Payment Service** (Port 3004)

Handles payment processing and transaction management.

**Database:** `db_payments`  
**Tables:** PAYMENTS  
**Key Features:**

- Multi-payment method support (COD, VNPay, Momo, Credit Card)
- Payment status tracking
- Transaction logging

### 5. **Promotion Service** (Port 3005)

Manages discounts, vouchers, and promotional campaigns.

**Database:** `db_promos`  
**Tables:** PROMOTIONS, PROMOTION_USAGES  
**Key Features:**

- Percentage & fixed amount discounts
- Promotion usage tracking
- Duplicate prevention

### 6. **Review Service** (Port 3006)

Manages product reviews and user comments.

**Database:** `db_reviews`  
**Tables:** REVIEWS, COMMENTS  
**Key Features:**

- Star-based product reviews
- Nested comment system
- Review ownership validation

### 7. **Config Service** (Port 3007)

Centralized configuration and banner management.

**Database:** `db_config`  
**Tables:** SETTINGS, BANNERS  
**Key Features:**

- Key-value configuration store
- Settings management
- Promotional banners

### 8. **Notification Service** (Port 3008)

Real-time push notifications with Firebase.

**No Database**  
**Key Features:**

- Event-driven notifications
- Firebase Admin SDK integration
- Order status updates

---

## Tech Stack

| Component       | Technology     | Version      |
| --------------- | -------------- | ------------ |
| Framework       | NestJS         | 11.x         |
| Language        | TypeScript     | 5.x          |
| ORM             | Prisma         | 7.x          |
| Database        | MySQL          | 8.0          |
| Message Broker  | RabbitMQ       | 3-management |
| Runtime         | Node.js        | 20+          |
| Package Manager | npm            | 10+          |
| Container       | Docker Compose | Latest       |

---

## Project Setup

### Prerequisites

- Node.js 20+
- npm 10+
- Docker & Docker Compose (optional, for containerized deployment)
- MySQL 8.0 (local or containerized)

### Installation

1. **Clone and install dependencies:**

```bash
git clone <repository-url>
cd tmdt
npm install
```

2. **Setup environment files:**
   Each service requires a `.env` file. Copy `.env.example` to `.env` for each service:

```bash
# User Service
cp apps/user-service/.env.example apps/user-service/.env

# Product Service
cp apps/product-service/.env.example apps/product-service/.env

# Order Service
cp apps/order-service/.env.example apps/order-service/.env

# Payment Service
cp apps/payment-service/.env.example apps/payment-service/.env

# Promotion Service
cp apps/promotion-service/.env.example apps/promotion-service/.env

# Review Service
cp apps/review-service/.env.example apps/review-service/.env

# Config Service
cp apps/config-service/.env.example apps/config-service/.env
```

---

## Database Configuration

### Option 1: Docker Compose (Recommended)

```bash
docker-compose up -d
```

This starts:

- MySQL 8.0 with all 7 databases
- RabbitMQ 3-management on port 15672

### Option 2: Local MySQL

1. **Create databases:**

```sql
CREATE DATABASE db_users CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE db_products CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE db_orders CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE db_payments CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE db_promos CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE db_reviews CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE db_config CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

2. **Update `.env` files** with correct MySQL connection strings:

```
DATABASE_URL="mysql://root:password@localhost:3306/db_users"
```

### Apply Migrations

```bash
# User Service
cd apps/user-service && npx prisma migrate deploy

# Product Service
cd apps/product-service && npx prisma migrate deploy

# Order Service
cd apps/order-service && npx prisma migrate deploy

# Payment Service
cd apps/payment-service && npx prisma migrate deploy

# Promotion Service
cd apps/promotion-service && npx prisma migrate deploy

# Review Service
cd apps/review-service && npx prisma migrate deploy

# Config Service
cd apps/config-service && npx prisma migrate deploy
```

---

## Running the Application

### Development Mode

```bash
npm run start:dev
```

This starts all services in watch mode:

- API Gateway on http://localhost:3000
- User Service on http://localhost:3001
- Product Service on http://localhost:3002
- ... and so on

### Production Mode

```bash
npm run build
npm run start:prod
```

### Using Docker Compose

```bash
docker-compose up --build
```

### RabbitMQ Management Console

Visit: http://localhost:15672  
**Default Credentials:**

- Username: `guest`
- Password: `guest`

---

## Project Structure

```
tmdt/
├── apps/
│   ├── tmdt/                          # API Gateway
│   │   ├── src/
│   │   │   ├── app.controller.ts      # Route handlers
│   │   │   ├── app.module.ts          # Service clients
│   │   │   ├── app.service.ts
│   │   │   └── main.ts
│   │   └── test/
│   │
│   ├── user-service/                  # User & Auth Service
│   │   ├── prisma/
│   │   │   ├── schema.prisma
│   │   │   ├── migrations/
│   │   │   └── .env
│   │   ├── src/
│   │   │   ├── user-service.controller.ts
│   │   │   ├── user-service.service.ts
│   │   │   ├── user-service.module.ts
│   │   │   └── main.ts
│   │   └── test/
│   │
│   ├── product-service/               # Product & Catalog Service
│   ├── order-service/                 # Order Management Service
│   ├── payment-service/               # Payment Processing Service
│   ├── promotion-service/             # Promotion & Discount Service
│   ├── review-service/                # Reviews & Comments Service
│   ├── config-service/                # Configuration Service
│   └── notification-service/          # Notifications Service
│
├── frontend/                          # Admin Dashboard & Client Frontend
│   ├── index.html
│   ├── tmdt/
│   │   ├── admin/                     # Admin Panel
│   │   │   ├── index.html
│   │   │   ├── assets/
│   │   │   │   ├── css/
│   │   │   │   │   └── main.css
│   │   │   │   └── js/                # Admin modules (products, orders, users, etc.)
│   │   │   └── components/
│   │   └── ...                        # Public site pages
│
├── docker-compose.yml                 # Container orchestration
├── Dockerfile                         # Application image
├── nest-cli.json                      # NestJS config
├── package.json
├── tsconfig.json
├── eslint.config.mjs
└── README.md
```

---

## API Endpoints

### API Gateway (Port 3000)

| Method | Endpoint               | Service           | Description       |
| ------ | ---------------------- | ----------------- | ----------------- |
| POST   | `/api/user/login`      | User Service      | User login        |
| POST   | `/api/user/register`   | User Service      | User registration |
| GET    | `/api/product/list`    | Product Service   | Get products      |
| POST   | `/api/order/create`    | Order Service     | Create order      |
| POST   | `/api/payment/process` | Payment Service   | Process payment   |
| POST   | `/api/promotion/apply` | Promotion Service | Apply promotion   |
| POST   | `/api/review/create`   | Review Service    | Create review     |
| GET    | `/api/config/settings` | Config Service    | Get settings      |
| POST   | `/api/{service}/ping`  | Any Service       | Health check      |

---

## Development Commands

```bash
# Build all services
npm run build

# Run in development
npm run start:dev

# Run production build
npm run start:prod

# Run all tests
npm run test

# Run e2e tests
npm run test:e2e

# Run tests with coverage
npm run test:cov

# Lint code
npm run lint

# Format code
npm run format

# Prisma validation
npx prisma validate --schema apps/[service]/prisma/schema.prisma

# Generate Prisma Client
npx prisma generate --config apps/[service]/prisma.config.ts
```

---

## Environment Variables

### Connection Strings

Each service uses a unique database URL in `.env`:

```
# User Service
DATABASE_URL="mysql://root:tmdt2026@localhost:3306/db_users"

# Product Service
DATABASE_URL="mysql://root:tmdt2026@localhost:3306/db_products"

# ... and so on for other services
```

### RabbitMQ Configuration

Defined in service `main.ts` files:

```
amqp://tmdt:tmdt2026@rabbitmq:5672
```

---

## Best Practices

✅ **Service Isolation:** Each service has independent database - no cross-database foreign keys  
✅ **ID References:** Services reference other services' data via scalar IDs only  
✅ **RPC Communication:** Gateway uses RabbitMQ ClientProxy for service communication  
✅ **Validation:** Application-layer validation for cross-service constraints  
✅ **Error Handling:** Proper HTTP error codes and exception handling  
✅ **Logging:** Structured logging for debugging

---

## Troubleshooting

### MySQL Connection Issues

- Verify MySQL is running: `docker ps`
- Check DATABASE_URL format in `.env` files
- Ensure databases exist: `SHOW DATABASES;`

### RabbitMQ Issues

- Check RabbitMQ status: `docker logs rabbitmq`
- Visit management console: http://localhost:15672
- Verify queues are declared in service modules

### Prisma Migration Issues

- Validate schema: `npx prisma validate --schema apps/[service]/prisma/schema.prisma`
- Check migrations exist: `ls apps/[service]/prisma/migrations/`
- Reset database: `npx prisma migrate reset` (development only!)

---

## Contributing

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Make your changes
3. Run tests: `npm run test`
4. Commit: `git commit -m "feat: your feature"`
5. Push: `git push origin feature/your-feature`

---

## License

This project is proprietary and confidential.

---

**Last Updated:** March 2026  
**Version:** 1.0.0
