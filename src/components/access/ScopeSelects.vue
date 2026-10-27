<script setup lang="ts">
  import { computed } from 'vue'

  import Select, { type SelectOption } from '@/components/ui/Select.vue'
  import { MAX_DAYS_OPTIONS } from '@/utils/access'

  const props = withDefaults(
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
      stationLabel: 'Stations',
      variableLabel: 'Variables',
      maxDaysLabel: 'Max days of history',
      allStationsLabel: 'All stations',
      allVariablesLabel: 'All variables',
    },
  )

  const historyOptions = computed(() => props.maxDaysOptions ?? MAX_DAYS_OPTIONS)

  const stations = defineModel<(string | number)[]>('stations', { default: () => [] })
  const variables = defineModel<(string | number)[]>('variables', { default: () => [] })
  const maxDays = defineModel<number>('maxDays', { default: 365 })
</script>

<template>
  <Select
    v-model="stations"
    :options="stationOptions"
    multiple
    :all-label="allStationsLabel"
    placeholder="Select stations…"
  >
    <slot name="station-label">{{ stationLabel }}</slot>
  </Select>
  <div class="flex items-end gap-3">
    <div class="w-1/3">
      <Select v-model="maxDays" :options="historyOptions">{{ maxDaysLabel }}</Select>
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
