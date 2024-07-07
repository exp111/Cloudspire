import {HeroData} from "../../../../data/model/chip";
import {GameHex} from "../hex";
import {Data} from "../../../../data/data";
import {Chip, ChipType} from "./chip";

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
