# Build: docker build -f Dockerfile .
FROM node:20-alpine AS deps
WORKDIR /app
ARG NPM_REGISTRY=https://registry.npmjs.org
RUN npm config set registry "$NPM_REGISTRY"
COPY package.json package-lock.json ./
RUN npm ci

FROM node:20-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ARG NEXT_PUBLIC_SITE_URL=https://funnelking.ir
ARG NEXT_PUBLIC_API_URL=https://exirerp.ir/api
ARG NEXT_PUBLIC_TENANT_SLUG=t63724ac4c3f
ARG NEXT_PUBLIC_EVENTS_BOOKING_BASE_URL=
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_TENANT_SLUG=$NEXT_PUBLIC_TENANT_SLUG
ENV NEXT_PUBLIC_EVENTS_BOOKING_BASE_URL=$NEXT_PUBLIC_EVENTS_BOOKING_BASE_URL
RUN npm run build

FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
RUN addgroup -S exir && adduser -S exir -G exir
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
COPY --from=build /app/public ./public
USER exir
EXPOSE 3000
CMD ["node", "server.js"]
