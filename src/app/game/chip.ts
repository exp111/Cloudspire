import * as PIXI from "pixi.js";
import {Hex} from "honeycomb-grid";
import {AllFactions} from "../../data/factions";
import {ChipData, HeroData} from "../../data/data";
import {Sprite} from "pixi.js";

export class Chip {
  sprite: PIXI.Sprite;
  hex: Hex;
  data: ChipData;

  constructor(hex: Hex, sprite: PIXI.Sprite, name: string) {
    this.hex = hex;
    this.sprite = sprite;
    // get data from db
    this.data = AllFactions.Chips.find(h => h.name === name)!;
  }
}

export class Hero extends Chip {
  override data: HeroData;
  health: number;

  constructor(hex: Hex, sprite: PIXI.Sprite, name: string) {
    super(hex, sprite, name);
    // get data from db
    this.data = AllFactions.Heroes.find(h => h.name === name)!;
    this.health = this.data.health;
  }
}
