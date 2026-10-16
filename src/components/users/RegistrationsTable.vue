<template>
  <div class="flex flex-col gap-4">
    <div class="flex gap-2">
      <button
        v-for="s in statuses"
        :key="s.label"
        :class="[
          'px-3 py-1.5 rounded-lg text-sm font-medium',
          status === s.value ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100',
        ]"
        @click="setStatus(s.value)"
      >
        {{ s.label }}
      </button>
    </div>

    <div v-if="isLoading" class="flex justify-center p-4">
      <div class="i-mdi:loading animate-spin text-2xl"></div>
    </div>

    <div v-else-if="!items.length" class="text-center p-8 text-gray-500">No users.</div>

    <div v-else class="overflow-x-auto shadow-md sm:rounded-lg">
      <table class="w-full text-sm text-left text-gray-500">
        <thead class="text-xs text-gray-700 uppercase bg-gray-50">
          <tr>
            <th class="px-4 py-3">#</th>
            <th class="px-4 py-3">Username</th>
            <th class="px-4 py-3">Name</th>
            <th class="px-4 py-3">Email</th>
            <th class="px-4 py-3">Status</th>
            <th class="px-4 py-3">Registered</th>
            <th class="px-4 py-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="u in items" :key="u.id" class="bg-white border-b hover:bg-gray-50">
            <td class="px-4 py-3">{{ u.id }}</td>
            <td class="px-4 py-3">{{ u.username }}</td>
            <td class="px-4 py-3">{{ u.full_name }}</td>
            <td class="px-4 py-3">{{ u.email }}</td>
            <td class="px-4 py-3">
              <span :class="statusClass(u.status)">{{ u.status }}</span>
            </td>
            <td class="px-4 py-3">{{ new Date(u.created_at).toLocaleString() }}</td>
            <td class="px-4 py-3">
              <div v-if="u.status === 'pending'" class="flex items-center gap-2">
                <template v-if="rejectID !== u.id">
                  <button class="text-green-600 hover:text-green-800" @click="approve(u.id)">Approve</button>
                  <button class="text-red-500 hover:text-red-700" @click="startReject(u.id)">Reject</button>
                </template>
                <template v-else>
                  <input
                    v-model="rejectNote"
                    placeholder="Reason"
                    class="bg-gray-50 border border-gray-300 rounded px-2 py-1 text-sm"
                  />
                  <button class="text-red-600 hover:text-red-800" :disabled="!rejectNote" @click="confirmReject(u.id)">
                    Confirm
                  </button>
                  <button class="text-gray-500" @click="rejectID = 0">Cancel</button>
                </template>
              </div>
              <span v-else-if="u.review_note" class="text-xs text-gray-400">{{ u.review_note }}</span>
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

  import { approveUser, listUsers, rejectUser } from '@/stores/user'

  import Pagination from '@/components/ui/Pagination.vue'

  const statuses: { label: string; value: string | undefined }[] = [
    { label: 'Pending', value: 'pending' },
    { label: 'Active', value: 'active' },
    { label: 'Rejected', value: 'rejected' },
    { label: 'All', value: undefined },
  ]

  const queryClient = useQueryClient()
  const status = ref<string | undefined>('pending')
  const page = ref(1)
  const perPage = ref(10)
  const rejectID = ref(0)
  const rejectNote = ref('')

  const { isLoading, data } = useQuery({
    queryKey: ['users', 'registrations', { status, page, perPage }],
    queryFn: () => listUsers({ status: status.value, page: page.value, perPage: perPage.value }),
  })

  const items = computed(() => data.value?.items ?? [])

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['users', 'registrations'] })

  const { mutate: approve } = useMutation({
    mutationKey: ['users', 'registrations', 'approve'],
    mutationFn: (id: number) => approveUser(id),
    onSuccess: invalidate,
  })

  const { mutate: reject } = useMutation({
    mutationKey: ['users', 'registrations', 'reject'],
    mutationFn: ({ id, note }: { id: number; note: string }) => rejectUser(id, note),
    onSuccess: () => {
      rejectID.value = 0
      rejectNote.value = ''
      invalidate()
    },
  })

  const setStatus = (s?: string) => {
    status.value = s
    page.value = 1
  }

  const startReject = (id: number) => {
    rejectID.value = id
    rejectNote.value = ''
  }

  const confirmReject = (id: number) => {
    if (rejectNote.value) reject({ id, note: rejectNote.value })
  }

  const statusClass = (s: string) =>
    ({ pending: 'text-yellow-600', active: 'text-green-600', rejected: 'text-red-600' })[s] ?? 'text-gray-500'
</script>
