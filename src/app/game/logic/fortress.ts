import {Hex} from "honeycomb-grid";
import {GameElement} from "./game";
import {Factions} from "../../../data/enums";

export class Fortress extends GameElement {
  gateHex: Hex;
  faction: Factions;
  rotation: number;
  health = 10;

  constructor(hex: Hex, faction: Factions, rotation: number) {
    super();
    this.gateHex = hex;
    this.faction = faction;
    this.rotation = rotation;
  }

  getFactionName() {
    return Factions[this.faction];
  }

  override getFileName() {
    return `fortress/${Fortress.sanitizeName(this.getFactionName())}.png`;
  }
}
