import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('writerx', {
  savePng: (dataUrl: string, suggestedName: string) =>
    ipcRenderer.invoke('save-png', dataUrl, suggestedName),
  saveArticle: (json: string, suggestedName: string) =>
    ipcRenderer.invoke('save-article', json, suggestedName),
  openArticle: () => ipcRenderer.invoke('open-article'),
})
