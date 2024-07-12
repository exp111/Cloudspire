import {LandmarkData} from "../../../../data/model/chip";
import {GameHex} from "../hex";
import {Data} from "../../../../data/data";
import {AttackUpgrade, Chip, ChipType, ContainerChip} from "./chip";

export class Landmark extends ContainerChip {
  override type = ChipType.LANDMARK;
  override data: LandmarkData;
  health!: number;
  attack!: number;

  constructor(hex: GameHex, name: string, chips?: Chip[]) {
    super(hex, name, chips);
    // get data from db
    this.data = Data.Landmarks.find(h => h.name === name)!;
    this.calculateStats();
  }

  createDefaultChips(): void {
    this.addChips(AttackUpgrade, this.data.health);
  }

  calculateStats() {
    this.health = this.countOfChip(ChipType.CHIP_HEALTH);
    this.attack = this.data.attack;
  }
}
