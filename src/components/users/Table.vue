<template>
  <div class="flex flex-col gap-4">
    <div class="flex justify-end">
      <Button @click="showCreateDialog = true">
        <div class="i-mdi:plus"></div>
        Create User
      </Button>
    </div>

    <Table v-if="!isLoading && data" :data="items" :columns="columns" :show-actions="{ edit: true, delete: true }" @delete-item="handleDelete">
      <template #edit-form="{ itemID, close }"><Form :itemID="itemID" @close="close" @success="handleSuccess" /></template>
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
  </div>
</template>

<script setup lang="ts">
  import { computed, h, ref, watchEffect } from 'vue'
  import { useVModel } from '@nanostores/vue'
  import { useQuery, useQueryClient, useMutation } from '@tanstack/vue-query'

  import { $page, $perPage, deleteUser, listUsers } from '@/stores/user'
  import type { User } from '@/types/user'

  import { DialogContent, DialogOverlay, DialogPortal, DialogRoot } from 'reka-ui'
  import Table from '@/components/ui/Table.vue'
  import Pagination from '@/components/ui/Pagination.vue'
  import Button from '@/components/ui/Button.vue'
  import Form from '@/components/users/Form.vue'
  import TokensDialog from '@/components/users/TokensDialog.vue'
  import UserAccessDialog from '@/components/access/UserAccessDialog.vue'

  const page = useVModel($page)
  const perPage = useVModel($perPage)
  const queryClient = useQueryClient()

  const { isLoading, data } = useQuery({
    queryKey: ['users', 'list', { page, perPage }],
    queryFn: listUsers,
  })

  const items = computed(() => data.value?.items ?? [])

  const showCreateDialog = ref(false)
  const showTokensDialog = ref(false)
  const showAccessDialog = ref(false)
  const selectedUserID = ref(0)
  const selectedAccessUserID = ref(0)

  const openTokens = (userID: number) => {
    selectedUserID.value = userID
    showTokensDialog.value = true
  }

  const openAccess = (userID: number) => {
    selectedAccessUserID.value = userID
    showAccessDialog.value = true
  }

  const columns = [
    { accessorKey: 'username', header: 'Username' },
    { accessorKey: 'full_name', header: 'Full Name' },
    { accessorKey: 'email', header: 'Email' },
    {
      id: 'roles',
      header: 'Roles',
      cell: ({ row }: { row: { original: User } }) => (row.original.roles ?? []).join(', '),
    },
    {
      id: 'tokens',
      header: 'API Keys',
      cell: ({ row }: { row: { original: User } }) =>
        h(Button, { onClick: () => openTokens(row.original.id) }, () => 'Keys'),
    },
    {
      id: 'access',
      header: 'Access',
      cell: ({ row }: { row: { original: User } }) =>
        h(Button, { onClick: () => openAccess(row.original.id) }, () => 'Access'),
    },
  ]

  const handleSuccess = () => {
    showCreateDialog.value = false
    queryClient.invalidateQueries({ queryKey: ['users', 'list'] })
  }

  const { mutate: deleteItem } = useMutation({
    mutationKey: ['users', 'delete'],
    mutationFn: deleteUser,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users', 'list'] }),
    onError: (err) => console.error(err),
  })

  const handleDelete = (id: number) => deleteItem(id)

  watchEffect(() => {
    queryClient.invalidateQueries({ queryKey: ['users', 'list', { page, perPage }] })
  })
</script>
