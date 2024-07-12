import {SpireData} from "../../../../data/model/chip";
import {GameHex} from "../hex";
import {Data} from "../../../../data/data";
import {Chip, ChipType, UpgradeType} from "./chip";

export class Spire extends Chip {
  override type = ChipType.SPIRE;
  override data: SpireData;
  attack!: number;
  fortification!: number;
  range!: number;
  // list of upgrade chips from top to bottom
  upgrades: UpgradeType[];

  constructor(hex: GameHex, name: string, upgrades?: UpgradeType[]) {
    super(hex, name);
    // get data from db
    this.data = Data.Spires.find(h => h.name === name)!;
    if (upgrades) {
      // upgrades are given, dont use default starting ones
      this.upgrades = [...upgrades];
    } else {
      // use default starting ones
      this.upgrades = Array(this.data.attack + this.data.range + this.data.fortification);
      this.upgrades.fill(UpgradeType.ATTACK, 0, this.data.attack);
      this.upgrades.fill(UpgradeType.RANGE, this.data.attack, this.data.attack + this.data.range);
      this.upgrades.fill(UpgradeType.FORTIFICATION, this.data.attack + this.data.range + 1);
    }
    this.calculateStats();
  }

  calculateStats() {
    this.attack = this.upgrades.filter(u => u == UpgradeType.ATTACK).length;
    this.fortification = this.upgrades.filter(u => u == UpgradeType.FORTIFICATION).length;
    // has 1 range by default with no chips
    this.range = this.upgrades.filter(u => u == UpgradeType.RANGE).length + 1;
  }

  override canMoveToHex(hex: GameHex): boolean {
    // can't move //TODO: talents?
    return false;
  }
}
