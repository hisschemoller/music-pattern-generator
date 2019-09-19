/**
 * Electron 6.0.10
 * 
 * Loading ES6 modules using protocol:
 * @see {@link https://gist.github.com/smotaal/f1e6dbb5c0420bfd585874bd29f11c43}
 */

const { app, BrowserWindow } = require('electron');

function createWindow () {
  let win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
    },
  });

  win.on('closed', () => {
    win = null;
  });

  win.webContents.openDevTools();

  win.loadFile('src/index.html');
}

app.on('ready', createWindow);
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