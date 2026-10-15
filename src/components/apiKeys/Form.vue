<template>
  <div class="w-full flex flex-col space-y-4 md:space-y-6">
    <h1 class="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
      Create API Key
    </h1>
    <form class="space-y-3 w-full" @submit.prevent="handleSubmit">
      <Input name="name" v-model="name" v-bind="nameProps">Name</Input>

      <ScopeSelects
        v-model:stations="stationsSel"
        v-model:variables="variablesSel"
        v-model:maxDays="maxDaysSel"
        :station-options="stationOptions"
        :variable-options="variableOptions"
        :max-days-options="maxDaysOptions"
      />

      <div class="flex justify-end gap-2 mt-4">
        <Button
          type="button"
          class="w-1/3 bg-gray-200 border border-gray-400 hover:bg-gray-300"
          @click.prevent="$emit('close')"
          >Cancel</Button
        >
        <Button
          :disabled="!meta.valid"
          :is-pending="isPending"
          :class="[
            'w-1/3 text-gray-200',
            meta.valid
              ? 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800'
              : 'bg-blue-400 dark:bg-blue-500',
          ]"
          @click.prevent="handleSubmit"
          >Add</Button
        >
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
  import { computed, ref, watch } from 'vue'
  import { useStore } from '@nanostores/vue'
  import { useMutation, useQuery } from '@tanstack/vue-query'
  import { useForm } from 'vee-validate'
  import { toTypedSchema } from '@vee-validate/zod'

  import { createApiToken } from '@/stores/apiToken'
  import { getUserAccess } from '@/stores/access'
  import { listAllStations } from '@/stores/station'
  import { $authUserID } from '@/stores/user'
  import { ACCESS_VARIABLES } from '@/schemas/access'
  import { createAPITokenArgsSchema } from '@/schemas/apiToken'
  import type { APITokenWithSecret, CreateAPITokenReq } from '@/types/apiToken'

  import { MULTISELECT_ALL } from '@/components/ui/Select.vue'
  import Input from '@/components/ui/Input.vue'
  import Button from '@/components/ui/Button.vue'
  import ScopeSelects, { MAX_DAYS_OPTIONS } from '@/components/access/ScopeSelects.vue'

  const emit = defineEmits<{
    close: []
    success: [d: APITokenWithSecret]
    error: [err: Error]
  }>()

  const userID = useStore($authUserID)

  // A key can only be as broad as its owner's entitlement, so the picker is
  // limited to (and defaults to) that entitlement.
  const { data: access } = useQuery({
    queryKey: ['users', userID, 'access'],
    queryFn: () => getUserAccess(userID.value!),
    enabled: () => !!userID.value,
  })
  const { data: stations } = useQuery({ queryKey: ['stations', 'all'], queryFn: listAllStations })

  const stationOptions = computed(() => {
    const items = stations.value?.items ?? []
    const ids = access.value?.station_ids
    return (ids == null ? items : items.filter((s) => ids.includes(s.id))).map((s) => ({ value: s.id, label: s.name }))
  })
  const variableOptions = computed(() => {
    const vars = access.value?.variables
    return (vars == null ? [...ACCESS_VARIABLES] : vars).map((v) => ({ value: v, label: v }))
  })

  // Only offer history within the entitlement (unlimited opens every option).
  const maxDaysOptions = computed(() => {
    const ent = access.value?.max_days_history
    if (ent == null || ent === -1) return MAX_DAYS_OPTIONS
    if (ent === 0) return MAX_DAYS_OPTIONS.filter((o) => o.value === 365)
    const opts = MAX_DAYS_OPTIONS.filter((o) => o.value > 0 && o.value <= ent)
    if (!opts.some((o) => o.value === ent)) opts.unshift({ value: ent, text: `${ent} days` })
    return opts
  })

  const stationsSel = ref<(string | number)[]>([])
  const variablesSel = ref<(string | number)[]>([])
  const maxDaysSel = ref(365)

  watch(
    access,
    (a) => {
      if (!a) return
      stationsSel.value = a.station_ids === null ? [MULTISELECT_ALL] : a.station_ids
      variablesSel.value = a.variables === null ? [MULTISELECT_ALL] : a.variables
      maxDaysSel.value = a.max_days_history === -1 ? -1 : a.max_days_history > 0 ? a.max_days_history : 365
    },
    { immediate: true },
  )

  const hasAll = (v: (string | number)[]) => v.includes(MULTISELECT_ALL)
  const selected = (v: (string | number)[]) => v.filter((x) => x !== MULTISELECT_ALL)

  const { defineField, meta, setValues, values } = useForm({
    validationSchema: toTypedSchema(createAPITokenArgsSchema),
  })

  const { mutate, isPending } = useMutation({
    mutationKey: ['api-tokens', 'create'],
    mutationFn: (args: CreateAPITokenReq) => createApiToken(userID.value!, args),
    onSuccess: (d: APITokenWithSecret) => {
      emit('success', d)
    },
    onError: (err) => {
      emit('error', err)
    },
  })

  const [name, nameProps] = defineField('name', {
    props: (state) => ({ 'error-message': state.errors[0] }),
  })

  const handleSubmit = () => {
    if (!meta.value.valid) return
    mutate({
      name: values.name ?? '',
      permissions: {
        station_ids: hasAll(stationsSel.value) ? null : selected(stationsSel.value).map(Number),
        variables: hasAll(variablesSel.value) ? null : selected(variablesSel.value).map(String),
        max_days_history: maxDaysSel.value,
      },
    })
  }
</script>
