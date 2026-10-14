<template>
  <div class="flex flex-col gap-4">
    <div v-if="isSuperAdmin" class="flex justify-end">
      <Button @click="showCreateDialog = true">
        <div class="i-mdi:plus"></div>
        Create Role
      </Button>
    </div>

    <Table
      v-if="!isLoading && data"
      :data="items"
      :columns="columns"
      :show-actions="{ edit: isSuperAdmin, delete: isSuperAdmin }"
      @delete-item="handleDelete"
    >
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
  </div>
</template>

<script setup lang="ts">
  import { computed, ref, watchEffect } from 'vue'
  import { useStore, useVModel } from '@nanostores/vue'
  import { useQuery, useQueryClient, useMutation } from '@tanstack/vue-query'

  import { $page, $perPage, listRoles, deleteRole } from '@/stores/role'
  import { $isSuperAdmin } from '@/stores/user'
  import type { Role } from '@/types/role'

  import { DialogContent, DialogOverlay, DialogPortal, DialogRoot } from 'reka-ui'
  import Table from '@/components/ui/Table.vue'
  import Pagination from '@/components/ui/Pagination.vue'
  import Button from '@/components/ui/Button.vue'
  import Form from '@/components/roles/Form.vue'

  const page = useVModel($page)
  const perPage = useVModel($perPage)

  const isSuperAdmin = useStore($isSuperAdmin)

  const queryClient = useQueryClient()

  const { isLoading, data } = useQuery({
    queryKey: ['roles', 'list', { page, perPage }],
    queryFn: listRoles,
  })

  const items = computed(() => data.value?.items ?? [])
  const columns = [
    { accessorKey: 'name', header: 'Name' },
    { accessorKey: 'description', header: 'Description' },
    {
      id: 'createdAt',
      accessorKey: 'created_at',
      header: 'Created',
      cell: ({ row }: { row: { original: Role } }) => new Date(row.original.created_at).toLocaleDateString(),
    },
  ]

  const showCreateDialog = ref(false)

  const handleSuccess = () => {
    showCreateDialog.value = false
    queryClient.invalidateQueries({ queryKey: ['roles', 'list'] })
  }

  const { mutate: deleteItem } = useMutation({
    mutationKey: ['roles', 'delete'],
    mutationFn: deleteRole,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['roles', 'list'] }),
    onError: (err) => console.error(err),
  })

  const handleDelete = (id: number) => deleteItem(id)

  watchEffect(() => {
    queryClient.invalidateQueries({ queryKey: ['roles', 'list', { page, perPage }] })
  })
</script>
