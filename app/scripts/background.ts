// Enable chromereload by uncommenting this line:
// import 'chromereload/devonly'

const maxTabs = 10
let countTabs = 0

import { AudioContextContainer } from './interfaces/AudioContextContainer'

const audioContainer: AudioContextContainer[] = []

chrome.runtime.onInstalled.addListener((details) => {
  console.log('previousVersion', details.previousVersion)
})

chrome.browserAction.onClicked.addListener((activeTab) => {
  // chrome.tabs.create({ url: chrome.extension.getURL('pages/index.html') })

  chrome.tabCapture.capture({ audio: true, video: false }, (stream: MediaStream) => {
    const audioContext = new AudioContext()
    const streamSource: MediaStreamAudioSourceNode = audioContext.createMediaStreamSource(stream)
    const gainNode: GainNode = audioContext.createGain()
    streamSource.connect(gainNode)
    gainNode.connect(audioContext.destination)
    //container追加
    const container: AudioContextContainer = {
      audioContext: audioContext,
      streamSource: streamSource,
      gainNode: gainNode
    }
    audioContainer.push(container)

    //debug用　tabに拡張機能を追加するごとに付けたり消えたり
    for (let i = 0; i <= countTabs; i++) {
      //gainNodeからゲインを調整
      audioContainer[i].gainNode.gain.value = (countTabs % 2)
    }

    if (countTabs < audioContext.length - 1) {
      countTabs++
    }

  })

})

/*
function setGain(audioTab:any, value:any){
  audioObj[audioTab].gainNode.gain.value = value
}

function getGain(audioTab:any){
  return audioObj[audioTab].gainNode.gain.value
}
*/

chrome.browserAction.setBadgeText({
  text: '\'Allo'
})

console.log('\'Allo \'Allo! Event Page for Browser Action')
