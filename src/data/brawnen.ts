import {FactionData} from "./model/faction";
import {HeroData, MinionData, SpireData} from "./model/chip";
import {FactionType, Terrain} from "./enums";

class BrawnenHeroData extends HeroData {
  override faction = FactionType.BRAWNEN;
}

class BrawnenMinionData extends MinionData {
  override faction = FactionType.BRAWNEN;
}

class BrawnenSpireData extends SpireData {
  override faction = FactionType.BRAWNEN;
}

export class BrawnenFactionData implements FactionData {
  type = FactionType.BRAWNEN;

  heroes = [
    new BrawnenHeroData({
      name: "Awsh",
      cost: 0,
      reward: 3,
      health: 3,
      attack: 1,
      movement: 2,
      capacity: 1,
      allowance: Terrain.Forest,
      promotedReward: 4,
      promotedAttack: 2
    }),
    new BrawnenHeroData({
      name: "Drang",
      cost: 4,
      reward: 3,
      health: 4,
      attack: 1,
      movement: 2,
      capacity: 1,
      allowance: Terrain.Forest,
      promotedReward: 4,
      promotedCapacity: 0,
      promotedAllowance: Terrain.Mountain
    }),
    new BrawnenHeroData({
      name: "Kram The Mighty",
      cost: 7,
      reward: 4,
      health: 5,
      attack: 2,
      movement: 2,
      capacity: 2,
      allowance: Terrain.Mountain,
      promotedHealth: 6,
      promotedMovement: 3,
      promotedReward: 5,
    }),
  ];
  minions = [
    new BrawnenMinionData({
      name: "Battleborn",
      amount: 3,
      cost: 2,
      reward: 2,
      health: 3,
      attack: 1,
      movement: 2,
      promotedAttack: 2,
      promotedMovement: 3
    }),
    new BrawnenMinionData({
      name: "Dispatch",
      amount: 2,
      cost: 3,
      reward: 3,
      health: 3,
      attack: 1,
      movement: 2,
      promotedAttack: 2,
      promotedReward: 2
    }),
    new BrawnenMinionData({
      name: "Aegis",
      amount: 2,
      cost: 4,
      reward: 3,
      health: 3,
      attack: 2,
      movement: 2,
      promotedMovement: 1
    }),
    new BrawnenMinionData({
      name: "Architect",
      amount: 2,
      cost: 4,
      reward: 2,
      health: 4,
      attack: 1,
      movement: 2,
      promotedAttack: 2,
      promotedMovement: 3,
    }),
    new BrawnenMinionData({
      name: "Forsaken",
      amount: 2,
      cost: 7,
      reward: 4,
      health: 7,
      attack: 4,
      movement: 2,
      allowance: Terrain.Water,
      promotedHealth: 8,
      promotedAttack: 3
    }),
    new BrawnenMinionData({
      name: "Source Siege",
      cost: 6,
      reward: 0,
      health: 4,
      attack: 1,
      movement: 2,
      promotedHealth: 5,
      promotedAttack: 2,
      promotedMovement: 3
    }),
  ];
  spires = [
    new BrawnenSpireData({
      name: "Drilling Outpost",
      amount: 4,
      cost: 3,
      reward: 3,
      fortification: 1,
      capacity: 0
    }),
    new BrawnenSpireData({
      name: "Dispatch Platform",
      amount: 4,
      cost: 4,
      reward: 3,
      attack: 1,
      range: 1,
      capacity: 3
    }),
    new BrawnenSpireData({
      name: "Lance Launcher",
      //TODO: promoted version of drilling outpost
      amount: 4,
      cost: 6,
      reward: 3,
      attack: 1,
      range: 1,
      capacity: 4
    }),
    new BrawnenSpireData({
      name: "Siege Tower",
      //TODO: promoted version of dispatch platform
      amount: 4,
      cost: 6,
      reward: 5,
      attack: 1,
      range: 2,
      capacity: 4
    }),
  ];
  chips = [
    ...this.heroes,
    ...this.minions,
    ...this.spires
  ];
}

