const { app, BrowserWindow, ipcMain } = require("electron"); 
const path = require("path");
const fs = require("fs"); 

function createWindow() {
    const mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        minWidth: 1100,
        minHeight: 650,
        autoHideMenuBar: true,
        resizable: true,
        /* icon: path.join(__dirname, 'img', ), */
        webPreferences: {
            preload: path.join(__dirname, "preload.js") 
        }
    });

    mainWindow.loadFile(path.join(__dirname, 'interface', 'index.html')); 
}

app.whenReady().then(createWindow);

/* ================= SALVAR JSON ================= */ 
ipcMain.handle("salvar-json", async (_, dados) => {
    const filePath = path.join(__dirname, "data", "racisave.json"); 

    fs.writeFileSync(
        filePath,
        JSON.stringify(dados, null, 4),
        "utf-8"
    );

    return true;
});

