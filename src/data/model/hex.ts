import {Terrain} from "../enums";

export abstract class HexGroupData {
  abstract groupSize: number;

  number!: number;
  terrain!: Terrain[];
  //TODO: source wells??

  protected constructor(data: Partial<HexGroupData>) {
    Object.assign(this, data);
  }
}

export class IsleData extends HexGroupData {
  override groupSize = 13;
  constructor(data: Partial<IsleData>) {
    super(data);
    if (data.terrain?.length != this.groupSize) {
      console.debug(`Terrain data length ${data.terrain?.length} is bigger than ${this.groupSize}.`);
    }
  }
}

export class EarthscapeData extends HexGroupData {
  override groupSize = 3;
  constructor(data: Partial<EarthscapeData>) {
    super(data);
    if (data.terrain?.length != this.groupSize) {
      console.debug(`Terrain data length ${data.terrain?.length} is bigger than ${this.groupSize}.`);
    }
  }
}
