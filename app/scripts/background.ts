// Enable chromereload by uncommenting this line:
// import 'chromereload/devonly'

const maxTabs = 5
let countTabs = 0

let audioContext: AudioContext[] = new Array(maxTabs)
let streamSource: MediaStreamAudioSourceNode[] = new Array(maxTabs)
let gainNode: GainNode[] = new Array(maxTabs)

chrome.runtime.onInstalled.addListener((details) => {
  console.log('previousVersion', details.previousVersion)
})

chrome.browserAction.onClicked.addListener((activeTab) => {
  // chrome.tabs.create({ url: chrome.extension.getURL('pages/index.html') })

  chrome.tabCapture.capture({ audio: true, video: false }, (stream: MediaStream) => {
    audioContext[countTabs] = new AudioContext()

    streamSource[countTabs] = audioContext[countTabs].createMediaStreamSource(stream)
    gainNode[countTabs] = audioContext[countTabs].createGain()
    streamSource[countTabs].connect(gainNode[countTabs])
    gainNode[countTabs].connect(audioContext[countTabs].destination)

    for (let i = 0; i <= countTabs; i++) {
      gainNode[i].gain.value = (countTabs % 2) 
    }

    if (countTabs < audioContext.length - 1) {
      countTabs++
    }
  })

})

chrome.browserAction.setBadgeText({
  text: '\'Allo'
})

console.log('\'Allo \'Allo! Event Page for Browser Action')
