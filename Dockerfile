FROM node:lts AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0
ARG PNPM_VERSION=12.9.0
RUN corepack enable && corepack prepare pnpm@${PNPM_VERSION} --activate

FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

FROM deps AS build
ARG MODE=production
WORKDIR /app
COPY . .
RUN pnpm build --mode "${MODE}"

FROM node:lts-slim AS deploy
WORKDIR /app
ENV NODE_ENV="production"
COPY --from=deps /app/node_modules /app/node_modules
COPY --from=build /app/dist /app/

ENV HOST=0.0.0.0
ENV PORT=3000
EXPOSE 3000

CMD ["node", "/app/server/entry.mjs"]
