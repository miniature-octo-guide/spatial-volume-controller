// Enable chromereload by uncommenting this line:
// import 'chromereload/devonly'

let objectUrl : DOMString

chrome.runtime.onInstalled.addListener((details) => {
  console.log('previousVersion', details.previousVersion)
})

chrome.browserAction.onClicked.addListener((activeTab) => {
  chrome.tabCapture.capture({ audio: false, video: true }, (stream: MediaStream) => {
    objectUrl = URL.createObjectURL(stream);
  }
})

chrome.browserAction.setBadgeText({
  text: '\'Allo'
})

console.log('\'Allo \'Allo! Event Page for Browser Action')
