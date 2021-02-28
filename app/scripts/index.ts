// Enable chromereload by uncommenting this line:
// import 'chromereload/devonly'

import { AudioContainer } from './interfaces/AudioContainer'
import { AudioRequest } from './interfaces/AudioRequest'
import { AudioResponse } from './interfaces/AudioResponse'

console.log('Index page opened!')

const setRequest: AudioRequest = {
    type: 'setAudio'
}

const getRequest: AudioRequest = {
    type: 'getAudio'
}

chrome.runtime.sendMessage(setRequest, (response: AudioResponse) => {
    const containers: AudioContainer[] = response.audioContainer

    console.log(containers)
})

chrome.runtime.sendMessage(getRequest, (response: AudioResponse) => {
    const containers: AudioContainer[] = response.audioContainer

    console.log(containers)
})
