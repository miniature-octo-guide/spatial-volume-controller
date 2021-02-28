// Enable chromereload by uncommenting this line:
// import 'chromereload/devonly'

import { AudioContainer } from './interfaces/AudioContainer'

import { GetGainRequest } from './interfaces/GetGainRequest'
import { SetGainRequest } from './interfaces/SetGainRequest'
import { GainResponse } from './interfaces/GainResponse'

const audioContainer: { [tabId: number]: AudioContainer } = {}

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

    // container作成
    const container: AudioContainer = {
      tabId: tabId,
      audioContext: audioContext,
      streamSource: streamSource,
      gainNode: gainNode
    }

    audioContainer[tabId] = container
  })
})

function setGain (tabId: number, value: number): void {
  audioContainer[tabId].gainNode.gain.value = value
}

function getGain (tabId: number): number {
  return audioContainer[tabId].gainNode.gain.value
}

chrome.browserAction.setBadgeText({
  text: '\'Allo'
})

chrome.runtime.onMessage.addListener((request: SetGainRequest | GetGainRequest, sender, sendResponse) => {
  if (request instanceof SetGainRequest) {
    const tabId: number = request.tabId
    const gainValue: number = request.gainValue

    setGain(tabId, gainValue)

    const retGainValue: number = getGain(tabId)
    const response: GainResponse = {
      tabId: tabId,
      gainValue: retGainValue
    }
    sendResponse(response)
  } else {
    const tabId: number = request.tabId
    const gainValue: number = getGain(tabId)

    const response: GainResponse = {
      tabId: tabId,
      gainValue: gainValue
    }
    sendResponse(response)
  }

  return true
})

console.log('\'Allo \'Allo! Event Page for Browser Action')
