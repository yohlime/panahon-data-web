import { defineConfig } from 'astro/config'
import { loadEnv } from 'vite'

import node from '@astrojs/node'
import vue from '@astrojs/vue'

import UnoCSS from 'unocss/astro'
import mkcert from 'vite-plugin-mkcert'

const { APP_HOST, APP_PORT, APP_SITE, APP_BASE } = loadEnv(process.env.NODE_ENV, process.cwd(), '')
const basePath = `${(APP_BASE ?? '/').replace(/\/$/, '')}/`

// https://astro.build/config
export default defineConfig({
  server: {
    host: APP_HOST,
    port: +APP_PORT,
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
    plugins: [mkcert()],
    server: {
      proxy: {
        '/api/v1': `http://${APP_HOST}:3000/`,
      },
    },
  },
  output: 'server',
  adapter: node({
    mode: 'standalone',
  }),
})
