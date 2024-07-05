import {Component, ElementRef, OnInit, Renderer2, ViewChild} from '@angular/core';
import {NgOptimizedImage} from "@angular/common";
import {defineHex, Direction, fromCoordinates, Grid, Hex, move, rectangle} from "honeycomb-grid";
import * as PIXI from "pixi.js";
import {Dict, Sprite} from "pixi.js";
import {Viewport} from "pixi-viewport";

enum ZOrder {
  Background = 0,
  Tile = Background,
  Fortress = Tile,
  Earthscape = 1,
  HexOverlay = 2,
  Chip = 3,
  CoordinateOverlay = 4,
  HoverOverlay = 5,
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

  //TODO: include a ref to these in a custom hex class?
  //TODO: rather use a chip class
  chips: Dict<Sprite | null> = {};
  hexes: Dict<Sprite | null> = {};
  tiles: Dict<Sprite | null> = {};
  earthscapes: Dict<Sprite | null> = {};
  fortress: Dict<Sprite | null> = {};

  app = new PIXI.Application();
  viewport!: Viewport;
  hexOverlay = new PIXI.Graphics();

  selectedChip: Sprite | null = null;
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
      disableOnContextMenu: true,

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

    await this.createTile(8, 4, 2, 1);
    await this.createTile(4, 6, 5, 4);
    await this.createTile(1, 3, 6, 2);

    await this.createEarthscape(10, 6, 1, false);
    await this.createEarthscape(13, 5, 4, true, 2);
    await this.createEarthscape(16, 3, 10, true, 1);
    await this.createEarthscape(15, 4, 9, true, 2);

    await this.createChip("awsh", 1, 7);

    // Hex overlay
    this.hexOverlay.zIndex = ZOrder.HexOverlay;
    this.grid.forEach((hex) => {
      let key = this.getKeyFromHex(hex);
      if (!this.renderNonMapHexes && !this.hexes[key]) {
        return;
      }
      this.hexOverlay.poly(hex.corners);
      this.hexOverlay.stroke({width: 2, color: 0x000000});
      this.hexOverlay.circle(hex.x, hex.y, 2);
      this.hexOverlay.fill({color: 0xff0000});
      let label = new PIXI.Text({
        text: `${hex.col},${hex.row}`,
        position: {x: hex.x, y: hex.y},
        anchor: 0.5
      });
      label.zIndex = ZOrder.CoordinateOverlay;
      label.style = {
        fill: {color: this.hexes[key] ? 0xff0000 : 0x00ff00},
      };
      this.viewport.addChild(label);
    });
    this.viewport.addChild(this.hexOverlay);

    //TODO: center/fit view?
  }

  //TODO: move these into getter/setters?
  //TODO: replace tint with outline
  private selectChip(selected: Sprite) {
    selected.tint = 0xff0000;
    this.fakeChip.texture = selected.texture;
    this.selectedChip = selected;
  }

  private deselectChip(previouslySelected: Sprite) {
    this.selectedChip = null;
    previouslySelected.tint = 0xFFFFFF;
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
    let oldHex = this.grid.pointToHex(selected.position)!;
    this.chips[this.getKeyFromHex(oldHex)] = null;
    this.chips[key] = selected;

    selected.position = {x: hex.x, y: hex.y};
    this.deselectChip(selected);
  }

  private onChipClicked(chip: Sprite) {
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

  private async createTile(tile: number, col: number, row: number, rotation: number = 0) {
    let coords = {col: col, row: row};
    let hex = this.grid.getHex(coords)!;
    let sprite = await this.loadSpriteFromUrl(`${this.RESOURCE_BASE_PATH}/tile/${tile}.png`);
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
      move(Direction.NW),
      move(Direction.NE),
      move(Direction.SE),
      move(Direction.E),
      move(Direction.SW),
      move(Direction.SE),
      move(Direction.W),
      move(Direction.SW),
      move(Direction.NW),
      move(Direction.W),
      move(Direction.NE),
      move(Direction.NW)
    ];
    this.grid.traverse(traverser).forEach((h) => {
      let key = this.getKeyFromHex(h);
      this.hexes[key] = sprite;
      this.tiles[key] = sprite;
    });
    //TODO: click event?
    return sprite;
  }

  async createEarthscape(earthscape: number, col: number, row: number, down: boolean, rotation: number = 0) {
    let coords = {col: col, row: row};
    let hex = this.grid.getHex(coords)!;
    let sprite = await this.loadSpriteFromUrl(`${this.RESOURCE_BASE_PATH}/earthscape/${earthscape}.png`);
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
      move(down ? Direction.NE : Direction.SE),
      move(Direction.W)
    ];
    this.grid.traverse(traverser).forEach((h) => {
      let key = this.getKeyFromHex(h);
      this.hexes[key] = sprite;
      this.earthscapes[key] = sprite;
    });
    //TODO: click event?
    return sprite;
  }

  private async createChip(name: string, col: number, row: number) {
    let hex = this.grid.getHex({col: col, row: row})!;
    let sprite = await this.loadSpriteFromUrl(`${this.RESOURCE_BASE_PATH}/chip/${name}_front.png`);
    // make chip diameter as wide as the hex lines, plus a bit of extra (*1.5)
    sprite.scale = (this.HEX_SIZE * this.SPRITE_CHIP_MULT) / sprite.width;
    sprite.zIndex = ZOrder.Chip;
    sprite.eventMode = "static";
    sprite.anchor.set(0.5);
    sprite.position = {x: hex.x, y: hex.y};
    this.viewport.addChild(sprite);
    // add chip to list
    this.chips[this.getKeyFromPos(col, row)] = sprite;
    return sprite;
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
    ];
    this.grid.traverse(traverser).forEach((h) => {
      let key = this.getKeyFromHex(h);
      this.fortress[key] = sprite;
    });
    //TODO: click event?
    return sprite;
  }

}
