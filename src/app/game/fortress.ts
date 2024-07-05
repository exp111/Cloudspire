import {Hex} from "honeycomb-grid";
import * as PIXI from "pixi.js";

export class Fortress {
  gateHex: Hex;
  sprite: PIXI.Sprite;
  faction: string;
  health = 10;

  constructor(hex: Hex, sprite: PIXI.Sprite, faction: string) {
    this.gateHex = hex;
    this.sprite = sprite;
    this.faction = faction;
  }
}
