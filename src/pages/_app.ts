import type { App } from 'vue'

import { VueQueryPlugin } from '@tanstack/vue-query'

export default function setup(app: App) {
  app.use(VueQueryPlugin, {})
}
