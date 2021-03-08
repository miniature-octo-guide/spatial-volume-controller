export interface AudioContainer {
  tabId: number
  tabTitle: string
  audioContext: AudioContext
  streamSource: MediaStreamAudioSourceNode
  gainNode: GainNode
}
