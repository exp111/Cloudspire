import {BrawnenFactionData} from "./brawnen";

import {IslesData} from "./isles";
import {EarthscapesData} from "./earthscapes";
import {LandmarksData} from "./landmark";
import {ChipData, HeroData, MinionData} from "./model/chip";
import {GrovetendersFactionData} from "./grovetender";
import {FactionData} from "./model/faction";
import {MarketData} from "./market";

export class Data {
  static Brawnen = new BrawnenFactionData();
  static Grovetenders = new GrovetendersFactionData();
  static Market = new MarketData();

  static Factions: FactionData[] = [
    this.Brawnen,
    this.Grovetenders
  ];
  static Heroes: HeroData[] = [
    ...this.Brawnen.heroes,
    ...this.Grovetenders.heroes,
    ...this.Market.heroes
  ];
  static Minions: MinionData[] = [
    ...this.Brawnen.minions,
    ...this.Grovetenders.minions,
    ...this.Market.minions
  ];
  static Spires = [
    ...this.Brawnen.spires,
    ...this.Grovetenders.spires,
    ...this.Market.spires
  ];
  static Landmarks = LandmarksData.Chips;
  //TODO: other landmark non minions
  static Chips: ChipData[] = [
    ...this.Heroes,
    ...this.Minions,
    ...this.Spires,
    ...this.Landmarks
  ];
  static Isles = IslesData.Isles;
  static Earthscapes = EarthscapesData.Earthscapes;
  static HexGroups = [
    ...this.Isles,
    ...this.Earthscapes
  ];

  static createPool(array: ChipData[]): Record<string, number> {
    return array.reduce((o, l) => ({ ...o, [l.name]: l.amount}), {});
  }
  // creates a pool of chips and their amount
  static createPools() {
    return {
      chips: this.createPool(this.Chips)
    }
  }
}
