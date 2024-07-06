import {BrawnenFaction} from "./brawnen";

import {IslesData} from "./isles";
import {EarthscapesData} from "./earthscapes";
import {LandmarkData} from "./landmark";

export class Data {
  static Brawnen: BrawnenFaction = new BrawnenFaction();

  static Heroes = [
    ...this.Brawnen.heroes
    //TODO: market
  ];
  static Minions = [
    ...this.Brawnen.minions,
    ...LandmarkData.Minions
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
  ];
  static Isles = IslesData.Isles;
  static Earthscapes = EarthscapesData.Earthscapes;
  static HexGroups = [
    ...this.Isles,
    ...this.Earthscapes
  ];
}
