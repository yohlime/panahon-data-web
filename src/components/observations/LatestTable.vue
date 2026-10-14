<template>
  <div class="flex flex-col gap-2">
    <Table v-if="!isLoading && data" :data="pagedItems" :columns="columns" />

    <Pagination
      v-if="!isLoading && items.length"
      v-model:page="page"
      v-model:perPage="perPage"
      :nextPage="nextPage"
      :prevPage="prevPage"
      :totalPages="totalPages"
    />
  </div>
</template>

<script setup lang="ts">
  import { computed, ref, watch } from 'vue'
  import { useQuery } from '@tanstack/vue-query'

  import { listLatestObservations } from '@/stores/observation'
  import type { LatestObservation } from '@/types/observation'

  import Table from '@/components/ui/Table.vue'
  import Pagination from '@/components/ui/Pagination.vue'

  const { isLoading, data } = useQuery({
    queryKey: ['observations', 'latest'],
    queryFn: listLatestObservations,
  })

  const items = computed(() => data.value ?? [])

  // The endpoint returns the whole snapshot, so paging is done client-side.
  const page = ref(1)
  const perPage = ref(10)

  const totalPages = computed(() => Math.max(1, Math.ceil(items.value.length / perPage.value)))
  const prevPage = computed(() => (page.value > 1 ? page.value - 1 : 0))
  const nextPage = computed(() => (page.value < totalPages.value ? page.value + 1 : 0))

  const pagedItems = computed(() => {
    const start = (page.value - 1) * perPage.value
    return items.value.slice(start, start + perPage.value)
  })

  // Keep the current page in range when the page size (or data) changes.
  watch([perPage, totalPages], () => {
    if (page.value > totalPages.value) page.value = totalPages.value
  })

  const num = (v: number | null | undefined, d = 1) => (v === null || v === undefined ? '—' : v.toFixed(d))
  const dt = (v: Date | null | undefined) => (v ? new Date(v).toLocaleString() : '—')

  const columns = [
    { accessorKey: 'name', header: 'Station' },
    {
      id: 'timestamp',
      header: 'Timestamp',
      cell: ({ row }: { row: { original: LatestObservation } }) => dt(row.original.obs.timestamp),
    },
    {
      id: 'temp',
      header: 'Temperature (°C)',
      cell: ({ row }: { row: { original: LatestObservation } }) => num(row.original.obs.temp),
    },
    {
      id: 'rain',
      header: 'Rain (mm)',
      cell: ({ row }: { row: { original: LatestObservation } }) => num(row.original.obs.rain, 2),
    },
    {
      id: 'pres',
      header: 'Pressure (hPa)',
      cell: ({ row }: { row: { original: LatestObservation } }) => num(row.original.obs.mslp),
    },
    {
      id: 'wspd',
      header: 'Wind Speed (m/s)',
      cell: ({ row }: { row: { original: LatestObservation } }) => num(row.original.obs.wspd, 2),
    },
    {
      id: 'wdir',
      header: 'Wind Direction (°)',
      cell: ({ row }: { row: { original: LatestObservation } }) => num(row.original.obs.wdir, 0),
    },
  ]
</script>
