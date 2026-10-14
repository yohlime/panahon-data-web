<template>
  <div class="w-full flex flex-col gap-4">
    <h1 class="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
      Access Entitlement
    </h1>

    <div v-if="isLoading" class="text-gray-500">Loading…</div>
    <AccessForm
      v-else
      :station-options="stationOptions"
      :variable-options="variableOptions"
      :initial-stations="initialStations"
      :initial-variables="initialVariables"
      :initial-max-days="data?.max_days_history"
      :is-pending="isPending"
      submit-label="Save"
      cancel-label="Cancel"
      @submit="onSave"
      @cancel="emit('close')"
    />
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'

  import { getUserAccess, updateUserAccess } from '@/stores/access'
  import { listAllStations } from '@/stores/station'
  import { ACCESS_VARIABLES } from '@/schemas/access'

  import { MULTISELECT_ALL } from '@/components/ui/Select.vue'
  import AccessForm, { type AccessFormValues } from '@/components/access/AccessForm.vue'

  const props = defineProps<{ userID: number }>()
  const emit = defineEmits<{ close: [] }>()

  const { userID } = props
  const queryClient = useQueryClient()

  const { isLoading, data } = useQuery({
    queryKey: ['users', userID, 'access'],
    queryFn: () => getUserAccess(userID),
  })
  const { data: stations } = useQuery({ queryKey: ['stations', 'all'], queryFn: listAllStations })

  const stationOptions = computed(() => (stations.value?.items ?? []).map((s) => ({ value: s.id, label: s.name })))
  const variableOptions = computed(() => ACCESS_VARIABLES.map((v) => ({ value: v, label: v })))

  const initialStations = computed(() =>
    data.value?.station_ids === null ? [MULTISELECT_ALL] : (data.value?.station_ids ?? []),
  )
  const initialVariables = computed(() =>
    data.value?.variables === null ? [MULTISELECT_ALL] : (data.value?.variables ?? []),
  )

  const { isPending, mutate } = useMutation({
    mutationKey: ['users', userID, 'access', 'update'],
    mutationFn: (values: AccessFormValues) =>
      updateUserAccess(userID, {
        all_stations: values.all_stations,
        station_ids: values.station_ids,
        all_variables: values.all_variables,
        variables: values.variables,
        max_days_history: values.max_days_history,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users', userID, 'access'] })
      emit('close')
    },
  })

  const onSave = (values: AccessFormValues) => mutate(values)
</script>
