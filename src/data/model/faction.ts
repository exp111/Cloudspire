import {HeroData, SpireData} from "./chip";
import {FactionType} from "../enums";

export interface FactionData {
  type: FactionType;
  heroes: HeroData[];
  minions: any[]; //TODO: data
  spires: SpireData[];
}

