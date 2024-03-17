self.onmessage = evt => {
  console.log('form main: ', evt.data)

  const result = evt.data.toUpperCase()

  self.postMessage(result)
}
