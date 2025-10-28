<template>
  <div>
    <label :for="name" class="block mb-1 text-sm font-medium text-gray-900 dark:text-white"><slot /></label>
    <SelectRoot v-model="modelValue">
      <SelectTrigger
        class="w-full inline-flex items-center justify-between rounded-lg p-4 leading-none bg-gray-50 border border-gray-300 text-gray-900 focus:ring-blue-600 focus:border-blue-600 outline-none"
        aria-label="Customise options"
      >
        <SelectValue :placeholder="placeholder" />
        <div class="i-mdi:chevron-down h-3.5 w-3.5" />
      </SelectTrigger>

      <SelectPortal>
        <SelectContent
          class="bg-white rounded-lg border shadow-sm will-change-[opacity,transform] data-[side=top]:animate-slideDownAndFade data-[side=right]:animate-slideLeftAndFade data-[side=bottom]:animate-slideUpAndFade data-[side=left]:animate-slideRightAndFade z-[100]"
          :side-offset="5"
        >
          <SelectScrollUpButton class="flex items-center justify-center h-4 bg-white text-gray-800 cursor-default">
            <div class="i-mdi:chevron-up" />
          </SelectScrollUpButton>

          <SelectViewport class="p-1">
            <SelectItem
              v-for="(option, index) in options"
              :key="index"
              class="text-xs leading-none text-gray-700 rounded-sm flex items-center h-6 pr-2.5 pl-4.5 relative select-none data-[disabled]:text-gray-400 data-[disabled]:pointer-events-none data-[highlighted]:outline-none data-[highlighted]:bg-blue-500 data-[highlighted]:text-blue-100"
              :value="getValue(option)"
              :disabled="isDisabled(option)"
            >
              <SelectItemIndicator class="absolute left-0 w-4 inline-flex items-center justify-center">
                <div class="i-mdi:check" />
              </SelectItemIndicator>
              <SelectItemText>
                {{ getText(option) }}
              </SelectItemText>
            </SelectItem>
          </SelectViewport>

          <SelectScrollDownButton class="flex items-center justify-center h-4 bg-white text-gray-800 cursor-default">
            <div class="i-mdi:chevron-down" />
          </SelectScrollDownButton>
        </SelectContent>
      </SelectPortal>
    </SelectRoot>
  </div>
</template>

<script setup lang="ts" generic="T extends Option">
  import {
    SelectContent,
    SelectItem,
    SelectItemIndicator,
    SelectItemText,
    SelectPortal,
    SelectRoot,
    SelectScrollDownButton,
    SelectScrollUpButton,
    SelectTrigger,
    SelectValue,
    SelectViewport,
  } from 'reka-ui'

  export type Option = string | number | { value: string | number; text: string; disabled?: boolean }

  withDefaults(
    defineProps<{
      name: string
      options: T[]
      placeholder?: string
    }>(),
    {
      placeholder: 'Select an item',
    },
  )

  const modelValue = defineModel<string | number>()

  const getText = (opt: T) => {
    if (typeof opt === 'string') {
      return opt
    } else if (typeof opt === 'number') {
      return `${opt}`
    }
    return opt.text
  }

  const getValue = (opt: T) => (typeof opt === 'string' || typeof opt === 'number' ? opt : opt.value)

  const isDisabled = (opt: T) => (typeof opt === 'string' || typeof opt === 'number' ? false : (opt?.disabled ?? false))
</script>
