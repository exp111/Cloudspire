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

export enum UpgradeType {
  ATTACK,
  RANGE,
  FORTIFICATION
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

  //TODO: automated pathfinding calc is a bit fucky as the neighbours function doesnt exist and spiral/ring traverse is fucked
  // also we'd need to give like 3 parameters from game service to here as to get any possibility to calculate shit
}
