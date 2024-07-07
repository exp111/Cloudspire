import {BrawnenFaction} from "./brawnen";

import {IslesData} from "./isles";
import {EarthscapesData} from "./earthscapes";
import {LandmarkData} from "./landmark";
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
    ...LandmarkData.Minions
    //TODO: landmark
  ];
  static Spires = [
    ...this.Brawnen.spires,
    ...this.Grovetender.spires
    //TODO: market
  ];
  //TODO: other landmark non minions
  static Chips: ChipData[] = [
    ...this.Heroes,
    ...this.Minions,
    ...this.Spires
  ];
  static Isles = IslesData.Isles;
  static Earthscapes = EarthscapesData.Earthscapes;
  static HexGroups = [
    ...this.Isles,
    ...this.Earthscapes
  ];
}
