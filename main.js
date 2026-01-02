const { app, BrowserWindow } = require("electron");
const path = require("path");

function createWindow() {
    const mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        minWidth: 1100,
        minHeight: 650,
        autoHideMenuBar: true,
        resizable: true,
        /* icon: path.join(__dirname, 'img', ), */
        /* webPreferences: {
            preload: path.join(__dirname, "preload.js")
        } */
    });

    /* mainWindow.loadFile(path.join(__dirname, 'interface', 'index.html')); */
    mainWindow.loadFile(path.join(__dirname, 'test 2', 'index.html'));
}

app.whenReady().then(createWindow);
