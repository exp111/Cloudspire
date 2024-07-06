import * as PIXI from "pixi.js";
import {Hex} from "honeycomb-grid";
import {HexGroupData} from "../../data/model/hex";
import {Data} from "../../data/data";
import {Dict} from "pixi.js";
import {Terrain} from "../../data/enums";

export class GameHex {
  constructor(public hex: Hex,
              public parent: HexGroup,
              public terrain: Terrain) {
  }
}

export class HexGroup {
  sprite: PIXI.Sprite;
  baseHex: Hex;
  number: number;
  data: HexGroupData;
  hexes: Dict<GameHex> = {};

  constructor(hex: Hex, sprite: PIXI.Sprite, number: number) {
    this.baseHex = hex;
    this.sprite = sprite;
    this.number = number;
    // get the data
    this.data = Data.HexGroups.find(h => h.number === number)!;
  }
}

export class Isle extends HexGroup {
}

export class Earthscape extends HexGroup {

}
