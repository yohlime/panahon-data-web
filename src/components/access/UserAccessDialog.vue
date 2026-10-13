<template>
  <div class="w-full flex flex-col gap-4">
    <h1 class="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
      Access Entitlement
    </h1>

    <div v-if="isLoading" class="text-gray-500">Loading…</div>
    <form v-else class="flex flex-col gap-3" @submit.prevent="handleSave">
      <Input name="station-ids" v-model="form.stationIDs">Station IDs (comma-separated, empty = none)</Input>
      <label class="flex items-center gap-2 text-sm">
        <input type="checkbox" v-model="form.allStations" /> All stations
      </label>

      <div>
        <div class="text-sm font-medium text-gray-900 mb-1">Variables</div>
        <div class="flex flex-wrap gap-3">
          <label v-for="v in ACCESS_VARIABLES" :key="v" class="flex items-center gap-1 text-sm">
            <input type="checkbox" :value="v" v-model="form.variables" /> {{ v }}
          </label>
        </div>
        <label class="flex items-center gap-2 text-sm mt-2">
          <input type="checkbox" v-model="form.allVariables" /> All variables
        </label>
      </div>

      <Input name="max-days" type="number" v-model="form.maxDays">Max days history (1–365)</Input>

      <div class="flex justify-end gap-2 mt-2">
        <Button type="button" class="bg-gray-200 border border-gray-400 hover:bg-gray-300" @click="emit('close')"
          >Cancel</Button
        >
        <Button
          :is-pending="isPending"
          class="text-gray-200 bg-blue-600 hover:bg-blue-700 focus:ring-blue-300"
          @click.prevent="handleSave"
          >Save</Button
        >
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
  import { reactive, watch } from 'vue'
  import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'

  import { getUserAccess, updateUserAccess } from '@/stores/access'
  import { ACCESS_VARIABLES } from '@/schemas/access'

  import Input from '@/components/ui/Input.vue'
  import Button from '@/components/ui/Button.vue'

  const props = defineProps<{ userID: number }>()
  const emit = defineEmits<{ close: [] }>()

  const { userID } = props
  const queryClient = useQueryClient()

  const form = reactive({
    stationIDs: '',
    allStations: false,
    variables: [] as string[],
    allVariables: false,
    maxDays: '365',
  })

  const { isLoading, data } = useQuery({
    queryKey: ['users', userID, 'access'],
    queryFn: () => getUserAccess(userID),
  })

  watch(data, (a) => {
    if (!a) return
    form.allStations = a.station_ids === null
    form.stationIDs = a.station_ids && a.station_ids.length ? a.station_ids.join(', ') : ''
    form.allVariables = a.variables === null
    form.variables = a.variables ?? []
    form.maxDays = String(a.max_days_history)
  })

  const parseIDs = (s: string) =>
    s
      .split(',')
      .map((v) => v.trim())
      .filter((v) => v !== '')
      .map(Number)
      .filter((v) => !Number.isNaN(v))

  const { isPending, mutate } = useMutation({
    mutationKey: ['users', userID, 'access', 'update'],
    mutationFn: () =>
      updateUserAccess(userID, {
        all_stations: form.allStations,
        station_ids: form.allStations ? undefined : parseIDs(form.stationIDs),
        all_variables: form.allVariables,
        variables: form.allVariables ? undefined : form.variables,
        max_days_history: Number(form.maxDays) || 365,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users', userID, 'access'] })
      emit('close')
    },
  })

  const handleSave = () => mutate()
</script>
