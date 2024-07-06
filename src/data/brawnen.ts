import {FactionData} from "./model/faction";
import {HeroData} from "./model/chip";
import {Factions, Terrain} from "./enums";

class BrawnenHero extends HeroData {
  override faction = Factions.BRAWNEN;
}

export class BrawnenFaction implements FactionData {
  heroes = [
    new BrawnenHero({faction: Factions.BRAWNEN,
      name: "awsh",
      cost: 0,
      reward: 3,
      health: 3,
      attack: 1,
      movement: 2,
      capacity: 1,
      allowance: Terrain.Forest,
      promotedReward: 4,
      promotedAttack: 2}),
  ];
  minions = [

  ];
  spires = [

  ];
  chips = [
    ...this.heroes,
    ...this.minions,
    ...this.spires
  ];
}

