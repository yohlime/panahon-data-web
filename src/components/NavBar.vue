<template>
  <header>
    <nav class="flex justify-between items-center bg-white md:new-navbar p-4">
      <div class="hidden md:flex flex-col items-center">
        <h1 class="font-trajan text-xl md:text-2xl tracking-3px">Panahon</h1>
      </div>
      <div class="flex flex-col items-center">
        <ul>
          <li v-if="!isLoggedIn">
            <a
              class="py-2 px-3 text-gray-900 rounded-sm hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-blue-700 md:p-0 dark:text-white md:dark:hover:text-blue-500 dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent"
              @click.prevent="showLogin"
            >
              Login
            </a>
          </li>
          <li v-else>
            <a
              class="py-2 px-3 text-gray-900 rounded-sm hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-blue-700 md:p-0 dark:text-white md:dark:hover:text-blue-500 dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent"
              @click.prevent="handleLogout"
            >
              Logout
            </a>
          </li>
        </ul>
      </div>
    </nav>
    <DialogRoot v-model:open="showDialog">
      <DialogPortal>
        <DialogOverlay class="bg-gray-900/40 data-[state=open]:animate-overlayShow fixed inset-0 z-30" />
        <DialogContent
          class="data-[state=open]:animate-contentShow fixed top-[50%] left-[50%] max-h-[85vh] w-[90vw] max-w-[450px] translate-x-[-50%] translate-y-[-50%] rounded-[6px] bg-white p-[25px] shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,_hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px] focus:outline-none z-[100]"
          :aria-describedby="undefined"
          asChild
        >
          <div v-if="loginDialog" class="flex flex-col gap-4">
            <LoginForm @success="handleLoginSuccess" />
            <p class="text-sm font-light text-gray-500 dark:text-gray-400">
              Don’t have an account yet?
              <a
                href="#"
                class="font-medium text-blue-600 hover:underline dark:text-blue-500"
                @click.prevent="showSignUp"
                >Sign up</a
              >
            </p>
          </div>
          <div v-if="signupDialog" class="flex flex-col gap-4">
            <SignupForm @success="handleSignupSuccess" />
            <p class="text-sm font-light text-gray-500 dark:text-gray-400">
              Already have an account?
              <a
                href="#"
                class="font-medium text-blue-600 hover:underline dark:text-blue-500"
                @click.prevent="showLogin"
                >Login</a
              >
            </p>
          </div>
        </DialogContent>
      </DialogPortal>
    </DialogRoot>
  </header>
</template>

<script setup lang="ts">
  import { ref } from 'vue'
  import { useQuery, useQueryClient, useMutation } from '@tanstack/vue-query'
  import { useStore } from '@nanostores/vue'

  import { $activeRoute } from '@/stores/routes'
  import { $page as $stnPage, $perPage as $stnPerPage } from '@/stores/station'
  import { $isLoggedIn, getUser, logout } from '@/stores/user'

  import { DialogContent, DialogOverlay, DialogPortal, DialogRoot } from 'reka-ui'

  import LoginForm from '@/components/form/Login.vue'
  import SignupForm from '@/components/form/SignUp.vue'

  const isLoggedIn = useStore($isLoggedIn)
  const activeRoute = useStore($activeRoute)
  const stnPage = useStore($stnPage)
  const stnPerPage = useStore($stnPerPage)

  const showDialog = ref(false)
  const loginDialog = ref(false)
  const signupDialog = ref(false)

  const queryClient = useQueryClient()

  useQuery({
    queryKey: ['auth', 'user'],
    queryFn: async () => {
      const user = await getUser()
      return user ?? {}
    },
  })

  const { mutate: handleLogout } = useMutation({
    mutationKey: ['auth', 'logout'],
    mutationFn: logout,
    onSuccess: async () => {
      await invalidateQueries()
      loginDialog.value = false
      showDialog.value = false
    },
  })

  const showLogin = () => {
    loginDialog.value = true
    signupDialog.value = false
    showDialog.value = true
  }

  const showSignUp = () => {
    loginDialog.value = false
    signupDialog.value = true
    showDialog.value = true
  }

  const handleLoginSuccess = async () => {
    await invalidateQueries()
    loginDialog.value = false
    showDialog.value = false
  }

  const handleSignupSuccess = async () => {
    await invalidateQueries()
    signupDialog.value = false
    showDialog.value = false
  }

  const invalidateQueries = async () => {
    if (activeRoute.value?.name === 'stations') {
      await queryClient.invalidateQueries({ queryKey: ['station', stnPage, stnPerPage] })
    }
  }
</script>
