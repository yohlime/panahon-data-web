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
  </div>
</template>

<script setup lang="ts">
  import { computed, ref, watchEffect } from 'vue'
  import { useStore, useVModel } from '@nanostores/vue'
  import { useQuery, useQueryClient, useMutation } from '@tanstack/vue-query'

  import { $page, $perPage, listStations, deleteStation } from '@/stores/station'
  import { $isAdmin, $isLoggedIn } from '@/stores/user'

  import Table from '@/components/ui/Table.vue'
  import Pagination from '@/components/ui/Pagination.vue'
  import Form from '@/components/stations/Form.vue'

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

  const columns = [
    { accessorKey: 'id', header: '#' },
    {
      accessorKey: 'name',
      header: 'Station Name',
    },
    { id: 'stationType', accessorKey: 'station_type', header: 'Type' },
    { accessorKey: 'status', header: 'Status' },
    { id: 'dateInstalled', accessorKey: 'date_installed', header: 'Date Installed' },
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
      console.log(err)
    },
  })
</script>
