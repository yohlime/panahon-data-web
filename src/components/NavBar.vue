<template>
  <header>
    <nav class="flex justify-between items-center bg-white p-3 md:new-navbar">
      <div class="flex items-center gap-2">
        <button class="p-2 text-gray-700 md:hidden" aria-label="Open menu" @click="openMobileNav">
          <div class="i-mdi:menu text-2xl"></div>
        </button>
        <a :href="route()" class="flex items-center gap-2">
          <img src="/mo-logo.png" alt="Manila Observatory" class="h-8 w-8 md:h-10 md:w-10 shrink-0" />
          <span class="font-trajan text-xl md:text-2xl tracking-3px text-mo-Blue md:text-white">Panahon</span>
        </a>
      </div>
      <div class="flex items-center gap-1">
        <template v-if="!isLoggedIn">
          <button
            type="button"
            class="p-2 rounded-lg text-gray-700 hover:bg-gray-100"
            aria-label="Log in"
            title="Log in"
            @click="showLogin"
          >
            <div class="i-mdi:login text-xl"></div>
          </button>
          <button
            type="button"
            class="p-2 rounded-lg text-gray-700 hover:bg-gray-100"
            aria-label="Register"
            title="Register"
            @click="showSignUp"
          >
            <div class="i-mdi:account-plus text-xl"></div>
          </button>
        </template>
        <template v-else>
          <a
            :href="route('settings')"
            class="p-2 rounded-lg text-gray-700 hover:bg-gray-100"
            aria-label="Settings"
            title="Settings"
          >
            <div class="i-mdi:cog text-xl"></div>
          </a>
          <button
            type="button"
            class="p-2 rounded-lg text-gray-700 hover:bg-gray-100"
            aria-label="Log out"
            title="Log out"
            @click="handleLogout"
          >
            <div class="i-mdi:logout text-xl"></div>
          </button>
        </template>
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
                class="font-medium text-mo-Blue hover:underline dark:text-mo-Blue"
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
                class="font-medium text-mo-Blue hover:underline dark:text-mo-Blue"
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

  import { $activeRoute, route } from '@/stores/routes'
  import { $page as $stnPage, $perPage as $stnPerPage } from '@/stores/station'
  import { $isLoggedIn, fetchAuthUser, logout } from '@/stores/user'
  import { setMobileNavOpen } from '@/stores/ui'

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
    queryFn: fetchAuthUser,
    staleTime: 5 * 60 * 1000,
  })

  const { mutate: handleLogout } = useMutation({
    mutationKey: ['auth', 'logout'],
    mutationFn: logout,
    onSettled: () => {
      loginDialog.value = false
      showDialog.value = false
      // Full reload: the guard reads the auth query on load, so a client-side
      // state change alone would leave us stranded on a protected page.
      window.location.replace(route())
    },
  })

  const showLogin = () => {
    loginDialog.value = true
    signupDialog.value = false
    showDialog.value = true
  }

  const openMobileNav = () => setMobileNavOpen(true)

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
    await queryClient.invalidateQueries({ queryKey: ['auth', 'user'] })
    if (activeRoute.value?.name === 'stations') {
      await queryClient.invalidateQueries({ queryKey: ['station', stnPage, stnPerPage] })
    }
  }
</script>
