import type { App } from 'vue'

import '@mdi/font/css/materialdesignicons.css'

// Vuetify
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import 'vuetify/styles'

import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query'

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 5000 } },
})

export default function setup(app: App) {
  const vuetify = createVuetify({
    ssr: true,
    components,
    directives,
  })
  app.use(vuetify)
  app.use(VueQueryPlugin, {
    queryClient,
  })
}
