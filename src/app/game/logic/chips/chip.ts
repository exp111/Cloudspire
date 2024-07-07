import {ChipData} from "../../../../data/model/chip";
import {Data} from "../../../../data/data";
import {GameHex} from "../hex";
import {Terrain} from "../../../../data/enums";
import {GameElement} from "../game";

export enum ChipType {
  HERO,
  MINION,
  SPIRE,
  LANDMARK
}

export abstract class Chip extends GameElement {
  abstract type: ChipType;
  hex: GameHex;
  data: ChipData;

  protected constructor(hex: GameHex, name: string) {
    super();
    this.hex = hex;
    // get data from db
    this.data = Data.Chips.find(h => h.name === name)!;
  }

  canMoveToHex(hex: GameHex) {
    return hex.terrain == Terrain.Path;
  }

  override getFileName() {
    return `chip/${Chip.sanitizeName(this.data.name)}.png`;
  }
}
