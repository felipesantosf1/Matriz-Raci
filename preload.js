const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("api", {
    salvar: (dados) => ipcRenderer.invoke("salvar-json", dados)
});
