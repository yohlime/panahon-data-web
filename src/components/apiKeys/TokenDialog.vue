<template>
  <div class="flex flex-col gap-4">
    <h1 class="text-xl font-bold leading-tight tracking-tight text-green-600 md:text-2xl dark:text-white">
      API Key Created
    </h1>
    <p class="text-sm text-gray-600">Make sure to copy your API key now. You won't be able to see it again!</p>
    <div class="flex gap-2">
      <code class="flex-1 bg-gray-100 p-3 rounded break-all text-sm">{{ token }}</code>
      <Button @click="copyToken">
        <div class="i-mdi:content-copy"></div>
      </Button>
    </div>
    <div class="flex justify-end">
      <Button @click="emit('close')">Done</Button>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { toRefs } from 'vue'

  const props = defineProps<{ token: string }>()

  const emit = defineEmits<{
    close: []
  }>()

  const { token } = toRefs(props)

  const copyToken = async () => {
    await navigator.clipboard.writeText(token.value)
  }
</script>
