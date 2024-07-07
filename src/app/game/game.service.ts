import { Injectable } from '@angular/core';
import {defineHex, Direction, fromCoordinates, Grid, Hex, move, rectangle} from "honeycomb-grid";
import {Fortress} from "./logic/fortress";
import {Dict} from "pixi.js";
import {Chip, Hero, Landmark, Spire} from "./logic/chip";
import {Earthscape, GameHex, HexGroup, Isle} from "./logic/hex";

declare global {
  interface Window { Game: GameService; }
}

@Injectable({
  providedIn: 'root'
})
export class GameService {
  HEX_SIZE = 154;
  hexBuilder = defineHex({dimensions: this.HEX_SIZE, origin: "topLeft"});
  grid!: Grid<Hex>;

  //TODO: include a ref to these in a custom hex class?
  chips: Dict<Chip | null> = {};
  hexes: Dict<GameHex | null> = {};
  isles: Dict<Isle | null> = {};
  earthscapes: Dict<Earthscape | null> = {};
  fortress: Dict<Fortress | null> = {};
  elements: {fortress: Fortress[], chips: Chip[], isles: Isle[], earthscapes: Earthscape[]} = {
    fortress: [],
    chips: [],
    isles: [],
    earthscapes: []
  }

  constructor() {
    window.Game = this;
    //TODO: load from scenario file
    this.grid = new Grid(this.hexBuilder, rectangle({width: 9, height: 14}));
    this.createScenario1();
  }

  createScenario1() {
    this.createFortress("grovetenders", 2, 2, 1);
    this.createFortress("brawnen", 4, 10, -1);

    this.createIsle(8, 4, 2, 3);
    this.createIsle(4, 6, 5, 0);
    this.createIsle(1, 3, 6, 4);

    this.createEarthscape(10, 6, 1, false, 0);
    this.createEarthscape(13, 5, 4, true, 2);
    this.createEarthscape(16, 3, 10, true, 1);
    this.createEarthscape(15, 4, 9, true, 2);

    this.createHero("Awsh", 1, 7);
    this.createLandmark("Thoraxx", 3, 6);
    //TODO: starting upgrades
    this.createSpire("Reetall", 6, 1);
    this.createSpire("Shrubbery", 7, 5);
    this.createSpire("Shrubbery", 6, 6);
  }

  // Helpers
  getKeyFromHex(hex: Hex) {
    return this.getKeyFromPos(hex.col, hex.row);
  }
  private getKeyFromPos(col: number, row: number) {
    return `${col},${row}`;
  }

  DirectionFromAngle(angle: number) {
    let arr: {[k: number]: Direction} = {
      30: Direction.NE,
      90: Direction.E,
      150: Direction.SE,
      210: Direction.SW,
      270: Direction.W,
      330: Direction.NW
    };
    // normalize
    angle = angle % 360;
    return arr[angle];
  }
  DirectionToAngle(dir: Direction) {
    let arr = [0,30,90,150,180,210,270,330];
    return arr[dir];
  }
  rotatedMove(dir: Direction, rotation: number) {
    return move(this.DirectionFromAngle(this.DirectionToAngle(dir) + rotation * 60));
  }

  // create helpers
  createFortress(faction: string, col: number, row: number, rotation: number) {
    let coords = {col: col, row: row};
    let hex = this.grid.getHex(coords)!;
    // add hexes to list
    let traverser = [
      fromCoordinates(coords),
      this.rotatedMove(Direction.SE, rotation),
      this.rotatedMove(Direction.SE, rotation),
      this.rotatedMove(Direction.W, rotation),
      this.rotatedMove(Direction.W, rotation),
      this.rotatedMove(Direction.NW, rotation),
      this.rotatedMove(Direction.NW, rotation),
      this.rotatedMove(Direction.E, rotation),
      this.rotatedMove(Direction.SE, rotation),
    ];
    let fortress = new Fortress(hex, faction, rotation);
    this.elements.fortress.push(fortress);
    this.grid.traverse(traverser).forEach((h) => {
      let key = this.getKeyFromHex(h);
      this.fortress[key] = fortress;
    });
    return fortress;
  }

  createIsle(number: number, col: number, row: number, rotation: number = 0) {
    let coords = {col: col, row: row};
    let hex = this.grid.getHex(coords)!;
    // add tile hexes to list
    let traverser = [
      fromCoordinates(coords),
      this.rotatedMove(Direction.NW, rotation),
      this.rotatedMove(Direction.NE, rotation),
      this.rotatedMove(Direction.SE, rotation),
      this.rotatedMove(Direction.E, rotation),
      this.rotatedMove(Direction.SW, rotation),
      this.rotatedMove(Direction.SE, rotation),
      this.rotatedMove(Direction.W, rotation),
      this.rotatedMove(Direction.SW, rotation),
      this.rotatedMove(Direction.NW, rotation),
      this.rotatedMove(Direction.W, rotation),
      this.rotatedMove(Direction.NE, rotation),
      this.rotatedMove(Direction.NW, rotation)
    ];
    let isle = new Isle(hex, number, rotation);
    this.elements.isles.push(isle);
    let i = 0;
    this.grid.traverse(traverser).forEach((h) => {
      let key = this.getKeyFromHex(h);
      let terrain = isle.data.terrain[i];
      let hasSource = isle.data.source[i];
      let hex = new GameHex(h, isle, terrain, hasSource ?? false);
      isle.hexes[key] = hex;
      this.hexes[key] = hex;
      this.isles[key] = isle;
      i++;
    });
    return isle;
  }

  createEarthscape(number: number, col: number, row: number, down: boolean, rotation: number = 0) {
    let coords = {col: col, row: row};
    let hex = this.grid.getHex(coords)!;
    // add earthscape hexes to list
    //INFO: earthscapes don't rotate around one base hex but rather at the center, so we need to move manually and get the terrain otherwise
    let traverser = [
      fromCoordinates(coords),
      move(down ? Direction.NW : Direction.SE),
      move(down ? Direction.E : Direction.W)
    ];
    let scape = new Earthscape(hex, number, rotation, down);
    this.elements.earthscapes.push(scape);
    let i = 0;
    this.grid.traverse(traverser).forEach((h) => {
      let key = this.getKeyFromHex(h);
      // offset the terrain index by the rotation
      let index = (i + (rotation * 2)) % scape.data.terrain.length;
      let terrain = scape.data.terrain[index];
      let hasSource = scape.data.source[index];
      let hex = new GameHex(h, scape, terrain, hasSource ?? false);
      scape.hexes[key] = hex;
      this.hexes[key] = hex;
      this.earthscapes[key] = scape;
      i++;
    });
    return scape;
  }

  createHero(name: string, col: number, row: number) {
    let hex = this.hexes[this.getKeyFromPos(col, row)]!;
    // add chip to list
    let chip = new Hero(hex, name);
    this.chips[this.getKeyFromPos(col, row)] = chip;
    this.elements.chips.push(chip);
    return chip;
  }

  createLandmark(name: string, col: number, row: number) {
    let hex = this.hexes[this.getKeyFromPos(col, row)]!;
    // add chip to list
    let chip = new Landmark(hex, name);
    this.chips[this.getKeyFromPos(col, row)] = chip;
    this.elements.chips.push(chip);
    return chip;
  }

  createSpire(name: string, col: number, row: number) {
    let hex = this.hexes[this.getKeyFromPos(col, row)]!;
    // add chip to list
    let chip = new Spire(hex, name);
    this.chips[this.getKeyFromPos(col, row)] = chip;
    this.elements.chips.push(chip);
    return chip;
  }
}
