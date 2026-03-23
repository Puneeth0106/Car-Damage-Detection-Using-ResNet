# ── Stage 1: Build ────────────────────────────────────────────────────────────
# Use Node to install deps and compile React → /app/dist
# This stage is DISCARDED after build; it never ships to production.
# ──────────────────────────────────────────────────────────────────────────────
FROM node:20-alpine AS build

WORKDIR /app

# Copy package files first for better layer caching (same trick as backend)
COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build
# /app/dist now contains: index.html + bundled JS/CSS


# ── Stage 2: Serve ────────────────────────────────────────────────────────────
# Nginx is a high-performance static file server.
# The final image is ~25MB instead of ~300MB with Node.
# ──────────────────────────────────────────────────────────────────────────────
FROM nginx:1.27-alpine

# Copy only the built static files from Stage 1
COPY --from=build /app/dist /usr/share/nginx/html

# Override default nginx config with our custom proxy rules
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
