<template>
  <div class="bg-white rounded-lg p-4 shadow-sm border border-gray-100 flex items-start gap-3">
    <div v-if="icon" :class="iconClass" class="text-2xl text-blue-600 shrink-0"></div>
    <div class="min-w-0">
      <div class="text-xs uppercase tracking-wide text-gray-400">{{ label }}</div>
      <div class="text-2xl font-semibold text-gray-800 truncate">{{ value }}</div>
      <div v-if="hint" class="text-xs text-gray-500 truncate">{{ hint }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
  const props = defineProps<{ label: string; value: string | number; hint?: string; icon?: string }>()

  const iconClass = props.icon ? `i-${props.icon.replace('-', ':')}` : ''
</script>
