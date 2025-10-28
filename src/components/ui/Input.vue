<template>
  <div>
    <label :for="name" class="block mb-1 text-sm font-medium text-gray-900 dark:text-white"><slot /></label>
    <div class="relative">
      <input
        :type="type === 'password' && reveal ? 'text' : type"
        :name="name"
        :id="name"
        v-model="model"
        :class="[
          'bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-blue-600 focus:border-blue-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500',
          { 'pe-10': withIconEnd },
        ]"
        :placeholder="placeholder"
        :required="required"
      />
      <div v-if="withIconEnd" :class="['absolute inset-y-0 end-0 top-0 flex items-center', { 'pe-3.5': withIconEnd }]">
        <div v-if="!reveal" class="i-mdi:eye text-xl" @click="reveal = true"></div>
        <div v-else class="i-mdi:eye-off text-xl" @click="reveal = false"></div>
      </div>
    </div>
    <p v-show="errorMessage" class="mt-2 text-sm text-red-600 dark:text-red-500">
      {{ errorMessage }}
    </p>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, toRefs } from 'vue'

  const props = withDefaults(
    defineProps<{
      name: string
      type?: string
      placeholder?: string
      required?: boolean
      errorMessage?: string
    }>(),
    {
      type: 'text',
      placeholder: '',
      required: false,
      errorMessage: '',
    },
  )

  const model = defineModel()

  const reveal = ref(false)

  const { type } = toRefs(props)

  const withIconEnd = computed(() => type.value === 'password')
</script>
