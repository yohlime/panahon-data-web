<template>
  <div class="flex flex-col gap-6 w-full max-w-3xl">
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
      <form class="flex flex-col gap-3" @submit.prevent="handleSubmit">
        <Input name="station-ids" v-model="form.stationIDs">Station IDs (comma-separated)</Input>
        <label class="flex items-center gap-2 text-sm">
          <input type="checkbox" v-model="form.allStations" /> All stations
        </label>

        <div>
          <div class="text-sm font-medium text-gray-900 mb-1">Variables</div>
          <div class="flex flex-wrap gap-3">
            <label v-for="v in ACCESS_VARIABLES" :key="v" class="flex items-center gap-1 text-sm">
              <input type="checkbox" :value="v" v-model="form.variables" /> {{ v }}
            </label>
          </div>
          <label class="flex items-center gap-2 text-sm mt-2">
            <input type="checkbox" v-model="form.allVariables" /> All variables
          </label>
        </div>

        <Input name="max-days" type="number" v-model="form.maxDays">Max days of history (max 365)</Input>
        <Input name="reason" v-model="form.reason">Reason</Input>

        <div class="flex justify-end">
          <Button
            :is-pending="isPending"
            class="text-gray-200 bg-blue-600 hover:bg-blue-700 focus:ring-blue-300"
            @click.prevent="handleSubmit"
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
  </div>
</template>

<script setup lang="ts">
  import { reactive } from 'vue'
  import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'

  import {
    cancelAccessRequest,
    createAccessRequest,
    getMyAccess,
    listMyAccessRequests,
  } from '@/stores/access'
  import { ACCESS_VARIABLES } from '@/schemas/access'
  import type { AccessRequest } from '@/types/access'

  import Input from '@/components/ui/Input.vue'
  import Button from '@/components/ui/Button.vue'

  const queryClient = useQueryClient()

  const { isLoading, data: access } = useQuery({ queryKey: ['access', 'me'], queryFn: getMyAccess })
  const { data: requests } = useQuery({ queryKey: ['access', 'me', 'requests'], queryFn: listMyAccessRequests })

  const form = reactive({
    stationIDs: '',
    allStations: false,
    variables: [] as string[],
    allVariables: false,
    maxDays: '',
    reason: '',
  })

  const parseIDs = (s: string) =>
    s
      .split(',')
      .map((v) => v.trim())
      .filter((v) => v !== '')
      .map(Number)
      .filter((v) => !Number.isNaN(v))

  const { isPending, mutate } = useMutation({
    mutationKey: ['access', 'requests', 'create'],
    mutationFn: () =>
      createAccessRequest({
        station_ids: parseIDs(form.stationIDs),
        all_stations: form.allStations,
        variables: form.variables,
        all_variables: form.allVariables,
        max_days_history: form.maxDays ? Number(form.maxDays) : undefined,
        reason: form.reason,
      }),
    onSuccess: () => {
      form.stationIDs = ''
      form.allStations = false
      form.variables = []
      form.allVariables = false
      form.maxDays = ''
      form.reason = ''
      queryClient.invalidateQueries({ queryKey: ['access', 'me', 'requests'] })
    },
  })

  const { mutate: doCancel } = useMutation({
    mutationKey: ['access', 'requests', 'cancel'],
    mutationFn: cancelAccessRequest,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['access', 'me', 'requests'] }),
  })

  const describeStations = (ids: number[] | null) => (ids === null ? 'All' : ids.length ? ids.join(', ') : 'None')
  const describeVariables = (vars: string[] | null) => (vars === null ? 'All' : vars.length ? vars.join(', ') : 'None')
  const describeRequest = (r: AccessRequest) => {
    const parts: string[] = []
    if (r.all_stations) parts.push('all stations')
    else if (r.station_ids?.length) parts.push(`stations ${r.station_ids.join(', ')}`)
    if (r.all_variables) parts.push('all variables')
    else if (r.variables?.length) parts.push(r.variables.join(', '))
    if (r.max_days_history) parts.push(`${r.max_days_history}d`)
    return parts.join(' · ') || '—'
  }

  const handleSubmit = () => mutate()
  const cancel = (id: number) => doCancel(id)
</script>
