<template>
  <!-- Desktop: collapsible rail -->
  <CollapsibleRoot
    v-model:open="expanded"
    class="hidden md:flex flex-col shrink-0 bg-white border-r border-gray-200 transition-[width] duration-200"
    :class="expanded ? 'w-52' : 'w-14'"
  >
    <SideBarLinks :expanded="expanded" />
    <CollapsibleTrigger as-child>
      <button
        class="m-2 p-2 rounded-lg text-gray-500 hover:bg-gray-100"
        :aria-label="expanded ? 'Collapse sidebar' : 'Expand sidebar'"
      >
        <div :class="expanded ? 'i-mdi:chevron-left' : 'i-mdi:chevron-right'" class="text-lg"></div>
      </button>
    </CollapsibleTrigger>
  </CollapsibleRoot>

  <!-- Mobile: off-canvas drawer -->
  <DialogRoot :open="open" @update:open="setMobileNavOpen">
    <DialogPortal>
      <DialogOverlay class="fixed inset-0 z-30 bg-gray-900/40 md:hidden" />
      <DialogContent
        class="fixed left-0 top-0 z-40 h-full w-64 bg-white p-4 shadow-lg focus:outline-none md:hidden"
        :aria-describedby="undefined"
      >
        <DialogTitle class="mb-4 text-lg font-bold text-gray-900">Menu</DialogTitle>
        <SideBarLinks @navigate="setMobileNavOpen(false)" />
        <DialogClose
          class="absolute right-4 top-4 rounded-full p-1 text-gray-500 hover:bg-gray-100"
          aria-label="Close menu"
        >
          <div class="i-mdi:close text-xl"></div>
        </DialogClose>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>

<script setup lang="ts">
  import { onMounted, ref } from 'vue'
  import { useStore } from '@nanostores/vue'
  import {
    CollapsibleRoot,
    CollapsibleTrigger,
    DialogClose,
    DialogContent,
    DialogOverlay,
    DialogPortal,
    DialogRoot,
    DialogTitle,
  } from 'reka-ui'

  import { $routes, setActiveRoute } from '@/stores/routes'
  import { $mobileNavOpen, setMobileNavOpen } from '@/stores/ui'

  import SideBarLinks from '@/components/SideBarLinks.vue'

  const routes = useStore($routes)
  const open = useStore($mobileNavOpen)

  const expanded = ref(true)

  onMounted(() => {
    const path = window.location.pathname.replace(/\/$/, '')
    const match = routes.value.filter((r) => r.visible).find((r) => r.to.replace(/\/$/, '') === path)
    if (match) setActiveRoute(match)
  })
</script>
