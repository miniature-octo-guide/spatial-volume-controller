// Enable chromereload by uncommenting this line:
// import 'chromereload/devonly'

import { VideoStreamContainer } from './interfaces/VideoStreamContainer'
import { VideoStreamRequest } from './interfaces/VideoStreamRequest'
import { VideoStreamResponse } from './interfaces/VideoStreamResponse'
import { AnswerRequest } from './interfaces/AnswerRequest'

let peerConnection : RTCPeerConnection; 

console.log('Index page opened!')

function prepareNewConnection(): RTCPeerConnection {
  let pc_config = {"iceServers":[]};
  let peer = new RTCPeerConnection(pc_config);

  // --- on get remote stream ---
  if ('ontrack' in peer) {
    peer.ontrack = function(event:RTCTrackEvent) {
      console.log('-- peer.ontrack()');
      let videoElement = <HTMLVideoElement> document.createElement('video')
        videoElement.style.backgroundColor = 'gray';
        document.body.appendChild(videoElement)

        // TODO: fix track muted issue
        const stream: MediaStream = event.streams[0]
        const track: MediaStreamTrack = event.track
        // const localStream = new MediaStream([ track ])
        videoElement.srcObject = stream
        videoElement.play().then(() => {
          console.log('video play') // TODO: not called
        })
    };
  } 

  // --- on get local ICE candidate
  peer.onicecandidate = function (evt) {
    if (evt.candidate) {
      console.log(evt.candidate);

      // Trickle ICE の場合は、ICE candidateを相手に送る
      // Vanilla ICE の場合には、何もしない
    } else {
      console.log('empty ice event');

      // Trickle ICE の場合は、何もしない
      // Vanilla ICE の場合には、ICE candidateを含んだSDPを相手に送る
      console.log(peer.localDescription)
      answer(peer.localDescription!, (response:RTCSessionDescription) => {
      })
    }
  };

  return peer;
}

function makeAnswer() {   
  peerConnection.createAnswer()
  .then(function (sessionDescription) {
    return peerConnection.setLocalDescription(sessionDescription);
  }).then(function() {
    // -- Trickle ICE の場合は、初期SDPを相手に送る -- 
    // -- Vanilla ICE の場合には、まだSDPは送らない --
    //sendSdp(peerConnection.localDescription);
  }).catch(function(err) {
    console.error(err);
  });
}

function setOffer(sessionDescription:RTCSessionDescription) {
  peerConnection = prepareNewConnection();
  peerConnection.setRemoteDescription(sessionDescription)
  .then(function() {
    makeAnswer();
  }).catch(function(err) {
    console.error('setRemoteDescription(offer) ERROR: ', err);
  });
}

function initMain():void {
  connect((response:RTCSessionDescription) => {
    console.log('Received offer text...');
    setOffer(response);
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