const { app, BrowserWindow, ipcMain, screen } = require('electron')

let win;
let isClickThroughEnabled = false;

function createWindow () {
  // 获取屏幕尺寸
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width: screenW, height: screenH } = primaryDisplay.workAreaSize;

  win = new BrowserWindow({
    width: 340,
    // ⚡️ 高度加到 550，防止起飞时气泡或头被切掉
    height: 550,
    type: 'panel', // 浮动面板类型
    transparent: true,
    frame: false,
    hasShadow: false,
    alwaysOnTop: true,
    resizable: false,
    enableLargerThanScreen: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  })

  win.loadFile('index.html')

  // 允许在所有桌面显示 (Stickies 模式)
  win.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });

  // 初始位置：屏幕右下角舒适区
  win.setPosition(Math.floor(screenW / 2 - 170), Math.floor(screenH / 2 - 275));

  // 🔥 窗口加载完成后，设置初始穿透状态
  win.webContents.on('did-finish-load', () => {
    win.setIgnoreMouseEvents(true, { forward: true });
    isClickThroughEnabled = true;
  });

  // === 🖐 核心：JS 强力拖拽逻辑 ===
  // 必须有这一段，index.html 里的拖拽才能生效
  ipcMain.on('window-move', (event, { x, y }) => {
    try {
      const pos = win.getPosition();
      win.setPosition(pos[0] + x, pos[1] + y);
    } catch (e) {
      // 忽略极速移动时的计算误差
    }
  });

  // 动态控制窗口穿透
  ipcMain.on('set-click-through', (event, enabled) => {
    try {
      if (isClickThroughEnabled !== enabled) {
        win.setIgnoreMouseEvents(enabled, { forward: true });
        isClickThroughEnabled = enabled;
      }
    } catch (e) {
      console.error('Failed to set click-through:', e);
    }
  });

  // 位置重置功能
  ipcMain.on('window-reset', () => {
    win.setPosition(50, screenH - 550);
  });

  // 🔥 退出应用功能
  ipcMain.on('quit-app', () => {
    app.quit();
  });
}

app.whenReady().then(createWindow)

// 🔥 即使在 macOS 上也允许通过关闭窗口退出应用
app.on('window-all-closed', () => {
  app.quit();
})
