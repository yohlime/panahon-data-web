<template>
  <dl :class="dense ? 'space-y-1 text-xs' : 'divide-y divide-gray-100 text-sm'">
    <div v-if="showStations" :class="rowClass">
      <dt :class="labelClass">{{ stationRowLabel }}</dt>
      <dd class="flex min-w-0 flex-wrap items-center gap-1.5">
        <span v-if="stationIds == null" :class="[badgeClass, allClass]">All stations</span>
        <span v-else-if="stationIds.length === 0" :class="[badgeClass, noneClass]">No stations</span>
        <template v-else>
          <span v-for="id in visibleStations" :key="id" :class="badgeClass" :title="stationName(id)">
            {{ stationName(id) }}
          </span>
          <button
            v-if="hiddenStationCount > 0"
            type="button"
            :class="[badgeClass, moreClass]"
            :aria-expanded="expanded"
            @click="expanded = true"
          >
            +{{ hiddenStationCount }} more
          </button>
          <button
            v-else-if="expanded && canCollapse"
            type="button"
            :class="[badgeClass, moreClass]"
            :aria-expanded="expanded"
            @click="expanded = false"
          >
            Show less
          </button>
        </template>
      </dd>
    </div>

    <div v-if="showVariables" :class="rowClass">
      <dt :class="labelClass">{{ variableRowLabel }}</dt>
      <dd class="flex min-w-0 flex-wrap items-center gap-1.5">
        <span v-if="variables == null" :class="[badgeClass, allClass]">All variables</span>
        <span v-else-if="variables.length === 0" :class="[badgeClass, noneClass]">No variables</span>
        <template v-else>
          <span v-for="variable in variables" :key="variable" :class="badgeClass">{{ variable }}</span>
        </template>
      </dd>
    </div>

    <div v-if="showHistory && maxDays != null" :class="rowClass">
      <dt :class="labelClass">{{ historyRowLabel }}</dt>
      <dd class="flex min-w-0 flex-wrap items-center gap-1.5">
        <span :class="[badgeClass, maxDays === -1 ? allClass : '']">{{ historyLabel(maxDays) }}</span>
      </dd>
    </div>
  </dl>
</template>

<script setup lang="ts">
  import { computed, ref, watch } from 'vue'

  import { historyLabel } from '@/utils/access'

  const props = withDefaults(
    defineProps<{
      stationIds?: number[] | null
      variables?: string[] | null
      maxDays?: number | null
      stationNames?: Map<number, string>
      maxVisibleStations?: number
      dense?: boolean
      showStations?: boolean
      showVariables?: boolean
      showHistory?: boolean
      stationRowLabel?: string
      variableRowLabel?: string
      historyRowLabel?: string
    }>(),
    {
      stationIds: null,
      variables: null,
      stationNames: () => new Map<number, string>(),
      maxVisibleStations: 3,
      dense: false,
      showStations: true,
      showVariables: true,
      showHistory: true,
      stationRowLabel: 'Stations',
      variableRowLabel: 'Variables',
      historyRowLabel: 'History',
    },
  )

  const expanded = ref(false)

  const stationList = computed(() => props.stationIds ?? [])
  const canCollapse = computed(() => stationList.value.length > props.maxVisibleStations)
  const hiddenStationCount = computed(() =>
    !expanded.value && canCollapse.value ? stationList.value.length - props.maxVisibleStations : 0,
  )
  const visibleStations = computed(() =>
    expanded.value ? stationList.value : stationList.value.slice(0, props.maxVisibleStations),
  )

  const stationName = (id: number) => props.stationNames.get(id) ?? `#${id}`

  const rowClass = computed(() =>
    props.dense ? 'grid grid-cols-[5.5rem_1fr] gap-1' : 'grid gap-1 py-2 sm:grid-cols-[8rem_1fr]',
  )
  const labelClass = computed(() => (props.dense ? 'text-[11px] text-gray-500' : 'text-gray-500'))

  const badgeClass =
    'inline-flex max-w-full items-center truncate rounded bg-mo-Blue/10 px-2 py-0.5 text-xs text-mo-Blue'
  const allClass = 'bg-emerald-50 text-emerald-700'
  const noneClass = 'bg-amber-50 text-amber-700'
  const moreClass = 'bg-gray-100 text-gray-600 hover:bg-gray-200'

  watch(
    () => props.stationIds,
    () => {
      expanded.value = false
    },
    { deep: true },
  )
</script>
