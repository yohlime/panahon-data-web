<template>
  <v-app-bar color="blue-darken-4" prominent>
    <v-toolbar-title>Panahon</v-toolbar-title>

    <v-spacer></v-spacer>

    <template v-if="!isLoggedIn">
      <v-btn variant="text" icon="mdi-login-variant" @click="toggleLogin" data-testid="open-login-btn"></v-btn>

      <v-btn variant="text" icon="mdi-account-plus" @click="toggleRegister" data-testid="open-register-btn"></v-btn>

      <v-dialog v-model="loginDialog">
        <Login @success="loginDialog = false">
          <v-card-text class="text-center">
            <v-btn color="blue" variant="text" append-icon="mdi-chevron-right" @click="toggleRegister"
              >Sign up now</v-btn
            >
          </v-card-text>
        </Login>
      </v-dialog>

      <v-dialog v-model="registerDialog">
        <Register @success="registerDialog = false">
          <v-card-text class="text-center">
            <v-btn color="blue" variant="text" append-icon="mdi-chevron-right" @click="toggleLogin">Login</v-btn>
          </v-card-text>
        </Register>
      </v-dialog>
    </template>

    <v-btn v-else variant="text" icon="mdi-logout-variant" @click="handleLogout" data-testid="logout-btn"></v-btn>
  </v-app-bar>
</template>

<script setup lang="ts">
  import { useStore } from '@nanostores/vue'

  import { $isLoggedIn, logout } from '@/stores/user'

  const isLoggedIn = useStore($isLoggedIn)

  const loginDialog = ref(false)
  const registerDialog = ref(false)

  const { mutate: handleLogout } = useMutation({
    mutationKey: ['user', 'logout'],
    mutationFn: logout,
    onSuccess: () => {
      loginDialog.value = false
      registerDialog.value = false
    },
  })

  const toggleLogin = () => {
    registerDialog.value = false
    loginDialog.value = true
  }

  const toggleRegister = () => {
    loginDialog.value = false
    registerDialog.value = true
  }
</script>
