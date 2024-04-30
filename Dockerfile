FROM node:20-slim AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

FROM nginx:stable-alpine-slim AS runner
COPY --from=builder /app/dist/* /usr/share/nginx/html

EXPOSE 80
