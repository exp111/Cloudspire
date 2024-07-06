import {LandmarkMinionData} from "./model/chip";
import {Factions} from "./enums";

export class LandmarkData {
  //TODO: swamp, ruins, temple
  static Minions = [
    new LandmarkMinionData({
      name: "Thoraxx",
      health: 5,
      movement: 3,
      reward: 5
    })
  ];
  static Traxxyr = new LandmarkMinionData({
    name: "Ancient Traxxyr",
    faction: Factions.NEUTRAL,
    reward: 6
    //TODO: relic reward
  });
  static Chips = [
    ...LandmarkData.Minions,
    LandmarkData.Traxxyr
  ];
}
