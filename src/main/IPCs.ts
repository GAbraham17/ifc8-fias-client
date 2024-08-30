import { ipcMain, shell, IpcMainEvent, dialog, BrowserWindow } from 'electron'
import Constants from './utils/Constants'
import Store from './store'
import SocketIO, { Socket } from 'socket.io-client'
import { createCashierWindow } from './MainRunner'
import os from 'os'

const store = new Store({
  configName: 'user-preferences',
  defaults: {
    appSettings: {
      host: 'unknow',
      port: 0,
      workstation: {
        name: 'unknow',
        property: {
          code: 'unknow',
          name: 'unknow'
        },
      },
      terminal: 'unknow',
      autoconnect: false
    },
    catalogs: {
      terminals: [],
      hotels: []
    },
    windowBounds: { width: 900, height: 720 }
  }
})
/*
 * IPC Communications
 * */
export default class IPCs {
  static socket: Socket;
  static connected: Boolean = false;
  static signed: Boolean = false;
  private static cashierWindows?: Map<string, BrowserWindow> = new Map();

  static initialize(): void {
    // Get application version
    ipcMain.handle('msgRequestGetVersion', () => {
      return Constants.APP_VERSION
    })

    // Get application version
    ipcMain.handle('getHostname', () => {
      return os.hostname();
    })

    // Open url via web browser
    ipcMain.on('msgOpenExternalLink', async (event: IpcMainEvent, url: string) => {
      await shell.openExternal(url)
    })

    ipcMain.handle('get-settings', (event) => {
      return store.get('appSettings');
    })

    ipcMain.handle('get-catalogs', (event) => {
      return store.get('catalogs');
    })

    ipcMain.handle('get-connection', (event) => {
      return {
        connected: this.connected,
        signed: this.signed
      };
    })

    ipcMain.handle('save-settings', (event: IpcMainEvent, settings: any) => {
      store.set('appSettings', settings);
    })

    ipcMain.handle('update-catalogs', (event: IpcMainEvent, catalogs: any) => {
      store.set('catalogs', catalogs);
    })

  }

  static websocket(mainWindow): void {
    ipcMain.handle('connect', async (event: IpcMainEvent, serverSettings: any) => {
      const url = `http://${serverSettings.host}:${serverSettings.port}`;
      this.socket = await SocketIO(url, {
        reconnection: true,
        reconnectionAttempts: 3,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        randomizationFactor: 0.5
      })

      this.socket.on('connect', async () => {
        console.log('connected to server')
        const settings = store.get('appSettings');
        this.connected = true;

        this.socket.emit('signin', {
          workstation: settings.workstation.name,
          property: settings.workstation.property
        })
      })

      this.socket.on('payment', async (data) => {
        console.log("recibiendo testing", data);
        const cashierPayment = await createCashierWindow(data.paymentData);
        const { transactionId } = data.paymentData;
        if (!this.cashierWindows.has(transactionId)) {
          this.cashierWindows.set(transactionId, cashierPayment)
        }
      })

      this.socket.on('payment-confirmation', async (data) => {
        console.log("recibiendo testing", data);
        const { PaymentResponse } = data.SaleToPOIResponse;
        console.log(PaymentResponse.SaleData.SaleTransactionID.TransactionID)
        this.cashierWindows.get(PaymentResponse.SaleData.SaleTransactionID.TransactionID)?.webContents.send('payment-confirmation', data);
      });

      this.socket.on('login', async (data) => {
        console.log("Login Success: " + JSON.stringify(data));
        this.signed = true;
        event.sender.send("signed-status", true);
      })
    })

    ipcMain.handle('disconnect', async (event: IpcMainEvent) => {
      await this.socket.disconnect();
      this.connected = false;
      this.signed = false;
    })

    ipcMain.handle('sendPaymentResponse', async (event: IpcMainEvent, response: any) => {
      this.socket.emit('payment-response', response);
    });
  }
}
