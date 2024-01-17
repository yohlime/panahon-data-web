<template>
  <div>
    <v-card class="mx-auto pa-12" elevation="8" max-width="448" rounded="lg">
      <v-form @submit.prevent="handleRegister(values as UserRegisterArgs)">
        <div class="text-subtitle-1 text-medium-emphasis">Full Name</div>
        <v-text-field
          v-model="fullName"
          v-bind="fullNameProps"
          :error-messages="errors.full_name"
          density="compact"
          placeholder="Full Name"
          prepend-inner-icon="mdi-badge-account"
          variant="outlined"
          name="full_name"
        ></v-text-field>

        <div class="text-subtitle-1 text-medium-emphasis">Email</div>
        <v-text-field
          v-model="email"
          v-bind="emailProps"
          :error-messages="errors.email"
          density="compact"
          placeholder="Email address"
          prepend-inner-icon="mdi-email-outline"
          variant="outlined"
          name="email"
        ></v-text-field>

        <div class="text-subtitle-1 text-medium-emphasis">Username</div>
        <v-text-field
          v-model="username"
          v-bind="usernameProps"
          :error-messages="errors.username"
          density="compact"
          placeholder="Username"
          prepend-inner-icon="mdi-account"
          variant="outlined"
          name="username"
        ></v-text-field>

        <div class="text-subtitle-1 text-medium-emphasis">Password</div>
        <v-text-field
          v-model="password"
          v-bind="passwordProps"
          :error-messages="errors.password"
          :append-inner-icon="passwordVisible ? 'mdi-eye-off' : 'mdi-eye'"
          :type="passwordVisible ? 'text' : 'password'"
          density="compact"
          placeholder="Enter password"
          prepend-inner-icon="mdi-lock-outline"
          variant="outlined"
          @click:append-inner="passwordVisible = !passwordVisible"
          name="password"
        ></v-text-field>

        <div class="text-subtitle-1 text-medium-emphasis">Confirm Password</div>
        <v-text-field
          v-model="confirmPassword"
          v-bind="confirmPasswordProps"
          :error-messages="errors.confirm_password"
          :append-inner-icon="confirmPasswordVisible ? 'mdi-eye-off' : 'mdi-eye'"
          :type="confirmPasswordVisible ? 'text' : 'password'"
          density="compact"
          placeholder="Confirm password"
          prepend-inner-icon="mdi-lock-outline"
          variant="outlined"
          @click:append-inner="confirmPasswordVisible = !confirmPasswordVisible"
          name="confirm_password"
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
          Register
        </v-btn>
      </v-form>

      <slot></slot>
    </v-card>
  </div>
</template>

<script setup lang="ts">
  import { userRegisterArgsSchema } from '@/schemas/user'
  import { register } from '@/stores/user'
  import type { UserRegisterArgs } from '@/types/user'

  const passwordVisible = ref(false)
  const confirmPasswordVisible = ref(false)

  const emit = defineEmits<{
    (event: 'success'): void
  }>()

  const { isLoading, mutate: handleRegister } = useMutation({
    mutationKey: ['user', 'register'],
    mutationFn: register,
    onError: () => {
      setFieldError('full_name', 'Registration error')
    },
    onSuccess: () => {
      emit('success')
    },
  })

  const { errors, values, defineField, meta, setFieldError } = useForm({
    validationSchema: toTypedSchema(userRegisterArgsSchema),
  })

  const [fullName, fullNameProps] = defineField('full_name')
  const [email, emailProps] = defineField('email')
  const [username, usernameProps] = defineField('username')
  const [password, passwordProps] = defineField('password')
  const [confirmPassword, confirmPasswordProps] = defineField('confirm_password')
</script>
