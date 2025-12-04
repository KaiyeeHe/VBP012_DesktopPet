const { app, BrowserWindow, ipcMain, screen } = require('electron')

let mainWindow = null

function createWindow () {
  const primaryDisplay = screen.getPrimaryDisplay()
  const { width, height } = primaryDisplay.workAreaSize

  mainWindow = new BrowserWindow({
    width: 240,
    height: 280,
    x: Math.floor(width / 2 - 120),
    y: Math.floor(height / 3 - 140),
    transparent: true,
    frame: false,
    hasShadow: false,
    alwaysOnTop: true,
    resizable: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  })

  mainWindow.loadFile('index.html')

  // 隐藏Dock栏图标（可选）
  // app.dock.hide()
}

// 监听窗口移动请求
ipcMain.on('window-move', (event, { x, y }) => {
  if (mainWindow) {
    const [currentX, currentY] = mainWindow.getPosition()
    mainWindow.setPosition(currentX + x, currentY + y)
  }
})

// 监听窗口重置位置请求
ipcMain.on('window-reset', () => {
  if (mainWindow) {
    const primaryDisplay = screen.getPrimaryDisplay()
    const { width, height } = primaryDisplay.workAreaSize
    // 定位到左下角
    mainWindow.setPosition(100, height - 300)
  }
})

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})