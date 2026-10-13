<template>
  <nav class="flex flex-col gap-1 flex-1">
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

    <div v-if="settings.length" class="mt-2">
      <div v-if="expanded" class="px-3 pt-2 pb-1 text-[11px] uppercase tracking-wide text-gray-400">Settings</div>
      <div v-else class="mx-2 my-1 border-t border-gray-200"></div>
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
    </div>
  </nav>
</template>

<script setup lang="ts">
  import { useStore } from '@nanostores/vue'

  import { $activeRoute, $mainRoutes, $settingRoutes, setActiveRoute, type Route } from '@/stores/routes'

  const props = withDefaults(defineProps<{ expanded?: boolean }>(), { expanded: true })

  const emit = defineEmits<{ navigate: [] }>()

  const main = useStore($mainRoutes)
  const settings = useStore($settingRoutes)
  const active = useStore($activeRoute)

  const iconClass = (icon: string) => `i-${icon.replace('-', ':')}`

  const linkClass = (r: Route) => [
    'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium',
    !props.expanded && 'justify-center px-0',
    active.value?.name === r.name ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100',
  ]

  const go = (r: Route) => {
    setActiveRoute(r)
    emit('navigate')
  }
</script>
