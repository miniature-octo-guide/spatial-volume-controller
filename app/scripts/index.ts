import { v4 as uuidv4 } from 'uuid'

import { Point } from './interfaces/Point'

let dragStartX: number = 0
let dragStartY: number = 0

window.onload = () => {
  initMain()
}

function initMain() {
  document.body.addEventListener("mousemove", __onMouseMove, false) // 3rd == false: bottom-up propagation
  document.body.addEventListener("touchmove", __onMouseMove, false)
  // document.body.addEventListener("mouseleave", __onMouseUp, false)
  // document.body.addEventListener("touchleave", __onMouseUp, false)

  let listenerIcon = __createListenerIcon(100, 100)
  document.body.appendChild(listenerIcon)

  let speakerIcon = __createSpeakerIcon(100, 100, 'Room X')
  document.body.appendChild(speakerIcon)
  // icons.push(new SpeakerIcon(100+i*100,100+i*100, "Room" + i));
}

function __createListenerIcon(left: number, top: number) {
  // TODO: replace with React or Vue
  let dom = <HTMLDivElement> document.createElement('div')
  dom.classList.add('listener-box')
  dom.classList.add("drag-and-drop")

  dom.style.left = left + "px"
  dom.style.top = top + "px"


  let img = <HTMLImageElement> document.createElement('img')
  img.src = '../images/yamanekko.jpg'
  img.id = "my-icon"
  dom.appendChild(img)

  dom.addEventListener("mousedown", __onIconMouseDown, false)
  dom.addEventListener("touchstart", __onIconMouseDown, false)

  //マウスボタンが離されたとき、またはカーソルが外れたとき発火
  dom.addEventListener("mouseup", __onMouseUp, false)
  dom.addEventListener("touchend", __onMouseUp, false)

  return dom
}

function __createSpeakerIcon(left: number, top: number, text: string) {
  let dom = <HTMLDivElement> document.createElement('div')
  dom.classList.add('speaker-box')
  dom.classList.add('drag-and-drop')

  dom.style.left = left + "px"
  dom.style.top = top + "px"

  dom.dataset.text = text


  let dom_p: HTMLParagraphElement = <HTMLParagraphElement> document.createElement('p')
  dom_p.innerText = text
  dom.appendChild(dom_p)

  dom.addEventListener("mousedown", __onIconMouseDown, false);
  dom.addEventListener("touchstart", __onIconMouseDown, false);

  //マウスボタンが離されたとき、またはカーソルが外れたとき発火
  dom.addEventListener("mouseup", __onMouseUp, false)
  dom.addEventListener("touchend", __onMouseUp, false)

  return dom
}

interface PageLocation {
  pageX: number
  pageY: number
}

function __onIconMouseDown(e: MouseEvent | TouchEvent) {
  let target: EventTarget | null = e.currentTarget
  if (! (target instanceof HTMLElement)) {
    console.error('event target is not HTML element')
    return
  }

  //タッチイベントとマウスのイベントの差異を吸収
  let event: PageLocation
  if (e instanceof TouchEvent) {
    event = e.changedTouches[0]
  }
  else {
    event = e
  }

  //クラスに .drag を追加
  target.classList.add('drag')

  //要素内の相対座標を取得
  dragStartX = event.pageX - this.offsetLeft
  dragStartY = event.pageY - this.offsetTop

  console.log(dragStartX, dragStartY)
}

//マウスカーソルが動いたときに発火
function __onMouseMove(e: MouseEvent | TouchEvent) {
    //フリックしたときに画面を動かさないようにデフォルト動作を抑制
    e.preventDefault()

    //タッチイベントとマウスのイベントの差異を吸収
    let event: PageLocation
    if (e instanceof TouchEvent) {
      event = e.changedTouches[0]
    }
    else {
      event = e
    }

    const drag: HTMLElement | null = document.querySelector('.drag')
    if (drag == null) return

    // const rect: Element = drag.getBoundingClientRect()
    // const centerX = (rect.left + rect.right) / 2
    // const centerY = (rect.top + rect.bottom) / 2

    //マウスが動いた場所に要素を動かす
    let newX: number = event.pageX - dragStartX
    let newY: number = event.pageY - dragStartY

    drag.style.left = newX + "px"
    drag.style.top = newY + "px"
}

//マウスボタンが上がったら発火
function __onMouseUp(e: MouseEvent | TouchEvent) {
    const drag: HTMLElement = <HTMLElement> document.querySelector('.drag')
    if (drag == null) {
      console.error('drag object is null')
      return
    }

    //クラス .drag を消す
    drag.classList.remove("drag")
}
