import * as PIXI from "pixi.js";
import {Hex} from "honeycomb-grid";

export class Chip {
  sprite: PIXI.Sprite;
  hex: Hex;

  constructor(hex: Hex, sprite: PIXI.Sprite) {
    this.hex = hex;
    this.sprite = sprite;
  }
}

enum TerrainAllowance {
  None = 0,
  Grass,
  Forest,
  Mountain,
  Water
}

export class Hero extends Chip {
  baseHealth: number;
  baseAttack: number;
  baseMovement: number;
  upgradeCapacity: number;
  terrainAllowance: TerrainAllowance;

  constructor(hex: Hex, sprite: PIXI.Sprite) {
    super(hex, sprite);
    //TODO: get from db
    this.baseHealth = 0;
    this.baseAttack = 0;
    this.baseMovement = 0;
    this.upgradeCapacity = 0;
    this.terrainAllowance = TerrainAllowance.None;
  }
}
