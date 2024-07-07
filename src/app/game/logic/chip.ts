import {ChipData, HeroData, LandmarkData, SpireData} from "../../../data/model/chip";
import {Data} from "../../../data/data";
import {GameHex} from "./hex";
import {Terrain} from "../../../data/enums";
import {GameElement} from "./game";

export enum ChipType {
  HERO,
  MINION,
  SPIRE,
  LANDMARK
}
export abstract class Chip extends GameElement {
  abstract type: ChipType;
  hex: GameHex;
  data: ChipData;

  protected constructor(hex: GameHex, name: string) {
    super();
    this.hex = hex;
    // get data from db
    this.data = Data.Chips.find(h => h.name === name)!;
  }

  canMoveToHex(hex: GameHex) {
    return hex.terrain == Terrain.Path;
  }

  override getFileName() {
    return `chip/${Chip.sanitizeName(this.data.name)}.png`;
  }
}

export class Landmark extends Chip {
  override type = ChipType.LANDMARK;
  override data: LandmarkData;
  health: number;
  attack: number;

  constructor(hex: GameHex, name: string) {
    super(hex, name);
    // get data from db
    this.data = Data.Landmarks.find(h => h.name === name)!;
    this.health = this.data.health;
    this.attack = this.data.attack;
  }
}

export class Spire extends Chip {
  override type = ChipType.SPIRE;
  override data: SpireData;
  attack: number;
  fortification: number;
  range: number;

  constructor(hex: GameHex, name: string) {
    super(hex, name);
    // get data from db
    this.data = Data.Spires.find(h => h.name === name)!;
    this.attack = this.data.attack;
    this.fortification = this.data.fortification;
    this.range = this.data.range + 1; // has 1 range by default with no chips
  }

  override canMoveToHex(hex: GameHex): boolean {
    // can't move //TODO: talents?
    return false;
  }
}

export class Hero extends Chip {
  override type = ChipType.HERO;
  override data: HeroData;
  health: number;
  attack: number;
  range: number;
  promoted: boolean = false;

  constructor(hex: GameHex, name: string) {
    super(hex, name);
    // get data from db
    this.data = Data.Heroes.find(h => h.name === name)!;
    this.health = this.data.health;
    this.attack = this.data.attack;
    this.range = 1; //TODO: get from talent
  }

  override getFileName() {
    //TODO: backside?
    return `chip/${Hero.sanitizeName(this.data.name)}_front.png`;
  }

  override canMoveToHex(hex: GameHex): boolean {
    let allowance = this.promoted ? this.data.promotedAllowance : this.data.allowance;
    return allowance >= hex.terrain;
  }
}
