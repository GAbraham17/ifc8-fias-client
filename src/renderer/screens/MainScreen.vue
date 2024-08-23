<script setup lang="tsx">
import { useI18n } from 'vue-i18n'
import { storeToRefs } from 'pinia'
import { onMounted, ref } from 'vue'
import { useSettingStore } from '@/renderer/store/setting'
import { useSocketStore } from '@/renderer/store/socket'

const { availableLocales } = useI18n()
const { connect, disconnect } = useSocketStore()
const { connected, signed } = storeToRefs(useSocketStore())
const languages = ref(['en'])
const appVersion = ref('Unknown')
const selectedFile = ref('')
const { appSettings } = storeToRefs(useSettingStore())

onMounted((): void => {
  languages.value = availableLocales
  // Get application version from package.json version string (Using IPC communication)
  getApplicationVersionFromMainProcess()
})

const getApplicationVersionFromMainProcess = (): void => {
  window.mainApi.invoke('msgRequestGetVersion').then((result: string) => {
    appVersion.value = result
  })
}

const handleConnect = async (): Promise<void> => {
  await window.mainApi.connect({ host: appSettings.value.host, port: appSettings.value.port })
  connect()
}

const handleDisconnect = async (): Promise<void> => {
  disconnect()
}
</script>

<template>
  <v-container class="pa-12">
    <v-row>
      <v-col class="text-center">
        <h2 class="text-h6">Estado del Servidor:</h2>
        <v-divider></v-divider>
      </v-col>
    </v-row>
    <v-row align="center" class="text-center">
      <v-col cols="12">
        <v-icon v-if="connected" icon="mdi-lan-connect" color="green" size="150"></v-icon>
        <v-icon v-else icon="mdi-lan-disconnect" color="grey" size="150"></v-icon>
      </v-col>
    </v-row>
    <v-row no-gutters align="center" class="text-center">
      <v-col cols="12" class="pt-4">
        <p
          >Estado del servicio:
          <v-chip v-if="signed" class="ma-2" color="green" label>
            <v-icon icon="mdi-cloud-check-variant" start></v-icon>
            Conectado
          </v-chip>
          <v-chip v-else class="ma-2" color="error" label>
            <v-icon icon="mdi-cloud-alert" start></v-icon>
            Desconectado
          </v-chip>
        </p>
        <p>Workstation: {{ appSettings.workstation.name }}</p>
        <p class="my-4">
          App Version: <strong>{{ appVersion }}</strong>
        </p>
        <p v-if="selectedFile">{{
          $t('desc.selected-file', {
            filePath: selectedFile
          })
        }}</p>
        <v-row>
          <v-col>
            <v-btn v-if="!connected" color="#274C68" type="submit" @click="handleConnect">
              Conectar
            </v-btn>
            <v-btn v-else color="error" type="submit" @click="handleDisconnect">
              Desconectar
            </v-btn>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
  </v-container>
</template>
