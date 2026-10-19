<template>
  <div class="w-full flex flex-col space-y-4 md:space-y-6">
    <h1 class="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">Sign Up</h1>

    <div
      v-if="submitted"
      class="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800 dark:border-green-800 dark:bg-green-900/20 dark:text-green-300"
    >
      <p class="font-medium">Your account is awaiting approval.</p>
      <p class="mt-1">
        An administrator will review your registration. You'll be able to log in once it's approved.
      </p>
    </div>

    <form v-else class="space-y-4 md:space-y-6" @submit.prevent="onSubmit">
      <Input name="full_name" placeholder="Full Name" v-model="fullName" v-bind="fullNameProps">Name</Input>
      <Input name="username" placeholder="username" v-model="username" v-bind="usernameProps">Username</Input>
      <Input type="email" name="email" placeholder="Enter email here" v-model="email" v-bind="emailProps">Email</Input>
      <Input type="password" name="password" placeholder="••••••••" v-model="password" v-bind="passwordProps"
        >Password</Input
      >
      <Input
        type="password"
        name="confirm_password"
        placeholder="••••••••"
        v-model="confirmPassword"
        v-bind="confirmPasswordProps"
        >Confirm Password</Input
      >
      <Button
        :disabled="!meta.valid"
        :is-pending="isPending"
        :class="[
          'w-full text-gray-200',
          meta.valid
            ? 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800'
            : 'bg-blue-400 dark:bg-blue-500',
        ]"
        >Sign Up</Button
      >
    </form>
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue'
  import { useMutation } from '@tanstack/vue-query'
  import { useForm } from 'vee-validate'
  import { toTypedSchema } from '@vee-validate/zod'

  import { userRegisterArgsSchema } from '@/schemas/user'
  import { register } from '@/stores/user'
  import type { UserRegisterArgs } from '@/types/user'

  import Input from '@/components/ui/Input.vue'
  import Button from '@/components/ui/Button.vue'

  // Declared (not emitted): registration no longer opens a session, so we keep
  // the dialog open and show the pending state instead.
  defineEmits<{
    success: []
  }>()

  const submitted = ref(false)

  const { isPending, mutate } = useMutation({
    mutationKey: ['user', 'register'],
    mutationFn: register,
    onSuccess: (ok) => {
      if (ok) {
        submitted.value = true
      } else {
        setFieldError('full_name', 'Registration failed (username or email may already be taken)')
      }
    },
  })

  const { defineField, meta, setFieldError, handleSubmit } = useForm({
    validationSchema: toTypedSchema(userRegisterArgsSchema),
  })

  const [fullName, fullNameProps] = defineField('full_name', {
    props: (state) => ({ 'error-message': state.errors[0] }),
  })
  const [email, emailProps] = defineField('email', {
    props: (state) => ({ 'error-message': state.errors[0] }),
  })
  const [username, usernameProps] = defineField('username', {
    props: (state) => ({ 'error-message': state.errors[0] }),
  })
  const [password, passwordProps] = defineField('password', {
    props: (state) => ({ 'error-message': state.errors[0] }),
  })
  const [confirmPassword, confirmPasswordProps] = defineField('confirm_password')

  // vee-validate validates before calling the mutation.
  const onSubmit = handleSubmit((formValues) => {
    mutate(formValues as UserRegisterArgs)
  })
</script>
