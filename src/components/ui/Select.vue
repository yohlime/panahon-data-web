<script lang="ts">
  export const MULTISELECT_ALL = '__all__'

  export type SelectOption =
    | string
    | number
    | { value: string | number; label?: string; text?: string; disabled?: boolean }
</script>

<script setup lang="ts">
  import { computed, ref } from 'vue'
  import { PopoverContent, PopoverPortal, PopoverRoot, PopoverTrigger } from 'reka-ui'

  const props = withDefaults(
    defineProps<{
      name?: string
      options: SelectOption[]
      placeholder?: string
      multiple?: boolean
      allLabel?: string
      locked?: (string | number)[]
      errorMessage?: string
    }>(),
    { name: '', placeholder: 'Select…', multiple: false, allLabel: '', locked: () => [], errorMessage: '' },
  )

  const model = defineModel<string | number | (string | number)[]>()

  const open = ref(false)
  const query = ref('')

  const normalized = computed(() =>
    props.options.map((o) =>
      typeof o === 'string' || typeof o === 'number'
        ? { value: o, label: String(o), disabled: false }
        : { value: o.value, label: o.label ?? o.text ?? String(o.value), disabled: o.disabled ?? false },
    ),
  )

  const selectedArray = computed(() => (Array.isArray(model.value) ? model.value : []))
  const allChecked = computed(() => props.multiple && selectedArray.value.includes(MULTISELECT_ALL))

  const selectedLabel = computed(() => {
    if (props.multiple) return ''
    return normalized.value.find((o) => o.value === model.value)?.label ?? ''
  })

  const filtered = computed(() => {
    const q = query.value.trim().toLowerCase()
    return q ? normalized.value.filter((o) => o.label.toLowerCase().includes(q)) : normalized.value
  })

  const labelFor = (value: string | number) =>
    value === MULTISELECT_ALL
      ? props.allLabel || 'All'
      : (normalized.value.find((o) => o.value === value)?.label ?? String(value))

  const isSelected = (value: string | number) => (props.multiple ? allChecked.value || selectedArray.value.includes(value) : model.value === value)

  const toggle = (value: string | number) => {
    const current = selectedArray.value
    if (allChecked.value) {
      model.value = normalized.value.map((o) => o.value).filter((v) => v !== value)
      return
    }
    model.value = current.includes(value) ? current.filter((v) => v !== value) : [...current, value]
  }

  const toggleAll = () => {
    model.value = allChecked.value ? [...props.locked] : [MULTISELECT_ALL]
  }

  const remove = (value: string | number) => {
    model.value = value === MULTISELECT_ALL ? [...props.locked] : selectedArray.value.filter((v) => v !== value)
  }

  const onRowClick = (value: string | number) => {
    if (props.multiple) {
      toggle(value)
    } else {
      model.value = value
      open.value = false
    }
  }
</script>

<template>
  <div>
    <label v-if="$slots.default" :for="name" class="block mb-1 text-sm font-medium text-gray-900"><slot /></label>
    <PopoverRoot v-model:open="open">
      <PopoverTrigger as-child>
        <button
          type="button"
          :id="name"
          class="flex min-h-[42px] w-full flex-wrap items-center gap-1 rounded-lg border border-gray-300 bg-gray-50 px-3 py-2.5 text-left focus:ring-2 focus:ring-mo-Blue/40"
        >
          <template v-if="multiple">
            <span
              v-for="val in selectedArray"
              :key="val"
              class="inline-flex items-center gap-1 rounded bg-mo-Blue/10 px-2 py-0.5 text-xs text-mo-Blue"
            >
              {{ labelFor(val) }}
              <span role="button" aria-label="Remove" @click.stop="remove(val)">
                <div class="i-mdi:close text-xs"></div>
              </span>
            </span>
            <span v-if="!selectedArray.length" class="text-sm text-gray-400">{{ placeholder }}</span>
          </template>
          <span v-else :class="['text-sm', selectedLabel ? 'text-gray-900' : 'text-gray-400']">
            {{ selectedLabel || placeholder }}
          </span>
          <div class="ml-auto text-gray-500">
            <div class="i-mdi:chevron-down"></div>
          </div>
        </button>
      </PopoverTrigger>
      <PopoverPortal>
        <PopoverContent
          class="z-[100] mt-1 w-[var(--reka-popover-trigger-width)] rounded-lg border border-gray-200 bg-white p-1 shadow-md focus:outline-none"
          :side-offset="4"
        >
          <input
            v-model="query"
            placeholder="Search…"
            class="mb-1 w-full rounded border border-gray-200 bg-gray-50 px-2 py-1 text-sm outline-none"
          />
          <div v-if="multiple && allLabel" class="mb-1 border-b border-gray-100 pb-1">
            <div
              class="flex cursor-pointer items-center gap-2 rounded px-2 py-1 text-sm text-gray-700 hover:bg-gray-100"
              @click="toggleAll"
            >
              <div class="w-4"><div v-show="allChecked" class="i-mdi:check"></div></div>
              <span>{{ allLabel }}</span>
            </div>
          </div>
          <div class="max-h-56 overflow-auto">
            <div v-if="!filtered.length" class="px-2 py-1 text-sm text-gray-500">No results</div>
            <div
              v-for="opt in filtered"
              :key="opt.value"
              :class="[
                'flex items-center gap-2 rounded px-2 py-1 text-sm',
                opt.disabled ? 'cursor-not-allowed text-gray-400' : 'cursor-pointer text-gray-700 hover:bg-gray-100',
              ]"
              @click="!opt.disabled && onRowClick(opt.value)"
            >
              <div class="w-4"><div v-show="isSelected(opt.value)" class="i-mdi:check"></div></div>
              <span>{{ opt.label }}</span>
            </div>
          </div>
        </PopoverContent>
      </PopoverPortal>
    </PopoverRoot>
    <p v-show="errorMessage" class="mt-2 text-sm text-red-600">{{ errorMessage }}</p>
  </div>
</template>
