import * as PIXI from "pixi.js";
import {Sprite} from "pixi.js";
import {ChipData, HeroData} from "../../data/model/chip";
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

  override canMoveToHex(hex: GameHex): boolean {
    let allowance = this.promoted ? this.data.promotedAllowance : this.data.allowance;
    return allowance >= hex.terrain;
  }
}
