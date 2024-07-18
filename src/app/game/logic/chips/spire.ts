import {SpireData} from "../../../../data/model/chip";
import {GameHex} from "../hex";
import {Data} from "../../../../data/data";
import {AttackUpgrade, Chip, ChipType, ContainerChip, FortificationUpgrade, RangeUpgrade, UpgradeChip} from "./chip";
import {FactionType} from "../../../../data/enums";

export class Spire extends ContainerChip {
  override type = ChipType.SPIRE;
  override data: SpireData;
  attack!: number;
  fortification!: number;
  range!: number;

  constructor(hex: GameHex, name: string, faction?: FactionType, upgrades?: Chip[]) {
    super(hex, name, faction, upgrades);
    // get data from db
    this.data = Data.Spires.find(h => h.name === name)!;
    this.calculateStats();
  }

  calculateStats() {
    this.attack = this.countOfChip(ChipType.UPGRADE_ATTACK);
    this.fortification = this.countOfChip(ChipType.UPGRADE_FORTIFICATION);
    // has 1 range by default with no chips
    this.range = this.countOfChip(ChipType.UPGRADE_RANGE) + 1;
  }

  override canMoveToTerrain(hex: GameHex): boolean {
    // can't move //TODO: talents?
    return false;
  }

  createDefaultChips(): void {
    this.addChips(AttackUpgrade, this.data.attack);
    this.addChips(FortificationUpgrade, this.data.fortification);
    this.addChips(RangeUpgrade, this.data.range);
  }
}
