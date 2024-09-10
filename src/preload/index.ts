import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron'

// Whitelist of valid channels used for IPC communication (Send message from Renderer to Main)
const mainAvailChannels: string[] = ['msgRequestGetVersion', 'msgOpenExternalLink', 'getHostname', 'sendPaymentResponse']
const rendererAvailChannels: string[] = []

contextBridge.exposeInMainWorld('mainApi', {
  sendMessage: (message: string) => ipcRenderer.send('message', message),
  getSettings: () => ipcRenderer.invoke('get-settings'),
  getConnection: () => ipcRenderer.invoke('get-connection'),
  saveSettings: (settings: any) => ipcRenderer.invoke('save-settings', settings),
  updateCatalogs: (catalogs: any) => ipcRenderer.invoke('update-catalogs', catalogs),
  getCatalogs: () => ipcRenderer.invoke('get-catalogs'),
  connect: (serverSettings) => ipcRenderer.invoke('connect', serverSettings),
  disconnect: () => ipcRenderer.invoke('disconnect'),
  onSignedStatus: (callback) => ipcRenderer.on('signed-status', (_event, value) => callback(value)),
  onStartConnect: (callback) => ipcRenderer.on('start-connect', (_event, value) => callback(value)),
  onPaymentRequest: (callback) => ipcRenderer.on('payment-request', (_event, value) => callback(value)),
  onPaymentConfirmation: (callback) => ipcRenderer.on('payment-confirmation', (_event, value) => callback(value)),
  onConnectionSuccess: (callback) => ipcRenderer.on('connection-success', (_event, value) => callback(value)),
  onConnectionLost: (callback) => ipcRenderer.on('connection-lost', (_event, value) => callback(value)),
  send: (channel: string, ...data: any[]): void => {
    if (mainAvailChannels.includes(channel)) {
      ipcRenderer.send.apply(null, [channel, ...data])
      if (process.env.NODE_ENV === 'development') {
        console.log({ type: 'send', channel, request: data })
      }
    } else {
      throw new Error(`Unknown ipc channel name: ${channel}`)
    }
  },
  on: (channel: string, listener: (event: IpcRendererEvent, ...args: any[]) => void): void => {
    if (rendererAvailChannels.includes(channel)) {
      ipcRenderer.on(channel, listener)
    } else {
      throw new Error(`Unknown ipc channel name: ${channel}`)
    }
  },
  once: (channel: string, listener: (event: IpcRendererEvent, ...args: any[]) => void): void => {
    if (rendererAvailChannels.includes(channel)) {
      ipcRenderer.once(channel, listener)
    } else {
      throw new Error(`Unknown ipc channel name: ${channel}`)
    }
  },
  off: (channel: string, listener: (event: IpcRendererEvent, ...args: any[]) => void): void => {
    if (rendererAvailChannels.includes(channel)) {
      ipcRenderer.off(channel, listener)
    } else {
      throw new Error(`Unknown ipc channel name: ${channel}`)
    }
  },
  invoke: async (channel: string, ...data: any[]): Promise<any> => {
    if (mainAvailChannels.includes(channel)) {
      const result = await ipcRenderer.invoke.apply(null, [channel, ...data])
      if (process.env.NODE_ENV === 'development') {
        console.log({ type: 'invoke', channel, request: data, result })
      }
      return result
    }

    throw new Error(`Unknown ipc channel name: ${channel}`)
  }
})
