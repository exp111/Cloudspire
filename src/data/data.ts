import {BrawnenFaction} from "./brawnen";

import {IslesData} from "./isles";
import {EarthscapesData} from "./earthscapes";
import {LandmarksData} from "./landmark";
import {ChipData, HeroData} from "./model/chip";
import {GrovetenderFaction} from "./grovetender";

export class Data {
  static Brawnen: BrawnenFaction = new BrawnenFaction();
  static Grovetender: GrovetenderFaction = new GrovetenderFaction();

  static Heroes: HeroData[] = [
    ...this.Brawnen.heroes,
    ...this.Grovetender.heroes
    //TODO: market
  ];
  static Minions = [
    ...this.Brawnen.minions,
    ...this.Grovetender.minions,
  ];
  static Spires = [
    ...this.Brawnen.spires,
    ...this.Grovetender.spires
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
