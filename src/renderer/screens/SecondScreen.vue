<template>
  <v-container class="pa-12">
    <v-row>
      <v-col class="mb-6 text-center">
        <h2 class="text-h6">Configurar Aplicación</h2>
        <v-divider></v-divider>
      </v-col>
    </v-row>
    <v-row no-gutters align="center" class="text-center">
      <v-col cols="12">
        <form @submit.prevent="submit">
          <v-text-field
            v-model="workstation.value.value"
            :error-messages="workstation.errorMessage.value"
            :readonly="true"
            label="Workstation ID"
          ></v-text-field>

          <v-text-field
            v-model="host.value.value"
            v-maska="{
              mask: '#00.#00.#00.#00',
              tokens: {
                '0': {
                  pattern: /[0-9]/,
                  optional: true
                }
              }
            }"
            :error-messages="host.errorMessage.value"
            label="Server Ip"
          ></v-text-field>

          <v-text-field
            v-model="port.value.value"
            v-maska="'####'"
            :error-messages="port.errorMessage.value"
            label="Server Port"
          ></v-text-field>

          <v-select
            v-model="hotel.value.value"
            :error-messages="hotel.errorMessage.value"
            :items="getHotels"
            item-title="description"
            item-value="code"
            label="Hotel"
          ></v-select>

          <v-select
            v-model="terminal.value.value"
            :error-messages="terminal.errorMessage.value"
            :items="getTerminals"
            item-title="code"
            item-value="code"
            label="Terminal Principal"
          ></v-select>

          <v-checkbox
            v-model="autoconnect.value.value"
            label="Conexión Automática"
            type="checkbox"
          ></v-checkbox>

          <v-btn color="#274C68" class="me-4" type="submit"> Guardar </v-btn>

          <v-btn hidden @click="handleReset"> clear </v-btn>
        </form>
      </v-col>
    </v-row>
  </v-container>
</template>
<script setup>
import { useField, useForm } from 'vee-validate'
import { vMaska } from 'maska/vue'
import { useSettingStore } from '@/renderer/store/setting'
import { useCatalogStore } from '@/renderer/store/catalog'
import { onMounted } from 'vue'

const { getAppSettings } = useSettingStore()
const settings = getAppSettings

const { getHotels, getTerminals } = useCatalogStore()

const { handleSubmit, handleReset } = useForm({
  initialValues: {
    workstation: settings.workstation.name,
    host: settings.host,
    port: settings.port,
    terminal: settings.terminal,
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
      if (value) return true

      return 'Select an item.'
    },
    hotel(value) {
      if (value) return true

      return 'Select an item.'
    },
    autoconnect(value) {
      return true
    }
  }
})
const workstation = useField('workstation')
const host = useField('host')
const port = useField('port')
const terminal = useField('terminal')
const hotel = useField('hotel')
const autoconnect = useField('autoconnect')

onMounted(() => {
  window.mainApi.updateCatalogs({
    terminals: JSON.parse(JSON.stringify(getTerminals)),
    hotels: JSON.parse(JSON.stringify(getHotels))
  })
})

const submit = handleSubmit((values) => {
  console.log(values)
  alert(JSON.stringify(values, null, 2))
  const property = getHotels.find((hotel) => hotel.code === values.hotel)
  window.mainApi.saveSettings({
    host: values.host,
    port: values.port,
    workstation: {
      name: values.workstation,
      property: {
        code: property.code,
        name: property.description
      }
    },
    terminal: values.terminal,
    autoconnect: values.autoconnect
  })
})
</script>
<style>
.touppercase input {
  text-transform: uppercase;
}
</style>
