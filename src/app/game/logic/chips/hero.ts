import {HeroData} from "../../../../data/model/chip";
import {GameHex} from "../hex";
import {Data} from "../../../../data/data";
import {Chip, ChipType, ContainerChip, HealthChip} from "./chip";
import {FactionType} from "../../../../data/enums";
import {Grid, Hex} from "honeycomb-grid";
import {Dict} from "pixi.js";

export class Hero extends ContainerChip {
  override type = ChipType.HERO;
  override data: HeroData;
  health!: number;
  attack!: number;
  fortification!: number;
  range!: number;
  promoted: boolean = false;

  constructor(hex: GameHex, name: string, faction?: FactionType, chips?: Chip[]) {
    super(hex, name, faction, chips);
    // get data from db //TODO: move this into overwriteable method?
    this.data = Data.Heroes.find(h => h.name === name)!;
    this.calculateStats();
  }

  override createDefaultChips() {
    // only add health
    this.chips = [];
    for (let i = 0; i < this.data.health; i++) {
      this.chips.push(new HealthChip());
    }
  }

  calculateStats() {
    this.health = this.countOfChip(ChipType.CHIP_HEALTH);
    this.attack = this.countOfChip(ChipType.UPGRADE_ATTACK) + this.data.attack;
    this.fortification = this.countOfChip(ChipType.UPGRADE_FORTIFICATION);
    this.range = this.countOfChip(ChipType.UPGRADE_RANGE) + 1; //TODO: get from talent
  }

  override getFileName() {
    return `chip/${Hero.sanitizeName(this.data.name)}${!this.promoted ? "_front" : "_back"}.png`;
  }

  override canMoveToHex(hex: GameHex): boolean {
    let allowance = this.promoted ? this.data.promotedAllowance : this.data.allowance;
    return allowance >= hex.terrain;
  }

  override getPossibleMovementHexes(grid: Grid<Hex>, hexes: Dict<GameHex | undefined>): Hex[] {
    return this.getReachableHexes(grid, hexes, this.data.movement);
  }
}
