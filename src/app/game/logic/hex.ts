import {Hex} from "honeycomb-grid";
import {HexGroupData} from "../../../data/model/hex";
import {Data} from "../../../data/data";
import {Dict} from "pixi.js";
import {Terrain} from "../../../data/enums";
import {GameElement} from "./game";

export class GameHex {
  constructor(public hex: Hex,
              public parent: HexGroup,
              public terrain: Terrain,
              public hasSource: boolean) {
  }
}

export class HexGroup extends GameElement {
  hex: Hex;
  number: number;
  rotation: number;
  data: HexGroupData;
  hexes: Dict<GameHex> = {};

  constructor(hex: Hex, number: number, rotation: number) {
    super();
    this.hex = hex;
    this.number = number;
    this.rotation = rotation;
    // get the data
    this.data = Data.HexGroups.find(h => h.number === number)!;
  }
}

export class Isle extends HexGroup {
  override getFileName() {
    return `isle/${this.number}.png`;
  }
}

export class Earthscape extends HexGroup {
  constructor(hex: Hex,
              number: number,
              rotation: number,
              public isDown: boolean) {
    super(hex, number, rotation);
  }
  override getFileName() {
    return `earthscape/${this.number}.png`;
  }
}
