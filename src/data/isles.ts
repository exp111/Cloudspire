import {IsleData} from "./model/hex";
import {Terrain} from "./enums";

export class IslesData {
  static Isles = [
    new IsleData({
      number: 1,
      terrain: [
        Terrain.Forest,
        Terrain.Path,
        Terrain.Path,
        Terrain.Path,
        Terrain.Mountain,
        Terrain.Path,
        Terrain.Grass,
        Terrain.Path,
        Terrain.Path,
        Terrain.Path,
        Terrain.Forest,
        Terrain.Path,
        Terrain.Water,
      ]
    }),
    new IsleData({
      number: 2,
      terrain: [
        Terrain.Water,
        Terrain.Water,
        Terrain.Grass,
        Terrain.Water,
        Terrain.Grass,
        Terrain.Water,
        Terrain.Path,
        Terrain.Path,
        Terrain.Grass,
        Terrain.Path,
        Terrain.Grass,
        Terrain.Path,
        Terrain.Path,
      ]
    }),
    new IsleData({
      number: 4,
      terrain: [
        Terrain.Path,
        Terrain.Path,
        Terrain.Path,
        Terrain.Path,
        Terrain.Mountain,
        Terrain.Mountain,
        Terrain.Mountain,
        Terrain.Path,
        Terrain.Grass,
        Terrain.Grass,
        Terrain.Grass,
        Terrain.Water,
        Terrain.Path,
      ]
    }),
    new IsleData({
      number: 8,
      terrain: [
        Terrain.Path,
        Terrain.Grass,
        Terrain.Forest,
        Terrain.Grass,
        Terrain.Grass,
        Terrain.Path,
        Terrain.Path,
        Terrain.Water,
        Terrain.Mountain,
        Terrain.Mountain,
        Terrain.Mountain,
        Terrain.Path,
        Terrain.Path,
      ]
    }),
  ];
}
