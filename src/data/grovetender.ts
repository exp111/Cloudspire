import {FactionData} from "./model/faction";
import {HeroData, SpireData} from "./model/chip";
import {Factions, Terrain} from "./enums";

class GrovetenderHero extends HeroData {
  override faction = Factions.GROVETENDERS;
}

class GrovetenderSpire extends SpireData {
  override faction = Factions.GROVETENDERS;
}

export class GrovetenderFaction implements FactionData {
  heroes = [
    new GrovetenderHero({
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
  ];
  minions = [

  ];
  spires = [
    new GrovetenderSpire({
      name: "Shrubbery",
      cost: 4,
      reward: 1,
      attack: 1,
      fortification: 1,
      capacity: 2
    }),
    new GrovetenderSpire({
      name: "Reetall",
      cost: 5,
      reward: 2,
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

