<template>
  <nav class="flex items-center justify-end p-2" aria-label="Table navigation">
    <div class="flex items-center justify-between gap-2">
      <ul class="inline-flex -space-x-px text-sm">
        <li>
          <button
            class="flex items-center justify-center px-3 h-8 ms-0 leading-tight text-gray-500 bg-white border border-e-0 border-gray-300 rounded-s-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
            @click="() => (page = 1)"
            :disabled="page === 1"
          >
            <div class="i-mdi:chevron-double-left"></div>
          </button>
        </li>
        <li>
          <button
            class="flex items-center justify-center px-3 h-8 leading-tight text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
            @click="() => (page = prevPage)"
            :disabled="prevPage === 0"
          >
            <div class="i-mdi:chevron-left"></div>
          </button>
        </li>
        <li>
          <button
            class="flex items-center justify-center px-3 h-8 leading-tight text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
            @click="() => (page = nextPage)"
            :disabled="nextPage === 0"
          >
            <div class="i-mdi:chevron-right"></div>
          </button>
        </li>
        <li>
          <button
            class="flex items-center justify-center px-3 h-8 leading-tight text-gray-500 bg-white border border-gray-300 rounded-e-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
            @click="() => (page = totalPages)"
            :disabled="page === totalPages"
          >
            <div class="i-mdi:chevron-double-right"></div>
          </button>
        </li>
      </ul>
      <div class="flex items-center gap-1">
        <div>Page</div>
        <strong>
          {{ page }} of
          {{ totalPages }}
        </strong>
      </div>
      <div class="flex items-center justify-between gap-2">
        <div class="flex items-center justify-between gap-2">
          <label for="go-to-page">| Go to page:</label>
          <input
            id="go-to-page"
            type="number"
            v-model="page"
            class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-mo-Blue/40 focus:border-mo-Blue w-12 p-2 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-mo-Blue/40 dark:focus:border-mo-Blue"
          />
        </div>
        <div class="flex">
          <select
            v-model="perPage"
            class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-mo-Blue/40 focus:border-mo-Blue w-24 p-2 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-mo-Blue/40 dark:focus:border-mo-Blue"
          >
            <option :key="pageSize" :value="pageSize" v-for="pageSize in pageSizes">Show {{ pageSize }}</option>
          </select>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
  withDefaults(
    defineProps<{
      prevPage?: number
      nextPage?: number
      totalPages: number
      pageSizes?: number[]
    }>(),
    {
      prevPage: 0,
      nextPage: 0,
      pageSizes: [10, 20, 30, 40, 50],
    },
  )

  const page = defineModel<number>('page')
  const perPage = defineModel<number>('perPage')
</script>
