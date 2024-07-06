import * as PIXI from "pixi.js";
import {Hex} from "honeycomb-grid";
import {AllFactions} from "../../data/factions";
import {ChipData, HeroData} from "../../data/data";
import {Sprite} from "pixi.js";

export class Chip {
  container: PIXI.Container;
  sprite: PIXI.Sprite;
  hex: Hex;
  data: ChipData;

  constructor(hex: Hex, container: PIXI.Container, name: string) {
    this.hex = hex;
    this.container = container;
    this.sprite = container.getChildByName("sprite") as Sprite;
    // get data from db
    this.data = AllFactions.Chips.find(h => h.name === name)!;
  }
}

export class Hero extends Chip {
  override data: HeroData;
  health: number;

  constructor(hex: Hex, container: PIXI.Container, name: string) {
    super(hex, container, name);
    // get data from db
    this.data = AllFactions.Heroes.find(h => h.name === name)!;
    this.health = this.data.health;
  }
}
