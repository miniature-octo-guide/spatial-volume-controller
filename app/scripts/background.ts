// Enable chromereload by uncommenting this line:
// import 'chromereload/devonly'

const maxTabCount = 10
let tabCount = 0

import { AudioContainer } from './interfaces/AudioContainer'
import { AudioRequest } from './interfaces/AudioRequest'
import { AudioResponse } from './interfaces/AudioResponse'

const audioContainer: AudioContainer[] = []

chrome.runtime.onInstalled.addListener((details) => {
  console.log('previousVersion', details.previousVersion)
})

chrome.browserAction.onClicked.addListener((activeTab) => {
  //chrome.tabs.create({ url: chrome.extension.getURL('pages/index.html') })
  let tabId
  chrome.tabs.Tab({
    tabId = tab.id
  })

  chrome.tabCapture.capture({
    audio: true,
    video: false
  }, (stream: MediaStream) => {
    const audioContext = new AudioContext()
    const streamSource: MediaStreamAudioSourceNode = audioContext.createMediaStreamSource(stream)
    const gainNode: GainNode = audioContext.createGain()
    streamSource.connect(gainNode)
    gainNode.connect(audioContext.destination)
    //container追加
    const container: AudioContainer = {
      tabId: tabId,
      audioContext: audioContext,
      streamSource: streamSource,
      gainNode: gainNode
    }
    audioContainer.push(container)

    /*
    //debug用　tabに拡張機能を追加するごとに付けたり消えたり
    for (let i = 0; i <= tabCount; i++) {
      //gainNodeからゲインを調整
      setGain(i, (tabCount % 2))
    }
    */
    if (tabCount < maxTabCount - 1) {
      tabCount++
    }
  })

})

function setGain(audioTab: any, value: any) {
  audioContainer[audioTab].gainNode.gain.value = value
}

function getGain(audioTab: any) {
  return audioContainer[audioTab].gainNode.gain.value
}

chrome.browserAction.setBadgeText({
  text: '\'Allo'
})

chrome.runtime.onMessage.addListener((request: AudioRequest, sender, sendResponse) => {
  if (request.type === 'setAudio') {
    setGain(0, 0)
  }else if (request.type === 'getAudio') {
    const response: AudioResponse = {
      audioContainer: audioContainer
    }
    sendResponse(response)
  }
  return true
})

console.log('\'Allo \'Allo! Event Page for Browser Action')
