// Enable chromereload by uncommenting this line:
// import 'chromereload/devonly'

import { VideoStreamContainer } from './interfaces/VideoStreamContainer'
import { VideoStreamRequest } from './interfaces/VideoStreamRequest'
import { VideoStreamResponse } from './interfaces/VideoStreamResponse'


console.log('Index page opened!')

let request: VideoStreamRequest = {
  type: 'video',
}

chrome.runtime.sendMessage(request, function(response: VideoStreamResponse) {
  let containers: VideoStreamContainer[] = response.videoStreams

  console.log(containers);
});
