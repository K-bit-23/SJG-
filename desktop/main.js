const { app, BrowserWindow, shell, Menu } = require('electron');
const path = require('path');
const { exec } = require('child_process');
const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

let mainWindow;

// 1. Register a custom protocol for deep linking
if (process.defaultApp) {
  if (process.argv.length >= 2) {
    app.setAsDefaultProtocolClient('sjg-app', process.execPath, [path.resolve(process.argv[1])]);
  }
} else {
  app.setAsDefaultProtocolClient('sjg-app');
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
    icon: path.join(__dirname, 'assets/icon.png')
  });

  const liveUrl = 'https://sjg-stationary.vercel.app/';
  
  if (isDev) {
    mainWindow.loadURL(liveUrl);
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../frontend/build/index.html')).catch(() => {
      mainWindow.loadURL(liveUrl);
    });
  }

  // Intercept navigation to Clerk/Auth URLs
  mainWindow.webContents.on('will-navigate', (event, url) => {
    handleAuthNavigation(event, url);
  });
  
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.includes('clerk') || url.includes('accounts.google.com')) {
      shell.openExternal(url);
      return { action: 'deny' };
    }
    return { action: 'allow' };
  });

}

function handleAuthNavigation(event, url) {
  // If the URL is a Clerk sign-in/up or OAuth URL, open in system browser
  if (url.includes('clerk.com') || url.includes('accounts.google.com') || url.includes('sign-in') || url.includes('sign-up')) {
    event.preventDefault();
    shell.openExternal(url);
  }
}

function getPrinters() {
  return new Promise((resolve) => {
    exec('wmic printer get name /value', (error, stdout) => {
      if (error) {
        console.error('Error getting printers:', error);
        resolve([]);
        return;
      }
      const printers = stdout.split('\n')
        .filter(line => line.trim())
        .map(line => line.split('=')[1])
        .filter(Boolean);
      resolve(printers);
    });
  });
}

// 2. Handle Deep Linking back to the app
app.on('open-url', (event, url) => {
  event.preventDefault();
  handleDeepLink(url);
});

// For Windows/Linux deep linking
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', (event, commandLine) => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
    // Command line contains the URL on Windows
    const url = commandLine.pop();
    if (url.includes('sjg-app://')) {
      handleDeepLink(url);
    }
  });
}

function handleDeepLink(url) {
  if (mainWindow) {
    // Pass the deep link URL (which might contain tokens) to the frontend
    mainWindow.webContents.send('on-deep-link', url);
  }
}

app.whenReady().then(async () => {
  createWindow();

  // Get available printers
  const printers = await getPrinters();
  const printerMenuItems = printers.map(name => ({
    label: name,
    click: () => {
      console.log(`Selected printer: ${name}`);
      // You can add more functionality here, like sending to renderer
    }
  }));

  const menuTemplate = [
    {
      label: 'File',
      submenu: [
        { role: 'quit' }
      ]
    },
    {
      label: 'Printers',
      submenu: printerMenuItems.length > 0 ? printerMenuItems : [{ label: 'No printers found', enabled: false }]
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(menu);

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
