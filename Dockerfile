# syntax=docker/dockerfile:1.7

ARG NODE_VERSION=22-alpine

FROM node:${NODE_VERSION} AS base
WORKDIR /app
RUN apk add --no-cache libc6-compat openssl

FROM base AS deps
COPY package*.json ./
RUN npm ci

FROM deps AS build
ARG APP_NAME
ARG HAS_PRISMA=false
ENV APP_NAME=${APP_NAME}
ENV HAS_PRISMA=${HAS_PRISMA}

COPY nest-cli.json tsconfig*.json ./
COPY apps ./apps

RUN npm run build ${APP_NAME}

# Chuẩn bị Prisma artifacts cho service có DB (optional)
RUN if [ "${HAS_PRISMA}" = "true" ] && [ -f "apps/${APP_NAME}/prisma/schema.prisma" ]; then \
    npx prisma generate --schema="apps/${APP_NAME}/prisma/schema.prisma"; \
    else \
    echo "Skip Prisma generate for ${APP_NAME}"; \
    fi

FROM base AS runtime
ARG APP_NAME
ARG HAS_PRISMA=false
ENV NODE_ENV=production
ENV APP_NAME=${APP_NAME}
ENV HAS_PRISMA=${HAS_PRISMA}

COPY package*.json ./
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/dist/apps/${APP_NAME} ./dist

# Prisma runtime files chỉ cần cho service có DB
COPY --from=build /app/apps/${APP_NAME}/prisma ./apps/${APP_NAME}/prisma

EXPOSE 3000

CMD ["sh", "-c", "node dist/main.js"]
