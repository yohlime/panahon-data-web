<template>
  <div class="relative overflow-x-auto shadow-md sm:rounded-lg">
    <Table
      v-if="!isLoading"
      :data="items"
      :columns="columns"
      :column-visibility="columnVisibility"
      :show-actions="isAdmin"
      @delete-item="deleteItem"
    >
      <template #edit-form="{ itemID, close }"><Form :itemID="itemID" @close="close" /></template>
    </Table>
    <Pagination
      v-if="data"
      v-model:page="page"
      v-model:perPage="perPage"
      :nextPage="data.next_page"
      :prevPage="data.prev_page"
      :totalPages="data.total_pages"
    />

    <DialogRoot v-model:open="showObsDialog" v-slot="{ close }">
      <DialogPortal>
        <DialogOverlay class="bg-gray-900/40 fixed inset-0 z-30" />
        <DialogContent
          class="fixed top-[50%] left-[50%] max-h-[85vh] w-[95vw] max-w-[900px] translate-x-[-50%] translate-y-[-50%] overflow-y-auto rounded-[6px] bg-white p-[25px] shadow-lg focus:outline-none z-[100]"
          :aria-describedby="undefined"
          asChild
        >
          <StationObservationsDialog v-if="selectedStationID" :stationID="selectedStationID" @close="close" />
        </DialogContent>
      </DialogPortal>
    </DialogRoot>
  </div>
</template>

<script setup lang="ts">
  import { computed, h, ref, watchEffect } from 'vue'
  import { useStore, useVModel } from '@nanostores/vue'
  import { useQuery, useQueryClient, useMutation } from '@tanstack/vue-query'

  import { $page, $perPage, listStations, deleteStation } from '@/stores/station'
  import { $isAdmin, $isLoggedIn } from '@/stores/user'
  import type { Station } from '@/types/station'

  import { DialogContent, DialogOverlay, DialogPortal, DialogRoot } from 'reka-ui'
  import Table from '@/components/ui/Table.vue'
  import Pagination from '@/components/ui/Pagination.vue'
  import Button from '@/components/ui/Button.vue'
  import Form from '@/components/stations/Form.vue'
  import StationObservationsDialog from '@/components/observations/StationObservationsDialog.vue'

  const isAdmin = useStore($isAdmin)
  const isLoggedIn = useStore($isLoggedIn)
  const page = useVModel($page)
  const perPage = useVModel($perPage)

  const queryClient = useQueryClient()

  const { isLoading, data } = useQuery({
    queryKey: ['stations', 'list', { page, perPage }],
    queryFn: listStations,
  })

  const items = computed(() => data.value?.items)

  const showObsDialog = ref(false)
  const selectedStationID = ref(0)

  const openObservations = (stationID: number) => {
    selectedStationID.value = stationID
    showObsDialog.value = true
  }

  const columns = [
    { accessorKey: 'id', header: '#' },
    {
      accessorKey: 'name',
      header: 'Station Name',
    },
    { id: 'stationType', accessorKey: 'station_type', header: 'Type' },
    { accessorKey: 'status', header: 'Status' },
    { id: 'dateInstalled', accessorKey: 'date_installed', header: 'Date Installed' },
    {
      id: 'observations',
      header: 'Records',
      cell: ({ row }: { row: { original: Station } }) =>
        h(Button, { onClick: () => openObservations(row.original.id) }, () => 'View'),
    },
  ]

  const columnVisibility = ref({ dateInstalled: false })

  watchEffect(() => {
    columnVisibility.value = {
      ...columnVisibility.value,
      dateInstalled: isLoggedIn.value,
    }

    queryClient.invalidateQueries({ queryKey: ['stations', 'list', { page, perPage }] })
  })

  const { mutate: deleteItem } = useMutation({
    mutationKey: ['stations', 'delete'],
    mutationFn: deleteStation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stations', 'list', { page, perPage }] })
    },
    onError: (err) => {
      console.error(err)
    },
  })
</script>
