const { app, BrowserWindow, ipcMain } = require('electron');
const url = require('url');
const path = require('path');

let win;

function createWindow() {
  const icon = path.resolve(__dirname, 'icon.ico');
  win = new BrowserWindow({ title: 'Strongman', show: false, icon });
  win.setMenu(null);
  const address = url.format({
    protocol: 'file',
    slashes: true,
    pathname: path.resolve(__dirname, 'strongman.html'),
  });
  win.loadURL(address);

  ipcMain.on('strongman', (event, token) => {
    if (token === 'close') {
      win.close();
      win = null;
    }
  });

  win.once('ready-to-show', () => {
    win.show();
  });
}

app.on('ready', createWindow);
app.on('window-all-closed', () => app.quit());
app.on('activate', () => {
  if (win === null) createWindow();
});
