<template>
  <div class="relative overflow-x-auto shadow-md sm:rounded-lg">
    <table class="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
      <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
        <tr v-for="headerGroup in table.getHeaderGroups()" :key="headerGroup.id">
          <th v-for="header in headerGroup.headers" :key="header.id" :colSpan="header.colSpan" class="px-6 py-3">
            <FlexRender
              v-if="!header.isPlaceholder"
              :render="header.column.columnDef.header"
              :props="header.getContext()"
            />
          </th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="row in table.getRowModel().rows"
          :key="row.id"
          class="bg-white border-b dark:bg-gray-800 dark:border-gray-700 border-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600"
        >
          <td v-for="cell in row.getVisibleCells()" :key="cell.id" class="px-6 py-4">
            <FlexRender :render="cell.column.columnDef.cell" :props="cell.getContext()" />
          </td>
        </tr>
      </tbody>
    </table>
    <DialogRoot v-model:open="editFormDialog" v-slot="{ close }">
      <DialogPortal>
        <DialogOverlay class="bg-gray-900/40 data-[state=open]:animate-overlayShow fixed inset-0 z-30" />
        <DialogContent
          class="data-[state=open]:animate-contentShow fixed top-[50%] left-[50%] max-h-[85vh] w-[90vw] max-w-[450px] translate-x-[-50%] translate-y-[-50%] rounded-[6px] bg-white p-[25px] shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,_hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px] focus:outline-none z-[100]"
          :aria-describedby="undefined"
          asChild
        >
          <slot v-if="editFormDialog" name="edit-form" :itemID="itemID" :close="close"></slot>
        </DialogContent>
      </DialogPortal>
    </DialogRoot>
    <AlertDialogRoot v-model:open="deleteDialog">
      <AlertDialogPortal>
        <AlertDialogOverlay class="bg-gray-900/40 data-[state=open]:animate-overlayShow fixed inset-0 z-30" />
        <AlertDialogContent
          class="z-[100] text-sm data-[state=open]:animate-contentShow fixed top-[50%] left-[50%] max-h-[85vh] w-[90vw] max-w-[500px] translate-x-[-50%] translate-y-[-50%] rounded-lg bg-white p-[25px] shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,_hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px] focus:outline-none"
        >
          <AlertDialogTitle class="text-black m-0 text-[17px] font-semibold">
            Are you absolutely sure?
          </AlertDialogTitle>
          <AlertDialogDescription class="text-gray-700 mt-4 mb-5 text-sm leading-normal">
            This action cannot be undone.
          </AlertDialogDescription>
          <div class="flex justify-end gap-4">
            <AlertDialogCancel
              class="text-gray-700 bg-gray-300 hover:bg-gray-400 focus:shadow-gray-500 inline-flex h-[35px] items-center justify-center rounded-md px-[15px] font-semibold leading-none outline-none focus:shadow-[0_0_0_2px]"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              class="text-red-700 bg-red-300 hover:bg-red-400 focus:shadow-red-500 inline-flex h-[35px] items-center justify-center rounded-md px-[15px] font-semibold leading-none outline-none focus:shadow-[0_0_0_2px]"
              @click="handleDeleteAction"
            >
              Yes
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialogPortal>
    </AlertDialogRoot>
  </div>
</template>

<script lang="ts">
  export type VisibleActions = {
    edit?: boolean
    delete?: boolean
  }
</script>

<script setup lang="ts" generic="T extends { id: number }, U extends ColumnDef<T>">
  import { ref, toRefs, computed, h } from 'vue'
  import { createColumnHelper, FlexRender, getCoreRowModel, useVueTable } from '@tanstack/vue-table'

  import {
    DialogContent,
    DialogOverlay,
    DialogPortal,
    DialogRoot,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogOverlay,
    AlertDialogPortal,
    AlertDialogRoot,
    AlertDialogTitle,
  } from 'reka-ui'

  import type { ColumnDef } from '@tanstack/vue-table'

  const emit = defineEmits<{
    deleteItem: [id: number]
  }>()

  const itemID = ref(0)
  const editFormDialog = ref(false)
  const deleteDialog = ref(false)

  const props = withDefaults(
    defineProps<{
      data: T[]
      columns: U[]
      columnVisibility?: Record<string, boolean>
      manualPagination?: boolean
      showActions?: boolean | VisibleActions
    }>(),
    {
      data: () => [] as T[],
      manualPagination: false,
      showActions: false,
    },
  )

  const { data, columns, columnVisibility, manualPagination, showActions: _showActions } = toRefs(props)

  const columnHelper = createColumnHelper<T>()
  const table = useVueTable({
    data,
    get columns() {
      return [
        ...columns.value,
        columnHelper.display({
          id: 'actions',
          cell: ({ row }) =>
            h('div', { class: 'flex text-xl gap-1' }, [
              showActionsObj.value.edit &&
                h('div', {
                  class: 'i-mdi:pencil hover:text-mo-Blue cursor-pointer',
                  onClick: () => {
                    itemID.value = row.original.id
                    editFormDialog.value = true
                  },
                }),
              showActionsObj.value.delete &&
                h('div', {
                  class: 'i-mdi:delete hover:text-red-400 cursor-pointer',
                  onClick: () => {
                    itemID.value = row.original.id
                    deleteDialog.value = true
                  },
                }),
            ]),
        }),
      ]
    },
    state: {
      get columnVisibility() {
        return { ...columnVisibility.value }
      },
    },
    getCoreRowModel: getCoreRowModel(),
    manualPagination: manualPagination.value,
  })

  const handleDeleteAction = () => {
    if (itemID.value > 0) emit('deleteItem', itemID.value)
  }

  const showActionsObj = computed(() =>
    typeof _showActions.value === 'boolean'
      ? {
          edit: _showActions.value,
          delete: _showActions.value,
        }
      : {
          edit: false,
          delete: false,
          ..._showActions.value,
        },
  )

  const showActions = computed(() => showActionsObj.value.edit || showActionsObj.value.delete)
</script>
