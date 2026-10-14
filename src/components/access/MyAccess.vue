<template>
  <div class="flex flex-col gap-6 w-full max-w-3xl">
    <section v-if="isAdmin" class="bg-white rounded-lg p-4 shadow-sm">
      <h2 class="text-lg font-semibold mb-2">API access</h2>
      <p class="text-sm text-gray-600">
        As an admin you have unrestricted API access across all stations, variables and history — no request is needed.
      </p>
    </section>

    <template v-else>
      <section class="bg-white rounded-lg p-4 shadow-sm">
        <h2 class="text-lg font-semibold mb-2">Current access</h2>
        <div v-if="isLoading" class="text-gray-500">Loading…</div>
        <dl v-else-if="access" class="grid grid-cols-2 gap-2 text-sm">
          <dt class="text-gray-500">Stations</dt>
          <dd>{{ describeStations(access.station_ids) }}</dd>
          <dt class="text-gray-500">Variables</dt>
          <dd>{{ describeVariables(access.variables) }}</dd>
          <dt class="text-gray-500">Max days history</dt>
          <dd>{{ access.max_days_history }}</dd>
        </dl>
      </section>

      <section class="bg-white rounded-lg p-4 shadow-sm">
        <h2 class="text-lg font-semibold mb-3">Request additional access</h2>
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
          <Input name="reason" v-model="reason">Reason</Input>

          <div class="flex justify-end">
            <Button
              :disabled="!meta.valid || !meta.dirty"
              :is-pending="isPending"
              :class="[
                'text-gray-200',
                meta.valid && meta.dirty
                  ? 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-300'
                  : 'bg-blue-400 dark:bg-blue-500',
              ]"
              @click.prevent="onSubmit"
              >Submit request</Button
            >
          </div>
        </form>
      </section>

      <section class="bg-white rounded-lg p-4 shadow-sm">
        <h2 class="text-lg font-semibold mb-3">My requests</h2>
        <div v-if="!requests?.length" class="text-gray-500 text-sm">No requests yet.</div>
        <ul v-else class="divide-y divide-gray-200">
          <li v-for="r in requests" :key="r.id" class="flex items-center justify-between py-2 text-sm">
            <div class="flex flex-col">
              <span class="font-medium">#{{ r.id }} · {{ r.status }}</span>
              <span class="text-gray-500">{{ describeRequest(r) }}</span>
              <span v-if="r.review_note" class="text-gray-500">Note: {{ r.review_note }}</span>
            </div>
            <button
              v-if="r.status === 'pending'"
              class="text-red-500 hover:text-red-700"
              @click="cancel(r.id)"
              aria-label="Cancel request"
            >
              <div class="i-mdi:close-circle-outline text-xl"></div>
            </button>
          </li>
        </ul>
      </section>
    </template>
  </div>
</template>

<script setup lang="ts">
  import { computed, ref, watch } from 'vue'
  import { useStore } from '@nanostores/vue'
  import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
  import { useForm } from 'vee-validate'
  import { toTypedSchema } from '@vee-validate/zod'
  import { z } from 'zod'

  import { cancelAccessRequest, createAccessRequest, getMyAccess, listMyAccessRequests } from '@/stores/access'
  import { listAllStations } from '@/stores/station'
  import { $isAdmin } from '@/stores/user'
  import { ACCESS_VARIABLES } from '@/schemas/access'
  import type { AccessRequest, UserAccess } from '@/types/access'

  import Input from '@/components/ui/Input.vue'
  import Select, { MULTISELECT_ALL } from '@/components/ui/Select.vue'
  import Button from '@/components/ui/Button.vue'

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

  const queryClient = useQueryClient()
  const isAdmin = useStore($isAdmin)

  const { isLoading, data: access } = useQuery({ queryKey: ['access', 'me'], queryFn: getMyAccess })
  const { data: requests } = useQuery({ queryKey: ['access', 'me', 'requests'], queryFn: listMyAccessRequests })
  const { data: stations } = useQuery({ queryKey: ['stations', 'all'], queryFn: listAllStations })

  const approvedStations = ref<(string | number)[]>([])
  const approvedVariables = ref<(string | number)[]>([])

  const stationNames = computed(() => new Map((stations.value?.items ?? []).map((s) => [s.id, s.name])))
  const stationName = (id: number) => stationNames.value.get(id) ?? `#${id}`

  const stationOptions = computed(() =>
    (stations.value?.items ?? [])
      .filter((s) => !approvedStations.value.includes(s.id))
      .map((s) => ({ value: s.id, label: s.name })),
  )
  const variableOptions = computed(() =>
    ACCESS_VARIABLES.filter((v) => !approvedVariables.value.includes(v)).map((v) => ({ value: v, label: v })),
  )

  const value = z.union([z.string(), z.number()])
  const { defineField, handleSubmit, meta, values, resetForm } = useForm({
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

  const initialValues = (a?: UserAccess) => ({
    stations: [] as (string | number)[],
    variables: [] as (string | number)[],
    maxDays: normalizeMaxDays(a?.max_days_history),
    reason: '',
  })

  watch(
    access,
    (a) => {
      approvedStations.value = a?.station_ids ?? []
      approvedVariables.value = a?.variables ?? []
      resetForm({ values: initialValues(a) })
    },
    { immediate: true },
  )

  const { isPending, mutate } = useMutation({
    mutationKey: ['access', 'requests', 'create'],
    mutationFn: () =>
      createAccessRequest({
        all_stations: hasAll(values.stations ?? []),
        station_ids: selectedIDs(values.stations ?? []).map(Number),
        all_variables: hasAll(values.variables ?? []),
        variables: selectedIDs(values.variables ?? []).map(String),
        max_days_history: values.maxDays,
        reason: values.reason ?? '',
      }),
    onSuccess: () => {
      resetForm({ values: initialValues(access.value) })
      queryClient.invalidateQueries({ queryKey: ['access', 'me', 'requests'] })
    },
  })

  const onSubmit = handleSubmit(() => mutate())

  const { mutate: doCancel } = useMutation({
    mutationKey: ['access', 'requests', 'cancel'],
    mutationFn: cancelAccessRequest,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['access', 'me', 'requests'] }),
  })

  const describeStations = (ids: number[] | null) =>
    ids === null ? 'All' : ids.length ? ids.map(stationName).join(', ') : 'None'
  const describeVariables = (vars: string[] | null) => (vars === null ? 'All' : vars.length ? vars.join(', ') : 'None')
  const describeRequest = (r: AccessRequest) => {
    const parts: string[] = []
    if (r.all_stations) parts.push('all stations')
    else if (r.station_ids?.length) parts.push(`stations ${r.station_ids.map(stationName).join(', ')}`)
    if (r.all_variables) parts.push('all variables')
    else if (r.variables?.length) parts.push(r.variables.join(', '))
    if (r.max_days_history) parts.push(`${r.max_days_history}d`)
    return parts.join(' · ') || '—'
  }

  const cancel = (id: number) => doCancel(id)
</script>
