# Panahon Data Web

Admin frontend for the Panahon Observatory weather-data API. Astro (SSR via
`@astrojs/node`, `output: 'server'`) with Vue 3 islands, UnoCSS, reka-ui,
TanStack Vue Query, nanostores, and vee-validate + zod.

## Requirements

- Node.js + pnpm (provided by the [devenv](https://devenv.sh) shell; pnpm-only —
  `preinstall` enforces it).
- A running Panahon API backend (default `http://10.8.5.100:3000`).

## Development

```sh
devenv up          # install deps, wait for the backend, then run the dev server
# or, without the backend readiness gate:
pnpm dev
```

- The dev server binds **all interfaces** (`server.host = true`), so it is
  reachable at both `https://localhost:8000` and `https://<lan-ip>:8000`.
- It serves **HTTPS via mkcert**; use `https://`, not `http://`.
- Vite proxies `/api/v1` to `BACKEND_URL`, so the browser talks to the same
  origin and auth cookies work.

Other scripts:

| Command           | Description                             |
| ----------------- | --------------------------------------- |
| `pnpm dev`        | Astro dev server (live reload)          |
| `pnpm build`      | Production build (node standalone)      |
| `pnpm preview`    | Preview the production build            |
| `pnpm test:unit`  | Vitest (watch mode)                     |
| `devenv test`     | Vitest once (`vitest --run`)            |

Run a single test file:

```sh
pnpm exec vitest --run tests/unit/stores/user.test.ts
```

## Environment

`.env`, `.env.development`, `.env.test`, and `.env.production` are tracked and
hold only host/URL config.

| Variable              | Description                                                                 |
| --------------------- | --------------------------------------------------------------------------- |
| `APP_PORT`            | Dev server port (Astro `server.port`, default `4321`).                       |
| `APP_SITE`            | Canonical site URL (Astro `site`).                                           |
| `APP_HOST`            | Legacy bind host; the dev server now binds `0.0.0.0` regardless.             |
| `BACKEND_URL`         | Backend origin used by the Vite `/api/v1` proxy and the `devenv up` readiness check. |
| `PUBLIC_PANAHON_API`  | API base for the browser. **Relative (`/api/v1`) in dev** so requests are same-origin; absolute in production. Only `PUBLIC_`-prefixed vars reach the client. |
| `APP_BASE`            | Optional base path (defaults to `/`).                                        |

> `PUBLIC_`-prefixed values are read by the client at build time; keep
> `PUBLIC_PANAHON_API` relative in dev and absolute (e.g.
> `https://panahon.observatory.ph/data/api/v1`) in production, where a reverse
> proxy routes `/data/api/...` to the backend.

## Architecture

- `src/pages/**` — Astro pages (SSR); mount Vue islands with `client:load`.
- `src/layouts/Default.astro` — page shell; `NavBar.vue` is the client navbar.
- `src/components/**` — UI, grouped by domain (`stations/`, `users/`, `roles/`,
  `observations/`, `apiKeys/`, `auth/`); primitives in `components/ui/`.
- `src/stores/**` — nanostores atoms/computed **plus** the async API functions;
  responses are parsed with the zod schemas in `src/schemas/` (snake_case API
  types live in `src/types/`).
- `src/utils/axios.ts` — API client: `baseURL = PUBLIC_PANAHON_API`,
  `withCredentials`, and a single-flight 401 → `/tokens/renew` → retry interceptor.
- `src/components/auth/Guard.vue` — client-side role guard used by the
  `users`/`roles` pages (redirects unauthorized users home).

Uses the `@/*` → `src/*` alias.

## Formatting

Prettier (`.prettierrc.mjs`): 120 columns, 2 spaces, single quotes, no
semicolons, `vueIndentScriptAndStyle: true`.

> Never commit secrets. `.env` files here contain only host/URL config.
