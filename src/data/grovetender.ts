import {FactionData} from "./model/faction";
import {HeroData, MinionData, SpireData} from "./model/chip";
import {FactionType, Terrain} from "./enums";

class GrovetendersHeroData extends HeroData {
  override faction = FactionType.GROVETENDERS;
}

class GrovetendersSpireData extends SpireData {
  override faction = FactionType.GROVETENDERS;
}

class GrovetendersMinionData extends MinionData {
  override faction = FactionType.GROVETENDERS;
}

export class GrovetendersFactionData implements FactionData {
  type = FactionType.GROVETENDERS;

  heroes = [
    new GrovetendersHeroData({
      name: "Dywen",
      cost: 0,
      reward: 2,
      health: 2,
      attack: 1,
      movement: 2,
      capacity: 1,
      allowance: Terrain.Forest,
      promotedHealth: 3
    }),
    new GrovetendersHeroData({
      name: "Ybanthe",
      cost: 4,
      reward: 2,
      health: 5,
      attack: 1,
      movement: 2,
      capacity: 2,
      allowance: Terrain.Forest,
      promotedAttack: 2,
      promotedMovement: 3,
      promotedReward: 3
    }),
    new GrovetendersHeroData({
      name: "Wyvankaye",
      cost: 7,
      reward: 0,
      health: 2,
      attack: 0,
      movement: 3,
      capacity: 0,
      allowance: Terrain.Forest,
      promotedMovement: 4,
      promotedAllowance: Terrain.Mountain
    }),
  ];
  minions = [
    new GrovetendersMinionData({
      name: "War Briar",
      amount: 3,
      cost: 2,
      reward: 1,
      health: 3,
      attack: 1,
      movement: 2,
      promotedHealth: 4,
      promotedAttack: 2
    }),
    new GrovetendersMinionData({
      name: "Vineherald",
      amount: 2,
      cost: 3,
      reward: 1,
      health: 3,
      attack: 1,
      movement: 2,
      promotedHealth: 4
    }),
    new GrovetendersMinionData({
      name: "Taproot",
      amount: 3,
      cost: 3,
      reward: 2,
      health: 3,
      attack: 1,
      movement: 2,
      promotedHealth: 1,
      promotedMovement: 1
    }),
    new GrovetendersMinionData({
      name: "Treed",
      amount: 2,
      cost: 3,
      reward: 2,
      health: 4,
      attack: 1,
      movement: 2,
      promotedHealth: 5,
      promotedAttack: 2,
      promotedMovement: 3,
      promotedAllowance: Terrain.Forest,
    }),
    new GrovetendersMinionData({
      name: "Ogregrowth",
      cost: 5,
      reward: 3,
      health: 5,
      attack: 2,
      movement: 2,
      promotedHealth: 6,
      promotedAttack: 3
    }),
    new GrovetendersMinionData({
      name: "Grizzled Oak",
      cost: 6,
      reward: 3,
      health: 6,
      attack: 2,
      movement: 1,
      promotedHealth: 7,
      promotedAttack: 4,
      promotedMovement: 2
    }),
  ];
  spires = [
    new GrovetendersSpireData({
      name: "Shrubbery",
      amount: 4,
      cost: 4,
      reward: 1,
      attack: 1,
      fortification: 1,
      capacity: 2
    }),
    new GrovetendersSpireData({
      name: "Reetall",
      amount: 4,
      cost: 5,
      reward: 2,
      attack: 1,
      range: 1,
      capacity: 3
    }),
    new GrovetendersSpireData({
      name: "Creeping Vines",
      //TODO: promoted version of shrubbery
      amount: 4,
      cost: 4,
      reward: 2,
      attack: 1,
      fortification: 1,
      capacity: 3
    }),
    new GrovetendersSpireData({
      name: "Muskeg",
      //TODO: promoted version of reetall
      amount: 4,
      cost: 5,
      reward: 3,
      attack: 1,
      range: 1,
      capacity: 3
    }),
  ];
  chips = [
    ...this.heroes,
    ...this.minions,
    ...this.spires
  ];
}

