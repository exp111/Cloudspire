import {Hex} from "honeycomb-grid";
import {GameElement} from "./game";
import {FactionType} from "../../../data/enums";

export class Fortress extends GameElement {
  gateHex: Hex;
  faction: FactionType;
  rotation: number;
  health: number;
  source: number;

  constructor(hex: Hex, faction: FactionType, rotation: number, health: number = 10, source: number = 0) {
    super();
    this.gateHex = hex;
    this.faction = faction;
    this.rotation = rotation;
    this.health = health;
    this.source = source;
  }

  getFactionName() {
    return FactionType[this.faction];
  }

  override getFileName() {
    return `fortress/${Fortress.sanitizeName(this.getFactionName())}.png`;
  }
}
