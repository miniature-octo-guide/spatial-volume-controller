// Enable chromereload by uncommenting this line:
// import 'chromereload/devonly'

import { VideoStreamContainer } from './interfaces/VideoStreamContainer'
import { VideoStreamRequest } from './interfaces/VideoStreamRequest'
import { VideoStreamResponse } from './interfaces/VideoStreamResponse'

console.log('Index page opened!')


chrome.runtime.onConnect.addListener((port: chrome.runtime.Port) => {
  if (port.name === 'tabCaptureConnection') {
    port.onMessage.addListener((message: any, port: chrome.runtime.Port) => {
      let pc = new RTCPeerConnection({iceServers:[]})
      pc.ontrack = (event: RTCTrackEvent) => {
        console.log(event)

        let videoElement = <HTMLVideoElement> document.createElement('video')
        videoElement.style.backgroundColor = 'gray';
        const streams: readonly MediaStream[] = event.streams

        videoElement.srcObject = streams[0]
        console.log(videoElement)
        
        document.body.appendChild(videoElement)
      };

      let sdp: RTCSessionDescription = <RTCSessionDescription> message
      pc.setRemoteDescription(sdp).then(() => {
        pc.createAnswer().then((answer: RTCSessionDescriptionInit) => {
          pc.setLocalDescription(answer).then(() => {
            port.postMessage(pc.localDescription)
          })
        })
      })
    })
  }
})

const request: VideoStreamRequest = {
  type: 'video'
}
chrome.runtime.sendMessage(request)
