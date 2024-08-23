<script setup lang="tsx">
import { DefaultLayout } from '@/renderer/components/layout'
import { onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useSettingStore } from '@/renderer/store/setting'
import { useSocketStore } from '@/renderer/store/socket'

const { changeStatus, loadSettings, setHostname } = useSettingStore()
const { connect, signin } = useSocketStore()
const { appSettings, loadFromFile } = storeToRefs(useSettingStore())
const { connected, signed } = storeToRefs(useSocketStore())

onMounted(async () => {
  if (!loadFromFile.value) {
    await loadSettings()
    changeStatus()
  }
  const hostname = await window.mainApi.invoke('getHostname')
  console.log(hostname)
  setHostname(hostname)
  const connection = await window.mainApi.getConnection()
  if (connection.connected) {
    connect()
    if (connection.signed) signin()
  }

  console.log('App.vue mounted')
})

const handleConnect = async (): Promise<void> => {
  console.log('conectando')
  await window.mainApi.connect({
    host: appSettings.value.host,
    port: appSettings.value.port
  })
  connect()

  if (!signed) {
    console.log('Signin please')
  }
}

window.mainApi.onStartConnect(async (data) => {
  if (appSettings.value.autoconnect && !connected.value) await handleConnect()
  console.log('Init socket connection', data)
})

window.mainApi.onSignedStatus((data) => {
  signin()
  console.log('Signed on socket', data)
})
</script>

<template>
  <DefaultLayout>
    <router-view />
  </DefaultLayout>
</template>

<style>
html {
  overflow-y: auto !important;
  user-select: none;
}

html,
body {
  width: 100%;
  height: 100%;
}

/* Do not force capitalization of button text */
.v-btn {
  text-transform: unset !important;
}
</style>
