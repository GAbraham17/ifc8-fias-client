<template>
  <v-container class="pa-12 pb-6">

    <v-overlay :model-value="onSaving" persistent class="align-center justify-center">
      <v-progress-circular color="primary" size="64" indeterminate></v-progress-circular>
    </v-overlay>
    <v-row>
      <v-col class="mb-6 text-center">
        <h2 class="text-h6">Configurar Aplicación</h2>
        <v-divider></v-divider>
      </v-col>
    </v-row>
    <form @submit.prevent="submit">
      <v-row no-gutters align="center" class="text-center">
        <v-col cols="12">
          <v-text-field v-model="workstation.value.value" :error-messages="workstation.errorMessage.value"
            :readonly="false" label="Workstation ID"></v-text-field>
        </v-col>
        <v-col cols="6" class="pr-2">
          <v-text-field v-model="host.value.value" v-maska="{
            mask: '#00.#00.#00.#00',
            tokens: {
              '0': {
                pattern: /[0-9]/,
                optional: true
              }
            }
          }" :error-messages="host.errorMessage.value" label="Server Ip"></v-text-field>
        </v-col>
        <v-col cols="6" class="pl-2">
          <v-text-field v-model="port.value.value" v-maska="'####'" :error-messages="port.errorMessage.value"
            label="Server Port"></v-text-field>
        </v-col>
        <v-col cols="12">
          <v-select v-model="hotel.value.value" :error-messages="hotel.errorMessage.value" :items="hotels"
            item-title="description" item-value="code" label="Hotel"
            @update:model-value="handleLoadLocations"></v-select>

          <v-select v-model="location.value.value" :error-messages="location?.errorMessage.value" :items="locations"
            item-title="description" item-value="code" label="Location"
            @update:model-value="handleLoadTerminals"></v-select>

          <v-select v-model="terminal.value.value" :error-messages="terminal.errorMessage.value" :items="terminals"
            item-title="label" item-value="code" label="Terminal Principal"></v-select>

          <v-checkbox v-model="autoconnect.value.value" label="Conexión Automática" type="checkbox"></v-checkbox>

          <v-btn color="#274C68" class="me-4" type="submit"> Guardar </v-btn>

          <v-btn hidden @click="handleReset"> clear </v-btn>

        </v-col>
      </v-row>
    </form>
  </v-container>
</template>
<script setup>
import { useField, useForm } from 'vee-validate'
import { storeToRefs } from 'pinia'
import { vMaska } from 'maska/vue'
import { useSettingStore } from '@/renderer/store/setting'
import { useCatalogStore } from '@/renderer/store/catalog'
import { onMounted, ref } from 'vue'
import { useToast } from 'vue-toastification'

const toast = useToast();

const { getAppSettings, saveSettings } = useSettingStore()
const settings = getAppSettings
const { hotels, locations, terminals } = storeToRefs(useCatalogStore())

const { loadLocationsByHotel, loadTerminalByLocation, updateCatalogs, loadCatalogs } = useCatalogStore()

const { handleSubmit, handleReset } = useForm({
  initialValues: {
    workstation: settings.workstation.name,
    host: settings.host,
    port: settings.port,
    terminal: settings.terminal,
    location: settings.location,
    hotel: settings.workstation.property.code,
    autoconnect: settings.autoconnect
  },
  validationSchema: {
    workstation(value) {
      if (value?.length >= 2) return true

      return 'Name needs to be at least 2 characters.'
    },
    host(value) {
      const ipRegex = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/
      if (ipRegex.test(value)) return true

      return 'Must be a valid ip address.'
    },
    port(value) {
      if (value?.length === 4 && /[0-9-]+/.test(value)) return true
      return 'Must be a valid host port (4 digits)'
    },
    terminal(value) {
      if (value && value !== "Seleccione") return true

      return 'Seleccione una opción'
    },
    hotel(value) {
      if (value && value !== "Seleccione") return true

      return 'Seleccione una opción'
    },
    location(value) {
      if (value && value !== "Seleccione") return true

      return 'Seleccione una opción'
    },
    autoconnect(value) {
      return true
    }
  }
})

const toastConfig = {
  position: "top-right",
  timeout: 5000,
  closeOnClick: true,
  pauseOnFocusLoss: true,
  pauseOnHover: true,
  draggable: true,
  draggablePercent: 0.6,
  showCloseButtonOnHover: false,
  hideProgressBar: false,
  closeButton: "button",
  icon: true,
  rtl: false
};
const workstation = useField('workstation')
const host = useField('host')
const port = useField('port')
const terminal = useField('terminal')
const hotel = useField('hotel')
const location = useField('location')
const autoconnect = useField('autoconnect')
const onSaving = ref(false)

onMounted(async () => {
  await loadCatalogs()
  loadLocationsByHotel(hotel.value.value)
  loadTerminalByLocation(location.value.value)
})

const submit = handleSubmit(async (values) => {
  onSaving.value = true
  try {
    const property = hotels.value.find((hotel) => hotel.code === values.hotel)
    await updateCatalogs();
    await saveSettings({
      host: values.host,
      port: values.port,
      workstation: {
        name: values.workstation,
        property: {
          code: property.code,
          name: property.description
        }
      },
      location: values.location,
      terminal: values.terminal,
      autoconnect: values.autoconnect
    })
    toast.success("Configuración actualizada exitosamente", toastConfig);
  } catch (Error) {
    toast.error("Configuración actualizada exitosamente", toastConfig);
  } finally {
    setTimeout(() => {
      onSaving.value = false
    }, 1000)
  }
})

const handleLoadLocations = () => {
  loadLocationsByHotel(hotel.value.value)
  if (locations.value.length === 0) {
    location.value.value = '';
    handleLoadTerminals()
  }
}

const handleLoadTerminals = () => {
  loadTerminalByLocation(location.value.value)
  if (terminals.value.length === 0) {
    terminal.value.value = ''
  }
}

</script>
<style>
.touppercase input {
  text-transform: uppercase;
}
</style>
