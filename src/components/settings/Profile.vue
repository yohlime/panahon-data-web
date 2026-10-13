<template>
  <section class="bg-white rounded-lg p-4 shadow-sm max-w-xl">
    <h2 class="text-lg font-semibold mb-3">Profile</h2>
    <div class="flex flex-col gap-3">
      <Input name="username" :model-value="user?.username ?? ''" disabled>Username</Input>
      <Input name="email" :model-value="user?.email ?? ''" disabled>Email</Input>
      <Input name="password" type="password" placeholder="••••••••" disabled>New password</Input>
      <p class="text-xs text-gray-400">Profile editing is not implemented yet.</p>
    </div>
  </section>
</template>

<script setup lang="ts">
  import { useStore } from '@nanostores/vue'

  import { $authUser } from '@/stores/user'

  import Input from '@/components/ui/Input.vue'

  const user = useStore($authUser)
</script>
