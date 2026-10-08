# Build context is the repository root: docker build -t certificates-api .
FROM node:22-bookworm-slim AS deps
WORKDIR /app
ENV PUPPETEER_SKIP_DOWNLOAD=true
COPY package.json package-lock.json ./
COPY backend/package.json backend/
COPY web/package.json web/
COPY admin/package.json admin/
RUN npm ci -w backend --include-workspace-root=false --omit=dev

FROM deps AS build
RUN npm ci -w backend --include-workspace-root=false
COPY backend backend
RUN npm run build -w backend

FROM node:22-bookworm-slim
# Chromium renders the certificate PDFs; the fonts cover Latin + Indic scripts.
RUN apt-get update \
 && apt-get install -y --no-install-recommends chromium fonts-liberation fonts-noto-core ca-certificates \
 && rm -rf /var/lib/apt/lists/*
ENV NODE_ENV=production \
    PUPPETEER_SKIP_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium \
    PUPPETEER_NO_SANDBOX=true \
    PORT=10000
WORKDIR /app/backend
COPY --from=deps /app/node_modules /app/node_modules
COPY --from=build /app/backend/dist ./dist
COPY backend/templates ./templates
COPY backend/package.json ./
USER node
EXPOSE 10000
CMD ["node", "dist/main.js"]
