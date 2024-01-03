/// <reference types="vitest" />
import { getViteConfig } from 'astro/config'

import Vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'

export default getViteConfig({
  plugins: [
    Vue(),
    AutoImport({
      imports: [
        'vue',
        'vee-validate',
        {
          axios: [['default', 'axios']],
          '@tanstack/vue-query': ['useQuery', 'useMutation', 'useQueryClient'],
          '@vee-validate/zod': ['toTypedSchema'],
        },
      ],
      dts: 'src/auto-imports.d.ts',
      vueTemplate: true,
    }),
  ],
  test: {
    globals: true,
    environment: 'jsdom',
    server: {
      deps: {
        inline: ['vuetify'],
      },
    },
    include: ['tests/unit/**/*.{spec,test}.?(c|m)[jt]s?(x)'],
  },
})
