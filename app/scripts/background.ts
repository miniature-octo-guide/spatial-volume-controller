// Enable chromereload by uncommenting this line:
// import 'chromereload/devonly'

import { AudioContainer } from './interfaces/AudioContainer'

// import { GetGainRequest } from './interfaces/GetGainRequest'
// import { SetGainRequest } from './interfaces/SetGainRequest'
import { GainResponse } from './interfaces/GainResponse'
import { TabsResponse } from './interfaces/TabsResponse'
import { VideoStreamResponse } from './interfaces/VideoStreamResponse'
// import { GetTabsRequest } from './interfaces/GetTabsRequest'
import { TabInfo } from './interfaces/TabInfo'

const audioContainer: { [tabId: number]: AudioContainer } = {}
const videoStreams: MediaStream[] = []

let peerConnection: RTCPeerConnection

chrome.runtime.onInstalled.addListener((details) => {
  console.log('previousVersion', details.previousVersion)
})

// chrome.browserAction.onClicked.addListener((activeTab) => {
// })

function captureActiveTab (tabId: number, tabTitle: string): void {
  // const tabId: number | null = activeTab.id ?? null
  if (tabId === null) { console.error('current tab id is null'); return } else { console.log(tabId) }

  // const tabTitle: string | null = activeTab.title ?? null
  if (tabTitle === null) { console.error('current tab title is null'); return } else { console.log(tabTitle) }

  // chrome.tabs.Tab({
  //   tabId = tab.id
  // })

  chrome.tabCapture.capture({
    audio: true,
    video: true
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

    // video stream
    // let videoStream: MediaStream = new MediaStream()
    // videoStream = JSON.parse(JSON.stringify(stream))
    // var audioTrack = videoStream.getAudioTracks()[0]
    // audioTrack.enabled = false
    videoStreams.push(stream)
    console.log(videoStreams.length)
    // console.error(`tracked ${tabId}`)

    // chrome.tabs.create({ url: chrome.extension.getURL('pages/index.html') })
  })

  // chrome.tabCapture.capture({
  //   audio: false,
  //   video: true
  // }, (stream: MediaStream) => {
  // })
}

function setGain (tabId: number, value: number): void {
  audioContainer[tabId].gainNode.gain.value = value
}

function getGain (tabId: number): number {
  return audioContainer[tabId].gainNode.gain.value
}

chrome.browserAction.setBadgeText({
  text: '\'Allo'
})

function getNewConnection (sendResoponse: any): RTCPeerConnection {
  const pcConfig = { iceServers: [] }
  const peer = new RTCPeerConnection(pcConfig)

    // https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/onicecandidate
    // called after ICE gathering has finished.
    peer.onicecandidate = function (evt: RTCPeerConnectionIceEvent) {
    if (evt.candidate == null) {
      // All ICE candidates have been sent (end of negotiation)

      const localDescription: RTCSessionDescription | null = peer.localDescription
      if (localDescription == null) {
        console.error('no local description during ice candicdate collection')
        return
      }

      const response: VideoStreamResponse = {
        sdp: localDescription
      }
      sendResoponse(response)
    }
  }

  // https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/addTrack
  // send tab video tracks to the viewer (the other peer)
  for (const videoStream of videoStreams) {
    videoStream.getTracks().forEach(function (track) {
      peer.addTrack(track, videoStream)
    })
  }

  return peer
}

function makeOffer (sendResoponse: any): void {
  peerConnection = getNewConnection(sendResoponse)
  peerConnection.createOffer()
    .then(async function (offer: RTCSessionDescription) {
      console.log('createOffer() succeeded in promise')
      return await peerConnection.setLocalDescription(offer)
    }).catch(function (err: DOMException) {
      console.error(err)
    })
}

function setAnswer (sessionDescription: RTCSessionDescription): void {
  peerConnection.setRemoteDescription(sessionDescription)
    .then(function () {
      console.log('setRemoteDescription(answer) succeeded in promise')
    }).catch(function (err: DOMException) {
      console.error('setRemoteDescription(answer) ERROR: ', err)
    })
}

chrome.runtime.onMessage.addListener((request: any, sender, sendResponse) => {
  if (request.key === 'track') {
    captureActiveTab(request.tabId, request.tabTitle)
  } else if (request.key === 'set-gain') {
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
  } else if (request.key === 'connect') {
    makeOffer(sendResponse)
  } else if (request.key === 'answer') {
    setAnswer(request.sdp)
  }

  return true
})

console.log('\'Allo \'Allo! Event Page for Browser Action')
