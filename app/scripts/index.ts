// Enable chromereload by uncommenting this line:
// import 'chromereload/devonly'

import { VideoStreamContainer } from './interfaces/VideoStreamContainer'
import { VideoStreamRequest } from './interfaces/VideoStreamRequest'
import { VideoStreamResponse } from './interfaces/VideoStreamResponse'
import { AnswerRequest } from './interfaces/AnswerRequest'

let peerConnection : RTCPeerConnection;

console.log('Index page opened!')

function prepareNewConnection(): RTCPeerConnection {
  let pcConfig = {"iceServers":[]}
  let peer = new RTCPeerConnection(pcConfig)

  // --- on get remote stream ---
  peer.ontrack = function(event:RTCTrackEvent) {
    console.log('-- peer.ontrack()')
    let videoElement = document.createElement('video') as HTMLVideoElement
      videoElement.style.backgroundColor = 'gray'
      document.body.appendChild(videoElement)

      // TODO: fix track muted issue
      const stream: MediaStream = event.streams[0]
      videoElement.srcObject = stream
      videoElement.play().then(() => {
        console.log('video play') // TODO: not called
      })
  }

  // --- on get local ICE candidate
  peer.onicecandidate = function (evt) {
    if (!evt.candidate) { // ICE candidate が収集された
      console.log('empty ice event')

      answer(peer.localDescription!, (response:RTCSessionDescription) => {
      })
    }
  };

  return peer
}

function makeAnswer() {   
  peerConnection.createAnswer()
  .then(function (sessionDescription) {
    return peerConnection.setLocalDescription(sessionDescription)
  }).catch(function(err) {
    console.error(err)
  });
}

function setOffer(sessionDescription:RTCSessionDescription) {
  peerConnection = prepareNewConnection()
  peerConnection.setRemoteDescription(sessionDescription)
  .then(function() {
    makeAnswer()
  }).catch(function(err) {
    console.error('setRemoteDescription(offer) ERROR: ', err)
  });
}

function initMain():void {
  connect((response:RTCSessionDescription) => {
    console.log('Received offer text...')
    setOffer(response)
  })

}

type GainResponseCallback = (response:RTCSessionDescription) => void

function connect(callback: GainResponseCallback) {
  const request: VideoStreamRequest = {
    key: 'connect'
  }
  chrome.runtime.sendMessage(request, callback)
}

function answer(sdp: RTCSessionDescription, callback: GainResponseCallback) {
  const request: AnswerRequest = {
    key: 'answer',
    sdp: sdp
  }
  chrome.runtime.sendMessage(request, callback)
}

window.onload = () => {
  initMain()
}