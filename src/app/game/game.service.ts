import {EventEmitter, Injectable} from '@angular/core';
import {defineHex, Direction, fromCoordinates, Grid, Hex, move, rectangle} from "honeycomb-grid";
import {Fortress} from "./logic/fortress";
import {Dict} from "pixi.js";
import {AttackUpgrade, Chip, FortificationUpgrade, HealthChip, RangeUpgrade} from "./logic/chips/chip";
import {Earthscape, GameHex, Isle} from "./logic/hex";
import {Landmark} from "./logic/chips/landmark";
import {Spire} from "./logic/chips/spire";
import {Hero} from "./logic/chips/hero";
import {FactionType} from "../../data/enums";
import {Faction} from "./logic/faction";
import "../utils/grid.extensions";
import "../utils/hex.extensions";
import {HexUtils} from "../utils/hexUtils";

declare global {
  interface Window {
    Game: GameService;
  }
}

@Injectable({
  providedIn: 'root'
})
export class GameService {
  static Instance: GameService;

  HEX_SIZE = 154;
  hexBuilder = defineHex({dimensions: this.HEX_SIZE, origin: "topLeft"});
  grid!: Grid<Hex>;

  //TODO: include a ref to these in a custom hex class?
  chips: Dict<Chip | null> = {};
  hexes: Dict<GameHex | null> = {};
  isles: Dict<Isle | null> = {};
  earthscapes: Dict<Earthscape | null> = {};
  fortress: Dict<Fortress | null> = {};
  factions: Dict<Faction | null> = {};
  playerFaction: Faction | null = null;
  elements: { fortress: Fortress[], chips: Chip[], isles: Isle[], earthscapes: Earthscape[] } = {
    fortress: [],
    chips: [],
    isles: [],
    earthscapes: []
  }

  selectedChip: Chip | null = null;
  // Events //TODO: proper event class?
  onChipSelected = new EventEmitter<Chip>();
  onChipDeselected = new EventEmitter<Chip>();
  onChipMoved = new EventEmitter<{chip: Chip, hex: GameHex}>();
  onHidePreview= new EventEmitter<void>();
  onShowPreview = new EventEmitter<GameHex>();

  constructor() {
    GameService.Instance = this;
    window.Game = this;
    //TODO: load from scenario file
    this.grid = new Grid(this.hexBuilder, rectangle({width: 9, height: 14}));
    this.createScenario1();
  }

  // Events
  onHexClicked(hex: Hex) {
    let key = hex.getKey();
    let gameHex = this.hexes[key];
    // dont do anything if its outside of the map
    if (!gameHex) {
      return;
    }

    let chip = this.chips[key];
    if (chip) {
      // forward to chip
      this.onChipClicked(chip);
      return;
    }
    // nothing on this hex => empty
    let selected = this.selectedChip;
    if (!selected) {
      return;
    }

    // unit cant move here
    if (!selected.canMoveToTerrain(gameHex)) {
      return;
    }
    // check if we can actually reach hex
    if (!selected.canReachTile(this.grid, this.hexes, this.chips, gameHex)) {
      return;
    }
    // move selected chip to here
    this.moveChip(selected, gameHex);
    this.deselectChip();
  }

  onHexHovered(hex: Hex) {
    if (!this.selectedChip) {
      return;
    }

    let key = hex.getKey();
    let gameHex = this.hexes[key];
    // not inside the map
    if (!gameHex) {
      this.onHidePreview.emit();
      return;
    }

    // unit cant move here
    if (!this.selectedChip.canMoveToTerrain(gameHex)) {
      this.onHidePreview.emit();
      return;
    }

    let chip = this.chips[key];
    if (chip) {
      // dont show fakechip if any other chip is here
      this.onHidePreview.emit();
      return;
    }
    this.onShowPreview.emit(gameHex);
  }

  //TODO: we cant move this into the model class, so maybe into a chipService/Controller?
  //      or move logic into higher chip class that doesnt get imported here (but how do we then create it?)
  onChipClicked(chip: Chip) {
    // select chip
    let selected = this.selectedChip;
    // only let
    if (chip.faction == this.playerFaction!.type) {
      // unselect previous chip if one was selected
      if (selected != null) {
        this.deselectChip();
      }
      // if we clicked a new chip, select it
      if (selected != chip) {
        // only select if we werent selected
        this.selectChip(chip);
      }
    } else {
      //TODO: attack enemy or smth idk
    }
  }

  // Functions
  moveChip(chip: Chip, hex: GameHex) {
    //TODO: displace?
    this.chips[chip.hex!.hex.getKey()] = null;
    this.chips[hex.hex.getKey()] = chip;
    chip.hex = hex;
    this.onChipMoved.emit({chip, hex});
  }

  deselectChip() {
    // no chip selected
    if (!this.selectedChip) {
      return;
    }

    // send event
    this.onChipDeselected.emit(this.selectedChip);
    // unselect
    this.selectedChip = null;
  }

  selectChip(chip: Chip) {
    this.selectedChip = chip;
    // send event
    this.onChipSelected.emit(chip);
  }

  getMovementHexes(chip: Chip) {
    return chip.getPossibleMovementHexes(this.grid, this.hexes, this.chips);
  }

  // Scenario
  createScenario1() {
    //TODO: round order
    const brawnen = this.createFaction(FactionType.BRAWNEN, true);
    const grovetenders = this.createFaction(FactionType.GROVETENDERS, false);

    this.createFortress(grovetenders, 2, 2, 1, 10);
    this.createFortress(brawnen, 4, 10, -1, 10, 0);

    this.createIsle(8, 4, 2, 3);
    this.createIsle(4, 6, 5, 0);
    this.createIsle(1, 3, 6, 4);

    this.createEarthscape(10, 6, 1, false, 0);
    this.createEarthscape(13, 5, 4, true, 2);
    this.createEarthscape(16, 3, 10, true, 1);
    this.createEarthscape(15, 4, 9, true, 2);

    this.createHero(brawnen, "Awsh", 1, 7, [new HealthChip(), new HealthChip(), new HealthChip()]);
    this.createLandmark(null, "Thoraxx", 3, 6, [new HealthChip(), new HealthChip(), new HealthChip(), new HealthChip(), new HealthChip()]);
    this.createSpire(grovetenders, "Reetall", 6, 1, [new AttackUpgrade(), new RangeUpgrade(), new RangeUpgrade()]);
    this.createSpire(grovetenders, "Shrubbery", 7, 5, [new FortificationUpgrade(), new FortificationUpgrade()]);
    this.createSpire(grovetenders, "Shrubbery", 6, 6, [new FortificationUpgrade(), new FortificationUpgrade()]);
  }

  // Helpers
  DirectionFromAngle(angle: number) {
    let arr: { [k: number]: Direction } = {
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
    let arr = [0, 30, 90, 150, 180, 210, 270, 330];
    return arr[dir];
  }

  rotatedMove(dir: Direction, rotation: number) {
    return move(this.DirectionFromAngle(this.DirectionToAngle(dir) + rotation * 60));
  }

  // create helpers
  createFaction(type: FactionType, isPlayer: boolean) {
    const faction = new Faction(type, isPlayer);
    this.factions[type] = faction;
    if (isPlayer) {
      this.playerFaction = faction;
    }
    return faction;
  }

  createFortress(faction: Faction, col: number, row: number, rotation: number, health?: number, source?: number) {
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
    let fortress = new Fortress(hex, faction.type, rotation, health, source);
    faction.fortress = fortress;
    this.elements.fortress.push(fortress);
    this.grid.traverse(traverser).forEach((h) => {
      this.fortress[h.getKey()] = fortress;
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
      let key = h.getKey();
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
      let key = h.getKey();
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

  createHero(faction: Faction, name: string, col: number, row: number, chips?: Chip[]) {
    const key = HexUtils.getKeyFromPos(col, row);
    const hex = this.hexes[key]!;
    // add chip to list
    const chip = new Hero(hex, name, faction.type, chips);
    this.chips[key] = chip;
    this.elements.chips.push(chip);
    return chip;
  }

  createLandmark(faction: Faction | null, name: string, col: number, row: number, chips?: Chip[]) {
    const key = HexUtils.getKeyFromPos(col, row);
    const hex = this.hexes[key]!;
    // add chip to list
    const chip = new Landmark(hex, name, faction ? faction.type : FactionType.NEUTRAL, chips);
    this.chips[key] = chip;
    this.elements.chips.push(chip);
    return chip;
  }

  createSpire(faction: Faction, name: string, col: number, row: number, upgrades?: Chip[]) {
    const key = HexUtils.getKeyFromPos(col, row);
    const hex = this.hexes[key]!;
    // add chip to list
    const chip = new Spire(hex, name, faction.type, upgrades);
    this.chips[key] = chip;
    this.elements.chips.push(chip);
    return chip;
  }
}
