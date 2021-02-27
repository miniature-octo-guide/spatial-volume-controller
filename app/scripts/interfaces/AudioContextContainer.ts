export interface AudioContextContainer {
    audioContext: AudioContext
    streamSource: MediaStreamAudioSourceNode
    gainNode: GainNode
}