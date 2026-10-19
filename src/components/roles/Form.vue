<template>
  <div class="w-full flex flex-col space-y-4 md:space-y-6">
    <h1 class="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
      {{ formTitle }}
    </h1>
    <form class="space-y-2 w-full" @submit.prevent="handleSubmit">
      <Input name="name" v-model="name" v-bind="nameProps">Name</Input>
      <Input name="description" v-model="description" v-bind="descriptionProps">Description</Input>
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
              ? 'bg-mo-Blue hover:bg-mo-Blue/90 focus:ring-mo-Blue/30 dark:bg-mo-Blue dark:hover:bg-mo-Blue/90 dark:focus:ring-mo-Blue/40'
              : 'bg-mo-Blue/60 dark:bg-mo-Blue',
          ]"
          @click.prevent="handleSubmit"
          >{{ isNew ? 'Add' : 'Save' }}</Button
        >
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
  import { computed, toRefs } from 'vue'
  import { useQuery, useMutation } from '@tanstack/vue-query'
  import { useForm } from 'vee-validate'
  import { toTypedSchema } from '@vee-validate/zod'

  import { createRole, getRole, updateRole } from '@/stores/role'
  import { createRoleArgsSchema } from '@/schemas/role'
  import type { CreateRoleReq, Role } from '@/types/role'

  import Input from '@/components/ui/Input.vue'
  import Button from '@/components/ui/Button.vue'

  const props = withDefaults(defineProps<{ itemID?: number }>(), { itemID: 0 })

  const emit = defineEmits<{
    close: []
    success: [d: Role]
    error: [err: Error]
  }>()

  const { itemID } = toRefs(props)

  const isNew = computed(() => (data.value?.id ? false : true))
  const formTitle = computed(() => (isNew.value ? 'New Role' : 'Edit Role'))

  const { data } = useQuery({
    queryKey: ['roles', 'get', itemID],
    queryFn: async () => {
      const d = await getRole(itemID.value)
      setValues(d)
      return d
    },
    enabled: () => itemID.value > 0,
  })

  const { defineField, meta, setValues, values, resetForm } = useForm({
    validationSchema: toTypedSchema(createRoleArgsSchema),
  })

  const { isPending, mutate } = useMutation({
    mutationKey: isNew.value ? ['roles', 'create'] : ['roles', 'update', values.id],
    mutationFn: async (payload: CreateRoleReq) =>
      isNew.value ? createRole(payload) : updateRole({ id: itemID.value, ...payload }),
    onSuccess: (d: Role) => {
      resetForm()
      emit('success', d)
    },
    onError: (err) => {
      emit('error', err)
    },
  })

  const [name, nameProps] = defineField('name', {
    props: (state) => ({ 'error-message': state.errors[0] }),
  })
  const [description, descriptionProps] = defineField('description', {
    props: (state) => ({ 'error-message': state.errors[0] }),
  })

  const handleSubmit = () => {
    mutate(values as CreateRoleReq)
  }
</script>
