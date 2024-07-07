import {LandmarkData} from "../../../../data/model/chip";
import {GameHex} from "../hex";
import {Data} from "../../../../data/data";
import {Chip, ChipType} from "./chip";

export class Landmark extends Chip {
  override type = ChipType.LANDMARK;
  override data: LandmarkData;
  health: number;
  attack: number;

  constructor(hex: GameHex, name: string) {
    super(hex, name);
    // get data from db
    this.data = Data.Landmarks.find(h => h.name === name)!;
    this.health = this.data.health;
    this.attack = this.data.attack;
  }
}
