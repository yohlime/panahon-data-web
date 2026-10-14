<template>
  <div class="w-full flex flex-col space-y-4 md:space-y-6">
    <h1 class="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
      {{ formTitle }}
    </h1>
    <form class="space-y-2 w-full" @submit.prevent="handleSubmit">
      <Input name="username" v-model="username" v-bind="usernameProps" :disabled="!isNew">Username</Input>
      <Input name="full-name" v-model="fullName" v-bind="fullNameProps">Full Name</Input>
      <Input name="email" v-model="email" v-bind="emailProps">Email</Input>
      <Input name="password" type="password" v-model="password" v-bind="passwordProps">
        {{ isNew ? 'Password' : 'Password (leave blank to keep)' }}
      </Input>
      <div>
        <label class="block mb-1 text-sm font-medium text-gray-900 dark:text-white">Roles</label>
        <div class="flex gap-4">
          <label v-for="opt in roleOptions" :key="opt" class="flex items-center gap-1 text-sm text-gray-900">
            <input type="checkbox" :value="opt" v-model="roles" />
            {{ opt }}
          </label>
        </div>
      </div>
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
          >{{ isNew ? 'Add' : 'Save' }}</Button
        >
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
  import { computed, toRefs } from 'vue'
  import { useStore } from '@nanostores/vue'
  import { useQuery, useMutation } from '@tanstack/vue-query'
  import { useForm } from 'vee-validate'
  import { toTypedSchema } from '@vee-validate/zod'

  import { $isSuperAdmin, createUser, getUserByID, updateUser } from '@/stores/user'
  import { createUserArgsSchema, updateUserArgsSchema } from '@/schemas/user'
  import type { CreateUserReq, User } from '@/types/user'

  import Input from '@/components/ui/Input.vue'
  import Button from '@/components/ui/Button.vue'

  // Only a superadmin may grant the SUPERADMIN role.
  const isSuperAdmin = useStore($isSuperAdmin)
  const roleOptions = computed(() =>
    isSuperAdmin.value ? ['USER', 'ADMIN', 'SUPERADMIN'] : ['USER', 'ADMIN'],
  )

  const props = withDefaults(defineProps<{ itemID?: number }>(), { itemID: 0 })

  const emit = defineEmits<{
    close: []
    success: [d: User]
    error: [err: Error]
  }>()

  const { itemID } = toRefs(props)
  const isNew = computed(() => itemID.value <= 0)
  const formTitle = computed(() => (isNew.value ? 'New User' : 'Edit User'))

  const editSchema = updateUserArgsSchema.omit({ id: true })

  const { data } = useQuery({
    queryKey: ['users', 'get', itemID],
    queryFn: async () => {
      const d = await getUserByID(itemID.value)
      if (d) {
        setValues({ ...d, password: '', roles: d.roles ?? [] })
      }
      return d
    },
    enabled: () => itemID.value > 0,
  })

  const { defineField, meta, setValues, values, resetForm } = useForm({
    validationSchema: toTypedSchema(isNew.value ? createUserArgsSchema : editSchema),
    initialValues: { roles: [] },
  })

  const { isPending, mutate } = useMutation({
    mutationKey: isNew.value ? ['users', 'create'] : ['users', 'update', itemID],
    mutationFn: async (payload: CreateUserReq) => {
      if (isNew.value) {
        return createUser(payload)
      }
      const { password, ...rest } = payload
      return updateUser({ id: itemID.value, ...rest, ...(password ? { password } : {}) })
    },
    onSuccess: (d: User) => {
      resetForm()
      emit('success', d)
    },
    onError: (err) => {
      emit('error', err)
    },
  })

  const [username, usernameProps] = defineField('username', {
    props: (state) => ({ 'error-message': state.errors[0] }),
  })
  const [fullName, fullNameProps] = defineField('full_name', {
    props: (state) => ({ 'error-message': state.errors[0] }),
  })
  const [email, emailProps] = defineField('email', {
    props: (state) => ({ 'error-message': state.errors[0] }),
  })
  const [password, passwordProps] = defineField('password', {
    props: (state) => ({ 'error-message': state.errors[0] }),
  })
  const [roles] = defineField('roles')

  const handleSubmit = () => {
    mutate(values as CreateUserReq)
  }
</script>
