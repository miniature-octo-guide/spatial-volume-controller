// Enable chromereload by uncommenting this line:
// import 'chromereload/devonly'

import { TabInfo } from "./interfaces/TabInfo"

console.log('Popup page opened!')

function initPopup (): void {
  const elmOpen: HTMLAnchorElement | null = document.querySelector('#id_open') as HTMLAnchorElement
  if (elmOpen == null) return
  elmOpen.addEventListener('click', () => {
    chrome.tabs.create({ url: chrome.extension.getURL('pages/index.html') })
  })

  const elmTrack: HTMLAnchorElement | null = document.querySelector('#id_track') as HTMLAnchorElement
  if (elmTrack == null) { console.error('track element not found'); return }
  elmTrack.addEventListener('click', () => {
    // TODO: track tab
    trackTab()
  })

  const elmUntrack: HTMLAnchorElement | null = document.querySelector('#id_untrack') as HTMLAnchorElement
  if (elmUntrack == null) { console.error('untrack element not found'); return }
  elmUntrack.addEventListener('click', () => {
    // TODO: untrack tab
  })
}

function trackTab() {
  console.log('track tab')
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs:any): void {
    // get active and currentWindow tab
    chrome.runtime.sendMessage({
      key: 'track',
      tabId: tabs[0].id,  
      tabTitle: tabs[0].title
    }, function(response:any){

    })
  })
}

window.onload = () => {
  initPopup()
}

// TODO: make Untrack visible if current tab is tracked
// TODO: make track invisible if current tab is untracked
