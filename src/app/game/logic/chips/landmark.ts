import {LandmarkData} from "../../../../data/model/chip";
import {GameHex} from "../hex";
import {Data} from "../../../../data/data";
import {AttackUpgrade, Chip, ChipType, ContainerChip} from "./chip";
import {FactionType, LandmarkType} from "../../../../data/enums";

export class Landmark extends ContainerChip {
  override type = ChipType.LANDMARK;
  override data: LandmarkData;
  health!: number;
  attack!: number;
  faceDown!: boolean;

  constructor(hex: GameHex, name: string, faction: FactionType = FactionType.NEUTRAL, faceDown = true, chips?: Chip[]) {
    super(hex, name, faction, chips);
    // get data from db
    this.data = Data.Landmarks.find(h => h.name === name)!;
    this.faceDown = faceDown;
    this.calculateStats();
  }

  createDefaultChips(): void {
    this.addChips(AttackUpgrade, this.data.health);
  }

  override getFileName() {
    return `chip/landmark/${this.faceDown ? `landmark_${LandmarkType[this.data.type].toLowerCase()}` : Landmark.sanitizeName(this.data.name)}.png`;
  }

  calculateStats() {
    this.health = this.countOfChip(ChipType.CHIP_HEALTH);
    this.attack = this.data.attack;
  }
}
