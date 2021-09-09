import { directoryOpen, fileSave } from 'browser-fs-access'

export async function openAssets () {
  const blobsInDirectory = await directoryOpen({
    recursive: true
  })

  const testOptions = {
    fileName: 'new.txt',
    extensions: ['.txt']
  }

  await fileSave(blobsInDirectory[0])

}
