import {EarthscapeData} from "./model/hex";
import {Terrain} from "./enums";

export class EarthscapesData {
  static Earthscapes = [
    new EarthscapeData({
      number: 10,
      terrain: [
        Terrain.Mountain,
        Terrain.Grass,
        Terrain.Path
      ],
      source: {
        0: true
      }
    }),
    new EarthscapeData({
      number: 13,
      terrain: [
        Terrain.Water,
        Terrain.Path,
        Terrain.Mountain
      ],
      source: {
        2: true
      }
    }),
    new EarthscapeData({
      number: 15,
      terrain: [
        Terrain.Mountain,
        Terrain.Grass,
        Terrain.Path
      ],
      source: {
        1: true
      }
    }),
    new EarthscapeData({
      number: 16,
      terrain: [
        Terrain.Forest,
        Terrain.Path,
        Terrain.Forest
      ],
      source: {
        0: true
      }
    })
  ];
}
