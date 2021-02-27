import {SpatialObject} from "./SpatialObject";

export interface AudioListener extends SpatialObject {
  dom: any;
  x: number
  y: number
}