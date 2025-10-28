<template>
  <div>
    <NumberFieldRoot
      v-model="model"
      :id="name"
      :min="min"
      :max="max"
      :default-value="defaultValue"
      :step="step"
      :format-options="formatOptions"
    >
      <label :for="name" class="block mb-1 text-sm font-medium text-gray-900 dark:text-white"><slot /></label>
      <div
        class="flex items-center bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-blue-600 focus-border-blue-600 w-full py-1 px-0.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
      >
        <NumberFieldDecrement class="px-1 py-2 disabled:opacity-20">
          <div class="i-mdi:minus text-xs" />
        </NumberFieldDecrement>
        <NumberFieldInput class="bg-transparent tabular-nums text-center focus:outline-0 p-0.5 w-18" />
        <NumberFieldIncrement class="px-1 py-2 disabled:opacity-20">
          <div class="i-mdi:plus text-xs" />
        </NumberFieldIncrement>
      </div>
    </NumberFieldRoot>
    <p v-show="errorMessage" class="mt-2 text-sm text-red-600 dark:text-red-500">
      {{ errorMessage }}
    </p>
  </div>
</template>

<script setup lang="ts">
  import { NumberFieldDecrement, NumberFieldIncrement, NumberFieldInput, NumberFieldRoot } from 'reka-ui'

  withDefaults(
    defineProps<{
      name: string
      placeholder?: string
      errorMessage?: string
      defaultValue?: number
      min?: number
      max?: number
      step?: number
      formatOptions?: any
    }>(),
    {
      placeholder: '',
      required: false,
      errorMessage: '',
      defaultValue: 0,
      step: 1,
      formatOptions: {
        signDisplay: 'exceptZero',
      },
    },
  )

  const model = defineModel<number>()
</script>
