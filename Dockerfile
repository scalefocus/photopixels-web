FROM node:16.18-alpine as deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM node:16.18-alpine as builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM nginx:latest as runtime
COPY --from=builder /app/build /var/www/data/photopixels
COPY ./docker/nginx.conf /etc/nginx/templates/default.conf.template
