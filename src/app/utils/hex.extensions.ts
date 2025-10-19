import {Hex, HexCoordinates} from "honeycomb-grid";
import {HexUtils} from "./hexUtils";
import {PointData} from "pixi.js";

export {}

// extension methods for the honeycomb hex
declare module "honeycomb-grid" {
  interface Hex {
    coords(): HexCoordinates;
    pos(): PointData;
    getKey(): string;
  }
}

Hex.prototype.coords = function() {
  return {col: this.col, row: this.row};
};
Hex.prototype.pos = function() {
  return {x: this.x, y: this.y};
}
Hex.prototype.getKey = function() {
  return HexUtils.getKeyFromPos(this.col, this.row);
}
