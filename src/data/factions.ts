import {HeroData} from "./data";
import {BrawnenFaction} from "./brawnen";

export enum Factions {
  BRAWNEN,
  GROVETENDERS,
  HEIRS,
  NARORA,
  GRIEGE,
  HORIOZONS_WRATH,
  UPRISING
}

export interface FactionData {
  heroes: HeroData[];
}

export class AllFactions {
  static Brawnen: BrawnenFaction = new BrawnenFaction();

  static Heroes = [
    ...this.Brawnen.heroes
    //TODO: market
  ];
  static Minions = [
    ...this.Brawnen.minions
    //TODO: landmark
  ];
  static Spires = [
    ...this.Brawnen.spires
    //TODO: market
  ];
  //TODO: other landmark non minions
  static Chips = [
    ...this.Heroes,
    ...this.Minions,
    ...this.Spires
  ]
}
