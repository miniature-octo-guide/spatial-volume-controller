// import { v4 as uuidv4 } from 'uuid'
import { SpeakerBox } from './interfaces/SpeakerBox'
import { ListenerBox } from './interfaces/ListenerBox'

import { GetGainRequest } from './interfaces/GetGainRequest'
import { SetGainRequest } from './interfaces/SetGainRequest'
import { GainResponse } from './interfaces/GainResponse'

import { TabsResponse } from './interfaces/TabsResponse'
import { GetTabsRequest } from './interfaces/GetTabsRequest'
import { TabInfo } from './interfaces/TabInfo'

import { VideoStreamResponse } from './interfaces/VideoStreamResponse'
import { VideoStreamRequest } from './interfaces/VideoStreamRequest'
import { AnswerSDPRequest } from './interfaces/AnswerSDPRequest'

let dragStartX: number = 0
let dragStartY: number = 0

let distStarts: number[] = []

let peerConnection: RTCPeerConnection

const videoStreams: MediaStream[] = []

function getListenerBox (): ListenerBox {
  const dom: Element | null = document.querySelector('.listener-box')
  if (!(dom instanceof HTMLElement)) { console.error('listener box must be HTML element'); return { x: 0, y: 0 } }

  const rect = dom.getBoundingClientRect()
  const x: number = (rect.left + rect.right) / 2
  const y: number = (rect.top + rect.bottom) / 2

  const box: ListenerBox = {
    x: x,
    y: y
  }

  return box
}

function getSpeakerBoxes (): SpeakerBox[] {
  const speakerBoxDomList: NodeList = document.querySelectorAll('.speaker-box')
  const ret: SpeakerBox[] = []

  for (let index = 0; index < speakerBoxDomList.length; index++) {
    const dom: Node = speakerBoxDomList[index]
    if (!(dom instanceof HTMLElement)) continue

    const rect = dom.getBoundingClientRect()
    const x: number = (rect.left + rect.right) / 2
    const y: number = (rect.top + rect.bottom) / 2

    const id: string | null = dom.dataset.id ?? null
    const text: string | null = dom.dataset.text ?? null

    const box: SpeakerBox = {
      x: x,
      y: y,
      id: id,
      text: text,
      rect: rect
    }

    ret.push(box)
  }

  return ret
}

function initMain (): void {
  document.body.addEventListener('mousemove', _onMouseMove, false) // 3rd == false: bottom-up propagation
  document.body.addEventListener('touchmove', _onMouseMove, false)
  // document.body.addEventListener("mouseleave", _onMouseUp, false)
  // document.body.addEventListener("touchleave", _onMouseUp, false)

  connectVideo((response: VideoStreamResponse) => {
    console.log('connect video request')
    setOffer(response.sdp)
  })
}

function getNewConnection (): RTCPeerConnection {
  const pcConfig = { iceServers: [] }
  const peer = new RTCPeerConnection(pcConfig)

  // https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/ontrack
  // called after a track has been added
  peer.ontrack = function (event: RTCTrackEvent) {
    console.log('RTCTrackEvent')
    for (const stream of event.streams) {
      console.log(stream.id)
      if (videoStreams.every(videoStream => videoStream.id !== stream.id)) videoStreams.push(stream)
    }
  }

  // https://developer.mozilla.org/en-US/docs/Glossary/ICE
  // https://developer.mozilla.org/en-US/docs/Web/API/RTCIceCandidate
  // https://ja.tech.jar.jp/webrtc/basics.html

  // https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/onicecandidate
  // called after ICE gathering has finished.
  peer.onicecandidate = function (evt: RTCPeerConnectionIceEvent) {
    if (evt.candidate == null) {
      // All ICE candidates have been sent (end of negotiation)

      const localDescription: RTCSessionDescription | null = peer.localDescription
      if (localDescription == null) {
        console.error('no local description during ice candidate collection')
        return
      }

      answerSDP(localDescription, (response: VideoStreamResponse) => {
        _initScreen()
      })
    }
  }

  return peer
}

function makeAnswer (): void {
  peerConnection.createAnswer()
    .then(async function (answer) {
      return await peerConnection.setLocalDescription(answer)
    }).catch(function (err: DOMException) {
      console.error(err)
    })
}

function setOffer (sessionDescription: RTCSessionDescription): void {
  peerConnection = getNewConnection()
  peerConnection.setRemoteDescription(sessionDescription)
    .then(function () {
      makeAnswer()
    }).catch(function (err: DOMException) {
      console.error('setRemoteDescription(offer) ERROR: ', err)
    })
}

// Video
type VideoResponseCallback = (response: VideoStreamResponse) => void

function connectVideo (callback: VideoResponseCallback): void {
  const request: VideoStreamRequest = {
    key: 'connect'
  }
  chrome.runtime.sendMessage(request, callback)
}

function answerSDP (sdp: RTCSessionDescription, callback: VideoResponseCallback): void {
  const request: AnswerSDPRequest = {
    key: 'answer',
    sdp: sdp
  }
  chrome.runtime.sendMessage(request, callback)
}

function _initScreen (): void {
  console.log('get tabs')
  getTabs((response: TabsResponse) => {
    const tabs: TabInfo[] = response.tabs
    for (var i = 0; i < tabs.length; i++) {
      const speakerIcon = _createSpeakerIcon(300, 100, `${tabs[i].id}`, tabs[i].title)
      document.body.appendChild(speakerIcon)

      const videoElement = document.createElement('video')
      var audioTrack = videoStreams[i].getAudioTracks()[0]
      audioTrack.enabled = false // streamの音声をoffにする
      videoElement.srcObject = videoStreams[i]
      speakerIcon.appendChild(videoElement)
      videoElement.play().then(() => {
        console.log('video play')
      }).catch(() => {
        console.error('video won\'t play')
      })
    }

    const bodyRect = document.body.getBoundingClientRect()
    const centerX = (bodyRect.left + bodyRect.right) / 2
    const centerY = (bodyRect.top + bodyRect.bottom) / 2

    const listenerIcon = _createListenerIcon(centerX, centerY)
    document.body.appendChild(listenerIcon)

    const speakers = getSpeakerBoxes()
    console.log(speakers)
  })
}

// TODO: set center point
function _createListenerIcon (left: number, top: number): HTMLElement {
  // TODO: replace with React or Vue
  const dom: HTMLDivElement = document.createElement('div')
  dom.classList.add('listener-box')
  dom.classList.add('drag-and-drop')

  dom.style.left = `${left}px`
  dom.style.top = `${top}px`

  const img = document.createElement('img')
  img.src = '../images/nicochan.png'
  img.id = 'my-icon'
  dom.appendChild(img)

  dom.addEventListener('mousedown', _onIconMouseDown, false)
  dom.addEventListener('touchstart', _onIconMouseDown, false)

  // マウスボタンが離されたとき、またはカーソルが外れたとき発火
  dom.addEventListener('mouseup', _onMouseUp, false)
  dom.addEventListener('touchend', _onMouseUp, false)

  return dom
}

function _createSpeakerIcon (left: number, top: number, id: string, text: string): HTMLElement {
  const dom: HTMLDivElement = document.createElement('div')
  dom.classList.add('speaker-box')
  dom.classList.add('drag-and-drop')

  dom.style.left = `${left}px`
  dom.style.top = `${top}px`

  dom.dataset.id = id
  dom.dataset.text = text

  dom.addEventListener('mousedown', _onIconMouseDown, false)
  dom.addEventListener('touchstart', _onIconMouseDown, false)

  // マウスボタンが離されたとき、またはカーソルが外れたとき発火
  dom.addEventListener('mouseup', _onMouseUp, false)
  dom.addEventListener('touchend', _onMouseUp, false)

  return dom
}

interface PageLocation {
  pageX: number
  pageY: number
}

function _onIconMouseDown (e: MouseEvent | TouchEvent): void {
  const target: EventTarget | null = e.currentTarget
  if (!(target instanceof HTMLElement)) {
    console.error('event target is not HTML element')
    return
  }

  // タッチイベントとマウスのイベントの差異を吸収
  let event: PageLocation
  if (e instanceof TouchEvent) {
    event = e.changedTouches[0]
  } else {
    event = e
  }

  // クラスに .drag を追加
  target.classList.add('drag')

  // 要素内の相対座標を取得
  dragStartX = event.pageX - this.offsetLeft
  dragStartY = event.pageY - this.offsetTop

  console.log(dragStartX, dragStartY)

  const dom: HTMLElement | null = document.querySelector('.listener-box')
  if (dom === null) { console.error('listener box not found'); return }
  dom.style.opacity = String(1.0)

  const listenerBox: ListenerBox = getListenerBox()

  const speakerBoxes: SpeakerBox[] = getSpeakerBoxes()
  distStarts = []
  for (const speakerBox of speakerBoxes) {
    // const id: string = speakerBox.id ?? ''
    // const tabId: number = parseInt(id)

    const srcX = speakerBox.x
    const srcY = speakerBox.y

    const destX = listenerBox.x
    const destY = listenerBox.y

    const x2 = (srcX - destX) * (srcX - destX)
    const y2 = (srcY - destY) * (srcY - destY)

    const distStart: number = Math.sqrt(x2 + y2)
    distStarts.push(distStart)
  }
}

// マウスカーソルが動いたときに発火
function _onMouseMove (e: MouseEvent | TouchEvent): void {
  // フリックしたときに画面を動かさないようにデフォルト動作を抑制
  e.preventDefault()

  // タッチイベントとマウスのイベントの差異を吸収
  let event: PageLocation
  if (e instanceof TouchEvent) {
    event = e.changedTouches[0]
  } else {
    event = e
  }

  const drag: HTMLElement | null = document.querySelector('.drag')
  if (drag == null) return

  // const rect: Element = drag.getBoundingClientRect()
  // const centerX = (rect.left + rect.right) / 2
  // const centerY = (rect.top + rect.bottom) / 2

  // マウスが動いた場所に要素を動かす
  const newX: number = event.pageX - dragStartX
  const newY: number = event.pageY - dragStartY

  drag.style.left = `${newX}px`
  drag.style.top = `${newY}px`

  onItemMoved()
}

// マウスボタンが上がったら発火
function _onMouseUp (e: MouseEvent | TouchEvent): void {
  const drag: HTMLElement | null = document.querySelector('.drag') as HTMLElement
  if (drag == null) {
    console.error('drag object is null')
    return
  }

  // クラス .drag を消す
  drag.classList.remove('drag')

  const dom: HTMLElement | null = document.querySelector('.listener-box')
  if (dom === null) { console.error('listener box not found'); return }
  dom.style.opacity = String(0.2)
}

function onItemMoved (): void {
  const listenerBox: ListenerBox = getListenerBox()

  const speakerBoxes: SpeakerBox[] = getSpeakerBoxes()
  for (let index = 0; index < speakerBoxes.length; index++) {
    const id: string = speakerBoxes[index].id ?? ''
    const tabId: number = parseInt(id)

    const srcX = speakerBoxes[index].x
    const srcY = speakerBoxes[index].y

    const destX = listenerBox.x
    const destY = listenerBox.y

    // TODO: fix attenuation algorithm
    let gainValue = 0.5 // default value
    const mutePixels = speakerBoxes[index].rect.width * 1.4

    const x2 = (srcX - destX) * (srcX - destX)
    const y2 = (srcY - destY) * (srcY - destY)

    let dist = Math.sqrt(x2 + y2)
    if (Math.abs(dist - distStarts[index]) > 50) { distStarts[index] = dist } else { continue }
    if (dist > mutePixels) dist = mutePixels

    gainValue = 1 - dist / mutePixels // linear

    setGain(tabId, gainValue, (responseSet: GainResponse) => {
      getGain(tabId, (responseGet: GainResponse) => {
        const remoteTabId: number = responseGet.tabId
        const remoteGain: number = responseGet.gainValue

        console.log(`Remote gain: ${remoteGain} (tab=${remoteTabId})`)
      })
    })
  }
}

// Audio
type GainResponseCallback = (response: GainResponse) => void
type TabsResponseCallback = (response: TabsResponse) => void

// TODO: rewrite with Promise
function setGain (tabId: number, value: number, callback: GainResponseCallback): void {
  const request: SetGainRequest = {
    key: 'set-gain',
    tabId: tabId,
    gainValue: value
  }
  chrome.runtime.sendMessage(request, callback)
}

function getGain (tabId: number, callback: GainResponseCallback): void {
  const request: GetGainRequest = {
    key: 'get-gain',
    tabId: tabId
  }
  chrome.runtime.sendMessage(request, callback)
}

function getTabs (callback: TabsResponseCallback): void {
  const request: GetTabsRequest = {
    key: 'get-tabs'
  }
  chrome.runtime.sendMessage(request, callback)
}

window.onload = () => {
  initMain()
}
