import {ChipData} from "../../../../data/model/chip";
import {Data} from "../../../../data/data";
import {GameHex} from "../hex";
import {FactionType, Terrain} from "../../../../data/enums";
import {GameElement} from "../game";
import {Grid, Hex, spiral} from "honeycomb-grid";
import {Dict} from "pixi.js";

export enum ChipType {
  HERO,
  MINION,
  SPIRE,
  LANDMARK,
  UPGRADE_ATTACK,
  UPGRADE_RANGE,
  UPGRADE_FORTIFICATION,
  CHIP_HEALTH
}

export abstract class Chip extends GameElement {
  abstract type: ChipType;
  hex: GameHex | undefined;
  data: ChipData | undefined;
  faction: FactionType;

  protected constructor(hex?: GameHex, name?: string, faction?: FactionType) {
    super();
    this.hex = hex;
    this.faction = faction ?? FactionType.NEUTRAL; //TODO: default to neutral?
    // get data from db
    if (name) {
      this.data = Data.Chips.find(h => h.name === name)!;
    }
  }

  canMoveToHex(hex: GameHex) {
    return hex.terrain == Terrain.Path;
  }

  override getFileName() {
    return `chip/${Chip.sanitizeName(this.data!.name)}.png`;
  }

  getReachableHexes(grid: Grid<Hex>, hexes: Dict<GameHex | undefined>, radius: number) {
    const traverser = spiral(
      {
        start: this.hex!.hex.coords(),
        radius: radius
      });
    let result: Hex[] = [];
    for (let h of grid.traverse(traverser)) {
      // dont check the same hex
      if (h == this.hex!.hex) {
        continue;
      }
      let gameHex = hexes[h.getKey()];
      // hex is outside of map
      if (!gameHex) {
        continue;
      }
      // can not move to hex
      if (!this.canMoveToHex(gameHex)) {
        continue;
      }
      result.push(h);
    }
    return result;
  }

  getPossibleMovementHexes(grid: Grid<Hex>, hexes: Dict<GameHex | undefined>) : Hex[] {
    return [];
  }
}

type Class<T> = new (...args: any[]) => T;
export abstract class ContainerChip extends Chip {
  // list of chips from top to bottom
  chips: Chip[];

  protected constructor(hex?: GameHex, name?: string, faction?: FactionType, chips?: Chip[]) {
    super(hex, name, faction);
    this.chips = [];
    if (chips) {
      this.chips = [...chips];
    } else {
      this.createDefaultChips();
    }
  }

  addChips(c: Class<UpgradeChip>, num: number) {
    for (let i = 0; i < num; i++) {
      this.chips.push(new c());
    }
  }

  countOfChip(type: ChipType) {
    return this.chips.filter(c => c.type == type).length;
  }

  abstract createDefaultChips(): void;
}

export abstract class UpgradeChip extends Chip {
  constructor() {
    super();
  }
}
export class HealthChip extends UpgradeChip {
  override type = ChipType.CHIP_HEALTH;
}
export class AttackUpgrade extends UpgradeChip {
  override type = ChipType.UPGRADE_ATTACK;
}
export class RangeUpgrade extends UpgradeChip {
  override type = ChipType.UPGRADE_RANGE;
}
export class FortificationUpgrade extends UpgradeChip {
  override type = ChipType.UPGRADE_FORTIFICATION;
}
