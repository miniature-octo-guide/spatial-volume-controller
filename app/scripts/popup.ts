// Enable chromereload by uncommenting this line:
// import 'chromereload/devonly'

console.log('Popup page opened!')

let elmOpen: HTMLAnchorElement = <HTMLAnchorElement> document.querySelector('#id_open')
elmOpen.addEventListener('click', () => {
  chrome.tabs.create({ url: chrome.extension.getURL('pages/index.html') })
})

let elmTrack: HTMLAnchorElement = <HTMLAnchorElement> document.querySelector('#id_track')
elmTrack.addEventListener('click', () => {
  // TODO: track tab
})

let elmUntrack: HTMLAnchorElement = <HTMLAnchorElement> document.querySelector('#id_untrack')
elmUntrack.addEventListener('click', () => {
  // TODO: untrack tab
})

// TODO: make Untrack visible if current tab is tracked
// TODO: make track invisible if current tab is untracked
