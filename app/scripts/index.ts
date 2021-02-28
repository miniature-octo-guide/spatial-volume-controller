// import { v4 as uuidv4 } from 'uuid'
import { SpeakerBox } from './interfaces/SpeakerBox'

import { GetGainRequest } from './interfaces/GetGainRequest'
import { SetGainRequest } from './interfaces/SetGainRequest'
import { GainResponse } from './interfaces/GainResponse'

let dragStartX: number = 0
let dragStartY: number = 0

function getListenerBox (): ListenerBox {
  const dom: Element = document.querySelector('.listener-box')
  if (!(dom instanceof HTMLElement)) { console.error('listener box must be HTML element'); return }

  const rect = dom.getBoundingClientRect()
  const x: number = (rect.left + rect.right) / 2
  const y: number = (rect.top + rect.bottom) / 2

  const ret: ListenerBox = {
    x: x,
    y: y
  }

  return ret
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
      text: text
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

  const bodyRect = document.body.getBoundingClientRect()
  const centerX = (bodyRect.left + bodyRect.right) / 2
  const centerY = (bodyRect.top + bodyRect.bottom) / 2

  const listenerIcon = _createListenerIcon(centerX, centerY)
  document.body.appendChild(listenerIcon)

  const speakerIcon = _createSpeakerIcon(300, 100, 'my-unique-id', 'Room X')
  document.body.appendChild(speakerIcon)
  // icons.push(new SpeakerIcon(100+i*100,100+i*100, "Room" + i));

  const speakers = getSpeakerBoxes()
  console.log(speakers)
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
  img.src = '../images/yamanekko.jpg'
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

  const domP: HTMLParagraphElement = document.createElement('p')
  domP.innerText = text
  dom.appendChild(domP)

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
}

function onItemMoved (): void {
  const listenerBox: ListenerBox = getListenerBox()

  const speakerBoxes: SpeakerBox[] = getSpeakerBoxes()
  for (const speakerBox of speakerBoxes) {
    const id: string = speakerBox.id
    const tabId: number = parseInt(id)

    const srcX = speakerBox.x
    const srcY = speakerBox.y

    const destX = listenerBox.x
    const destY = listenerBox.y

    // TODO: fix attenuation algorithm
    let gainValue = 0.5 // default value
    const mutePixels = 600

    const x2 = (srcX - destX) * (srcX - destX)
    const y2 = (srcY - destY) * (srcY - destY)

    let dist = Math.sqrt(x2 + y2)
    if (dist > mutePixels) dist = mutePixels

    gainValue = dist / mutePixels // linear

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

// TODO: rewrite with Promise
function setGain (tabId: number, value: number, callback: GainResponseCallback): void {
  const request: SetGainRequest = {
    tabId: tabId,
    value: value
  }
  chrome.runtime.sendMessage(request, callback)
}

function getGain (tabId: number, value: number, callback: GainResponseCallback): void {
  const request: GetGainRequest = {
    tabId: tabId
  }
  chrome.runtime.sendMessage(request, callback)
}

window.onload = () => {
  initMain()
}
