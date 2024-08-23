import { app, BrowserWindow, RenderProcessGoneDetails } from 'electron'
import Constants from './utils/Constants'

export interface RequestReservationDto {
  confimartionNumber: string,
  guets: string,
  exchangeRate: number
}

export interface RequestPaymentDto {
  transactionId: string
  amount: number
  currency: string
  reservation: RequestPaymentDto
}

const exitApp = (mainWindow: BrowserWindow): void => {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.hide()
  }
  mainWindow.destroy()
  app.exit()
}

export const createMainWindow = async (mainWindow: BrowserWindow): Promise<BrowserWindow> => {
  mainWindow = new BrowserWindow({
    title: 'Payments Workstation Agent',
    show: false,
    width: Constants.IS_DEV_ENV ? 1500 : 900,
    height: 720,
    useContentSize: true,
    webPreferences: Constants.DEFAULT_WEB_PREFERENCES
  })

  mainWindow.setMenu(null)

  mainWindow.on('resize', (event: Event) => {
    mainWindow.setBounds({ height: 720, width: 900 })
    // The event doesn't pass us the window size, so we call the `getBounds` method which returns an object with
    // the height, width, and x and y coordinates.
    //let { width, height } = mainWindow.getBounds();
    // Now that we have them, save them using the `set` method.
    //store.set('windowBounds', { width, height });
  })

  //mainWindow.on('close', (event: Event): void => {
  //event.preventDefault()
  //exitApp(mainWindow)
  //})

  mainWindow.webContents.on('did-frame-finish-load', (): void => {
    if (Constants.IS_DEV_ENV) {
      //mainWindow.webContents.openDevTools()
    }
  })

  mainWindow.once('ready-to-show', (): void => {
    mainWindow.setAlwaysOnTop(true)
    mainWindow.show()
    mainWindow.focus()
    mainWindow.setAlwaysOnTop(false)
  })

  if (Constants.IS_DEV_ENV) {
    await mainWindow.loadURL(Constants.APP_INDEX_URL_DEV)
  } else {
    await mainWindow.loadFile(Constants.APP_INDEX_URL_PROD)
  }

  return mainWindow
}

export const createCashierWindow = async (payload: RequestPaymentDto): Promise<BrowserWindow> => {
  let mainWindow = new BrowserWindow({
    title: 'Payments Workstation Confirm',
    show: false,
    width: 800,
    height: 650,
    useContentSize: true,
    webPreferences: Constants.DEFAULT_WEB_PREFERENCES
  })

  mainWindow.setMenu(null)

  mainWindow.on('resize', (event: Event) => {
    mainWindow.setBounds({ height: 650, width: 800 })
    // The event doesn't pass us the window size, so we call the `getBounds` method which returns an object with
    // the height, width, and x and y coordinates.
    //let { width, height } = mainWindow.getBounds();
    // Now that we have them, save them using the `set` method.
    //store.set('windowBounds', { width, height });
  })

  /*mainWindow.on('close', (event: Event): void => {
    event.preventDefault()
    exitApp(mainWindow)
  })*/

  mainWindow.webContents.on('did-frame-finish-load', (): void => {
    if (Constants.IS_DEV_ENV) {
      //mainWindow.webContents.openDevTools()
    }
    mainWindow.webContents.send('payment-request', payload)
  })

  mainWindow.once('ready-to-show', (): void => {
    mainWindow.setAlwaysOnTop(true)
    mainWindow.show()
    mainWindow.focus()
    mainWindow.setAlwaysOnTop(false)
  })

  if (Constants.IS_DEV_ENV) {
    await mainWindow.loadURL(Constants.APP_CASHIER_URL_DEV)
  } else {
    await mainWindow.loadFile(Constants.APP_CASHIER_URL_PROD)
  }

  return mainWindow;

}

export const createErrorWindow = async (
  errorWindow: BrowserWindow,
  mainWindow: BrowserWindow,
  details?: RenderProcessGoneDetails
): Promise<BrowserWindow> => {
  if (!Constants.IS_DEV_ENV) {
    mainWindow?.hide()
  }

  errorWindow = new BrowserWindow({
    title: Constants.APP_NAME,
    show: false,
    resizable: Constants.IS_DEV_ENV,
    webPreferences: Constants.DEFAULT_WEB_PREFERENCES
  })

  errorWindow.setMenu(null)

  if (Constants.IS_DEV_ENV) {
    await errorWindow.loadURL(`${Constants.APP_INDEX_URL_DEV}#/error`)
  } else {
    await errorWindow.loadFile(Constants.APP_INDEX_URL_PROD, { hash: 'error' })
  }

  errorWindow.on('ready-to-show', (): void => {
    if (!Constants.IS_DEV_ENV && mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.destroy()
    }
    errorWindow.show()
    errorWindow.focus()
  })

  errorWindow.webContents.on('did-frame-finish-load', (): void => {
    if (Constants.IS_DEV_ENV) {
      errorWindow.webContents.openDevTools()
    }
  })

  return errorWindow
}
