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

  canMoveToTerrain(hex: GameHex) {
    return hex.terrain == Terrain.Path;
  }

  override getFileName() {
    return `chip/${Chip.sanitizeName(this.data!.name)}.png`;
  }

  //TODO: we need to check if we can pathfind to those, not check for a simple radius
  // Returns the hexes in radius `radius` this chip can move to
  getReachableHexes(grid: Grid<Hex>, hexes: Dict<GameHex | null>, chips: Dict<Chip | null>, radius: number) {
    const traverser = spiral(
      {
        start: this.hex!.hex.coords(),
        radius: radius
      });
    let result: GameHex[] = [];
    for (let h of grid.traverse(traverser)) {
      // dont check the same hex
      if (h == this.hex!.hex) {
        continue;
      }
      const key = h.getKey();
      let gameHex = hexes[key];
      // hex is outside of map
      if (!gameHex) {
        continue;
      }
      // can not move to hex
      if (!this.canMoveToTerrain(gameHex)) {
        continue;
      }
      // a chip on the hex
      if (chips[key]) {
        continue;
      }
      result.push(gameHex);
    }
    return result;
  }

  // Returns a list of hexes where this chip can move to
  getPossibleMovementHexes(grid: Grid<Hex>, hexes: Dict<GameHex | null>, chips: Dict<Chip | null>) : GameHex[] {
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

  // Adds an amount of chips of class `c` under tis chip
  addChips(c: Class<UpgradeChip>, num: number) {
    for (let i = 0; i < num; i++) {
      this.chips.push(new c());
    }
  }

  // Returns the amount of chips of type `type` under this chip
  countOfChip(type: ChipType) {
    return this.chips.filter(c => c.type == type).length;
  }

  // Creates the default chips under this tile
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
