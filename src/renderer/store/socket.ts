import { defineStore } from 'pinia'
import { useSettingStore } from './setting'

export const useSocketStore = defineStore('socket', {
  state: () => ({
    connected: false,
    signed: false
  }),
  getters: {
    getConnected: (state): Boolean => state.connected,
    getSigned: (state): boolean => state.signed // Update the type to boolean
  },
  actions: {
    async loadConnection() {
      const connection = await window.mainApi.getConnectionStatus()
      this.connected = connection.isConnected
      this.signed = connection.isSigned
    },
    async connect() {
      const appSettings = useSettingStore().appSettings
      await window.mainApi.connect({ host: appSettings.host, port: appSettings.port })
    },
    disconnect() {
      window.mainApi.disconnect();
      this.connected = false;
      this.signed = false;
    },
    changeStatusConnection(status: boolean) {
      this.connected = status;
      if (!status)
        this.signed = false;
    },
    signin() {
      this.signed = true as (() => void) & boolean;
    }
  }
})
