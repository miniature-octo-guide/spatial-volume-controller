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
        document.body.appendChild(videoElement)

        // TODO: fix track muted issue
        const stream: MediaStream = event.streams[0]
        const track: MediaStreamTrack = event.track
        // const localStream = new MediaStream([ track ])
        videoElement.srcObject = stream
        videoElement.play().then(() => {
          console.log('video play') // TODO: not called
        })

        console.log(videoElement)
        console.log(stream)
        console.log(track) // track.muted === true
        // console.log(localStream)
      };

      let sdp = new RTCSessionDescription(message)
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
