/**
 * Generates self-host artifacts for a forged Next.js 16 project.
 */
export function renderDockerfile() {
  return `# syntax=docker/dockerfile:1.7
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev

FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM gcr.io/distroless/nodejs22-debian12 AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
USER 1001
EXPOSE 3000
CMD ["server.js"]
`;
}

export function renderCompose() {
  return `services:
  app:
    build: .
    ports: ["3000:3000"]
    env_file: .env
    depends_on: [db]
    restart: unless-stopped
  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: forgeagent
      POSTGRES_USER: forgeagent
      POSTGRES_PASSWORD: forgeagent
    volumes: ["pg:/var/lib/postgresql/data"]
    ports: ["5432:5432"]
  nginx:
    image: nginx:1.27-alpine
    ports: ["80:80", "443:443"]
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
    depends_on: [app]
volumes:
  pg: {}
`;
}

export function renderNginx() {
  return `events {}
http {
  gzip on;
  brotli on;
  upstream app { server app:3000; }
  server {
    listen 80;
    listen [::]:80;
    location / {
      proxy_pass http://app;
      proxy_set_header Host $host;
      proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
      proxy_set_header X-Forwarded-Proto $scheme;
    }
  }
}
`;
}

export function renderRunScript(): { sh: string; ps1: string } {
  return {
    sh: `#!/usr/bin/env bash\nset -e\ndocker compose up -d --build\n`,
    ps1: `docker compose up -d --build\n`,
  };
}
