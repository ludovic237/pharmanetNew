const {app, BrowserWindow} = require('electron')
const {spawn} = require('child_process')
const path = require('path')

// let backendProcess;
let mainWindow = null;
let pyProc = null;

function startPython() {
  // const script = path.join(__dirname, '../backend_py/pharmaPython/app/main.py')
  const isDev = !app.isPackaged;
  // let exePath;
  // if (app.isPackaged){
  //   exePath = path.join(process.resourcesPath, 'main.exe')
  // }
  // else {
  //   exePath = path.join(__dirname, '../backend_py/pharmaPython/app/main.py')
  // }
  const exePath = isDev
    ? path.join(__dirname, '../backend_py/pharmaPython/app/dist/main.exe')
    : path.join(process.resourcesPath, 'dist', 'main.exe')

  const indexPath = isDev
    ? path.join(process.resourcesPath, 'browser/index.html')
    : path.join(__dirname, '../dist/emporium/browser/index.html')
  /*  if (exePath.endsWith('.py')){
      pyProc = spawn('python',[exePath]);
    }
    else {
      pyProc = spawn(exePath);
    }*/
  pyProc = spawn(isDev ? 'python' : exePath, isDev ? [exePath] : [])
  // pyProc = spawn(exePath);
  //
  pyProc.stdout.on('data', (data) => console.log(`python : ${data}`))
  pyProc.stderr.on('data', (data) => console.error(`erreur python : ${data}`))
  pyProc.on('close', (code) => console.log(`Python terminer (code ${code})`))
}

function createWindows() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {

      contextIsolation: true
    },
    icon: path.join(__dirname, 'favicon.ico')
  })

  const isDev = app.isPackaged;
  const indexPath = isDev
    ? path.join(process.resourcesPath, 'browser/index.html')
    : path.join(__dirname, '../dist/emporium/browser/index.html')

  mainWindow.loadFile(indexPath)

  mainWindow.on('closed', () => {
    if (pyProc) pyProc.kill();
  })
}

app.whenReady().then(() => {
  startPython();
  createWindows();
});
app.on('window-all-closed', () => {
  if (pyProc) pyProc.kill()
  if (process.platform !== 'darwin') app.quit();
})
