"use strict";

const isOSX = process.platform === 'darwin';
const isDevMode = process.env.NODE_ENV === 'development';

const electron = require('electron');
const webContents = electron.webContents;

const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
let gameWindow = null;
let setupSteps = 2;
let server;
const state = {};

function createWindow() {
  gameWindow = new BrowserWindow({
    // setting to true doesn't work in Windows
    // https://github.com/electron/electron/issues/6036
    // fullscreen: false,
    fullscreenable: true,
    defaultEncoding: "utf8",
  });
  gameWindow.loadURL(`file://${__dirname}/index.html`);
  if (isDevMode) {
    gameWindow.webContents.openDevTools();
  }

  // open links in browser
  const webContents = gameWindow.webContents;
  const handleRedirect = (e, url) => {
    if(url != webContents.getURL()) {
      e.preventDefault();
      electron.shell.openExternal(url);
    }
  };

  webContents.on('will-navigate', handleRedirect);
  webContents.on('new-window', handleRedirect);
}

app.on('ready', () => {
  createWindow();
});

app.on('window-all-closed', () => {
  app.quit();
});
