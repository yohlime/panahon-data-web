<template>
  <div class="w-full flex flex-col gap-4">
    <h1 class="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
      Station Observations
    </h1>

    <div v-if="isLoading" class="flex justify-center p-4">
      <div class="i-mdi:loading animate-spin text-2xl"></div>
    </div>

    <Table v-else-if="data" :data="items" :columns="columns" />

    <Pagination
      v-if="data"
      v-model:page="page"
      v-model:perPage="perPage"
      :nextPage="data.next_page"
      :prevPage="data.prev_page"
      :totalPages="data.total_pages"
    />

    <div class="flex justify-end">
      <Button class="bg-gray-200 border border-gray-400 hover:bg-gray-300" @click="emit('close')">Close</Button>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed, ref } from 'vue'
  import { useQuery } from '@tanstack/vue-query'

  import { listStationObservations } from '@/stores/observation'
  import { getMyAccess } from '@/stores/access'
  import type { StationObservation } from '@/types/observation'

  import Table from '@/components/ui/Table.vue'
  import Pagination from '@/components/ui/Pagination.vue'
  import Button from '@/components/ui/Button.vue'

  const props = defineProps<{ stationID: number }>()
  const emit = defineEmits<{ close: [] }>()

  const { stationID } = props

  const page = ref(1)
  const perPage = ref(10)

  const { isLoading, data } = useQuery({
    queryKey: ['stations', stationID, 'records', { page, perPage }],
    queryFn: () => listStationObservations(stationID, page.value, perPage.value),
  })

  const { data: access } = useQuery({ queryKey: ['access', 'me'], queryFn: getMyAccess })

  const items = computed(() => data.value?.items ?? [])

  const num = (v: number | null | undefined, d = 1) => (v === null || v === undefined ? '—' : v.toFixed(d))
  const dt = (v: Date | string) => new Date(v).toLocaleString()

  const canSee = (name: string) => {
    const vars = access.value?.variables
    if (vars === undefined) return false
    if (vars === null) return true
    return vars.includes(name)
  }

  const columns = computed(() => {
    const cols = [
      {
        id: 'timestamp',
        header: 'Timestamp',
        cell: ({ row }: { row: { original: StationObservation } }) => dt(row.original.timestamp),
      },
    ]
    if (canSee('temp')) {
      cols.push({
        id: 'temp',
        header: 'Temperature (°C)',
        cell: ({ row }: { row: { original: StationObservation } }) => num(row.original.temp),
      })
    }
    if (canSee('rain')) {
      cols.push({
        id: 'rain',
        header: 'Rain (mm)',
        cell: ({ row }: { row: { original: StationObservation } }) => num(row.original.rr, 2),
      })
    }
    if (canSee('pres')) {
      cols.push({
        id: 'pres',
        header: 'Pressure (hPa)',
        cell: ({ row }: { row: { original: StationObservation } }) => num(row.original.pres),
      })
    }
    if (canSee('wind')) {
      cols.push(
        {
          id: 'wspd',
          header: 'Wind Speed (m/s)',
          cell: ({ row }: { row: { original: StationObservation } }) => num(row.original.wspd, 2),
        },
        {
          id: 'wdir',
          header: 'Wind Direction (°)',
          cell: ({ row }: { row: { original: StationObservation } }) => num(row.original.wdir, 0),
        },
      )
    }
    return cols
  })
</script>
