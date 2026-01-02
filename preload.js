const { contextBridge } = require("electron");

contextBridge.exposeInMainWorld("api", {
    // futuramente: salvarEstado, carregarEstado, etc.
});
