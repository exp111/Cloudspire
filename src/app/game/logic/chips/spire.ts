import {SpireData} from "../../../../data/model/chip";
import {GameHex} from "../hex";
import {Data} from "../../../../data/data";
import {Chip, ChipType} from "./chip";

export class Spire extends Chip {
  override type = ChipType.SPIRE;
  override data: SpireData;
  attack: number;
  fortification: number;
  range: number;

  constructor(hex: GameHex, name: string) {
    super(hex, name);
    // get data from db
    this.data = Data.Spires.find(h => h.name === name)!;
    this.attack = this.data.attack;
    this.fortification = this.data.fortification;
    this.range = this.data.range + 1; // has 1 range by default with no chips
  }

  override canMoveToHex(hex: GameHex): boolean {
    // can't move //TODO: talents?
    return false;
  }
}
