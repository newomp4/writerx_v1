import { app, BrowserWindow, ipcMain, dialog, shell } from 'electron'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import fs from 'node:fs/promises'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

process.env.APP_ROOT = path.join(__dirname, '..')

const VITE_DEV_SERVER_URL = process.env.VITE_DEV_SERVER_URL
const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')

let mainWindow: BrowserWindow | null = null

function createWindow() {
  mainWindow = new BrowserWindow({
    title: 'Writerx',
    width: 1480,
    height: 940,
    minWidth: 1100,
    minHeight: 700,
    titleBarStyle: 'hiddenInset',
    backgroundColor: '#0a0a0a',
    vibrancy: 'fullscreen-ui',
    visualEffectState: 'active',
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
  })

  if (VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(VITE_DEV_SERVER_URL)
  } else {
    mainWindow.loadFile(path.join(RENDERER_DIST, 'index.html'))
  }
}

ipcMain.handle('save-png', async (_event, dataUrl: string, suggestedName: string) => {
  if (!mainWindow) return { ok: false }
  const result = await dialog.showSaveDialog(mainWindow, {
    title: 'Export thumbnail',
    defaultPath: suggestedName,
    filters: [{ name: 'PNG image', extensions: ['png'] }],
  })
  if (result.canceled || !result.filePath) return { ok: false }
  const base64 = dataUrl.replace(/^data:image\/png;base64,/, '')
  await fs.writeFile(result.filePath, Buffer.from(base64, 'base64'))
  return { ok: true, path: result.filePath }
})

ipcMain.handle('save-article', async (_event, json: string, suggestedName: string) => {
  if (!mainWindow) return { ok: false }
  const result = await dialog.showSaveDialog(mainWindow, {
    title: 'Save article',
    defaultPath: suggestedName,
    filters: [{ name: 'Writerx article', extensions: ['writerx', 'json'] }],
  })
  if (result.canceled || !result.filePath) return { ok: false }
  await fs.writeFile(result.filePath, json, 'utf8')
  return { ok: true, path: result.filePath }
})

ipcMain.handle('open-article', async () => {
  if (!mainWindow) return { ok: false }
  const result = await dialog.showOpenDialog(mainWindow, {
    title: 'Open article',
    properties: ['openFile'],
    filters: [{ name: 'Writerx article', extensions: ['writerx', 'json'] }],
  })
  if (result.canceled || result.filePaths.length === 0) return { ok: false }
  const json = await fs.readFile(result.filePaths[0], 'utf8')
  return { ok: true, json }
})

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})
