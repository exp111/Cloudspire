import {ChipData} from "../../../../data/model/chip";
import {Data} from "../../../../data/data";
import {GameHex} from "../hex";
import {FactionType, Terrain} from "../../../../data/enums";
import {GameElement} from "../game";
import {Grid, Hex} from "honeycomb-grid";
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

  // Returns the hexes in radius `radius` this chip can move to
  getReachableHexes(grid: Grid<Hex>, hexes: Dict<GameHex | null>, chips: Dict<Chip | null>, maxDistance: number) {
    const reachable = [];
    // contains the hexes we need to check
    //TODO: priority queue? removes duplicate finds
    const queue = [this.hex];
    // contains which hexes we have and their fastest path
    const cost: Dict<number> = {};
    cost[this.hex!.hex.getKey()] = 0;
    while (queue.length > 0) {
      const current = queue.shift()!;
      const currentKey = current.hex.getKey();
      const currentCost = cost[currentKey];
      // its reachable
      reachable.push(current);
      // if we're at the edge, dont move any further
      const nextCost = currentCost + 1;
      if (nextCost > maxDistance) {
        continue;
      }
      // now check neighbours
      const neighbours = grid.neighbours(current!.hex);
      for (const neighbour of neighbours) {
        let nKey = neighbour.getKey();
        // check if hex is valid
        /// already got a faster way
        let neighbourCost = cost[nKey];
        if (neighbourCost && neighbourCost <= nextCost) {
          continue;
        }
        let gameHex = hexes[nKey];
        /// probably out of map or smth
        if (!gameHex) {
          continue;
        }
        //TODO: we can move through friendly chips (heroes, minions?)
        /// a chip on the hex
        if (chips[nKey]) {
          continue;
        }
        /// cant visit it
        if (!this.canMoveToTerrain(gameHex)) {
          continue;
        }
        // add to queue
        queue.push(gameHex);
        cost[nKey] = nextCost;
      }
    }
    return reachable;
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
