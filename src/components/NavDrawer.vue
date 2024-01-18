<template>
  <v-navigation-drawer color="blue-darken-3" expand-on-hover rail>
    <v-list density="compact" nav>
      <v-list-item
        v-for="(item, i) in visiblePages"
        :key="i"
        @click="handleItemClick(item)"
        color="primary"
        variant="plain"
        data-testid="list-item"
      >
        <template v-slot:prepend>
          <v-icon
            :icon="item.icon"
            :color="item.name === activeRoute?.name ? 'light-blue-lighten-5' : 'blue-grey-lighten-2'"
          ></v-icon>
        </template>

        <v-list-item-title v-text="item.title"></v-list-item-title>
      </v-list-item>
    </v-list>
  </v-navigation-drawer>
</template>

<script setup lang="ts">
  import { useStore } from '@nanostores/vue'

  import { $activeRoute, $routes, basePath, setActiveRoute, type Route } from '@/stores/routes'

  const routes = useStore($routes)
  const activeRoute = useStore($activeRoute)

  const visiblePages = computed(() => routes.value.filter((p) => p.visible))

  const handleItemClick = (item: Route) => {
    setActiveRoute(item)
    location.assign(`${basePath}${item.to}`)
  }
</script>
