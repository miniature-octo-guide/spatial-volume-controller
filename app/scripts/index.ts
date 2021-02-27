// Enable chromereload by uncommenting this line:
// import 'chromereload/devonly'

console.log('Index page opened!')

chrome.runtime.sendMessage({greeting: "video"}, function(response) {
    console.log(response.farewell);
});