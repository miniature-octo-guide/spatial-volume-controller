// Enable chromereload by uncommenting this line:
// import 'chromereload/devonly'

import { AudioContainer } from './interfaces/AudioContainer'
import { AudioRequest } from './interfaces/AudioRequest'
import { AudioResponse } from './interfaces/AudioResponse'

const audioContainer: AudioContainer[] = []

chrome.runtime.onInstalled.addListener((details) => {
  console.log('previousVersion', details.previousVersion)
})

chrome.browserAction.onClicked.addListener((activeTab) => {
  // chrome.tabs.create({ url: chrome.extension.getURL('pages/index.html') })

  const tabId: number = activeTab.id
  // chrome.tabs.Tab({
  //   tabId = tab.id
  // })

  chrome.tabCapture.capture({
    audio: true,
    video: false
  }, (stream: MediaStream) => {
    const audioContext = new AudioContext()
    const streamSource: MediaStreamAudioSourceNode = audioContext.createMediaStreamSource(stream)
    const gainNode: GainNode = audioContext.createGain()
    streamSource.connect(gainNode)
    gainNode.connect(audioContext.destination)
    // container追加
    const container: AudioContainer = {
      tabId: tabId,
      audioContext: audioContext,
      streamSource: streamSource,
      gainNode: gainNode
    }
    audioContainer.push(container)

    // debug用 tabに拡張機能を追加するごとに付けたり消えたり
    for (let i = 0; i <= tabCount; i++) {
      // gainNodeからゲインを調整
      setGain(i, (tabCount % 2))

      const gain = getGain(i)
      console.log(`gain tab=${i} value=${gain}`)
    }

    if (countTabs < audioContext.length - 1) {
      countTabs++
    }
  })
})

function setGain (audioTabIndex: number, value: number): void {
  audioContainer[audioTabIndex].gainNode.gain.value = value
}

function getGain (audioTabIndex: number): number {
  return audioContainer[audioTabIndex].gainNode.gain.value
}

chrome.browserAction.setBadgeText({
  text: '\'Allo'
})

chrome.runtime.onMessage.addListener((request: AudioRequest, sender, sendResponse) => {
  if (request.type === 'setAudio') {
    setGain(0, 0)
  } else if (request.type === 'getAudio') {
    const response: AudioResponse = {
      audioContainer: audioContainer
    }
    sendResponse(response)
  }
  return true
})

console.log('\'Allo \'Allo! Event Page for Browser Action')
