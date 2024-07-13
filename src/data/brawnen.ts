import {FactionData} from "./model/faction";
import {HeroData} from "./model/chip";
import {FactionType, Terrain} from "./enums";

class BrawnenHeroData extends HeroData {
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

