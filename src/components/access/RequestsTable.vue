<template>
  <div class="flex flex-col gap-4">
    <div class="flex gap-2">
      <button
        v-for="s in statuses"
        :key="s.value"
        :class="[
          'px-3 py-1.5 rounded-lg text-sm font-medium',
          status === s.value ? 'bg-mo-Blue text-white' : 'bg-white text-gray-700 hover:bg-gray-100',
        ]"
        @click="setStatus(s.value)"
      >
        {{ s.label }}
      </button>
    </div>

    <div v-if="isLoading" class="flex justify-center p-4">
      <div class="i-mdi:loading animate-spin text-2xl"></div>
    </div>

    <div v-else class="overflow-x-auto shadow-md sm:rounded-lg">
      <table class="w-full text-sm text-left text-gray-500">
        <thead class="text-xs text-gray-700 uppercase bg-gray-50">
          <tr>
            <th class="px-4 py-3">#</th>
            <th class="px-4 py-3">User</th>
            <th class="px-4 py-3">Requested</th>
            <th class="px-4 py-3">Status</th>
            <th class="px-4 py-3">Created</th>
            <th class="px-4 py-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="r in items" :key="r.id" class="bg-white border-b hover:bg-gray-50">
            <td class="px-4 py-3">{{ r.id }}</td>
            <td class="px-4 py-3">{{ r.user_id }}</td>
            <td class="px-4 py-3">
              {{ describe(r) }}
              <div v-if="r.reason" class="text-xs text-gray-400">{{ r.reason }}</div>
            </td>
            <td class="px-4 py-3">
              <span :class="statusClass(r.status)">{{ r.status }}</span>
            </td>
            <td class="px-4 py-3">{{ new Date(r.created_at).toLocaleString() }}</td>
            <td class="px-4 py-3">
              <div v-if="r.status === 'pending'" class="flex items-center gap-2">
                <template v-if="denyID !== r.id">
                  <button class="text-green-600 hover:text-green-800" @click="approve(r.id)">Approve</button>
                  <button class="text-red-500 hover:text-red-700" @click="startDeny(r.id)">Deny</button>
                </template>
                <template v-else>
                  <input
                    v-model="denyNote"
                    placeholder="Reason"
                    class="bg-gray-50 border border-gray-300 rounded px-2 py-1 text-sm"
                  />
                  <button class="text-red-600 hover:text-red-800" :disabled="!denyNote" @click="confirmDeny(r.id)">
                    Confirm
                  </button>
                  <button class="text-gray-500" @click="denyID = 0">Cancel</button>
                </template>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <Pagination
      v-if="data"
      v-model:page="page"
      v-model:perPage="perPage"
      :nextPage="data.next_page"
      :prevPage="data.prev_page"
      :totalPages="data.total_pages"
    />
  </div>
</template>

<script setup lang="ts">
  import { computed, ref } from 'vue'
  import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'

  import { approveAccessRequest, denyAccessRequest, listAccessRequests } from '@/stores/access'
  import type { AccessRequest, AccessRequestStatus } from '@/types/access'
  import { historyLabel } from '@/utils/access'

  import Pagination from '@/components/ui/Pagination.vue'

  const statuses: { label: string; value: AccessRequestStatus | undefined }[] = [
    { label: 'Pending', value: 'pending' },
    { label: 'Approved', value: 'approved' },
    { label: 'Denied', value: 'denied' },
    { label: 'All', value: undefined },
  ]

  const queryClient = useQueryClient()
  const status = ref<AccessRequestStatus | undefined>('pending')
  const page = ref(1)
  const perPage = ref(10)
  const denyID = ref(0)
  const denyNote = ref('')

  const { isLoading, data } = useQuery({
    queryKey: ['access', 'requests', { status, page, perPage }],
    queryFn: () => listAccessRequests(status.value),
  })

  const items = computed(() => data.value?.items ?? [])

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['access', 'requests'] })

  const { mutate: approve } = useMutation({
    mutationKey: ['access', 'requests', 'approve'],
    mutationFn: (id: number) => approveAccessRequest(id),
    onSuccess: invalidate,
  })

  const { mutate: deny } = useMutation({
    mutationKey: ['access', 'requests', 'deny'],
    mutationFn: ({ id, note }: { id: number; note: string }) => denyAccessRequest(id, note),
    onSuccess: () => {
      denyID.value = 0
      denyNote.value = ''
      invalidate()
    },
  })

  const setStatus = (s?: AccessRequestStatus) => {
    status.value = s
    page.value = 1
  }

  const startDeny = (id: number) => {
    denyID.value = id
    denyNote.value = ''
  }

  const confirmDeny = (id: number) => {
    if (!denyNote.value) return
    deny({ id, note: denyNote.value })
  }

  const describe = (r: AccessRequest) => {
    const parts: string[] = []
    if (r.all_stations) parts.push('all stations')
    else if (r.station_ids?.length) {
      parts.push(`${r.station_ids.length} station${r.station_ids.length === 1 ? '' : 's'}`)
    }
    if (r.all_variables) parts.push('all variables')
    else if (r.variables?.length) {
      parts.push(`${r.variables.length} variable${r.variables.length === 1 ? '' : 's'}`)
    }
    if (r.max_days_history != null) parts.push(historyLabel(r.max_days_history))
    return parts.join(' · ') || '—'
  }

  const statusClass = (s: AccessRequest['status']) =>
    ({
      pending: 'text-yellow-600',
      approved: 'text-green-600',
      denied: 'text-red-600',
    })[s]
</script>
