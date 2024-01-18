<template>
  <v-card>
    <v-layout>
      <Header v-model:drawer="drawer" />
      <NavDrawer v-model="drawer" />
      <v-main>
        <slot />
      </v-main>
    </v-layout>
  </v-card>
</template>

<script setup lang="ts">
  const drawer = ref(true)
</script>
