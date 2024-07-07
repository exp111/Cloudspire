import {Component, ElementRef, OnInit, Renderer2, ViewChild} from '@angular/core';
import {NgOptimizedImage} from "@angular/common";
import {defineHex, Direction, fromCoordinates, Grid, Hex, move, rectangle} from "honeycomb-grid";
import * as PIXI from "pixi.js";
import {ColorSource, Dict, PointData, Sprite} from "pixi.js";
import {Viewport} from "pixi-viewport";
import {Chip, Hero, Landmark, Spire} from "../game/chip";
import {Earthscape, GameHex, Isle} from "../game/hex";
import {Fortress} from "../game/fortress";

enum ZOrder {
  Background = 0,
  Tile = Background,
  Fortress = Tile,
  Earthscape = 1,
  HexOverlay,
  Chip = 3,
  ChipOverlay = Chip + 1,
  CoordinateOverlay,
  HoverOverlay,
  Debug
}

enum Colors {
  Black = 0x000000,
  White = 0xFFFFFF,
  Red = 0xFF0000,
  Orange = 0xFFA500,
  Green = 0x00FF00,
  Yellow = 0xFFFF00,

  Highlight = Red,

  Health = 0xE71C41,
  Attack = 0xF05423,
  Range = 0x1E9588,
  Fortification = 0xF8C750
}

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [
    NgOptimizedImage
  ],
  templateUrl: './map.component.html',
  styleUrl: './map.component.css'
})
export class MapComponent implements OnInit {
  @ViewChild("map")
  mapRef!: ElementRef;

  constructor(private renderer: Renderer2) {

  }

  RESOURCE_BASE_PATH = "assets";
  SPRITE_CHIP_WIDTH = 256;
  SPRITE_CHIP_MULT = 1.5;
  HEX_SIZE = 154;
  WORLD_SIZE = 1000;

  hexBuilder = defineHex({dimensions: this.HEX_SIZE, origin: "topLeft"});
  grid!: Grid<Hex>;

  renderNonMapHexes = false;
  showCoordLabels = true;
  showHexCenters = false;

  //TODO: include a ref to these in a custom hex class?
  //TODO: rather use a chip class
  chips: Dict<Chip | null> = {};
  hexes: Dict<GameHex | null> = {};
  isles: Dict<Isle | null> = {};
  earthscapes: Dict<Earthscape | null> = {};
  fortress: Dict<Fortress | null> = {};

  app = new PIXI.Application();
  viewport!: Viewport;
  hexOverlay = new PIXI.Graphics();

  selectedChip: Chip | null = null;
  fakeChip!: Sprite;

  async ngOnInit() {
    this.grid = new Grid(this.hexBuilder, rectangle({width: 9, height: 14}));

    // init app
    await this.app.init({backgroundAlpha: 0});
    this.app.resizeTo = this.mapRef.nativeElement;
    this.renderer.appendChild(this.mapRef.nativeElement, this.app.canvas);

    // init viewport
    this.viewport = new Viewport({
      screenWidth: window.innerWidth,
      screenHeight: window.innerHeight,
      worldWidth: this.WORLD_SIZE,
      worldHeight: this.WORLD_SIZE,
      disableOnContextMenu: true, // disable right click

      events: this.app.renderer.events // the interaction module is important for wheel to work properly when renderer.view is placed or scaled
    });
    this.app.stage.addChild(this.viewport);
    this.viewport
      .drag()
      .pinch()
      .wheel();

    // Hover chip
    //TODO: ideas:
    // - like this, global mouse listener
    // - global ticker that checks mouse pos
    // - make single hex entities and listen on them
    this.fakeChip = new Sprite({
      scale: (this.HEX_SIZE * this.SPRITE_CHIP_MULT) / this.SPRITE_CHIP_WIDTH,
      zIndex: ZOrder.HoverOverlay,
      anchor: 0.5,
      visible: false,
      alpha: 0.5
    });
    this.viewport.addChild(this.fakeChip);
    this.viewport.onpointertap = (e) => {
      let hex = this.grid.pointToHex(this.viewport.toWorld(e.screen), {allowOutside: false});
      if (hex) {
        e.stopPropagation(); // stop bubbling
        this.onHexClicked(hex);
      }
    }
    //TODO: rather than a hover, let user select chip and then show all possible options
    this.viewport.onmouseover = (e) => {
      if (!this.selectedChip) {
        return;
      }

      //TODO: fix fakechip not moving sometimes
      let hex = this.grid.pointToHex(this.viewport.toWorld(e.screen), {allowOutside: false});
      if (!hex) {
        return;
      }

      let key = this.getKeyFromHex(hex);
      let gamehex = this.hexes[key];
      // not inside the map
      if (!gamehex) {
        this.fakeChip.visible = false;
        return;
      }

      // unit cant move here
      if (!this.selectedChip.canMoveToHex(gamehex)) {
        this.fakeChip.visible = false;
        return;
      }

      let chip = this.chips[key];
      if (chip) {
        // dont show fakechip if any other chip is here
        this.fakeChip.visible = false;
        return;
      }
      this.fakeChip.visible = true;
      this.fakeChip.position = {x: hex.x, y: hex.y};
    }

    // Build map
    await this.createFortress("grovetenders", 2, 2, 1);
    await this.createFortress("brawnen", 4, 10, -1);

    await this.createIsle(8, 4, 2, 3);
    await this.createIsle(4, 6, 5, 0);
    await this.createIsle(1, 3, 6, 4);

    await this.createEarthscape(10, 6, 1, false, 0);
    await this.createEarthscape(13, 5, 4, true, 2);
    await this.createEarthscape(16, 3, 10, true, 1);
    await this.createEarthscape(15, 4, 9, true, 2);

    await this.createHero("Awsh", 1, 7);
    await this.createLandmark("Thoraxx", 3, 6);
    //TODO: starting upgrades
    await this.createSpire("Reetall", 6, 1);
    await this.createSpire("Shrubbery", 7, 5);
    await this.createSpire("Shrubbery", 6, 6);

    // Hex overlay
    this.hexOverlay.zIndex = ZOrder.HexOverlay;
    this.grid.forEach((hex) => {
      let key = this.getKeyFromHex(hex);
      if (!this.renderNonMapHexes && !this.hexes[key]) {
        return;
      }
      this.hexOverlay.poly(hex.corners);
      this.hexOverlay.stroke({width: 2, color: Colors.Black});
      if (this.showHexCenters) {
        this.hexOverlay.circle(hex.x, hex.y, 2);
        this.hexOverlay.fill({color: Colors.Red});
      }
      if (this.showCoordLabels) {
        this.debugLabel(`${hex.col},${hex.row}`,
          this.hexes[key] ? Colors.Red : Colors.Green,
          {x: hex.x, y: hex.y},
          ZOrder.CoordinateOverlay);
      }
    });
    this.viewport.addChild(this.hexOverlay);

    //TODO: center/fit view?
  }

  //TODO: move these into getter/setters?
  //TODO: replace tint with outline
  private selectChip(selected: Chip) {
    selected.sprite.tint = Colors.Highlight;
    this.fakeChip.texture = selected.sprite.texture;
    this.selectedChip = selected;
  }

  private deselectChip(previouslySelected: Chip) {
    this.selectedChip = null;
    previouslySelected.sprite.tint = Colors.White;
    this.fakeChip.visible = false;
  }

  // Events
  //TODO: put the sub functions into class events
  private onHexClicked(hex: Hex) {
    let key = this.getKeyFromHex(hex);
    let gameHex = this.hexes[key];
    // dont do anything if its outside of the map
    if (!gameHex) {
      return;
    }

    let chip = this.chips[this.getKeyFromHex(hex)];
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
    if (!selected.canMoveToHex(gameHex)) {
      return;
    }
    // move selected chip to here
    this.chips[this.getKeyFromHex(selected.hex.hex)] = null;
    this.chips[key] = selected;
    selected.hex = gameHex;
    selected.container.position = {x: hex.x, y: hex.y};
    this.deselectChip(selected);
  }

  private onChipClicked(chip: Chip) {
    // select chip
    let selected = this.selectedChip;
    // unselect previous chip if one was selected
    if (selected != null) {
      this.deselectChip(selected);
    }
    // if we clicked a new chip, select it
    if (selected != chip) {
      // only select if we werent selected
      this.selectChip(chip);
    }
  }

  // Helpers
  private getKeyFromHex(hex: Hex) {
    return this.getKeyFromPos(hex.col, hex.row);
  }

  private getKeyFromPos(col: number, row: number) {
    return `${col},${row}`;
  }

  private async loadSpriteFromUrl(url: string) {
    let texture = await PIXI.Assets.load(url);
    return PIXI.Sprite.from(texture);
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

  label(text: PIXI.TextString, color: ColorSource, strokeColor: ColorSource|null, pos: PointData, zIndex: ZOrder, label?: string) {
    return new PIXI.Text({
      text: text,
      position: pos,
      anchor: 0.5,
      zIndex: zIndex,
      label: label,
      style: {
        stroke: strokeColor != null ? {color: strokeColor, width: 3} : undefined,
        fill: {color: color}
      }
    });
  }
  debugLabel(text: string, color: ColorSource, pos: PointData, zIndex: ZOrder = ZOrder.Debug) {
    this.viewport.addChild(this.label(text, color, null, pos, zIndex));
  }
  chipOverlay(chip: Chip, text: PIXI.TextString, color: Colors, type: string, cornerIndex: number) {
    chip.container.addChild(this.label(
      text,
      color,
      Colors.Black,
      this.relativeCorner(chip, cornerIndex, 0.85),
      ZOrder.ChipOverlay,
      type
    ));
  }

  relativeCorner(chip: Chip, i: number, perc: number = 1.0) {
    let pos = chip.container.position;
    let corner = chip.hex.hex.corners[i];
    return {x: (pos.x - corner.x) * perc, y: (pos.y - corner.y) * perc}
  }

  //TODO: move these into the specific subclasses?
  private async createIsle(number: number, col: number, row: number, rotation: number = 0) {
    let coords = {col: col, row: row};
    let hex = this.grid.getHex(coords)!;
    let sprite = await this.loadSpriteFromUrl(`${this.RESOURCE_BASE_PATH}/isle/${number}.png`);
    sprite.eventMode = "static";
    sprite.zIndex = ZOrder.Tile; // lowest z
    sprite.angle = 60 * rotation;
    sprite.anchor.set(0.5); // center
    sprite.position = {x: hex.x, y: hex.y};
    // add to stage
    this.viewport.addChild(sprite);
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
    let isle = new Isle(hex, sprite, number);
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
    //TODO: click event?
    return isle;
  }

  async createEarthscape(number: number, col: number, row: number, down: boolean, rotation: number = 0) {
    let coords = {col: col, row: row};
    let hex = this.grid.getHex(coords)!;
    let sprite = await this.loadSpriteFromUrl(`${this.RESOURCE_BASE_PATH}/earthscape/${number}.png`);
    sprite.eventMode = "static";
    sprite.zIndex = ZOrder.Earthscape;
    sprite.angle = (Number(down) * 180) + 120 * rotation;
    sprite.anchor.set(0.5, 0.57); // center
    sprite.position = {x: hex.x, y: hex.y + (down ? -hex.dimensions.yRadius : hex.dimensions.yRadius)};
    // add to stage
    this.viewport.addChild(sprite);
    // add earthscape hexes to list
    //INFO: earthscapes don't rotate around one base hex but rather at the center, so we need to move manually and get the terrain otherwise
    let traverser = [
      fromCoordinates(coords),
      move(down ? Direction.NW : Direction.SE),
      move(down ? Direction.E : Direction.W)
    ];
    let scape = new Earthscape(hex, sprite, number);
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
    //TODO: click event?
    return scape;
  }

  private async createChip(fileName: string, hex: Hex) : Promise<PIXI.Container> {
    let container = new PIXI.Container();
    container.zIndex = ZOrder.Chip;
    container.position = {x: hex.x, y: hex.y};
    let sprite = await this.loadSpriteFromUrl(`${this.RESOURCE_BASE_PATH}/${fileName}`);
    // make chip diameter as wide as the hex lines, plus a bit of extra (*1.5)
    sprite.label = "sprite";
    sprite.scale = (this.HEX_SIZE * this.SPRITE_CHIP_MULT) / sprite.width;
    sprite.zIndex = ZOrder.Chip;
    sprite.eventMode = "static";
    sprite.anchor.set(0.5);
    container.addChild(sprite);
    this.viewport.addChild(container);
    return container;
  }

  private async createHero(name: string, col: number, row: number) {
    let hex = this.hexes[this.getKeyFromPos(col, row)]!;
    let container = await this.createChip(Hero.getFileName(name), hex.hex);
    // add chip to list
    let chip = new Hero(hex, container, name);
    this.chips[this.getKeyFromPos(col, row)] = chip;
    // add labels
    this.chipOverlay(chip, chip.health, Colors.Health, "health", 1);
    this.chipOverlay(chip, chip.attack, Colors.Attack, "attack", 2);
    this.chipOverlay(chip, chip.range, Colors.Range, "range", 3);
    return chip;
  }

  private async createLandmark(name: string, col: number, row: number) {
    let hex = this.hexes[this.getKeyFromPos(col, row)]!;
    let container = await this.createChip(Landmark.getFileName(name), hex.hex);
    // add chip to list
    let chip = new Landmark(hex, container, name);
    this.chips[this.getKeyFromPos(col, row)] = chip;
    // add labels
    this.chipOverlay(chip, chip.health, Colors.Health, "health", 1);
    this.chipOverlay(chip, chip.attack, Colors.Attack, "attack", 2);
    return chip;
  }

  private async createSpire(name: string, col: number, row: number) {
    let hex = this.hexes[this.getKeyFromPos(col, row)]!;
    let container = await this.createChip(Spire.getFileName(name), hex.hex);
    // add chip to list
    let chip = new Spire(hex, container, name);
    this.chips[this.getKeyFromPos(col, row)] = chip;
    // add labels
    this.chipOverlay(chip, chip.attack, Colors.Attack, "attack", 1);
    this.chipOverlay(chip, chip.fortification, Colors.Fortification, "fortification", 2);
    this.chipOverlay(chip, chip.range, Colors.Range, "range", 3);
    return chip;
  }

  private async createFortress(faction: string, col: number, row: number, rotation: number = 0) {
    let coords = {col: col, row: row};
    let hex = this.grid.getHex(coords)!;
    let sprite = await this.loadSpriteFromUrl(`${this.RESOURCE_BASE_PATH}/fortress/${faction}.png`);
    sprite.eventMode = "static";
    sprite.zIndex = ZOrder.Fortress; // lowest z
    sprite.angle = 30 + 60 * rotation;
    sprite.anchor.set(0.5, 0.155); // set center on the gate
    sprite.position = {x: hex.x, y: hex.y};
    // add to stage
    this.viewport.addChild(sprite);
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
    let fortress = new Fortress(hex, sprite, faction);
    this.grid.traverse(traverser).forEach((h) => {
      let key = this.getKeyFromHex(h);
      this.fortress[key] = fortress;
    });
    //TODO: click event?
    return fortress;
  }

}
