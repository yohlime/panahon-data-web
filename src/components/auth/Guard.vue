<template></template>

<script setup lang="ts">
  import { watch } from 'vue'
  import { useQuery } from '@tanstack/vue-query'

  import { fetchAuthUser } from '@/stores/user'
  import { route } from '@/stores/routes'

  const props = withDefaults(defineProps<{ roles?: string[] }>(), { roles: () => [] })

  const { data, isFetched } = useQuery({
    queryKey: ['auth', 'user'],
    queryFn: fetchAuthUser,
    staleTime: 5 * 60 * 1000,
  })

  watch([isFetched, data], () => {
    if (!isFetched.value || typeof window === 'undefined') return

    const user = data.value
    const allowed = !!user && (props.roles.length === 0 || props.roles.some((role) => user.roles?.includes(role)))

    if (!allowed) {
      window.location.replace(route())
    }
  })
</script>
