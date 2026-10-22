<template>
  <div class="w-full flex flex-col space-y-4 md:space-y-6">
    <h1 class="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
      {{ formTitle }}
    </h1>
    <form class="space-y-3 w-full" @submit.prevent="handleSubmit">
      <Input name="name" v-model="name" v-bind="nameProps">Station Name</Input>

      <div class="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <NumField :step="0.0001" :min="-180" :max="180" name="lon" v-model="lon" v-bind="lonProps">Longitude</NumField>
        <NumField :step="0.0001" :min="-90" :max="90" name="lat" v-model="lat" v-bind="latProps">Latitude</NumField>
        <NumField :step="0.1" name="elevation" v-model="elevation" v-bind="elevationProps">Elevation (m)</NumField>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <Select name="stn-type" v-model="stnType" v-bind="stnTypeProps" :options="stnTypes">Station Type</Select>
        <Select name="stn-type-2" v-model="stnType2" v-bind="stnType2Props" :options="stnTypes2">
          Station Type 2
        </Select>
      </div>

      <Input name="mobile-number" v-model="mobileNum" v-bind="mobileNumProps">Mobile Number</Input>
      <Input name="stn-url" v-model="stnUrl" v-bind="stnUrlProps">URL</Input>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <Select name="status" v-model="status" v-bind="statusProps" :options="statusOptions">Status</Select>
        <Input name="date-installed" type="date" v-model="dateInstalled" v-bind="dateInstalledProps">
          Date Installed
        </Input>
      </div>

      <Input name="address" v-model="address" v-bind="addressProps">Address</Input>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <Input name="province" v-model="province" v-bind="provinceProps">Province</Input>
        <Input name="region" v-model="region" v-bind="regionProps">Region</Input>
      </div>

      <p v-if="errorMessage" class="text-sm text-red-600">{{ errorMessage }}</p>

      <div class="flex justify-end gap-2 mt-4">
        <Button
          type="button"
          class="w-1/3 bg-gray-200 border border-gray-400 hover:bg-gray-300"
          @click.prevent="emit('close')"
          >Cancel</Button
        >
        <Button
          :disabled="!meta.valid"
          :is-pending="isPending"
          :class="[
            'w-1/3 text-gray-200',
            meta.valid
              ? 'bg-mo-Blue hover:bg-mo-Blue/90 focus:ring-mo-Blue/30 dark:bg-mo-Blue dark:hover:bg-mo-Blue/90 dark:focus:ring-mo-Blue/40'
              : 'bg-mo-Blue/60 dark:bg-mo-Blue',
          ]"
          @click.prevent="handleSubmit"
          >{{ isNew ? 'Add' : 'Save' }}</Button
        >
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
  import { computed, ref, toRefs } from 'vue'
  import { useQuery, useMutation } from '@tanstack/vue-query'
  import { useForm } from 'vee-validate'
  import { toTypedSchema } from '@vee-validate/zod'

  import { stationTypes, statusOptions, getStation, createOrUpdateStation } from '@/stores/station'
  import { stationInputSchema } from '@/schemas/station'
  import type { Station, StationInput } from '@/types/station'

  import Input from '@/components/ui/Input.vue'
  import NumField from '@/components/ui/NumField.vue'
  import Button from '@/components/ui/Button.vue'
  import Select from '@/components/ui/Select.vue'

  const props = withDefaults(defineProps<{ itemID?: number }>(), { itemID: 0 })

  const emit = defineEmits<{
    close: []
    success: [d: Station]
    error: [err: Error]
  }>()

  const { itemID } = toRefs(props)

  const isNew = computed(() => itemID.value <= 0)
  const formTitle = computed(() => (isNew.value ? 'New Station' : 'Edit Station'))

  const errorMessage = ref('')
  const extractError = (err: unknown) => {
    const e = err as { response?: { data?: { error?: string } }; message?: string }
    return e.response?.data?.error ?? e.message ?? 'Could not save the station'
  }

  const { defineField, meta, setValues, values } = useForm({
    validationSchema: toTypedSchema(stationInputSchema),
    initialValues: isNew.value ? { station_type: 'MO', station_type2: 'Default', status: 'OFFLINE' } : undefined,
  })

  useQuery({
    queryKey: ['stations', 'get', itemID],
    queryFn: async () => {
      const d = await getStation(itemID.value)
      if (d) setValues(d)
      return d
    },
    enabled: () => itemID.value > 0,
  })

  const { isPending, mutate } = useMutation({
    mutationKey: isNew.value ? ['stations', 'create'] : ['stations', 'update', itemID.value],
    mutationFn: (payload: StationInput) =>
      createOrUpdateStation({ ...payload, id: isNew.value ? undefined : itemID.value }),
    onSuccess: (d: Station) => {
      errorMessage.value = ''
      emit('success', d)
    },
    onError: (err) => {
      errorMessage.value = extractError(err)
      emit('error', err)
    },
  })

  const [name, nameProps] = defineField('name', {
    props: (state) => ({ 'error-message': state.errors[0] }),
  })
  const [lat, latProps] = defineField('lat')
  const [lon, lonProps] = defineField('lon')
  const [elevation, elevationProps] = defineField('elevation')
  const [stnType, stnTypeProps] = defineField('station_type')
  const [stnType2, stnType2Props] = defineField('station_type2')
  const [mobileNum, mobileNumProps] = defineField('mobile_number')
  const [stnUrl, stnUrlProps] = defineField('station_url')
  const [status, statusProps] = defineField('status')
  const [dateInstalled, dateInstalledProps] = defineField('date_installed')
  const [address, addressProps] = defineField('address')
  const [province, provinceProps] = defineField('province')
  const [region, regionProps] = defineField('region')

  const stnTypes = computed(() => stationTypes.map(({ name }) => name))
  const stnTypes2 = computed(() => stationTypes.find(({ name }) => name === stnType.value)?.opts ?? [])

  const handleSubmit = () => {
    if (!meta.valid) return
    errorMessage.value = ''
    mutate({ ...values, id: isNew.value ? undefined : itemID.value } as StationInput)
  }
</script>
