import { app, ipcMain, shell, IpcMainEvent, BrowserWindow } from 'electron'
import Constants from './utils/Constants'
import Store from './store'
import SocketIO, { Socket } from 'socket.io-client'
import { createCashierWindow, createMainWindow } from './MainRunner'
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
          code: 'Seleccione',
          name: 'Seleccione'
        },
      },
      location: 'Seleccione',
      terminal: 'Seleccione',
      autoconnect: false
    },
    catalogs: {},
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
  static manualClose: Boolean = false;
  static mainWindow: BrowserWindow;
  static gateWindow: BrowserWindow;
  private static cashierWindows?: Map<string, BrowserWindow> = new Map();
  private static catalogs: any;
  private static hotel: any;
  private static terminal: any;
  static gateValidation: Boolean = false;
  static mainWindowLoaded: Boolean = false;

  static initialize(): void {
    this.catalogs = store.get('catalogs');
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
      const settings = store.get('appSettings');
      this.hotel = settings.workstation.property;
      this.terminal = settings.terminal;
      return settings;
    })

    ipcMain.handle('get-catalogs', (event) => {
      this.catalogs = store.get('catalogs');
      return this.catalogs;
    })

    ipcMain.handle('get-connection', (event) => {
      return {
        connected: this.connected,
        signed: this.signed
      };
    })

    ipcMain.handle('save-settings', (event: IpcMainEvent, settings: any) => {
      this.hotel = settings.workstation.property;
      this.terminal = settings.terminal;
      store.set('appSettings', settings);
    })

    ipcMain.handle('update-catalogs', (event: IpcMainEvent, catalogs: any) => {
      this.catalogs = catalogs;
      store.set('catalogs', catalogs);
    })

    ipcMain.handle('gate-submit', async (event, key) => {
      if (key === "123456") {
        this.gateValidation = true;
        this.gateWindow.close();
        this.mainWindowLoaded = true;
        const mainWindow = await createMainWindow(this.mainWindow);
        this.setMainWindow(mainWindow);
        this.websocket();
        this.mainWindow.webContents.send('start-connect', true);
      } else {
        window.alert("Clave incorrecta");
        this.gateWindow.close();
        app.exit();
      }
    })

    ipcMain.handle('gate-cancel', async (event) => {
      this.gateWindow.close();
      app.exit();
    });

  }

  static setMainWindow(mainWindow: BrowserWindow): void {
    this.mainWindow = mainWindow
  }

  static setGateWindow(gateWindow: BrowserWindow): void {
    this.gateWindow = gateWindow
  }

  static websocket(): void {
    ipcMain.handle('cancel-payment', async (event: IpcMainEvent, transactionId: string) => {
      console.log("Cancelando pago", transactionId);
      this.socket.emit('cancel-payment', { transactionId });
    });

    ipcMain.handle('connect', async (event: IpcMainEvent, serverSettings: any) => {
      const url = `http://${serverSettings.host}:${serverSettings.port}`;
      this.socket = await SocketIO(url, {
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        randomizationFactor: 0.5
      })

      this.socket.on('connect', async () => {
        console.log('connected to server')
        const settings = store.get('appSettings');
        this.connected = true;

        this.mainWindow.webContents.send('connection-success', true);

        this.socket.emit('signin', {
          workstation: settings.workstation.name,
          property: settings.workstation.property
        })
      })

      this.socket.on('payment', async (data) => {
        console.log("recibiendo testing", data);
        const cashierPayment = await createCashierWindow({
          terminal: this.terminal,
          hotel: this.hotel,
          terminals: this.catalogs.terminals,
          paymentData: data
        });
        const { transactionId } = data;
        if (!this.cashierWindows.has(transactionId)) {
          this.cashierWindows.set(transactionId, cashierPayment)
        }
      })

      this.socket.on('payment-confirmation', async (data) => {
        console.log("recibiendo confirmacion", data);
        this.cashierWindows.get(data.transactionId)?.webContents.send('payment-confirmation', data);
      });

      this.socket.on('payment-closed', async (data) => {
        console.log("pago cerrado por opera", data);
        this.cashierWindows.get(data.transactionId)?.webContents.send('payment-closed', data);
      });

      this.socket.on('payment-reversal', async (data) => {
        console.log("Pago cancelado", data);
        this.cashierWindows.get(data.transactionId)?.webContents.send('payment-reversal', data);
      });

      this.socket.on('login', async (data) => {
        console.log("Login Success: " + JSON.stringify(data));
        this.signed = true;
        event.sender.send("signed-status", true);
      })

      this.socket.on("connect_error", (err) => {
        console.log(`connect_error due to ${err.message}`);
      });

      this.socket.on('disconnect', () => {
        console.log('disconnected from server');
        this.connected = false;
        this.signed = false;
        this.mainWindow.webContents.send('connection-lost', this.manualClose);
        this.manualClose = false;
      });

      this.socket.io.on('reconnect_attempt', (attempt) => {
        console.log(`reconnect attempt ${attempt}`);
      });

      this.socket.io.on('reconnect', (attempt) => {
        console.log(`reconnected to server after ${attempt} attempts`);
        this.connected = true;
      });

      this.socket.io.on('reconnect_failed', () => {
        console.log('failed to reconnect to server');
        this.connected = false;
        this.signed = false;
        this.manualClose = false;
        this.mainWindow.webContents.send('connection-lost', true);
      });
    })

    ipcMain.handle('disconnect', async (event: IpcMainEvent) => {
      this.manualClose = true;
      await this.socket.disconnect();
    })

    ipcMain.handle('sendPaymentResponse', async (event: IpcMainEvent, response: any) => {
      this.socket.emit('payment-response', response);
    });
  }
}
