/**
 * Electron 6.0.10
 * 
 * Loading ES6 modules using protocol:
 * @see {@link https://gist.github.com/smotaal/f1e6dbb5c0420bfd585874bd29f11c43}
 */

const { app, BrowserWindow, protocol, } = require('electron');

// base path used to resolve modules
const base = app.getAppPath();

// protocol will be "app://./…"
const scheme = 'app';

/** 
 * Protocol
 */
{
  console.log(protocol);
  // registering must be done before app::ready fires
  // (optional) technically not a standard scheme but works as needed
  protocol.registerSchemesAsPrivileged([{ 
    scheme,
    privileges: { 
      secure: true,
      supportFetchAPI: true,
      standard: true,
    },
  }]);

  // create protocol
  require('./create-protocol')(scheme, base);
}

/** 
 * BrowserWindow
 */
{
  let browserWindow;

  const createWindow = () => {
    if (browserWindow) return;
    browserWindow = new BrowserWindow({
      width: 800,
      height: 600,
      webPreferences: {
        nodeIntegration: true,
      },
    });

    browserWindow.on('closed', () => {
      browserWindow = null;
    });
  
    browserWindow.webContents.openDevTools();

    browserWindow.loadFile('src/index.html');
  };
  

  app.isReady()
    ? createWindow()
    : app.on('ready', createWindow);
  

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });

  app.on('activate', () => {
    if (win === null) {
      createWindow();
    }
  });
}
