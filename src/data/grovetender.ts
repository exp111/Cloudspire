import {FactionData} from "./model/faction";
import {HeroData, SpireData} from "./model/chip";
import {FactionType, Terrain} from "./enums";

class GrovetendersHeroData extends HeroData {
  override faction = FactionType.GROVETENDERS;
}

class GrovetendersSpireData extends SpireData {
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
    //TODO: other grovetender heroes
  ];
  minions = [
    //TODO: grovetender minions
  ];
  spires = [
    new GrovetendersSpireData({
      name: "Shrubbery",
      cost: 4,
      reward: 1,
      attack: 1,
      fortification: 1,
      capacity: 2
    }),
    new GrovetendersSpireData({
      name: "Reetall",
      cost: 5,
      reward: 2,
      attack: 1,
      range: 1,
      capacity: 3
    }),
    //TODO: other grovetender spires
  ];
  chips = [
    ...this.heroes,
    ...this.minions,
    ...this.spires
  ];
}

