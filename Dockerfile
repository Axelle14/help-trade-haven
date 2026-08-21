# ---------- Stage 1: build ----------
FROM node:22-alpine AS build

WORKDIR /app

# Install dependencies from the lockfile for reproducible builds
COPY package.json package-lock.json ./
RUN npm ci

# Copy the rest of the source
COPY . .

# Vite inlines VITE_* variables at BUILD time.
# These are public, client-side values only (never secrets).
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_PUBLISHABLE_KEY
ARG VITE_SUPABASE_PROJECT_ID
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL \
    VITE_SUPABASE_PUBLISHABLE_KEY=$VITE_SUPABASE_PUBLISHABLE_KEY \
    VITE_SUPABASE_PROJECT_ID=$VITE_SUPABASE_PROJECT_ID

# Fails the image build if the app does not compile
RUN npm run build

# ---------- Stage 2: production runtime ----------
FROM nginx:1.27-alpine AS production

# SPA-aware nginx config
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

# Only the compiled assets ship in the final image
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -q --spider http://127.0.0.1/healthz || exit 1

CMD ["nginx", "-g", "daemon off;"]
