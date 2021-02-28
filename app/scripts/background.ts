// Enable chromereload by uncommenting this line:
// import 'chromereload/devonly'

import { AudioContainer } from './interfaces/AudioContainer'

// import { GetGainRequest } from './interfaces/GetGainRequest'
// import { SetGainRequest } from './interfaces/SetGainRequest'
// import { GainResponse } from './interfaces/GainResponse'

import { TabsResponse } from './interfaces/TabsResponse'
// import { GetTabsRequest } from './interfaces/GetTabsRequest'
import { TabInfo } from './interfaces/TabInfo'

const audioContainer: { [tabId: number]: AudioContainer } = {}

chrome.runtime.onInstalled.addListener((details) => {
  console.log('previousVersion', details.previousVersion)
})

chrome.browserAction.onClicked.addListener((activeTab) => {
  const tabId: number | null = activeTab.id ?? null
  if (tabId === null) { console.error('current tab id is null'); return }

  const tabTitle: string | null = activeTab.title ?? null
  if (tabTitle === null) { console.error('current tab title is null'); return }

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
      tabTitle: tabTitle,
      audioContext: audioContext,
      streamSource: streamSource,
      gainNode: gainNode
    }

    audioContainer[tabId] = container
    console.error(`tracked ${tabId}`)

    chrome.tabs.create({ url: chrome.extension.getURL('pages/index.html') })
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

chrome.runtime.onMessage.addListener((request: any, sender, sendResponse) => {
  if (request.key === 'set-gain') {
    const tabId: number = request.tabId
    const gainValue: number = request.gainValue

    setGain(tabId, gainValue)

    const retGainValue: number = getGain(tabId)
    const response: GainResponse = {
      tabId: tabId,
      gainValue: retGainValue
    }

    sendResponse(response)
  } else if (request.key === 'get-gain') {
    const tabId: number = request.tabId
    const gainValue: number = getGain(tabId)

    const response: GainResponse = {
      tabId: tabId,
      gainValue: gainValue
    }

    sendResponse(response)
  } else if (request.key === 'get-tabs') {
    const tabs: TabInfo[] = []

    for (const tabId of Object.keys(audioContainer)) {
      const tabIdNumber: number = parseInt(tabId)
      const cont: AudioContainer = audioContainer[tabIdNumber]
      const tabInfo: TabInfo = {
        id: cont.tabId,
        title: cont.tabTitle
      }

      tabs.push(tabInfo)
    }

    const response: TabsResponse = {
      tabs: tabs
    }
    sendResponse(response)
  }

  return true
})

console.log('\'Allo \'Allo! Event Page for Browser Action')
