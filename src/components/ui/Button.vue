<template>
  <button
    type="submit"
    :class="[
      'flex justify-center items-center gap-1 font-medium rounded-lg text-sm px-5 py-2.5 text-center',
      !disabled ? 'focus:ring-4 focus:outline-none' : 'cursor-not-allowed',
    ]"
    :disabled="disabled || isPending"
  >
    <div v-show="isPending" class="relative">
      <div class="absolute text-white/50 i-mdi:checkbox-blank-circle-outline"></div>
      <div class="text-white i-mdi:loading animate-spin"></div>
    </div>
    <slot v-if="!isPending" />
    <span v-else>{{ pendingText }}</span>
  </button>
</template>

<script setup lang="ts">
  withDefaults(defineProps<{ disabled?: boolean; isPending?: boolean; pendingText?: string }>(), {
    disabled: false,
    isPending: false,
    pendingText: 'Processing...',
  })
</script>
