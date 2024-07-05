import * as PIXI from "pixi.js";
import {Hex} from "honeycomb-grid";

export class HexGroup {
  sprite: PIXI.Sprite;
  baseHex: Hex;
  number: number;

  constructor(hex: Hex, sprite: PIXI.Sprite, number: number) {
    this.baseHex = hex;
    this.sprite = sprite;
    this.number = number;
  }
}

export class Isle extends HexGroup {

}

export class Earthscape extends HexGroup {

}
