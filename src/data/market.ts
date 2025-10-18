import {FactionType, Terrain} from "./enums";
import {EquipmentData, HeroData, MinionData, SpireData} from "./model/chip";

export class MarketData {
  type = FactionType.BRAWNEN;

  heroes = [
    new HeroData({
      name: "Barybrund",
      cost: 2,
      reward: 2,
      health: 2,
      attack: 1,
      movement: 3,
      capacity: 2,
      allowance: Terrain.Mountain
    }),
    new HeroData({
      name: "Baza",
      cost: 5,
      reward: 2,
      health: 4,
      attack: 1,
      movement: 3,
      capacity: 2,
      allowance: Terrain.Water
    }),
    new HeroData({
      name: "Londil",
      cost: 4,
      reward: 3,
      health: 3,
      attack: 1,
      movement: 3,
      capacity: 2,
      allowance: Terrain.Water
    }),
    new HeroData({
      name: "Lostomire",
      cost: 3,
      reward: 1,
      health: 6,
      attack: 0,
      movement: 2,
      capacity: 3,
      allowance: Terrain.Grass
    }),
    new HeroData({
      name: "Roa",
      cost: 5,
      reward: 3,
      health: 4,
      attack: 1,
      movement: 2,
      capacity: 1,
      allowance: Terrain.Mountain
    }),
  ];
  minions = [
    new MinionData({
      name: "Anarchist",
      cost: 1,
      reward: 0,
      health: 3,
      attack: 3,
      movement: 2,
    }),
    new MinionData({
      name: "Convict",
      cost: 3,
      reward: 0,
      health: 2,
      attack: 2,
      movement: 2,
    }),
    new MinionData({
      name: "Elite Duelist",
      cost: 6,
      reward: 3,
      health: 5,
      attack: 3,
      movement: 3,
    }),
    new MinionData({
      name: "Fashioner",
      cost: 3,
      reward: 3,
      health: 4,
      attack: 1,
      movement: 3,
    }),
    new MinionData({
      name: "Nomad",
      cost: 2,
      reward: 2,
      health: 3,
      attack: 1,
      movement: 4,
      allowance: Terrain.Forest
    }),
  ];
  spires = [
    new SpireData({
      name: "Babel",
      cost: 6,
      reward: 3,
      attack: 1,
      range: 3,
      capacity: 4
    }),
    new SpireData({
      name: "Bladewall",
      cost: 5,
      reward: 4,
      attack: 3,
      fortification: 1,
      capacity: 0
    }),
    new SpireData({
      name: "Brick and Mortars",
      cost: 4,
      reward: 4,
      attack: 2,
      range: 1,
      capacity: 2
    }),
    new SpireData({
      name: "Plagebringer",
      cost: 2,
      reward: 3,
      attack: 1,
      fortification: 1,
      capacity: 3
    }),
    new SpireData({
      name: "Slingshot",
      cost: 2,
      reward: 1,
      attack: 1,
      range: 2,
      capacity: 0
    }),
    new SpireData({
      name: "The Bunker",
      cost: 3,
      reward: 0,
      fortification: 0,
      capacity: 0
    }),
  ];
  equipment = [
    new EquipmentData({
      name: "Makeshift Wings",
      cost: 3
    }),
    new EquipmentData({
      name: "Mini Harvester",
      cost: 2
    }),
    new EquipmentData({
      name: "Stave of Anvasse",
      cost: 3
    }),
    new EquipmentData({
      name: "Time Vials",
      cost: 3
    }),
  ];
  chips = [
    ...this.heroes,
    ...this.minions,
    ...this.spires,
    ...this.equipment
  ];
}
