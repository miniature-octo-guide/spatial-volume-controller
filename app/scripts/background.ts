// Enable chromereload by uncommenting this line:
// import 'chromereload/devonly'

const tab_size : number = 3;
var objectUrlArray : any[] = new Array(tab_size);
var count : number = 0;

chrome.runtime.onInstalled.addListener((details) => {
  console.log('previousVersion', details.previousVersion)
})

chrome.browserAction.onClicked.addListener((activeTab) => {
  if(count < tab_size) {
    chrome.tabCapture.capture({ audio: false, video: true }, (stream: MediaStream) => {
      objectUrlArray[count] = URL.createObjectURL(stream);
    })
  } else {
    chrome.tabs.create({ url: chrome.extension.getURL('pages/index.html') })
  } 
  count += 1;
})

chrome.browserAction.setBadgeText({
  text: '\'Allo'
})

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    console.log(sender.tab ?
                "from a content script:" + sender.tab.url :
                "from the extension");
    if (request.greeting == "video")
      sendResponse({farewell: objectUrlArray});
    return true;
  }
);

console.log('\'Allo \'Allo! Event Page for Browser Action')
