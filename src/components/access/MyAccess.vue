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
        <div v-if="isLoadingRequests" class="text-sm text-gray-500">Loading…</div>
        <p v-else-if="pendingRequest" class="text-sm text-amber-700">
          You have a pending request (#{{ pendingRequest.id }}). You can request more after it is reviewed, or cancel it
          below.
        </p>
        <p v-else-if="cooldownUntil" class="text-sm text-amber-700">
          Your last request was denied. You can request again after {{ cooldownUntil.toLocaleString() }}.
        </p>
        <p v-if="requestError" class="text-sm text-red-600">{{ requestError }}</p>
        <AccessForm
          v-else
          ref="formRef"
          :station-options="stationOptions"
          :variable-options="variableOptions"
          :initial-max-days="access?.max_days_history"
          :is-pending="isPending"
          show-reason
          require-dirty
          submit-label="Submit request"
          @submit="onRequest"
        />
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

  import {
    ACCESS_REQUEST_COOLDOWN_MS,
    cancelUserAccessRequest,
    createUserAccessRequest,
    getUserAccess,
    listUserAccessRequests,
  } from '@/stores/access'
  import { listAllStations } from '@/stores/station'
  import { $authUserID, $isAdmin } from '@/stores/user'
  import { ACCESS_VARIABLES } from '@/schemas/access'
  import type { AccessRequest } from '@/types/access'

  import AccessForm, { type AccessFormValues } from '@/components/access/AccessForm.vue'

  const queryClient = useQueryClient()
  const isAdmin = useStore($isAdmin)
  const userID = useStore($authUserID)

  const { isLoading, data: access } = useQuery({
    queryKey: ['users', userID, 'access'],
    queryFn: () => getUserAccess(userID.value!),
    enabled: () => !!userID.value,
  })
  const { isLoading: isLoadingRequests, data: requests } = useQuery({
    queryKey: ['users', userID, 'access-requests'],
    queryFn: () => listUserAccessRequests(userID.value!),
    enabled: () => !!userID.value,
  })

  const pendingRequest = computed(() => requests.value?.find((r) => r.status === 'pending') ?? null)
  const latestDenied = computed<AccessRequest | null>(() => {
    const denied = (requests.value ?? []).filter((r) => r.status === 'denied' && r.reviewed_at)
    return denied.reduce<AccessRequest | null>((latest, r) => {
      if (!latest?.reviewed_at) return r
      return new Date(r.reviewed_at!).getTime() > new Date(latest.reviewed_at).getTime() ? r : latest
    }, null)
  })
  const cooldownUntil = computed(() => {
    const reviewed = latestDenied.value?.reviewed_at
    if (!reviewed) return null
    const until = new Date(new Date(reviewed).getTime() + ACCESS_REQUEST_COOLDOWN_MS)
    return until.getTime() > Date.now() ? until : null
  })
  const { data: stations } = useQuery({ queryKey: ['stations', 'all'], queryFn: listAllStations })

  const formRef = ref<InstanceType<typeof AccessForm>>()

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

  watch(
    access,
    (a) => {
      approvedStations.value = a?.station_ids ?? []
      approvedVariables.value = a?.variables ?? []
    },
    { immediate: true },
  )

  const requestError = ref('')
  const extractError = (err: unknown) => {
    const e = err as { response?: { data?: { error?: string } }; message?: string }
    return e.response?.data?.error ?? e.message ?? 'Could not submit the request'
  }

  const { isPending, mutate } = useMutation({
    mutationKey: ['access', 'requests', 'create'],
    mutationFn: (values: AccessFormValues) =>
      createUserAccessRequest(userID.value!, {
        all_stations: values.all_stations,
        station_ids: values.station_ids,
        all_variables: values.all_variables,
        variables: values.variables,
        max_days_history: values.max_days_history,
        reason: values.reason,
      }),
    onSuccess: () => {
      requestError.value = ''
      formRef.value?.reset()
      queryClient.invalidateQueries({ queryKey: ['users', userID.value, 'access-requests'] })
    },
    onError: (err) => {
      requestError.value = extractError(err)
    },
  })

  const onRequest = (values: AccessFormValues) => {
    requestError.value = ''
    mutate(values)
  }

  const { mutate: doCancel } = useMutation({
    mutationKey: ['access', 'requests', 'cancel'],
    mutationFn: (id: number) => cancelUserAccessRequest(userID.value!, id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users', userID.value, 'access-requests'] }),
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
