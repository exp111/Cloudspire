import {BrawnenFactionData} from "./brawnen";

import {IslesData} from "./isles";
import {EarthscapesData} from "./earthscapes";
import {LandmarksData} from "./landmark";
import {ChipData, HeroData} from "./model/chip";
import {GrovetendersFactionData} from "./grovetender";
import {FactionData} from "./model/faction";

export class Data {
  static Brawnen: BrawnenFactionData = new BrawnenFactionData();
  static Grovetenders: GrovetendersFactionData = new GrovetendersFactionData();

  static Factions: FactionData[] = [
    this.Brawnen,
    this.Grovetenders
  ];
  static Heroes: HeroData[] = [
    ...this.Brawnen.heroes,
    ...this.Grovetenders.heroes
    //TODO: market
  ];
  static Minions = [
    ...this.Brawnen.minions,
    ...this.Grovetenders.minions,
  ];
  static Spires = [
    ...this.Brawnen.spires,
    ...this.Grovetenders.spires
    //TODO: market
  ];
  static Landmarks= LandmarksData.Chips;
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
}
