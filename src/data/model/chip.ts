import {Factions, Terrain} from "../enums";

export abstract class ChipData {
  faction!: Factions;
  name!: string;
  cost!: number;
  reward!: number;

  protected constructor(data: Partial<ChipData>) {
    Object.assign(this, data);
  }
}

//TODO: talents
export class LandmarkData extends ChipData {
  health!: number;
  attack: number = 0;
  movement!: number;
  constructor(data: Partial<LandmarkData>) {
    super(data);
  }
}

export class SpireData extends ChipData {
  attack!: number;
  fortification!: number;
  range!: number;
  capacity!: number;

  constructor(data: Partial<SpireData>) {
    super(data);
    this.attack = this.attack ?? 0;
    this.fortification = this.fortification ?? 0;
    this.range = this.range ?? 0;
  }
}

export class HeroData extends ChipData {
  health!: number;
  attack!: number;
  movement!: number;
  capacity!: number;
  allowance!: Terrain;
  promotedReward!: number;
  promotedHealth!: number;
  promotedAttack!: number;
  promotedMovement!: number;
  promotedCapacity!: number;
  promotedAllowance!: Terrain;

  constructor(data: Partial<HeroData>) {
    super(data);
    this.attack = this.attack ?? 0;
    this.promotedReward = this.promotedReward ?? this.reward;
    this.promotedHealth = this.promotedHealth ?? this.health;
    this.promotedAttack = this.promotedAttack ?? this.attack;
    this.promotedMovement = this.promotedMovement ?? this.movement;
    this.promotedCapacity = this.promotedCapacity ?? this.capacity;
    this.promotedAllowance = this.promotedAllowance ?? this.allowance;
  }
}
