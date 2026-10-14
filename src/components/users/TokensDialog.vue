<template>
  <div class="w-full flex flex-col gap-4">
    <h1 class="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
      API Keys
    </h1>

    <form class="flex items-end gap-2" @submit.prevent="handleCreate">
      <Input name="name" v-model="name" class="flex-1">Name</Input>
      <Button
        :disabled="!name"
        :is-pending="isCreating"
        class="text-gray-200 bg-blue-600 hover:bg-blue-700 focus:ring-blue-300"
        @click.prevent="handleCreate"
        >Add</Button
      >
    </form>

    <div v-if="isLoading" class="flex justify-center p-4">
      <div class="i-mdi:loading animate-spin text-2xl"></div>
    </div>
    <div v-else-if="tokens?.length === 0" class="text-center p-4 text-gray-500">No API keys.</div>
    <ul v-else class="divide-y divide-gray-200">
      <li v-for="tok in tokens" :key="tok.id" class="flex items-center justify-between py-2">
        <div class="flex flex-col">
          <span class="text-sm font-medium">{{ tok.name }}</span>
          <span class="text-xs text-gray-500">{{ tok.token_prefix }}••••••••</span>
        </div>
        <button class="i-mdi:delete text-xl text-red-400 hover:text-red-600" @click="handleDelete(tok.id)"></button>
      </li>
    </ul>

    <div v-if="newToken" class="flex gap-2">
      <code class="flex-1 bg-gray-100 p-3 rounded break-all text-sm">{{ newToken }}</code>
    </div>

    <div class="flex justify-end">
      <Button class="bg-gray-200 border border-gray-400 hover:bg-gray-300" @click="emit('close')">Done</Button>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed, ref } from 'vue'
  import { useQuery, useQueryClient, useMutation } from '@tanstack/vue-query'

  import { createApiToken, deleteApiToken, listApiTokens } from '@/stores/apiToken'
  import type { APITokenWithSecret } from '@/types/apiToken'

  import Input from '@/components/ui/Input.vue'
  import Button from '@/components/ui/Button.vue'

  const props = defineProps<{ userID: number }>()

  const emit = defineEmits<{ close: [] }>()

  const queryKey = ['users', props.userID, 'api-tokens']
  const queryClient = useQueryClient()

  const name = ref('')
  const newToken = ref('')

  const { isLoading, data } = useQuery({
    queryKey,
    queryFn: () => listApiTokens(props.userID),
  })

  const tokens = computed(() => data.value ?? [])

  const { isPending: isCreating, mutate: createToken } = useMutation({
    mutationKey: [...queryKey, 'create'],
    mutationFn: (n: string) => createApiToken(props.userID, { name: n }),
    onSuccess: (d: APITokenWithSecret) => {
      name.value = ''
      newToken.value = d.token
      queryClient.invalidateQueries({ queryKey })
    },
  })

  const { mutate: removeToken } = useMutation({
    mutationKey: [...queryKey, 'delete'],
    mutationFn: (tokenId: number) => deleteApiToken(props.userID, tokenId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  })

  const handleCreate = () => {
    if (!name.value) return
    createToken(name.value)
  }

  const handleDelete = (tokenId: number) => removeToken(tokenId)
</script>
