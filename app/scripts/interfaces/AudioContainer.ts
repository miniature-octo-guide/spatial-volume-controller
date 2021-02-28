export interface AudioContainer {
    tabId: string
    audioContext: AudioContext
    streamSource: MediaStreamAudioSourceNode
    gainNode: GainNode
}