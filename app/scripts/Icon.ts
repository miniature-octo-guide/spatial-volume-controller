import {AudioListener} from "../interfaces/AudioListener";
import {AudioSource} from "../interfaces/AudioSource";

let x:number = 0;
let y:number = 0;

class ListenerIcon implements AudioListener{
    // プロパティは名前: 型
    x: number;
    y: number;
    dom: any;

    // コストラクタ（省略可能）
    constructor(init_x:number,init_y:number) {
        this.x = init_x;
        this.y = init_y;

        this.dom = <HTMLDivElement>document.createElement('div');
        this.dom.className = "drag-and-drop";
        this.dom.addEventListener("mousedown", mdown, false);
        this.dom.addEventListener("touchstart", mdown, false);

        let dom_img = <HTMLImageElement>document.createElement('img');
        dom_img.src = "../images/yamanekko.jpg";
        dom_img.id = "my-icon"
        this.dom.appendChild(dom_img);
        document.body.appendChild(this.dom);
    }
}

class SpeakerIcon implements AudioSource{
    // プロパティは名前: 型
    x: number;
    y: number;
    dom: any;
    width:number;
    height:number;

    // コストラクタ（省略可能）
    constructor(init_x:number,init_y:number,name:string) {
        this.x = init_x;
        this.y = init_y;
        this.width = 100;
        this.height = 100;

        this.dom = <HTMLDivElement>document.createElement('div');
        this.dom.className = "box drag-and-drop";
        this.dom.id = name;
        this.dom.addEventListener("mousedown", mdown, false);
        this.dom.addEventListener("touchstart", mdown, false);

        let dom_p:any = document.createElement('p');
        dom_p.createTextNode = name;
        this.dom.appendChild(dom_p);
        document.body.appendChild(this.dom);
    }
}

//マウスが押された際の関数
function mdown(e:any){
    let event:any;
    //クラス名に .drag を追加
    this.classList.add("drag");

    //タッチデイベントとマウスのイベントの差異を吸収
    if(e.type === "mousedown") {
        event = e;
    } else {
        event = e.changedTouches[0];
    }

    //要素内の相対座標を取得
    x = event.pageX - this.offsetLeft;
    y = event.pageY - this.offsetTop;
    console.log(x,y)

    //ムーブイベントにコールバック
    document.body.addEventListener("mousemove", mmove, false);
    document.body.addEventListener("touchmove", mmove, false);
}

//マウスカーソルが動いたときに発火
function mmove(e:any) {
    let event:any;
    const drag: any = document.querySelector('.drag')
    //同様にマウスとタッチの差異を吸収
    if(e.type === "mousemove") {
        event = e;
    } else {
        event = e.changedTouches[0];
    }

    //フリックしたときに画面を動かさないようにデフォルト動作を抑制
    e.preventDefault();

    const target_icon:any = SearchObject(drag);

    //マウスが動いた場所に要素を動かす
    let new_x:any = event.pageY - y;
    let new_y:any = event.pageX - x;
    drag.style.top = new_x + "px";
    drag.style.left = new_y + "px";
    target_icon.x = new_x;
    target_icon.y = new_y;

    //マウスボタンが離されたとき、またはカーソルが外れたとき発火
    drag.addEventListener("mouseup", mup, false);
    document.body.addEventListener("mouseleave", mup, false);
    drag.addEventListener("touchend", mup, false);
    document.body.addEventListener("touchleave", mup, false);
}

    //マウスボタンが上がったら発火
function mup(e:any) {
    const drag: any = document.querySelector('.drag')
    //ムーブベントハンドラの消去
    document.body.removeEventListener("mousemove", mmove, false);
    document.body.removeEventListener("touchmove", mmove, false);
    //drag.removeEventListener("touchend", mup, false);

    //クラス名 .drag も消す
    drag.classList.remove("drag");
}

function SearchObject(dom:any):any{
    for(let i=0;i<icons.length;i++)
        if(icons[i].dom = dom)
            return icons[i]
}

let icons: any[] = new Array(3);
for(let i=0;i<icons.length;i++){
    if(i=0)
        icons[i] = new ListenerIcon(100+i*100,100+i*100);
    else
        icons[i] = new SpeakerIcon(100+i*100,100+i*100,"Room" + i);
}