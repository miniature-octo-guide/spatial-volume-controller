// Enable chromereload by uncommenting this line:
// import 'chromereload/devonly'

let countTabs = 0

let audioContext: AudioContext[] = new Array(5);
//let streamSource: MediaStreamAudioSourceNode
//let gainNode: GainNode

chrome.runtime.onInstalled.addListener((details) => {
  console.log('previousVersion', details.previousVersion)
})

chrome.browserAction.onClicked.addListener((activeTab) => {

  chrome.tabCapture.capture({ audio: true, video: false }, (stream: MediaStream) => {
    audioContext[countTabs] = new AudioContext()

    for (let i = 0; i <= countTabs; i++) {
      let streamSource = audioContext[i].createMediaStreamSource(stream)
      let gainNode = audioContext[i].createGain()
      streamSource.connect(gainNode)
      gainNode.connect(audioContext[i].destination)
      gainNode.gain.value = (countTabs % 2)
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
