# ponytail: replace the bootstrap upgrade with an official 24.21.0 image when published.
FROM node:26.8.1-bookworm-slim@sha256:367679cf9792759492a486e4aa4b421764d71a9546a6dae8aab81a99eb797b3e AS node
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
RUN npm install --global pnpm@11.26.0 --ignore-scripts
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.json ./
COPY apps/api/package.json apps/api/package.json
RUN pnpm install --frozen-lockfile --ignore-scripts
COPY apps/api/tsconfig*.json apps/api/
COPY apps/api/src apps/api/src
RUN pnpm --filter @maria/api build \
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
