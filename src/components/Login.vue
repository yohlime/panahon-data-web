<template>
  <div>
    <v-card class="mx-auto pa-12" elevation="8" max-width="448" rounded="lg">
      <v-form @submit.prevent="handleLogin(values as UserLoginArgs)">
        <div class="text-subtitle-1 text-medium-emphasis">Username</div>
        <v-text-field
          v-model="username"
          v-bind="usernameProps"
          :error-messages="errors.username"
          density="compact"
          placeholder="Username"
          prepend-inner-icon="mdi-account"
          variant="outlined"
        ></v-text-field>

        <div class="text-subtitle-1 text-medium-emphasis d-flex align-center justify-space-between">
          Password

          <a
            class="text-caption text-decoration-none text-blue"
            href="#"
            rel="noopener noreferrer"
            target="_blank"
            tabindex="-1"
          >
            Forgot login password?</a
          >
        </div>

        <v-text-field
          v-model="password"
          v-bind="passwordProps"
          :error-messages="errors.password"
          :append-inner-icon="passwordVisible ? 'mdi-eye-off' : 'mdi-eye'"
          :type="passwordVisible ? 'text' : 'password'"
          density="compact"
          placeholder="Enter your password"
          prepend-inner-icon="mdi-lock-outline"
          variant="outlined"
          @click:append-inner="passwordVisible = !passwordVisible"
        ></v-text-field>

        <v-btn
          :disabled="!meta.valid"
          :loading="isLoading"
          block
          class="mb-8"
          color="blue"
          size="large"
          variant="tonal"
          type="submit"
        >
          Log In
        </v-btn>
      </v-form>

      <slot></slot>
    </v-card>
  </div>
</template>

<script setup lang="ts">
  import { userLoginArgsSchema } from '@/schemas/user'
  import { login } from '@/stores/user'
  import type { UserLoginArgs } from '@/types/user'

  const passwordVisible = ref(false)

  const emit = defineEmits<{
    (event: 'success'): void
  }>()

  const { isLoading, mutate: handleLogin } = useMutation({
    mutationKey: ['user', 'login'],
    mutationFn: login,
    onError: () => {
      setFieldError('username', 'Wrong username or password')
    },
    onSuccess: () => {
      emit('success')
    },
  })

  const { errors, values, defineField, setFieldError, meta } = useForm({
    validationSchema: toTypedSchema(userLoginArgsSchema),
  })

  const [username, usernameProps] = defineField('username')
  const [password, passwordProps] = defineField('password')
</script>
