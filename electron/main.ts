//creates shell of desktop application in electron
import { app, BrowserWindow, ipcMain, dialog } from "electron";
import * as path from "path";
import * as url from "url";
import fs from 'fs'
import http from 'http'

let mainWindow: any;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 800,
    resizable: false,
    icon: path.resolve(app.getAppPath(), "assets/logo.png"),
    webPreferences: {
      nodeIntegration: true,
    },
  });
  // macOS dock settings for logo
  if (process.platform === 'darwin') {
    app.dock.setIcon(path.resolve(app.getAppPath(), "assets/logo.png"));
  }
  if (process.env.NODE_ENV === "development") {
    mainWindow.loadURL(`http://localhost:3000`);
    // mainWindow.webContents.openDevTools();
  } else {
    const value = url.format({
      pathname: path.resolve(app.getAppPath(), "dist/renderer/index.html"),
      protocol: "file:",
      slashes: true,
    })
    console.log("value ", value)
    mainWindow.loadURL(value);
  }
  mainWindow.on("closed", () => {
    mainWindow = null;
  });

}
ipcMain.on("download", (event, arg) => {
  dialog.showSaveDialog({
    title: "Save file",
    properties: ['createDirectory']
  }).then((filePath_obj: any) => {
    if (filePath_obj.canceled)
      console.log("canceled")
    else {
      // const dest: any = fs.createWriteStream(filePath_obj.filePath + '.sql');
      const dest: any = fs.createWriteStream(filePath_obj.filePath + '.sql');
      const request = http.get(`http://localhost:30000/faker/create/`,arg, function (response) {
        response.pipe(dest);
      });
    }
  })
  .catch(err => {
    console.log(err)
  })
});

app.on("ready", createWindow);
app.allowRendererProcessReuse = true;
