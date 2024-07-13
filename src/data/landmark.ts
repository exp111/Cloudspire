import {LandmarkData} from "./model/chip";
import {FactionType} from "./enums";

export class LandmarksData {
  //TODO: swamp, ruins, temple
  static Minions = [
    new LandmarkData({
      name: "Thoraxx",
      health: 5,
      movement: 3,
      reward: 5
    })
  ];
  static Traxxyr = new LandmarkData({
    name: "Ancient Traxxyr",
    faction: FactionType.NEUTRAL,
    reward: 6
    //TODO: relic reward
  });
  static Chips = [
    ...LandmarksData.Minions,
    LandmarksData.Traxxyr
  ];
}
