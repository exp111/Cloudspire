import {Component, ElementRef, OnInit, Renderer2, ViewChild} from '@angular/core';
import {NgOptimizedImage} from "@angular/common";
import {defineHex, Direction, fromCoordinates, Grid, Hex, move, rectangle} from "honeycomb-grid";
import * as PIXI from "pixi.js";
import {ColorSource, Dict, PointData, Sprite} from "pixi.js";
import {Viewport} from "pixi-viewport";
import {Chip, Hero} from "../game/chip";
import {Earthscape, HexGroup, Isle} from "../game/hex";
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
  hexes: Dict<HexGroup | null> = {};
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
      // not inside the map
      if (!this.hexes[key]) {
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

    await this.createIsle(8, 4, 2, 1);
    await this.createIsle(4, 6, 5, 4);
    await this.createIsle(1, 3, 6, 2);

    await this.createEarthscape(10, 6, 1, false);
    await this.createEarthscape(13, 5, 4, true, 2);
    await this.createEarthscape(16, 3, 10, true, 1);
    await this.createEarthscape(15, 4, 9, true, 2);

    await this.createHero("awsh", 1, 7);

    // Hex overlay
    this.hexOverlay.zIndex = ZOrder.HexOverlay;
    this.grid.forEach((hex) => {
      let key = this.getKeyFromHex(hex);
      if (!this.renderNonMapHexes && !this.hexes[key]) {
        return;
      }
      this.hexOverlay.poly(hex.corners);
      this.hexOverlay.stroke({width: 2, color: 0x000000});
      if (this.showHexCenters) {
        this.hexOverlay.circle(hex.x, hex.y, 2);
        this.hexOverlay.fill({color: 0xff0000});
      }
      if (this.showCoordLabels) {
        this.debugText(`${hex.col},${hex.row}`,
          this.hexes[key] ? 0xff0000 : 0x00ff00,
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
    selected.container.tint = 0xff0000;
    this.fakeChip.texture = selected.sprite.texture;
    this.selectedChip = selected;
  }

  private deselectChip(previouslySelected: Chip) {
    this.selectedChip = null;
    previouslySelected.container.tint = 0xFFFFFF;
    this.fakeChip.visible = false;
  }

  // Events
  //TODO: put the sub functions into class events
  private onHexClicked(hex: Hex) {
    let key = this.getKeyFromHex(hex);
    // dont do anything if its outside of the map
    if (!this.hexes[key]) {
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

    // move selected chip to here
    this.chips[this.getKeyFromHex(selected.hex)] = null;
    this.chips[key] = selected;
    selected.hex = hex;
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

  debugText(text: string, color: ColorSource, pos: PointData, zIndex: ZOrder = ZOrder.Debug) {
    let lbl = new PIXI.Text({
      text: text,
      position: pos,
      anchor: 0.5
    });
    lbl.style = {fill: {color: color}}
    lbl.zIndex = zIndex;
    this.viewport.addChild(lbl);
  }

  //TODO: move these into the specific subclasses?
  private async createIsle(number: number, col: number, row: number, rotation: number = 0) {
    let coords = {col: col, row: row};
    let hex = this.grid.getHex(coords)!;
    let sprite = await this.loadSpriteFromUrl(`${this.RESOURCE_BASE_PATH}/isle/${number}.png`);
    sprite.eventMode = "static";
    sprite.zIndex = ZOrder.Tile; // lowest z
    sprite.angle = 30 + 60 * rotation;
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
    this.grid.traverse(traverser).forEach((h) => {
      let key = this.getKeyFromHex(h);
      this.hexes[key] = isle;
      this.isles[key] = isle;
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
    let traverser = [
      fromCoordinates(coords),
      //TODO: rotatedmove
      move(down ? Direction.NE : Direction.SE),
      move(Direction.W)
    ];
    let scape = new Earthscape(hex, sprite, number);
    this.grid.traverse(traverser).forEach((h) => {
      let key = this.getKeyFromHex(h);
      this.hexes[key] = scape;
      this.earthscapes[key] = scape;
    });
    //TODO: click event?
    return scape;
  }

  private async createChip(name: string, hex: Hex) : Promise<PIXI.Container> {
    let container = new PIXI.Container();
    container.zIndex = ZOrder.Chip;
    container.position = {x: hex.x, y: hex.y};
    let sprite = await this.loadSpriteFromUrl(`${this.RESOURCE_BASE_PATH}/chip/${name}_front.png`);
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
    let hex = this.grid.getHex({col: col, row: row})!;
    let container = await this.createChip(name, hex);
    // add chip to list
    let chip = new Hero(hex, container, name);
    this.chips[this.getKeyFromPos(col, row)] = chip;
    // add labels
    let health = new PIXI.Text({
      text: chip.health
    });
    health.label = "health";
    health.zIndex = ZOrder.ChipOverlay;
    health.style = {
      fill: {color: 0xff0000},
    };
    container.addChild(health);
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
      //TODO: add other tiles (mostly just spire spots) depending on rotation
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
