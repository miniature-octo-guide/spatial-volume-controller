export interface AudioContainer {
  tabId: number
  tabTitle: string
  tabWidth: number
  tabHeight: number
  audioContext: AudioContext
  streamSource: MediaStreamAudioSourceNode
  gainNode: GainNode
}
