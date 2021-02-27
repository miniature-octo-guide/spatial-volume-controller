import {SpatialObject} from "./SpatialObject";

export interface AudioSource extends SpatialObject {
  x: number
  y: number
  dom: any;
  width: number // 音源オブジェクトの大きさを変えられるようにしたい！（映像入れたとき用）
  height: number
}