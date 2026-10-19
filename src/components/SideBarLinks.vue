<template>
  <nav class="flex flex-col gap-1 flex-1">
    <template v-if="group === 'settings'">
      <div v-if="expanded" class="px-3 pt-2 pb-1 text-[11px] uppercase tracking-wide text-gray-400">Settings</div>
      <a
        v-for="r in settings"
        :key="r.name"
        :href="r.to"
        :title="r.title"
        :class="linkClass(r)"
        @click="go(r)"
      >
        <div :class="iconClass(r.icon)" class="text-lg shrink-0"></div>
        <span v-if="expanded" class="truncate">{{ r.title }}</span>
      </a>
    </template>

    <template v-else>
      <a
        v-for="r in main"
        :key="r.name"
        :href="r.to"
        :title="r.title"
        :class="linkClass(r)"
        @click="go(r)"
      >
        <div :class="iconClass(r.icon)" class="text-lg shrink-0"></div>
        <span v-if="expanded" class="truncate">{{ r.title }}</span>
      </a>
    </template>
  </nav>
</template>

<script setup lang="ts">
  import { useStore } from '@nanostores/vue'

  import { $mainRoutes, $settingRoutes, setActiveRoute, type Route, type RouteGroup } from '@/stores/routes'

  const props = withDefaults(defineProps<{ expanded?: boolean; group?: RouteGroup; activeName?: string }>(), {
    expanded: true,
    group: 'main',
    activeName: '',
  })

  const emit = defineEmits<{ navigate: [] }>()

  const main = useStore($mainRoutes)
  const settings = useStore($settingRoutes)

  const iconClass = (icon: string) => `i-${icon.replace('-', ':')}`

  const linkClass = (r: Route) => [
    'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium',
    !props.expanded && 'justify-center px-0',
    props.activeName === r.name ? 'bg-mo-Blue text-white' : 'text-gray-700 hover:bg-gray-100',
  ]

  const go = (r: Route) => {
    setActiveRoute(r)
    emit('navigate')
  }
</script>
