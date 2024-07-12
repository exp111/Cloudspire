import {ChipData} from "../../../../data/model/chip";
import {Data} from "../../../../data/data";
import {GameHex, HexGroup} from "../hex";
import {Terrain} from "../../../../data/enums";
import {GameElement} from "../game";
import {Hex} from "honeycomb-grid";

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

  protected constructor(hex?: GameHex, name?: string) {
    super();
    this.hex = hex;
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

  //TODO: automated pathfinding calc is a bit fucky as the neighbours function doesnt exist and spiral/ring traverse is fucked
  // also we'd need to give like 3 parameters from game service to here as to get any possibility to calculate shit
}

type Class<T> = new (...args: any[]) => T;
export abstract class ContainerChip extends Chip {
  // list of chips from top to bottom
  chips: Chip[];

  protected constructor(hex?: GameHex, name?: string, chips?: Chip[]) {
    super(hex, name);
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
