import { defineConfig } from 'astro/config'
import { loadEnv } from 'vite'

import node from '@astrojs/node'
import vue from '@astrojs/vue'
import basicSsl from '@vitejs/plugin-basic-ssl'

import AutoImport from 'unplugin-auto-import/astro'
import Components from 'unplugin-vue-components/vite'

const { APP_HOST, APP_PORT, APP_SITE, APP_BASE } = loadEnv(process.env.NODE_ENV, process.cwd(), '')
const basePath = `${(APP_BASE ?? '/').replace(/\/$/, '')}/`

// https://astro.build/config
export default defineConfig({
  output: 'server',
  server: {
    host: APP_HOST,
    port: +APP_PORT,
  },
  site: APP_SITE,
  base: basePath,
  integrations: [
    vue({
      appEntrypoint: '/src/pages/_app',
    }),
    AutoImport({
      imports: [
        'vue',
        'vee-validate',
        {
          '@tanstack/vue-query': ['useQuery', 'useMutation', 'useQueryClient'],
          '@vee-validate/zod': ['toTypedSchema'],
        },
      ],
      dts: 'src/auto-imports.d.ts',
      dirs: ['src/composables'],
      vueTemplate: true,
    }),
  ],
  vite: {
    plugins: [
      Components({
        dts: 'src/vue-components.d.ts',
        directoryAsNamespace: true,
      }),
      basicSsl(),
    ],
    server: {
      proxy: {
        '/api/v1': `http://${APP_HOST}:3000/`,
      },
      https: true,
    },
    ssr: {
      noExternal: ['vuetify'],
    },
  },
  output: 'server',
  adapter: node({
    mode: 'standalone',
  }),
})
