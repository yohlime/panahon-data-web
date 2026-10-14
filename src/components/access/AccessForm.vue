<script lang="ts">
  export type AccessFormValues = {
    all_stations: boolean
    station_ids: number[]
    all_variables: boolean
    variables: string[]
    max_days_history: number
    reason: string
  }
</script>

<script setup lang="ts">
  import { watch } from 'vue'
  import { useForm } from 'vee-validate'
  import { toTypedSchema } from '@vee-validate/zod'
  import { z } from 'zod'

  import Input from '@/components/ui/Input.vue'
  import Select, { MULTISELECT_ALL, type SelectOption } from '@/components/ui/Select.vue'
  import Button from '@/components/ui/Button.vue'

  const props = withDefaults(
    defineProps<{
      stationOptions: SelectOption[]
      variableOptions: SelectOption[]
      initialStations?: (string | number)[]
      initialVariables?: (string | number)[]
      initialMaxDays?: number
      initialReason?: string
      isPending?: boolean
      submitLabel?: string
      cancelLabel?: string
      showReason?: boolean
      requireDirty?: boolean
    }>(),
    {
      initialStations: () => [],
      initialVariables: () => [],
      initialMaxDays: 365,
      initialReason: '',
      isPending: false,
      submitLabel: 'Save',
      cancelLabel: '',
      showReason: false,
      requireDirty: false,
    },
  )

  const emit = defineEmits<{ submit: [values: AccessFormValues]; cancel: [] }>()

  const maxDaysOptions = [
    { value: 365, text: '1 year' },
    { value: 730, text: '2 years' },
    { value: 1095, text: '3 years' },
    { value: 1825, text: '5 years' },
    { value: 3650, text: '10 years' },
    { value: -1, text: 'Unlimited' },
  ]
  const allowedMaxDays = maxDaysOptions.map((o) => o.value)
  const normalizeMaxDays = (m?: number) => (m !== undefined && allowedMaxDays.includes(m) ? m : 365)

  const value = z.union([z.string(), z.number()])
  const { defineField, meta, values, resetForm } = useForm({
    validationSchema: toTypedSchema(
      z.object({
        stations: z.array(value),
        variables: z.array(value),
        maxDays: z.number(),
        reason: z.string().optional(),
      }),
    ),
    initialValues: { stations: [], variables: [], maxDays: 365, reason: '' },
  })

  const [stationSelection] = defineField('stations')
  const [variableSelection] = defineField('variables')
  const [maxDays] = defineField('maxDays')
  const [reason] = defineField('reason')

  const selectedIDs = (v: (string | number)[]) => v.filter((x) => x !== MULTISELECT_ALL)
  const hasAll = (v: (string | number)[]) => v.includes(MULTISELECT_ALL)

  const reset = () =>
    resetForm({
      values: {
        stations: [...props.initialStations],
        variables: [...props.initialVariables],
        maxDays: normalizeMaxDays(props.initialMaxDays),
        reason: props.initialReason,
      },
    })

  watch(
    () => [props.initialStations, props.initialVariables, props.initialMaxDays, props.initialReason],
    reset,
    { immediate: true, deep: true },
  )

  const onSubmit = () => {
    if (!meta.value.valid) return
    if (props.requireDirty && !meta.value.dirty) return

    emit('submit', {
      all_stations: hasAll(values.stations ?? []),
      station_ids: selectedIDs(values.stations ?? []).map(Number),
      all_variables: hasAll(values.variables ?? []),
      variables: selectedIDs(values.variables ?? []).map(String),
      max_days_history: values.maxDays ?? 365,
      reason: values.reason ?? '',
    })
  }

  defineExpose({ reset })
</script>

<template>
  <form class="flex flex-col gap-3" @submit.prevent="onSubmit">
    <Select
      v-model="stationSelection"
      :options="stationOptions"
      multiple
      all-label="All stations"
      placeholder="Select stations…"
      >Stations</Select
    >
    <div class="flex items-end gap-3">
      <div class="w-1/3">
        <Select name="max-days" v-model="maxDays" :options="maxDaysOptions">Max days of history</Select>
      </div>
      <div class="flex-1">
        <Select
          v-model="variableSelection"
          :options="variableOptions"
          multiple
          all-label="All variables"
          placeholder="Select variables…"
          >Variables</Select
        >
      </div>
    </div>
    <Input v-if="showReason" name="reason" v-model="reason">Reason</Input>

    <div class="flex justify-end gap-2">
      <Button
        v-if="cancelLabel"
        type="button"
        class="bg-gray-200 border border-gray-400 hover:bg-gray-300"
        @click="emit('cancel')"
        >{{ cancelLabel }}</Button
      >
      <Button
        :disabled="!meta.valid || (requireDirty && !meta.dirty)"
        :is-pending="isPending"
        :class="[
          'text-gray-200',
          meta.valid && (!requireDirty || meta.dirty)
            ? 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-300'
            : 'bg-blue-400 dark:bg-blue-500',
        ]"
        @click.prevent="onSubmit"
        >{{ submitLabel }}</Button
      >
    </div>
  </form>
</template>
