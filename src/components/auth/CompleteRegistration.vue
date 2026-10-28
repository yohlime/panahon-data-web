<template>
  <section class="rounded-lg bg-white p-6 shadow-sm">
    <h1 class="mb-2 text-xl font-bold text-gray-900">Complete your registration</h1>
    <p class="mb-4 text-sm text-gray-600">Create your password to activate your Panahon account.</p>

    <p v-if="isLoading" class="text-sm text-gray-600">Checking your registration link...</p>

    <div v-else-if="linkError" class="flex flex-col gap-3">
      <p class="text-sm text-red-600">{{ linkError }}</p>
      <p class="text-sm text-gray-600">Ask an administrator to generate a new registration link.</p>
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

      <Input v-model="fullName" name="full_name" placeholder="Your full name">Full Name (optional)</Input>
      <div>
        <Input v-model="email" name="email" type="email" placeholder="you@example.com">Email (optional)</Input>
        <p class="mt-1 text-xs text-gray-500">Leave blank if you do not have an email address.</p>
      </div>
      <Input v-model="password" name="password" type="password" placeholder="••••••••">Password</Input>
      <Input v-model="confirmPassword" name="confirm_password" type="password" placeholder="••••••••"
        >Confirm Password</Input
      >

      <p v-if="error" class="text-sm text-red-600">{{ error }}</p>

      <Button
        class="mt-2 w-full text-gray-200 bg-mo-Blue hover:bg-mo-Blue/90 focus:ring-mo-Blue/30"
        :is-pending="isSubmitting"
        type="submit"
        >Create password</Button
      >
    </form>
  </section>
</template>

<script setup lang="ts">
  import { onMounted, ref } from 'vue'

  import { completeRegistration, validateRegistration } from '@/stores/user'
  import { route } from '@/stores/routes'
  import type { RegistrationInfo } from '@/types/user'

  import Input from '@/components/ui/Input.vue'
  import Button from '@/components/ui/Button.vue'

  const token = ref('')
  const info = ref<RegistrationInfo>()
  const fullName = ref('')
  const email = ref('')
  const password = ref('')
  const confirmPassword = ref('')
  const isLoading = ref(true)
  const isSubmitting = ref(false)
  const linkError = ref('')
  const error = ref('')

  const errorMessage = (err: unknown, fallback: string) =>
    (err as { response?: { data?: { error?: string } } })?.response?.data?.error ?? fallback

  onMounted(async () => {
    token.value = new URLSearchParams(window.location.search).get('token') ?? ''
    if (!token.value) {
      linkError.value = 'This registration link is missing a token.'
      isLoading.value = false
      return
    }

    try {
      info.value = await validateRegistration(token.value)
      fullName.value = info.value.full_name ?? ''
      email.value = info.value.email ?? ''
    } catch {
      linkError.value = 'This registration link is invalid or has expired.'
    } finally {
      isLoading.value = false
    }
  })

  const submit = async () => {
    error.value = ''

    if (password.value.length < 8) {
      error.value = 'Password must contain at least 8 characters.'
      return
    }
    if (password.value !== confirmPassword.value) {
      error.value = "Passwords don't match."
      return
    }

    isSubmitting.value = true
    try {
      await completeRegistration({
        token: token.value,
        full_name: fullName.value.trim(),
        email: email.value.trim(),
        password: password.value,
        confirm_password: confirmPassword.value,
      })
      window.location.replace(route())
    } catch (err) {
      error.value = errorMessage(err, 'Could not complete registration. Please try again.')
    } finally {
      isSubmitting.value = false
    }
  }
</script>
