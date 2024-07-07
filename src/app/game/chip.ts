import * as PIXI from "pixi.js";
import {Sprite} from "pixi.js";
import {ChipData, HeroData, LandmarkData, SpireData} from "../../data/model/chip";
import {Data} from "../../data/data";
import {GameHex} from "./hex";
import {Terrain} from "../../data/enums";

export class Chip {
  container: PIXI.Container;
  sprite: PIXI.Sprite;
  hex: GameHex;
  data: ChipData;

  constructor(hex: GameHex, container: PIXI.Container, name: string) {
    this.hex = hex;
    this.container = container;
    this.sprite = container.getChildByName("sprite") as Sprite;
    // get data from db
    this.data = Data.Chips.find(h => h.name === name)!;
  }

  canMoveToHex(hex: GameHex) {
    return hex.terrain == Terrain.Path;
  }

  static sanitizeName(name: string) {
    return name.toLowerCase().replace(" ", "_");
  }

  static getFileName(name: string) {
    return `chip/${Chip.sanitizeName(name)}.png`;
  }
}

export class Landmark extends Chip {
  override data: LandmarkData;

  constructor(hex: GameHex, container: PIXI.Container, name: string) {
    super(hex, container, name);
    // get data from db
    this.data = Data.Landmarks.find(h => h.name === name)!;
  }
}

export class Spire extends Chip {
  override data: SpireData;

  constructor(hex: GameHex, container: PIXI.Container, name: string) {
    super(hex, container, name);
    // get data from db
    this.data = Data.Spires.find(h => h.name === name)!;
  }

  override canMoveToHex(hex: GameHex): boolean {
    return false;
  }
}

export class Hero extends Chip {
  override data: HeroData;
  health: number;
  promoted: boolean = false;

  constructor(hex: GameHex, container: PIXI.Container, name: string) {
    super(hex, container, name);
    // get data from db
    this.data = Data.Heroes.find(h => h.name === name)!;
    this.health = this.data.health;
  }

  static override getFileName(name: string) {
    //TODO: backside?
    return `chip/${Chip.sanitizeName(name)}_front.png`;
  }

  override canMoveToHex(hex: GameHex): boolean {
    let allowance = this.promoted ? this.data.promotedAllowance : this.data.allowance;
    return allowance >= hex.terrain;
  }
}
