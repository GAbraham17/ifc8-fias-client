import { defineStore } from 'pinia'

export const useSettingStore = defineStore('setting', {
  state: () => ({
    loadFromFile: false,
    appSettings: {
      host: 'unknow',
      port: 0,
      workstation: {
        name: 'unknow',
        property: {
          code: 'unknow',
          name: 'unknow'
        }
      },
      location: 'unknow',
      terminal: 'unknow',
      autoconnect: false
    }
  }),
  getters: {
    getStatus: (state): Boolean => state.loadFromFile,
    getAppSettings: (state): any => state.appSettings
  },
  actions: {
    setHostname(hostname) {
      console.log(hostname);
      this.appSettings.workstation.name = hostname;
    },
    changeStatus() {
      this.loadFromFile = true as (() => void) & boolean;
    },
    async loadSettings() {
      this.appSettings = await window.mainApi.getSettings();
      console.log('Server socket settings:', this.appSettings.host)
    },
    async saveSettings(settings: any) {
      await window.mainApi.saveSettings(settings);
      this.appSettings = {
        host: settings.host,
        port: settings.port,
        workstation: {
          name: settings.workstation.name,
          property: {
            code: settings.workstation.property.code,
            name: settings.workstation.property.name
          }
        },
        location: settings.location,
        terminal: settings.terminal,
        autoconnect: settings.autoconnect
      }
    }
  }
})
