FROM node:24-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build && npm prune --omit=dev

FROM node:24-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY package.json ./
EXPOSE 3000
USER node
HEALTHCHECK --interval=10s --timeout=5s --start-period=10s \
    CMD node --input-type=module -e "const response = await fetch('http://127.0.0.1:' + (process.env.PORT || '3000') + '/api/health'); process.exit(response.ok ? 0 : 1);"
CMD ["node", "dist/main"]
