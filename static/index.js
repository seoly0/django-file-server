const worker = new Worker('/static/worker.js')

worker.onmessage = evt => {
  console.log('from worker: ', evt.data)
}

worker.postMessage('Hello Worker')

const handleOnClickBtnDownload = () => {
  const a = document.createElement('a')
  a.href = '/api/downloader/download/file'

  a.click()
}

const handleOnClickBtnDownloadByStream = () => {
  const a = document.createElement('a')
  a.href = '/api/downloader/download/stream'

  a.click()
}

const handleOnClickBtnDownloadByChunk = () => {
  const chunkDownloader = async () => {
    const chunkSize = 1024 * 1024 * 100 // 100MB

    const download = async (start, end) => {
      const res = await fetch('/api/downloader/download/chunk', {
        headers: {
          Range: `bytes=${start}-${end}`,
        },
      })
      const blob = await res.blob()
      return blob
    }

    const metadata = await fetch('/api/downloader/download/metadata')
    const contentLength = parseInt(await metadata.text())

    const numChunks = Math.ceil(contentLength / chunkSize)

    let fullFile = new Blob()

    let promiseList = []

    for (let i = 0; i < numChunks; i++) {
      const start = i * chunkSize
      const end = Math.min(start + chunkSize - 1, contentLength - 1)

      promiseList.push(download(start, end))

      if ((i + 1) % 10 == 0 || i == numChunks - 1) {
        const result = await Promise.all(promiseList)
        fullFile = new Blob([fullFile, ...result])
        promiseList = []
      }
    }

    const downloadLink = document.createElement('a')
    downloadLink.href = URL.createObjectURL(fullFile)
    downloadLink.download = 'large-file'
    downloadLink.click()
  }

  chunkDownloader()
}

document.getElementById('normal')?.addEventListener('click', handleOnClickBtnDownload)
document.getElementById('stream')?.addEventListener('click', handleOnClickBtnDownloadByStream)
document.getElementById('chunk')?.addEventListener('click', handleOnClickBtnDownloadByChunk)
