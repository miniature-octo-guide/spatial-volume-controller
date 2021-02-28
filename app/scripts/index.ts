// import { v4 as uuidv4 } from 'uuid'
import { SpeakerBox } from './interfaces/SpeakerBox'

import { AudioContainer } from './interfaces/AudioContainer'
import { AudioRequest } from './interfaces/AudioRequest'
import { AudioResponse } from './interfaces/AudioResponse'


let dragStartX: number = 0
let dragStartY: number = 0

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



// Audio

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



window.onload = () => {
  initMain()
}
