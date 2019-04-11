const { app, BrowserWindow, ipcMain } = require('electron');
const url = require('url');
const path = require('path');

let win;
let errorCode;

function createWindow() {
  const icon = path.resolve(__dirname, 'icon.ico');
  win = new BrowserWindow({ width: 800, height: 600, title: 'Account', show: false, icon });
  win.setMenu(null);
  const address = url.format({
    protocol: 'file',
    slashes: true,
    pathname: path.resolve(__dirname, 'ssoToken_local.html'),
  });
  win.loadURL(address);

  ipcMain.on('config', (event, token) => {
    process.stdout.write(token);
    win.close();
    win = null;
  });

  ipcMain.on('error', (event, error) => {
    process.stderr.write(error);
    errorCode = 1;
    win.close();
    win = null;
  });

  win.once('ready-to-show', () => {
    win.show();
  });
}

// SSL/TSL: this is the self signed certificate support
app.on('certificate-error', (event, webContents, url, error, certificate, callback) => {
  // On certificate error we disable default behaviour (stop loading the page)
  // and we then say "it is all fine - true" to the callback
  event.preventDefault();
  callback(true);
});
app.on('ready', createWindow);
app.on('window-all-closed', () => app.exit(errorCode));
app.on('activate', () => {
  if (win === null) createWindow();
});
