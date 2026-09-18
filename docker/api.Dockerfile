# ponytail: replace the bootstrap upgrade with an official 24.21.0 image when published.
FROM node:26.8.2-bookworm-slim@sha256:cd9f682fa2885cd1056e830424764158570061c59736a1da836bc3d73df095ae AS node
ENV NODE_VERSION=24.21.0
RUN node --input-type=module -e '\
  import { createHash } from "node:crypto"; \
  import { writeFileSync } from "node:fs"; \
  const hashes = { x64: "6e1db87ef58b8819e5d5402eff1536491b18edd8eb7bee5ef7897876e88dc5ff", arm64: "724282c3b43aec998aa9527380465b45d229e021b58035f5f4f63095eabfe5d5" }; \
  if (!hashes[process.arch]) throw new Error("Unsupported architecture"); \
  const response = await fetch(`https://nodejs.org/dist/v24.21.0/node-v24.21.0-linux-${process.arch}.tar.gz`); \
  if (!response.ok) throw new Error(`Node download failed: ${response.status}`); \
  const data = Buffer.from(await response.arrayBuffer()); \
  if (createHash("sha256").update(data).digest("hex") !== hashes[process.arch]) throw new Error("Node checksum mismatch"); \
  writeFileSync("/tmp/node.tar.gz", data);' \
  && tar -xzf /tmp/node.tar.gz -C /usr/local --strip-components=1 --no-same-owner \
  && rm /tmp/node.tar.gz \
  && test "$(node --version)" = "v24.21.0"

FROM node AS build
WORKDIR /build
# pnpm 12 requires its install script: it relinks the placeholder bin to the
# native @pnpm/exe binary. With --ignore-scripts the bin stays a shell-only
# script and direct spawns (e.g. `pnpm turbo run`) fail with ENOEXEC.
RUN npm install --global pnpm@12.4.2
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.json turbo.json ./
COPY apps/api/package.json apps/api/package.json
COPY packages/auth/package.json packages/auth/package.json
COPY packages/channel-waha/package.json packages/channel-waha/package.json
COPY packages/database/package.json packages/database/package.json
COPY packages/messaging/package.json packages/messaging/package.json
RUN pnpm install --frozen-lockfile --ignore-scripts
COPY apps/api/tsconfig*.json apps/api/
COPY apps/api/src apps/api/src
COPY packages/auth/src packages/auth/src
COPY packages/auth/tsconfig*.json packages/auth/
COPY packages/channel-waha/src packages/channel-waha/src
COPY packages/channel-waha/tsconfig*.json packages/channel-waha/
COPY packages/database/src packages/database/src
COPY packages/database/tsconfig*.json packages/database/
COPY packages/messaging/src packages/messaging/src
COPY packages/messaging/tsconfig*.json packages/messaging/
RUN pnpm turbo run build --filter=@maria/api... \
  && pnpm --filter @maria/api deploy --prod /out

FROM node AS runtime
LABEL org.opencontainers.image.source="https://github.com/JotaSXBR/MarIA-CRM" \
      org.opencontainers.image.licenses="AGPL-3.0-only"
ENV NODE_ENV=production HOST=0.0.0.0 PORT=3000
WORKDIR /app
COPY --from=build /out/ ./
COPY LICENSE ./LICENSE
USER node
EXPOSE 3000
HEALTHCHECK --interval=10s --timeout=3s --start-period=10s --retries=3 \
  CMD ["node", "-e", "fetch('http://127.0.0.1:' + process.env.PORT + '/health', {signal: AbortSignal.timeout(2000)}).then(r => {if (!r.ok) process.exit(1)}).catch(() => process.exit(1))"]
CMD ["node", "dist/server.js"]
