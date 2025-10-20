const {app, BrowserWindow} = require('electron')
const {spawn} = require('child_process')
const path = require('path')
const fs = require('fs')

// let backendProcess;
let mainWindow = null;
let pyProc = null;

function startPython() {
  // const script = path.join(__dirname, '../backend_py/pharmaPython/app/main.py')
  const isDev = !app.isPackaged;
  const logFile = path.join(app.getPath('userData'), 'backend.log');
  const logStream = fs.createWriteStream(logFile, {flags: 'a'})

  let script;
  let args = [];

  if (isDev) {
    script = path.join(__dirname, '../backend_py/pharmaPython/app/main.py');
    args = [script];
    pyProc = spawn('python', args);
  } else {
    script = path.join(process.resourcesPath,  'backend_py', 'pharmaPython', 'app', 'dist','main.exe');
    pyProc = spawn(script, [])
  }

  pyProc.stdout.on('data', (data) => {
    logStream.write(`[OUT] : ${data}\n`)
    console.log(`python : ${data}`)
  })
  pyProc.stderr.on('data', (data) => {
    logStream.write(`[ERR] : ${data}\n`)
    console.error(`erreur python : ${data}`)
  })
  pyProc.on('close', (code) => {
    logStream.write(`=== BACKEND CLOSED (code : ${code} ) ===\n`)
    console.log(`Python terminer (code ${code})`)
  })
  pyProc.on('error', (err) => {
    logStream.write(`[SWAPM] (err : ${err} ) ===\n`)
    console.log(`Python terminer (err ${err})`)
  })
}

module.exports = {startPython}

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
