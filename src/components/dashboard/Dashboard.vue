<template>
  <div class="p-4 flex flex-col gap-6">
    <h1 class="text-2xl font-bold">Dashboard</h1>

    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard :label="`Reporting (${reportingWindowLabel})`" :value="reportingCount" icon="mdi-access-point" />
      <StatCard label="Newest Reading" :value="newestRelative" :hint="newestAbsolute" icon="mdi-clock-outline" />

      <template v-if="isLoggedIn">
        <StatCard label="My Stations" :value="myStationCount" icon="mdi-weather-pouring" />
        <StatCard label="My Stations Reporting" :value="myReportingCount" icon="mdi-access-point-check" />
        <StatCard label="Online / Offline" :value="`${onlineCount} / ${offlineCount}`" icon="mdi-lan-connect" />
        <StatCard label="My API Keys" :value="apiKeyCount" icon="mdi-key-chain" :to="route('settings')" />
        <StatCard label="History Access" :value="historyLabel" :hint="variablesLabel" icon="mdi-calendar-range" />
      </template>

      <StatCard v-if="isAdmin" label="Pending API Requests" :value="pendingRequests" icon="mdi-clipboard-check" />
      <StatCard v-if="isSuperAdmin" label="Users" :value="userCount" icon="mdi-account" />
    </div>

    <section class="bg-white rounded-lg p-4 shadow-sm">
      <h2 class="text-lg font-semibold mb-3">Latest Observations</h2>
      <LatestTable />
    </section>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import { useStore } from '@nanostores/vue'
  import { useQuery } from '@tanstack/vue-query'
  import { formatDistanceToNow } from 'date-fns'

  import { listLatestObservations } from '@/stores/observation'
  import { getStationStats } from '@/stores/station'
  import { listApiTokens } from '@/stores/apiToken'
  import { getUserAccess, listAccessRequests } from '@/stores/access'
  import { $authUserID, $isLoggedIn, $isAdmin, $isSuperAdmin, listUsers } from '@/stores/user'
  import { route } from '@/stores/routes'

  import StatCard from '@/components/dashboard/StatCard.vue'
  import LatestTable from '@/components/observations/LatestTable.vue'

  const isLoggedIn = useStore($isLoggedIn)
  const isAdmin = useStore($isAdmin)
  const isSuperAdmin = useStore($isSuperAdmin)
  const userID = useStore($authUserID)

  const { data: latest } = useQuery({ queryKey: ['observations', 'latest'], queryFn: listLatestObservations })
  const { data: publicStats } = useQuery({
    queryKey: ['stations', 'stats', 'public'],
    queryFn: () => getStationStats(false),
  })
  const { data: stats } = useQuery({
    queryKey: ['stations', 'stats', 'accessible'],
    queryFn: () => getStationStats(true),
    enabled: isLoggedIn,
  })
  const { data: apiTokens } = useQuery({
    queryKey: ['users', userID, 'api-tokens'],
    queryFn: () => listApiTokens(userID.value!),
    enabled: () => !!userID.value,
  })
  const { data: access } = useQuery({
    queryKey: ['users', userID, 'access'],
    queryFn: () => getUserAccess(userID.value!),
    enabled: () => !!userID.value,
  })
  const { data: pending } = useQuery({
    queryKey: ['access-requests', 'pending'],
    queryFn: () => listAccessRequests('pending'),
    enabled: isAdmin,
  })
  const { data: users } = useQuery({ queryKey: ['users', 'list'], queryFn: listUsers, enabled: isSuperAdmin })

  const reportingCount = computed(() => publicStats.value?.reporting ?? latest.value?.length ?? 0)
  const reportingWindowLabel = computed(() => {
    const seconds = publicStats.value?.window_seconds
    if (!seconds) return 'recent'
    if (seconds === 3600) return 'last hour'
    if (seconds % 3600 === 0) return `last ${seconds / 3600} hours`
    if (seconds % 60 === 0) return `last ${seconds / 60} minutes`
    return `last ${seconds} seconds`
  })

  const newestTimestamp = computed(() => {
    const times = (latest.value ?? [])
      .map((o) => o.obs.timestamp)
      .filter((t): t is Date => t instanceof Date)
      .map((t) => t.getTime())
    return times.length ? new Date(Math.max(...times)) : undefined
  })
  const newestRelative = computed(() =>
    newestTimestamp.value ? formatDistanceToNow(newestTimestamp.value, { addSuffix: true }) : '—',
  )
  const newestAbsolute = computed(() => newestTimestamp.value?.toLocaleString() ?? '')

  const myStationCount = computed(() => stats.value?.total ?? 0)
  const myReportingCount = computed(() => stats.value?.reporting ?? 0)
  const onlineCount = computed(() => stats.value?.online ?? 0)
  const offlineCount = computed(() => stats.value?.offline ?? 0)

  const apiKeyCount = computed(() => apiTokens.value?.length ?? 0)
  const pendingRequests = computed(() => pending.value?.count ?? 0)
  const userCount = computed(() => users.value?.count ?? 0)

  const historyLabel = computed(() => {
    const days = access.value?.max_days_history
    if (days === undefined) return '—'
    if (days === -1) return 'Unlimited'
    if (days > 0 && days % 365 === 0) {
      const years = days / 365
      return `${years} year${years > 1 ? 's' : ''}`
    }
    return `${days} days`
  })
  const variablesLabel = computed(() => {
    const vars = access.value?.variables
    if (vars === null || vars === undefined) return 'All variables'
    return `${vars.length} variable${vars.length === 1 ? '' : 's'}`
  })
</script>
