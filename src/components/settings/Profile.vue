<template>
  <section class="bg-white rounded-lg p-4 shadow-sm max-w-xl">
    <h2 class="text-lg font-semibold mb-3">Profile</h2>

    <form class="flex flex-col gap-3" @submit.prevent="onSubmit">
      <Input name="username" v-model="username" v-bind="usernameProps">Username</Input>
      <Input type="email" name="email" v-model="email" v-bind="emailProps">Email</Input>
      <Input type="password" name="password" v-model="password" v-bind="passwordProps"
        >New password (leave blank to keep)</Input
      >
      <Input type="password" name="current_password" v-model="currentPassword" v-bind="currentPasswordProps"
        >Current password</Input
      >

      <div class="flex justify-end">
        <Button
          :disabled="!meta.valid || !meta.dirty"
          :is-pending="isPending"
          :class="[
            'text-gray-200',
            meta.valid && meta.dirty
              ? 'bg-mo-Blue hover:bg-mo-Blue/90 focus:ring-mo-Blue/30'
              : 'bg-mo-Blue/60 dark:bg-mo-Blue',
          ]"
          >Save</Button
        >
      </div>
    </form>
  </section>
</template>

<script setup lang="ts">
  import { watch } from 'vue'
  import { useStore } from '@nanostores/vue'
  import { useMutation, useQueryClient } from '@tanstack/vue-query'
  import { useForm } from 'vee-validate'
  import { toTypedSchema } from '@vee-validate/zod'

  import { $authUser, logout, updateProfile } from '@/stores/user'
  import { route } from '@/stores/routes'
  import { updateProfileArgsSchema } from '@/schemas/user'
  import type { UpdateProfileReq, User } from '@/types/user'

  import Input from '@/components/ui/Input.vue'
  import Button from '@/components/ui/Button.vue'

  const user = useStore($authUser)
  const queryClient = useQueryClient()

  const valuesFor = (u?: User) => ({
    username: u?.username ?? '',
    email: u?.email ?? '',
    password: '',
    current_password: '',
  })

  const { defineField, meta, handleSubmit, resetForm, setFieldError } = useForm({
    validationSchema: toTypedSchema(updateProfileArgsSchema),
    initialValues: valuesFor(user.value),
  })

  const [username, usernameProps] = defineField('username', {
    props: (state) => ({ 'error-message': state.errors[0] }),
  })
  const [email, emailProps] = defineField('email', {
    props: (state) => ({ 'error-message': state.errors[0] }),
  })
  const [password, passwordProps] = defineField('password', {
    props: (state) => ({ 'error-message': state.errors[0] }),
  })
  const [currentPassword, currentPasswordProps] = defineField('current_password', {
    props: (state) => ({ 'error-message': state.errors[0] }),
  })

  watch(user, (u) => {
    if (u) resetForm({ values: valuesFor(u) })
  })

  const { mutate, isPending } = useMutation({
    mutationKey: ['users', 'profile'],
    mutationFn: (values: UpdateProfileReq) => updateProfile(user.value!.id, values),
    onSuccess: async (updated) => {
      const usernameChanged = updated.username !== user.value?.username

      $authUser.set(updated)
      queryClient.invalidateQueries({ queryKey: ['auth', 'user'] })
      resetForm({ values: valuesFor(updated) })

      if (usernameChanged) {
        // The session token carries the username; the backend invalidated it.
        await logout()
        window.location.replace(route())
      }
    },
    onError: (err: unknown) => {
      const message =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ?? 'Could not update profile'
      setFieldError('current_password', message)
    },
  })

  const onSubmit = handleSubmit((formValues) => {
    mutate(formValues as UpdateProfileReq)
  })
</script>
