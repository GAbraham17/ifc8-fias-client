import { defineStore } from 'pinia'

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
    connect() {
      this.connected = true;
    },
    disconnect() {
      window.mainApi.disconnect();
      this.connected = false;
      this.signed = false;
    },
    signin() {
      this.signed = true as (() => void) & boolean;
    }
  }
})
