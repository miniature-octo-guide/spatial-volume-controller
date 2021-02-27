// Enable chromereload by uncommenting this line:
// import 'chromereload/devonly'

let audioContext: AudioContext
let streamSource: MediaStreamAudioSourceNode
let gainNode: GainNode

chrome.runtime.onInstalled.addListener((details) => {
  console.log('previousVersion', details.previousVersion)
})

chrome.browserAction.onClicked.addListener((activeTab) => {
  // chrome.tabs.create({ url: chrome.extension.getURL('pages/index.html') })
})

chrome.browserAction.setBadgeText({
  text: '\'Allo'
})

chrome.tabCapture.capture({ audio: true, video: false }, (stream: MediaStream) => {
  console.log("typeof")
  console.log(typeof(audioContext))
  console.log(typeof(streamSource))

  audioContext = new AudioContext()
  streamSource = audioContext.createMediaStreamSource(stream)
  gainNode = audioContext.createGain()

  streamSource.connect(gainNode)
  gainNode.connect(audioContext.destination)

  gainNode.gain.value = 1.0
})

console.log('\'Allo \'Allo! Event Page for Browser Action')
