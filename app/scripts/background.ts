// Enable chromereload by uncommenting this line:
// import 'chromereload/devonly'

chrome.runtime.onInstalled.addListener((details) => {
  console.log('previousVersion', details.previousVersion)
})

chrome.browserAction.onClicked.addListener((activeTab) => {
  chrome.tabs.create({ url: chrome.extension.getURL('pages/index.html') })
})

chrome.browserAction.setBadgeText({
  text: '\'Allo'
})

console.log('\'Allo \'Allo! Event Page for Browser Action')
