<template>
  <div class="w-full flex flex-col space-y-4 md:space-y-6">
    <h1 class="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
      Create API Key
    </h1>
    <form class="space-y-2 w-full" @submit.prevent="handleSubmit">
      <Input name="name" v-model="name" v-bind="nameProps">Name</Input>
      <!-- <div> -->
      <!--   <label class="block mb-1 text-sm font-medium text-gray-900 dark:text-white"> Expires At (optional) </label> -->
      <!--   <input -->
      <!--     v-model="form.expires_at" -->
      <!--     type="datetime-local" -->
      <!--     name="expires_at" -->
      <!--     class="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-blue-600 focus:border-blue-600 block w-full p-2.5" -->
      <!--   /> -->
      <!-- </div> -->
      <!-- <div> -->
      <!--   <label class="block mb-1 text-sm font-medium text-gray-900 dark:text-white"> Max Days History </label> -->
      <!--   <input -->
      <!--     v-model.number="form.permissions.max_days_history" -->
      <!--     type="number" -->
      <!--     name="max_days_history" -->
      <!--     min="1" -->
      <!--     class="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-blue-600 focus:border-blue-600 block w-full p-2.5" -->
      <!--   /> -->
      <!-- </div> -->
      <div class="flex justify-end gap-2 mt-4">
        <Button
          type="button"
          class="w-1/3 bg-gray-200 border border-gray-400 hover:bg-gray-300"
          @click.prevent="$emit('close')"
          >Cancel</Button
        >
        <Button
          :disabled="!meta.valid"
          :is-pending="isPending"
          :class="[
            'w-1/3 text-gray-200',
            meta.valid
              ? 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800'
              : 'bg-blue-400 dark:bg-blue-500',
          ]"
          @click.prevent="handleSubmit"
          >Add</Button
        >
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
  import { useMutation } from '@tanstack/vue-query'
  import { useForm } from 'vee-validate'
  import { toTypedSchema } from '@vee-validate/zod'

  import { createApiToken } from '@/stores/apiToken'
  import { createAPITokenArgsSchema } from '@/schemas/apiToken'
  import type { APITokenWithSecret, CreateAPITokenReq } from '@/types/apiToken'

  import Input from '@/components/ui/Input.vue'
  import Button from '@/components/ui/Button.vue'

  const emit = defineEmits<{
    close: []
    success: [d: APITokenWithSecret]
    error: [err: Error]
  }>()

  const { defineField, meta, setValues, values } = useForm({
    validationSchema: toTypedSchema(createAPITokenArgsSchema),
  })

  const { mutate, isPending } = useMutation({
    mutationKey: ['api-tokens', 'create'],
    mutationFn: createApiToken,
    onSuccess: (d: APITokenWithSecret) => {
      emit('success', d)
    },
    onError: (err) => {
      emit('error', err)
    },
  })

  const [name, nameProps] = defineField('name', {
    props: (state) => ({ 'error-message': state.errors[0] }),
  })

  const handleSubmit = () => {
    mutate(values as CreateAPITokenReq)
  }
</script>
