import {LandmarkData} from "./model/chip";
import {FactionType} from "./enums";

export class LandmarksData {
  //TODO: swamp, ruins, temple
  static Swamp = [
    new LandmarkData({
      name: "Thoraxx",
      health: 5,
      movement: 3,
      reward: 5
    }),
    new LandmarkData({
      name: "Grail Wasps",
      health: 2,
      movement: 4,
      reward: 3
    }),
    new LandmarkData({
      name: "Source Peddler",
      health: 5,
      attack: 2,
      movement: 2,
      reward: 6
    }),
    new LandmarkData({
      name: "Bounty Hunter",
      health: 4,
      movement: 2,
      reward: 3
    }),
    new LandmarkData({
      name: "Cebyssa",
      health: 4,
      movement: 2,
      reward: 4
    }),
    new LandmarkData({
      name: "Traxxer Loner",
      health: 4,
      attack: 1,
      movement: 2,
      reward: 4
    })
  ];
  static Ruins = [
    new LandmarkData({
      name: "Lost Caverns",
      health: 1
    }),
    new LandmarkData({
      name: "Grail Vipers",
      health: 3,
      movement: 2,
      //TODO: upgrade?
    }),
    new LandmarkData({
      name: "Rogue Grizzled Oak",
      health: 6,
      attack: 2,
      movement: 2,
      //TODO: upgrade?
    }),
    new LandmarkData({
      name: "Source Geyser"
    }),
    new LandmarkData({
      name: "Traxxyr Hellion",
      health: 6,
      attack: 1,
      movement: 3,
      //TODO: upgrade
    })
  ];
  static Temple = [
    new LandmarkData({
      name: "Gateport",
      //TODO: upgrade
    }),
    new LandmarkData({
      name: "Traxxyr Roughneck",
      health: 5,
      attack: 2,
      movement: 2,
      //TODO: upgrade
    }),
    new LandmarkData({
      name: "Grail Wolves",
      health: 5,
      movement: 2,
      reward: 2
      //TODO: upgrade
    }),
    new LandmarkData({
      name: "Naroran Altar"
    }),
    new LandmarkData({
      name: "Gateport2", //TODO: how to differentiate them?
      //TODO: upgrade
    }),
    new LandmarkData({
      name: "Wounded Priest",
      health: 4,
      attack: 2,
      movement: 2,
      //TODO: upgrade
    })
  ];
  static Traxxyr = new LandmarkData({
    name: "Ancient Traxxyr",
    faction: FactionType.NEUTRAL,
    reward: 6
    //TODO: relic reward
  });
  static Chips = [
    ...LandmarksData.Swamp,
    ...LandmarksData.Ruins,
    ...LandmarksData.Temple,
    LandmarksData.Traxxyr
  ];
}
