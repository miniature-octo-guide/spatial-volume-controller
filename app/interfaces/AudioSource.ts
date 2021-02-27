import {SpatialObject} from "./SpatialObject";

interface AudioSource extends SpatialObject {
  x: number
  y: number
  width: number // 音源オブジェクトの大きさを変えられるようにしたい！（映像入れたとき用）
  height: number
}