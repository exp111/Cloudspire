import {Hex} from "honeycomb-grid";
import * as PIXI from "pixi.js";
import {GameElement} from "./game";

export class Fortress extends GameElement {
  gateHex: Hex;
  faction: string;
  rotation: number;
  health = 10;

  constructor(hex: Hex, faction: string, rotation: number) {
    super();
    this.gateHex = hex;
    this.faction = faction;
    this.rotation = rotation;
  }

  override getFileName() {
    return `fortress/${Fortress.sanitizeName(this.faction)}.png`;
  }
}
