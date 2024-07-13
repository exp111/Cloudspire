import {FactionType} from "../../../data/enums";
import {FactionData} from "../../../data/model/faction";
import {Data} from "../../../data/data";

export class Faction {
  type: FactionType;
  isPlayer: boolean;
  data: FactionData;

  constructor(type: FactionType, isPlayer: boolean) {
    this.type = type;
    this.isPlayer = isPlayer;
    this.data = Data.Factions.find(f => f.type == this.type)!;
  }
}
