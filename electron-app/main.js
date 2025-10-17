const {app, BrowserWindow} = require('electron')
const {spawn} = require('child_process')
const path = require('path')

let backendProcess;

function createWindows() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    },
    icon: path.join(__dirname, 'favicon.ico')
  })

  win.loadFile(path.join(__dirname, '../dist/emporium/browser/index.html'))
  // win.loadFile(path.join(__dirname, '../backend_py/pharmaPython/app/dist/emporium/server/index.server.html'))
  // win.loadFile(path.join(__dirname, '../dist/emporium/browser/index.html'))
  // win.on('closed', () => {
  //   if (backendProcess) backendProcess.kill()
  // })
  win.webContents.openDevTools()

  // backendProcess = spawn('python', ['main.py'], {
  //   cwd: path.join(__dirname, '../backend_py/pharmaPython/app/')
  // })
  backendProcess = spawn('python', [path.join(__dirname, '../backend_py/pharmaPython/app/main.py')])
  backendProcess.stdout.on('data', (data) => // console.log(`python : ${data}`))
  backendProcess.stderr.on('data', (data) => console.error(`erreur python : ${data}`))

  win.on('closed', () => {
    if (backendProcess) backendProcess.kill();
  })
}

/*app.whenReady().then(() => {
  //
  // backendProcess = spawn('python', ['../backend_py/pharmaPython/app/main.py'])
  createWindows()
});*/

app.whenReady().then(createWindows);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    if (backendProcess)
      backendProcess.kill();
    app.quit();
  }
})
