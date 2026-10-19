<template>
  <div class="w-full flex flex-col space-y-4 md:space-y-6">
    <h1 class="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">Login</h1>
    <form class="space-y-4 md:space-y-6" @submit.prevent="onSubmit">
      <Input name="username" placeholder="username" v-model="username" v-bind="usernameProps">Username</Input>
      <Input type="password" name="password" placeholder="••••••••" v-model="password" v-bind="passwordProps"
        >Password</Input
      >
      <!-- <div class="flex items-center justify-between"> -->
      <!--   <div class="flex items-start"> -->
      <!--     <div class="flex items-center h-5"> -->
      <!--       <input -->
      <!--         id="remember" -->
      <!--         aria-describedby="remember" -->
      <!--         type="checkbox" -->
      <!--         v-model="remember" -->
      <!--         v-bind="rememberProps" -->
      <!--         class="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-mo-Blue/30 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-mo-Blue/50 dark:ring-offset-gray-800" -->
      <!--       /> -->
      <!--     </div> -->
      <!--     <div class="ml-3 text-sm"> -->
      <!--       <label for="remember" class="text-gray-500 dark:text-gray-300">Remember me</label> -->
      <!--     </div> -->
      <!--   </div> -->
      <!--   <a href="#" class="text-sm font-medium text-mo-Blue hover:underline dark:text-mo-Blue">Forgot password?</a> -->
      <!-- </div> -->
      <Button
        :disabled="!meta.valid"
        :is-pending="isPending"
        :class="[
          'w-full text-gray-200',
          meta.valid
            ? 'bg-mo-Blue hover:bg-mo-Blue/90 focus:ring-mo-Blue/30 dark:bg-mo-Blue dark:hover:bg-mo-Blue/90 dark:focus:ring-mo-Blue/40'
            : 'bg-mo-Blue/60 dark:bg-mo-Blue',
        ]"
        >Login</Button
      >
    </form>
  </div>
</template>

<script setup lang="ts">
  import { useMutation } from '@tanstack/vue-query'
  import { useForm } from 'vee-validate'
  import { toTypedSchema } from '@vee-validate/zod'

  import { userLoginArgsSchema } from '@/schemas/user'
  import { login } from '@/stores/user'
  import type { UserLoginArgs } from '@/types/user'

  import Input from '@/components/ui/Input.vue'
  import Button from '@/components/ui/Button.vue'

  const emit = defineEmits<{
    success: []
  }>()

  const { isPending, mutate } = useMutation({
    mutationKey: ['auth', 'login'],
    mutationFn: login,
    onSuccess: () => {
      emit('success')
    },
    onError: (err: unknown) => {
      const message =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ?? 'Invalid username or password'
      setFieldError('username', message)
    },
  })

  const { defineField, meta, setFieldError, handleSubmit } = useForm({
    validationSchema: toTypedSchema(userLoginArgsSchema),
  })

  const [username, usernameProps] = defineField('username', {
    props: (state) => ({ 'error-message': state.errors[0] }),
  })
  const [password, passwordProps] = defineField('password', {
    props: (state) => ({ 'error-message': state.errors[0] }),
  })
  // const [remember, rememberProps] = defineField('rememberPassword')

  // vee-validate validates before calling the mutation.
  const onSubmit = handleSubmit((formValues) => {
    mutate(formValues as UserLoginArgs)
  })
</script>
