<template>
  <section class="rounded-lg bg-white p-6 shadow-sm">
    <h1 class="mb-2 text-xl font-bold text-gray-900">Reset your password</h1>
    <p class="mb-4 text-sm text-gray-600">Choose a new password for your Panahon account.</p>

    <p v-if="isLoading" class="text-sm text-gray-600">Checking your reset link...</p>

    <div v-else-if="linkError" class="flex flex-col gap-3">
      <p class="text-sm text-red-600">{{ linkError }}</p>
      <p class="text-sm text-gray-600">Ask an administrator to generate a new password reset link.</p>
    </div>

    <form v-else-if="info" class="flex flex-col gap-3" @submit.prevent="submit">
      <div>
        <label class="mb-1 block text-sm font-medium text-gray-900">Username</label>
        <input
          :value="info.username"
          readonly
          class="block w-full rounded-lg border border-gray-300 bg-gray-100 p-2.5 text-gray-900"
        />
        <p class="mt-1 text-xs text-gray-500">Use this username when you log in.</p>
      </div>

      <Input v-model="password" name="password" type="password" placeholder="••••••••" v-bind="passwordProps"
        >New Password</Input
      >
      <Input
        v-model="confirmPassword"
        name="confirm_password"
        type="password"
        placeholder="••••••••"
        v-bind="confirmPasswordProps"
        >Confirm New Password</Input
      >

      <p v-if="error" class="text-sm text-red-600">{{ error }}</p>

      <Button
        class="mt-2 w-full text-gray-200 bg-mo-Blue hover:bg-mo-Blue/90 focus:ring-mo-Blue/30"
        :is-pending="isSubmitting"
        type="submit"
        >Set new password</Button
      >
    </form>
  </section>
</template>

<script setup lang="ts">
  import { onMounted, ref } from 'vue'
  import { useForm } from 'vee-validate'
  import { toTypedSchema } from '@vee-validate/zod'

  import { passwordResetFormSchema } from '@/schemas/user'
  import { resetPassword, validatePasswordReset } from '@/stores/user'
  import { route } from '@/stores/routes'
  import type { PasswordResetInfo, PasswordResetReq } from '@/types/user'

  import Input from '@/components/ui/Input.vue'
  import Button from '@/components/ui/Button.vue'

  const token = ref('')
  const info = ref<PasswordResetInfo>()
  const isLoading = ref(true)
  const isSubmitting = ref(false)
  const linkError = ref('')
  const error = ref('')

  const { defineField, handleSubmit } = useForm({
    validationSchema: toTypedSchema(passwordResetFormSchema),
    initialValues: { password: '', confirm_password: '' },
  })

  const [password, passwordProps] = defineField('password', {
    props: (state) => ({ 'error-message': state.errors[0] }),
  })
  const [confirmPassword, confirmPasswordProps] = defineField('confirm_password', {
    props: (state) => ({ 'error-message': state.errors[0] }),
  })

  const errorMessage = (err: unknown, fallback: string) =>
    (err as { response?: { data?: { error?: string } } })?.response?.data?.error ?? fallback

  onMounted(async () => {
    token.value = new URLSearchParams(window.location.search).get('token') ?? ''
    if (!token.value) {
      linkError.value = 'This password reset link is missing a token.'
      isLoading.value = false
      return
    }

    try {
      info.value = await validatePasswordReset(token.value)
    } catch {
      linkError.value = 'This password reset link is invalid or has expired.'
    } finally {
      isLoading.value = false
    }
  })

  const submit = handleSubmit(async (values) => {
    error.value = ''
    isSubmitting.value = true
    try {
      await resetPassword({ ...values, token: token.value } as PasswordResetReq)
      // The API signs out all old sessions and starts a fresh one.
      window.location.replace(route())
    } catch (err) {
      error.value = errorMessage(err, 'Could not reset your password. Please try again.')
    } finally {
      isSubmitting.value = false
    }
  })
</script>
