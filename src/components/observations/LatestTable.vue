<template>
  <Table v-if="!isLoading && data" :data="items" :columns="columns" />
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import { useQuery } from '@tanstack/vue-query'

  import { listLatestObservations } from '@/stores/observation'
  import type { LatestObservation } from '@/types/observation'

  import Table from '@/components/ui/Table.vue'

  const { isLoading, data } = useQuery({
    queryKey: ['observations', 'latest'],
    queryFn: listLatestObservations,
  })

  const items = computed(() => data.value ?? [])

  const num = (v: number | null | undefined, d = 1) => (v === null || v === undefined ? '—' : v.toFixed(d))
  const dt = (v: Date | null | undefined) => (v ? new Date(v).toLocaleString() : '—')

  const columns = [
    { accessorKey: 'name', header: 'Station' },
    {
      id: 'temp',
      header: 'Temp (°C)',
      cell: ({ row }: { row: { original: LatestObservation } }) => num(row.original.obs.temp),
    },
    {
      id: 'rh',
      header: 'RH (%)',
      cell: ({ row }: { row: { original: LatestObservation } }) => num(row.original.obs.rh),
    },
    {
      id: 'wspd',
      header: 'Wind (m/s)',
      cell: ({ row }: { row: { original: LatestObservation } }) => num(row.original.obs.wspd, 2),
    },
    {
      id: 'wdir',
      header: 'Dir',
      cell: ({ row }: { row: { original: LatestObservation } }) => num(row.original.obs.wdir, 0),
    },
    {
      id: 'rain',
      header: 'Rain',
      cell: ({ row }: { row: { original: LatestObservation } }) => num(row.original.obs.rain, 2),
    },
    {
      id: 'timestamp',
      header: 'Timestamp',
      cell: ({ row }: { row: { original: LatestObservation } }) => dt(row.original.obs.timestamp),
    },
  ]
</script>
