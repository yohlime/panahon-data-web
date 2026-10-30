import { defineConfig } from 'astro/config'
import { loadEnv } from 'vite'

import node from '@astrojs/node'
import vue from '@astrojs/vue'

import UnoCSS from 'unocss/astro'
import mkcert from 'vite-plugin-mkcert'

const { APP_PORT, APP_SITE, APP_BASE, BACKEND_URL } = loadEnv(process.env.NODE_ENV, process.cwd(), '')
const basePath = `${(APP_BASE ?? '/').replace(/\/$/, '')}/`
// mkcert is for the local HTTPS dev server; CI only builds and does not need it.
const isCI = Boolean(process.env.CI)

// https://astro.build/config
export default defineConfig({
  server: {
    // Bind every interface (localhost + LAN IP) to match the Docker deployment,
    // instead of a single configured host.
    host: true,
    port: +(APP_PORT ?? 4321),
  },
  site: APP_SITE,
  base: basePath,
  integrations: [
    UnoCSS(),
    vue({
      appEntrypoint: '/src/pages/_app',
    }),
  ],
  vite: {
    plugins: isCI ? [] : [mkcert()],
    server: {
      proxy: BACKEND_URL ? { '/api/v1': `${BACKEND_URL}/` } : {},
    },
  },
  output: 'server',
  adapter: node({
    mode: 'standalone',
  }),
})
