import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('mainApi', {
  licenseSubmit: (key: string) => ipcRenderer.invoke('gate-submit', key),
  licenseCancel: () => ipcRenderer.invoke('gate-cancel')
})
