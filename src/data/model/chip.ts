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
export class LandmarkMinionData extends ChipData {
  health!: number;
  attack: number = 0;
  movement!: number;
  constructor(data: Partial<LandmarkMinionData>) {
    super(data);
  }
}

export class SpireData extends ChipData {
  attack: number = 0;
  fortification: number = 0;
  range: number = 0;
  capacity!: number;

  constructor(data: Partial<SpireData>) {
    super(data);
  }
}

export class HeroData extends ChipData {
  health!: number;
  attack: number = 0;
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
    this.promotedReward = this.promotedReward ?? this.reward;
    this.promotedHealth = this.promotedHealth ?? this.health;
    this.promotedAttack = this.promotedAttack ?? this.attack;
    this.promotedMovement = this.promotedMovement ?? this.movement;
    this.promotedCapacity = this.promotedCapacity ?? this.capacity;
    this.promotedAllowance = this.promotedAllowance ?? this.allowance;
  }
}
