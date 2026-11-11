FROM node:24-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
RUN sed -i -e '/^user /d' -e 's|^pid .*;|pid /tmp/nginx.pid;|' /etc/nginx/nginx.conf \
    && chown -R nginx:nginx /var/cache/nginx
EXPOSE 80
USER nginx
HEALTHCHECK --interval=10s --timeout=5s --start-period=10s \
    CMD wget -q -O /dev/null http://127.0.0.1/
