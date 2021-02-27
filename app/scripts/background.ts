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
  chrome.tabCapture.capture({ audio: false, video: true }, (stream: MediaStream) => {
    const container: VideoStreamContainer = {
      stream: stream
    }

    videoStreams.push(container)

    console.log(videoStreams)

    if (videoStreams.length >= 3) {
      chrome.tabs.create({ url: chrome.extension.getURL('pages/index.html') })
    }
  })
})

chrome.browserAction.setBadgeText({
  text: '\'Allo'
})

chrome.runtime.onMessage.addListener((request: VideoStreamRequest, sender, sendResponse) => {
  if (request.type === 'video') {
    const response: VideoStreamResponse = {
      videoStreams: videoStreams
    }
    sendResponse(response)
  }

  return true
})

console.log('\'Allo \'Allo! Event Page for Browser Action')
