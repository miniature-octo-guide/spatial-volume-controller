// Enable chromereload by uncommenting this line:
// import 'chromereload/devonly'

import { VideoStreamContainer } from './interfaces/VideoStreamContainer'
import { VideoStreamRequest } from './interfaces/VideoStreamRequest'
import { VideoStreamResponse } from './interfaces/VideoStreamResponse'

const videoStreams: VideoStreamContainer[] = []
let peerConnection : RTCPeerConnection
let localStream : MediaStream

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
    localStream = stream
    console.log(localStream)

    if(localStream != null) {
      chrome.tabs.create({ url: chrome.extension.getURL('pages/index.html') })
    }
  })
})

chrome.browserAction.setBadgeText({
  text: '\'Allo'
})

function prepareNewConnection(sendResoponse:any): RTCPeerConnection {
  let pcConfig = {"iceServers":[]}
  let peer = new RTCPeerConnection(pcConfig)

  // --- on get local ICE candidate
  peer.onicecandidate = function (evt) {
    if (evt.candidate == null)  { // ICE candidate が収集された
      console.log('empty ice event')
      sendResoponse(peer.localDescription)
    }
  };

  // -- add local stream --
  if (localStream) {
    console.log('Adding local stream...')
    localStream.getTracks().forEach(function(track) {
      peer.addTrack(track, localStream)
    })
  } else {
    console.warn('no local stream, but continue.')
  }

  return peer;
}

function makeOffer(sendResoponse:any): void {
  peerConnection = prepareNewConnection(sendResoponse)
  peerConnection.createOffer()
  .then(function (sessionDescription) {
    console.log('createOffer() succsess in promise')
    peerConnection.setLocalDescription(sessionDescription)
  }).catch(function(err) {
    console.error(err)
  });
}

function setAnswer(sessionDescription:RTCSessionDescription): void{
  peerConnection.setRemoteDescription(sessionDescription)
  .then(function() {
    console.log('setRemoteDescription(answer) succsess in promise')
  }).catch(function(err) {
    console.error('setRemoteDescription(answer) ERROR: ', err)
  });
}

chrome.runtime.onMessage.addListener((request: any, sender: chrome.runtime.MessageSender, sendResponse) => {
  if (request.key === 'connect') {
    makeOffer(sendResponse)
  } else if (request.key === 'answer') {
    setAnswer(request.sdp)
  }
  return true
})

console.log('\'Allo \'Allo! Event Page for Browser Action')
