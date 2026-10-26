<template>
  <div class="flex flex-col gap-4">
    <div class="flex flex-wrap items-center justify-between gap-2">
      <div class="flex gap-2">
        <button
          v-for="s in statuses"
          :key="s.label"
          :class="[
            'px-3 py-1.5 rounded-lg text-sm font-medium',
            status === s.value ? 'bg-mo-Blue text-white' : 'bg-white text-gray-700 hover:bg-gray-100',
          ]"
          @click="setStatus(s.value)"
        >
          {{ s.label }}
        </button>
      </div>

      <Button v-if="status !== 'pending'" @click="showCreateDialog = true">
        <div class="i-mdi:plus"></div>
        Create User
      </Button>
    </div>

    <Table
      v-if="!isLoading && data"
      :data="items"
      :columns="columns"
      :show-actions="showActions"
      @delete-item="handleDelete"
    >
      <template #edit-form="{ itemID, close }"
        ><Form :itemID="itemID" @close="close" @success="handleSuccess"
      /></template>
    </Table>

    <Pagination
      v-if="data"
      v-model:page="page"
      v-model:perPage="perPage"
      :nextPage="data.next_page"
      :prevPage="data.prev_page"
      :totalPages="data.total_pages"
      :page-sizes="[5, 10, 20, 30]"
    />

    <DialogRoot v-model:open="showCreateDialog" v-slot="{ close }">
      <DialogPortal>
        <DialogOverlay class="bg-gray-900/40 data-[state=open]:animate-overlayShow fixed inset-0 z-30" />
        <DialogContent
          class="data-[state=open]:animate-contentShow fixed top-[50%] left-[50%] max-h-[85vh] w-[90vw] max-w-[500px] translate-x-[-50%] translate-y-[-50%] rounded-[6px] bg-white p-[25px] shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,_hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px] focus:outline-none z-[100]"
          :aria-describedby="undefined"
          asChild
        >
          <Form @close="close" @success="handleSuccess" />
        </DialogContent>
      </DialogPortal>
    </DialogRoot>

    <DialogRoot v-model:open="showTokensDialog" v-slot="{ close }">
      <DialogPortal>
        <DialogOverlay class="bg-gray-900/40 data-[state=open]:animate-overlayShow fixed inset-0 z-30" />
        <DialogContent
          class="data-[state=open]:animate-contentShow fixed top-[50%] left-[50%] max-h-[85vh] w-[90vw] max-w-[500px] translate-x-[-50%] translate-y-[-50%] rounded-[6px] bg-white p-[25px] shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,_hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px] focus:outline-none z-[100]"
          :aria-describedby="undefined"
          asChild
        >
          <TokensDialog v-if="selectedUserID" :userID="selectedUserID" @close="close" />
        </DialogContent>
      </DialogPortal>
    </DialogRoot>

    <DialogRoot v-model:open="showAccessDialog" v-slot="{ close }">
      <DialogPortal>
        <DialogOverlay class="bg-gray-900/40 data-[state=open]:animate-overlayShow fixed inset-0 z-30" />
        <DialogContent
          class="data-[state=open]:animate-contentShow fixed top-[50%] left-[50%] max-h-[85vh] w-[90vw] max-w-[500px] translate-x-[-50%] translate-y-[-50%] rounded-[6px] bg-white p-[25px] shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,_hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px] focus:outline-none z-[100]"
          :aria-describedby="undefined"
          asChild
        >
          <UserAccessDialog v-if="selectedAccessUserID" :userID="selectedAccessUserID" @close="close" />
        </DialogContent>
      </DialogPortal>
    </DialogRoot>

    <DialogRoot v-model:open="showRejectDialog" v-slot="{ close }">
      <DialogPortal>
        <DialogOverlay class="bg-gray-900/40 data-[state=open]:animate-overlayShow fixed inset-0 z-30" />
        <DialogContent
          class="data-[state=open]:animate-contentShow fixed top-[50%] left-[50%] max-h-[85vh] w-[90vw] max-w-[500px] translate-x-[-50%] translate-y-[-50%] rounded-[6px] bg-white p-[25px] shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,_hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px] focus:outline-none z-[100]"
          :aria-describedby="undefined"
        >
          <div class="flex w-full flex-col gap-4">
            <h1 class="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
              Reject Registration
            </h1>
            <Input name="note" v-model="rejectNote">Reason</Input>
            <div class="flex justify-end gap-2">
              <Button class="bg-gray-200 border border-gray-400 hover:bg-gray-300" @click="close">Cancel</Button>
              <Button
                :disabled="!rejectNote"
                :is-pending="isRejecting"
                class="text-gray-200 bg-mo-Blue hover:bg-mo-Blue/90 focus:ring-mo-Blue/30"
                @click="confirmReject"
                >Reject</Button
              >
            </div>
          </div>
        </DialogContent>
      </DialogPortal>
    </DialogRoot>

    <DialogRoot v-model:open="showRegistrationDialog" v-slot="{ close }">
      <DialogPortal>
        <DialogOverlay class="bg-gray-900/40 data-[state=open]:animate-overlayShow fixed inset-0 z-30" />
        <DialogContent
          class="data-[state=open]:animate-contentShow fixed top-[50%] left-[50%] max-h-[85vh] w-[90vw] max-w-[560px] translate-x-[-50%] translate-y-[-50%] rounded-[6px] bg-white p-[25px] shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,_hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px] focus:outline-none z-[100]"
          :aria-describedby="undefined"
        >
          <div class="flex w-full flex-col gap-4">
            <h1 class="text-xl font-bold leading-tight tracking-tight text-gray-900">Registration link</h1>
            <p class="text-sm text-gray-600">
              Copy this link and send it to the user. It is shown only when generated, is single-use, and expires.
            </p>
            <Input name="registration-link" :model-value="registrationURL" readonly />
            <div class="flex justify-end gap-2">
              <Button class="bg-gray-200 border border-gray-400 hover:bg-gray-300" @click="close">Close</Button>
              <Button class="text-gray-200 bg-mo-Blue hover:bg-mo-Blue/90" @click="copyRegistrationLink">
                {{ linkCopied ? 'Copied' : 'Copy link' }}
              </Button>
            </div>
          </div>
        </DialogContent>
      </DialogPortal>
    </DialogRoot>
  </div>
</template>

<script setup lang="ts">
  import { computed, h, ref } from 'vue'
  import { useVModel } from '@nanostores/vue'
  import { useQuery, useQueryClient, useMutation } from '@tanstack/vue-query'
  import type { ColumnDef } from '@tanstack/vue-table'

  import {
    $page,
    $perPage,
    approveUser,
    createRegistrationLink,
    deleteUser,
    listUsers,
    rejectUser,
  } from '@/stores/user'
  import type { User } from '@/types/user'

  import { DialogContent, DialogOverlay, DialogPortal, DialogRoot } from 'reka-ui'
  import Table from '@/components/ui/Table.vue'
  import Pagination from '@/components/ui/Pagination.vue'
  import Button from '@/components/ui/Button.vue'
  import Input from '@/components/ui/Input.vue'
  import Form from '@/components/users/Form.vue'
  import TokensDialog from '@/components/users/TokensDialog.vue'
  import UserAccessDialog from '@/components/access/UserAccessDialog.vue'

  // `undefined` = the "All" tab (no status filter). Active is first and default.
  const statuses: { label: string; value: string | undefined }[] = [
    { label: 'Active', value: 'active' },
    { label: 'Invited', value: 'invited' },
    { label: 'Pending', value: 'pending' },
    { label: 'Rejected', value: 'rejected' },
    { label: 'All', value: undefined },
  ]

  const page = useVModel($page)
  const perPage = useVModel($perPage)
  const queryClient = useQueryClient()

  const status = ref<string | undefined>('active')
  const isPending = computed(() => status.value === 'pending')
  const isAll = computed(() => status.value === undefined)

  const { isLoading, data } = useQuery({
    queryKey: ['users', 'list', { status, page, perPage }],
    queryFn: () => listUsers({ status: status.value, page: page.value, perPage: perPage.value }),
  })

  const items = computed(() => data.value?.items ?? [])
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['users', 'list'] })

  const showCreateDialog = ref(false)
  const showTokensDialog = ref(false)
  const showAccessDialog = ref(false)
  const showRejectDialog = ref(false)
  const showRegistrationDialog = ref(false)
  const registrationURL = ref('')
  const linkCopied = ref(false)
  const selectedUserID = ref(0)
  const selectedAccessUserID = ref(0)
  const rejectID = ref(0)
  const rejectNote = ref('')

  const openTokens = (userID: number) => {
    selectedUserID.value = userID
    showTokensDialog.value = true
  }

  const openAccess = (userID: number) => {
    selectedAccessUserID.value = userID
    showAccessDialog.value = true
  }

  const showRegistrationLink = async (userID: number) => {
    try {
      const { registration_url } = await createRegistrationLink(userID)
      registrationURL.value = registration_url
      linkCopied.value = false
      showRegistrationDialog.value = true
    } catch (err) {
      console.error(err)
    }
  }

  const copyRegistrationLink = async () => {
    await navigator.clipboard.writeText(registrationURL.value)
    linkCopied.value = true
    setTimeout(() => (linkCopied.value = false), 2000)
  }

  const { mutate: approve } = useMutation({
    mutationKey: ['users', 'approve'],
    mutationFn: (userID: number) => approveUser(userID),
    onSuccess: invalidate,
    onError: (err) => console.error(err),
  })

  const startReject = (userID: number) => {
    rejectID.value = userID
    rejectNote.value = ''
    showRejectDialog.value = true
  }

  const { mutate: reject, isPending: isRejecting } = useMutation({
    mutationKey: ['users', 'reject'],
    mutationFn: ({ id, note }: { id: number; note: string }) => rejectUser(id, note),
    onSuccess: () => {
      showRejectDialog.value = false
      rejectNote.value = ''
      invalidate()
    },
    onError: (err) => console.error(err),
  })

  const confirmReject = () => {
    if (rejectNote.value) reject({ id: rejectID.value, note: rejectNote.value })
  }

  const statusClass = (s: string) =>
    ({ invited: 'text-blue-600', pending: 'text-yellow-600', active: 'text-green-600', rejected: 'text-red-600' })[s] ??
    'text-gray-500'

  const columns = computed<ColumnDef<User>[]>(() => {
    const cols: ColumnDef<User>[] = [
      { accessorKey: 'username', header: 'Username' },
      {
        id: 'full_name',
        header: 'Full Name',
        cell: ({ row }) => row.original.full_name || row.original.username,
      },
      { id: 'email', header: 'Email', cell: ({ row }) => row.original.email || '—' },
      { id: 'roles', header: 'Roles', cell: ({ row }) => (row.original.roles ?? []).join(', ') },
    ]

    // Status is only meaningful when mixing statuses ("All").
    if (isAll.value) {
      cols.push({
        id: 'status',
        header: 'Status',
        cell: ({ row }) => h('span', { class: statusClass(row.original.status) }, row.original.status),
      })
    }

    cols.push({
      id: 'created',
      header: 'Created',
      cell: ({ row }) => new Date(row.original.created_at).toLocaleDateString(),
    })

    if (isPending.value) {
      // Pending registrations: approve/reject instead of keys/access.
      cols.push({
        id: 'registration',
        header: 'Registration',
        cell: ({ row }) =>
          h('div', { class: 'flex gap-2' }, [
            h(
              'button',
              { class: 'text-green-600 hover:text-green-800', onClick: () => approve(row.original.id) },
              'Approve',
            ),
            h(
              'button',
              { class: 'text-red-500 hover:text-red-700', onClick: () => startReject(row.original.id) },
              'Reject',
            ),
          ]),
      })
    } else if (status.value !== 'rejected') {
      if (status.value === 'invited' || isAll.value) {
        cols.push({
          id: 'registration-link',
          header: 'Registration',
          cell: ({ row }) =>
            row.original.status === 'invited'
              ? h(Button, { onClick: () => showRegistrationLink(row.original.id) }, () => 'Registration link')
              : '',
        })
      }

      // Active and All: API keys + access. Rejected and invited users don't need them.
      if (status.value !== 'invited') {
        cols.push({
          id: 'tokens',
          header: 'API Keys',
          cell: ({ row }) =>
            row.original.status === 'invited'
              ? ''
              : h(Button, { onClick: () => openTokens(row.original.id) }, () => 'Keys'),
        })
        cols.push({
          id: 'access',
          header: 'Access',
          cell: ({ row }) =>
            row.original.status === 'invited'
              ? ''
              : h(Button, { onClick: () => openAccess(row.original.id) }, () => 'Access'),
        })
      }
    }

    return cols
  })

  const showActions = computed(() => (isPending.value ? false : { edit: true, delete: true }))

  const setStatus = (s?: string) => {
    status.value = s
    page.value = 1
  }

  const handleSuccess = (result: { user: User; registration_url?: string }) => {
    showCreateDialog.value = false
    invalidate()
    if (result.registration_url) {
      registrationURL.value = result.registration_url
      linkCopied.value = false
      showRegistrationDialog.value = true
    }
  }

  const { mutate: deleteItem } = useMutation({
    mutationKey: ['users', 'delete'],
    mutationFn: deleteUser,
    onSuccess: invalidate,
    onError: (err) => console.error(err),
  })

  const handleDelete = (id: number) => deleteItem(id)
</script>
