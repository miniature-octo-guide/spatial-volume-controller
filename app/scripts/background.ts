// Enable chromereload by uncommenting this line:
// import 'chromereload/devonly'

import { VideoStreamContainer } from './interfaces/VideoStreamContainer'
import { VideoStreamRequest } from './interfaces/VideoStreamRequest'
import { VideoStreamResponse } from './interfaces/VideoStreamResponse'

const videoStreams: VideoStreamContainer[] = []

chrome.runtime.onInstalled.addListener((details) => {
  console.log('previousVersion', details.previousVersion)
})

chrome.browserAction.onClicked.addListener((activeTab) => {
  chrome.tabCapture.capture({
    audio: false,
    video: true,
    videoConstraints: {
      mandatory: {
        chromeMediaSource: 'tab',
      },
    },
  }, (stream: MediaStream) => {
    const container: VideoStreamContainer = {
      // TODO: contains tab title etc.
      stream: stream
    }
    videoStreams.push(container)

    if (videoStreams.length >= 1) {
      chrome.tabs.create({ url: chrome.extension.getURL('pages/index.html') })
    }
  })
})

chrome.browserAction.setBadgeText({
  text: '\'Allo'
})

chrome.runtime.onMessage.addListener((request: VideoStreamRequest, sender: chrome.runtime.MessageSender, sendResponse) => {
  if (request.type === 'video') {
    if (! sender.tab) { console.error('sender.tab cannot be undefined. it\'s bug,'); return }
    let senderTab: chrome.tabs.Tab = sender.tab

    if (! senderTab.id) { console.error('sender.tab.id cannot be undefined. it\'s bug,'); return }
    let senderTabId: number = senderTab.id

    const pc = new RTCPeerConnection({iceServers:[]})

    for (let videoStream of videoStreams) {
      const stream: MediaStream = videoStream.stream
      const tracks: MediaStreamTrack[] = stream.getTracks()
      console.log(stream)
      console.log(tracks)

      const track: MediaStreamTrack = stream.getTracks()[0]

      pc.addTrack(track, stream)
    }

    pc.createOffer().then((offer: RTCSessionDescriptionInit) => {
      pc.setLocalDescription(offer).then(() => {
        let connectInfo: chrome.tabs.ConnectInfo = {
          name: 'tabCaptureConnection',
        }

        let port = chrome.tabs.connect(senderTabId, connectInfo)
        port.onDisconnect.addListener((port: chrome.runtime.Port) => {
        })

        port.onMessage.addListener((message: any, port: chrome.runtime.Port) => {
          let sdp = new RTCSessionDescription(message)

          pc.setRemoteDescription(sdp).then(() => {
            console.log(sdp)
          })
        })

        port.postMessage(pc.localDescription)
      })
    })

  }

  return true
})

console.log('\'Allo \'Allo! Event Page for Browser Action')
