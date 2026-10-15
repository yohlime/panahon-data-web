<script lang="ts">
  export const MAX_DAYS_OPTIONS = [
    { value: 365, text: '1 year' },
    { value: 730, text: '2 years' },
    { value: 1095, text: '3 years' },
    { value: 1825, text: '5 years' },
    { value: 3650, text: '10 years' },
    { value: -1, text: 'Unlimited' },
  ]

  export const normalizeMaxDays = (m?: number) =>
    m !== undefined && MAX_DAYS_OPTIONS.some((o) => o.value === m) ? m : 365
</script>

<script setup lang="ts">
  import Select, { type SelectOption } from '@/components/ui/Select.vue'

  withDefaults(
    defineProps<{
      stationOptions: SelectOption[]
      variableOptions: SelectOption[]
      maxDaysOptions?: { value: number; text: string }[]
      stationLabel?: string
      variableLabel?: string
      maxDaysLabel?: string
      allStationsLabel?: string
      allVariablesLabel?: string
    }>(),
    {
      maxDaysOptions: () => MAX_DAYS_OPTIONS,
      stationLabel: 'Stations',
      variableLabel: 'Variables',
      maxDaysLabel: 'Max days of history',
      allStationsLabel: 'All stations',
      allVariablesLabel: 'All variables',
    },
  )

  const stations = defineModel<(string | number)[]>('stations', { default: () => [] })
  const variables = defineModel<(string | number)[]>('variables', { default: () => [] })
  const maxDays = defineModel<number>('maxDays', { default: 365 })
</script>

<template>
  <Select v-model="stations" :options="stationOptions" multiple :all-label="allStationsLabel" placeholder="Select stations…">
    <slot name="station-label">{{ stationLabel }}</slot>
  </Select>
  <div class="flex items-end gap-3">
    <div class="w-1/3">
      <Select v-model="maxDays" :options="maxDaysOptions">{{ maxDaysLabel }}</Select>
    </div>
    <div class="flex-1">
      <Select
        v-model="variables"
        :options="variableOptions"
        multiple
        :all-label="allVariablesLabel"
        placeholder="Select variables…"
      >
        <slot name="variable-label">{{ variableLabel }}</slot>
      </Select>
    </div>
  </div>
</template>
