FROM node:22.12-alpine AS mcp-builder

WORKDIR /app

COPY src/ ./src/
COPY package*.json ./
COPY tsconfig.json ./
COPY jest*.js ./

RUN npm ci

RUN npm run build

FROM node:22.12-alpine AS mcp-server

WORKDIR /app

RUN addgroup -g 1001 -S mcp && \
    adduser -S mcp -u 1001

COPY --chown=mcp:mcp package*.json ./
RUN npm ci --omit=dev --ignore-scripts && npm cache clean --force

COPY --chown=mcp:mcp --from=mcp-builder /app/dist ./dist
USER mcp

ENTRYPOINT ["node", "dist/index.js"]
