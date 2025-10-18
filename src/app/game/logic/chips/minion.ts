import {MinionData} from "../../../../data/model/chip";
import {GameHex} from "../hex";
import {Data} from "../../../../data/data";
import {Chip, ChipType, ContainerChip, HealthChip} from "./chip";
import {FactionType} from "../../../../data/enums";
import {Grid, Hex} from "honeycomb-grid";
import {Dict} from "pixi.js";

export class Minion extends ContainerChip {
  override type = ChipType.MINION;
  override data: MinionData;
  health!: number;
  //TODO: other stats

  constructor(hex: GameHex, name: string, faction?: FactionType, chips?: Chip[]) {
    super(hex, name, faction, chips);
    // get data from db //TODO: move this into overwriteable method?
    this.data = Data.Minions.find(h => h.name === name)!;
    this.calculateStats();
  }

  override createDefaultChips() {
    // only add health
    this.chips = [];
    for (let i = 0; i < this.data.health; i++) {
      this.chips.push(new HealthChip());
    }
  }

  override getFileName(): string {
    //TODO: support promoted backs
    return `chip/${FactionType[this.faction].toLowerCase()}/${Minion.sanitizeName(this.data.name)}.png`;
  }

  calculateStats() {
    this.health = this.countOfChip(ChipType.CHIP_HEALTH);
  }

  override getPossibleMovementHexes(grid: Grid<Hex>, hexes: Dict<GameHex | null>, chips: Dict<Chip | null>) {
    return this.getReachableHexes(grid, hexes, chips, 2);
  }
}
