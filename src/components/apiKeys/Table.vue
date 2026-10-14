<template>
  <div class="flex flex-col gap-4">
    <div class="flex justify-end">
      <Button @click="showCreateDialog = true">
        <div class="i-mdi:plus"></div>
        Create API Key
      </Button>
    </div>

    <div v-if="isLoading" class="flex justify-center p-4">
      <div class="i-mdi:loading animate-spin text-2xl"></div>
    </div>

    <div v-else-if="items?.length === 0" class="text-center p-8 text-gray-500">
      No API keys yet. Create one to get started.
    </div>

    <Table v-else :data="items ?? []" :columns="columns" :show-actions="{ delete: true }" @delete-item="handleDelete">
    </Table>

    <DialogRoot v-model:open="showCreateDialog" v-slot="{ close }">
      <DialogPortal>
        <DialogOverlay class="bg-gray-900/40 data-[state=open]:animate-overlayShow fixed inset-0 z-30" />
        <DialogContent
          class="data-[state=open]:animate-contentShow fixed top-[50%] left-[50%] max-h-[85vh] w-[90vw] max-w-[500px] translate-x-[-50%] translate-y-[-50%] rounded-[6px] bg-white p-[25px] shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,_hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px] focus:outline-none z-[100]"
          :aria-describedby="undefined"
          asChild
        >
          <Form @close="close" @success="handleCreateSuccess" />
        </DialogContent>
      </DialogPortal>
    </DialogRoot>

    <DialogRoot v-model:open="showTokenDialog" v-slot="{ close }">
      <DialogPortal>
        <DialogOverlay class="bg-gray-900/40 data-[state=open]:animate-overlayShow fixed inset-0 z-30" />
        <DialogContent
          class="data-[state=open]:animate-contentShow fixed top-[50%] left-[50%] max-h-[85vh] w-[90vw] max-w-[500px] translate-x-[-50%] translate-y-[-50%] rounded-[6px] bg-white p-[25px] shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,_hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px] focus:outline-none z-[100]"
          :aria-describedby="undefined"
          asChild
        >
          <TokenDialog :token="newToken" @close="close" />
        </DialogContent>
      </DialogPortal>
    </DialogRoot>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue'
  import { useStore } from '@nanostores/vue'
  import { formatRelative, parseISO } from 'date-fns'
  import { useQuery, useQueryClient, useMutation } from '@tanstack/vue-query'
  import { createColumnHelper } from '@tanstack/vue-table'

  import { listApiTokens, deleteApiToken } from '@/stores/apiToken'
  import { $authUserID } from '@/stores/user'

  import { DialogContent, DialogOverlay, DialogPortal, DialogRoot } from 'reka-ui'
  import Table from '@/components/ui/Table.vue'
  import Button from '@/components/ui/Button.vue'
  import Form from '@/components/apiKeys/Form.vue'
  import TokenDialog from '@/components/apiKeys/TokenDialog.vue'

  import type { APIToken, APITokenWithSecret } from '@/types/apiToken'

  const queryClient = useQueryClient()
  const userID = useStore($authUserID)

  const { isLoading, data } = useQuery({
    queryKey: ['users', userID, 'api-tokens'],
    queryFn: () => listApiTokens(userID.value!),
    enabled: () => !!userID.value,
  })

  const items = computed(() => data.value)

  const columnHelper = createColumnHelper<APIToken>()

  const columns = [
    columnHelper.accessor('name', { header: 'Name' }),
    columnHelper.accessor('token_prefix', {
      header: 'Token',
      cell: ({ row }) => `${row.original.token_prefix}••••••••`,
    }),
    columnHelper.accessor('created_at', {
      header: 'Created',
      cell: ({ row }) => formatDate(row.original.created_at),
    }),
    columnHelper.accessor('last_used_at', {
      header: 'Last Used',
      cell: ({ row }) => formatDate(row.original.last_used_at),
    }),
  ]

  const showCreateDialog = ref(false)
  const showTokenDialog = ref(false)
  const newToken = ref('')

  const { mutate: handleDelete } = useMutation({
    mutationKey: ['api-tokens', 'delete'],
    mutationFn: (tokenId: number) => deleteApiToken(userID.value!, tokenId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users', userID.value, 'api-tokens'] })
    },
    onError: (err) => {
      console.error(err)
    },
  })

  const handleCreateSuccess = (d: APITokenWithSecret) => {
    showCreateDialog.value = false
    newToken.value = d.token
    showTokenDialog.value = true
  }

  const formatDate = (date: string | undefined | null) => {
    return date ? formatRelative(parseISO(date), new Date()) : 'never'
  }
</script>
