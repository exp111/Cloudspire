import {LandmarkData} from "./model/chip";
import {FactionType, LandmarkType} from "./enums";

export class LandmarksData {
  //TODO: swamp, ruins, temple
  static Swamp = [
    new LandmarkData({
      type: LandmarkType.SWAMP,
      name: "Thoraxx",
      health: 5,
      movement: 3,
      reward: 5
    }),
    new LandmarkData({
      type: LandmarkType.SWAMP,
      name: "Grail Wasps",
      health: 2,
      movement: 4,
      reward: 3
    }),
    new LandmarkData({
      type: LandmarkType.SWAMP,
      name: "Source Peddler",
      health: 5,
      attack: 2,
      movement: 2,
      reward: 6
    }),
    new LandmarkData({
      type: LandmarkType.SWAMP,
      name: "Bounty Hunter",
      health: 4,
      movement: 2,
      reward: 3
    }),
    new LandmarkData({
      type: LandmarkType.SWAMP,
      name: "Cebyssa",
      health: 4,
      movement: 2,
      reward: 4
    }),
    new LandmarkData({
      type: LandmarkType.SWAMP,
      name: "Traxxer Loner",
      health: 4,
      attack: 1,
      movement: 2,
      reward: 4
    })
  ];
  static Ruins = [
    new LandmarkData({
      type: LandmarkType.RUINS,
      name: "Lost Caverns",
      health: 1
    }),
    new LandmarkData({
      type: LandmarkType.RUINS,
      name: "Grail Vipers",
      health: 3,
      movement: 2,
      //TODO: upgrade?
    }),
    new LandmarkData({
      type: LandmarkType.RUINS,
      name: "Rogue Grizzled Oak",
      health: 6,
      attack: 2,
      movement: 2,
      //TODO: upgrade?
    }),
    new LandmarkData({
      type: LandmarkType.RUINS,
      name: "Source Geyser"
    }),
    new LandmarkData({
      type: LandmarkType.RUINS,
      name: "Traxxyr Hellion",
      health: 6,
      attack: 1,
      movement: 3,
      //TODO: upgrade
    })
  ];
  static Temple = [
    new LandmarkData({
      type: LandmarkType.TEMPLE,
      name: "Gateport",
      //TODO: upgrade
    }),
    new LandmarkData({
      type: LandmarkType.TEMPLE,
      name: "Traxxyr Roughneck",
      health: 5,
      attack: 2,
      movement: 2,
      //TODO: upgrade
    }),
    new LandmarkData({
      type: LandmarkType.TEMPLE,
      name: "Grail Wolves",
      health: 5,
      movement: 2,
      reward: 2
      //TODO: upgrade
    }),
    new LandmarkData({
      type: LandmarkType.TEMPLE,
      name: "Naroran Altar"
    }),
    new LandmarkData({
      type: LandmarkType.TEMPLE,
      name: "Gateport2", //TODO: how to differentiate them?
      //TODO: upgrade
    }),
    new LandmarkData({
      type: LandmarkType.TEMPLE,
      name: "Wounded Priest",
      health: 4,
      attack: 2,
      movement: 2,
      //TODO: upgrade
    })
  ];
  static Traxxyr = new LandmarkData({
    type: LandmarkType.ANCIENT_TRAXXYR,
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
