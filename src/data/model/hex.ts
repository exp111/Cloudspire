import {Terrain} from "../enums";

export abstract class HexGroupData {
  number!: number;
  terrain!: Terrain[];
  //TODO: source wells??

  protected constructor(data: Partial<HexGroupData>) {
    Object.assign(this, data);
  }
}

export class IsleData extends HexGroupData {
  constructor(data: Partial<IsleData>) {
    super(data);
  }
}

export class EarthscapeData extends HexGroupData {
  constructor(data: Partial<EarthscapeData>) {
    super(data);
  }
}
