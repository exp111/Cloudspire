import {Factions} from "./factions";

export enum TerrainAllowance {
  None = 0,
  Grass,
  Forest,
  Mountain,
  Water
}

export abstract class ChipData {
  faction!: Factions;
  name!: string;
  cost!: number;
  reward!: number;

  protected constructor(data: Partial<ChipData>) {
    Object.assign(this, data);
  }
}

export class HeroData extends ChipData {
  health!: number;
  attack!: number;
  movement!: number;
  capacity!: number;
  allowance!: TerrainAllowance;
  promotedReward!: number;
  promotedHealth!: number;
  promotedAttack!: number;
  promotedMovement!: number;
  promotedCapacity!: number;
  promotedAllowance!: TerrainAllowance;

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
