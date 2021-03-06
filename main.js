const { app, BrowserWindow, ipcMain } = require('electron')
const util = require('util')
const path = require('path')
const fs = require('fs')

const stat = util.promisify(fs.stat)

// declare this as a variable globally so we can
// reference it and so it will not be garbage collected
let mainWindow

// wait for the main process to be ready
app.on('ready', () => {
  // path to our html
  const htmlPath = path.join('src', 'index.html')

  // create a browser window
  mainWindow = new BrowserWindow()

  mainWindow.loadFile(htmlPath)
})

// listen for files event by browser process
ipcMain.on('files', async (event, filesArr) => {
  try {
    // asynchronously get the data for all the files
    const data = await Promise.all(
      filesArr.map(async ({ name, pathName }) => ({
        ...await stat(pathName),
        name,
        pathName
      }))
    )

    mainWindow.webContents.send('metadata', data)
  } catch (error) {
    // send an error event if something goes wrong
    mainWindow.webContents.send('metadata:error', error)
  }
})
