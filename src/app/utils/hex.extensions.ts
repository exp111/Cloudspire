import {Hex, HexCoordinates} from "honeycomb-grid";
import {HexUtils} from "./hexUtils";

export {}

declare module "honeycomb-grid" {
  interface Hex {
    coords(): HexCoordinates;
    getKey(): string;
  }
}

Hex.prototype.coords = function() {
  return {col: this.col, row: this.row};
};
Hex.prototype.getKey = function() {
  return HexUtils.getKeyFromPos(this.col, this.row);
}
