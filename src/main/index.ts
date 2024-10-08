import { app, WebContents, RenderProcessGoneDetails } from 'electron'
import Constants from './utils/Constants'
import { createErrorWindow, createMainWindow } from './MainRunner'
import IPCs from './IPCs'
import os from 'os'

let mainWindow
let errorWindow

app.on('ready', async () => {
  if (Constants.IS_DEV_ENV) {
    import('./index.dev')
  }

  // Disable special menus on macOS by uncommenting the following, if necessary
  /*
  if (Constants.IS_MAC) {
    systemPreferences.setUserDefault('NSDisabledDictationMenuItem', 'boolean', true)
    systemPreferences.setUserDefault('NSDisabledCharacterPaletteMenuItem', 'boolean', true)
  }
  */

  // Initialize IPC Communication
  IPCs.initialize()

  console.log(os.hostname())
  console.log(os.type())
  console.log(os.platform())
  console.log(os.arch())
  console.log(os.release())

  mainWindow = await createMainWindow(mainWindow)

  IPCs.websocket(mainWindow);

  mainWindow.webContents.send('start-connect', true);

})

app.on('activate', async () => {
  if (!mainWindow) {
    if (IPCs.socket !== undefined) console.log(IPCs.socket.connected)
    else console.log('Socket is undefined')

    mainWindow = await createMainWindow(mainWindow);

  }
})

app.on('window-all-closed', () => {
  mainWindow = null
  errorWindow = null

  if (!Constants.IS_MAC) {
    app.quit()
  }
})

app.on(
  'render-process-gone',
  (event: Event, webContents: WebContents, details: RenderProcessGoneDetails) => {
    errorWindow = createErrorWindow(errorWindow, mainWindow, details)
  }
)

process.on('uncaughtException', () => {
  errorWindow = createErrorWindow(errorWindow, mainWindow)
})
