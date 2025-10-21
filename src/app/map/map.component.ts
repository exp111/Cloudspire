import {Component, ElementRef, inject, OnInit, Renderer2, ViewChild} from '@angular/core';
import * as PIXI from "pixi.js";
import {ColorSource, PointData, Sprite, Texture} from "pixi.js";
import {Viewport} from "pixi-viewport";
import {Chip, ChipType} from "../game/logic/chips/chip";
import {Earthscape, GameHex, Isle} from "../game/logic/hex";
import {Fortress} from "../game/logic/fortress";
import {GameService} from "../game/game.service";
import {Landmark} from "../game/logic/chips/landmark";
import {Spire} from "../game/logic/chips/spire";
import {Hero} from "../game/logic/chips/hero";
import {GameElement} from "../game/logic/game";

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
  HoverHighlight = Yellow,
  NoTint = White,

  Health = 0xE71C41,
  Attack = 0xF05423,
  Range = 0x1E9588,
  Fortification = 0xF8C750
}

declare global {
  interface Window {
    GameMap: MapComponent;
  }
}

@Component({
    selector: 'app-map',
    imports: [],
    templateUrl: './map.component.html',
    styleUrl: './map.component.scss'
})
export class MapComponent implements OnInit {
  @ViewChild("map")
  mapRef!: ElementRef;

  game = inject(GameService);
  renderer = inject(Renderer2);

  RESOURCE_BASE_PATH = "assets";
  SPRITE_CHIP_WIDTH = 256;
  SPRITE_CHIP_MULT = 1.5;
  WORLD_SIZE = 1000;

  renderNonMapHexes = false;
  showCoordLabels = true;
  showHexCenters = false;

  app = new PIXI.Application();
  viewport!: Viewport;
  hexOverlay = new PIXI.Graphics();

  sprites: PIXI.Container[] = [];
  fakeChips: PIXI.Sprite[] = [];

  constructor() {
    window.GameMap = this;
  }

  async ngOnInit() {
    // init app
    await this.app.init({backgroundAlpha: 0});
    this.app.resizeTo = this.mapRef.nativeElement;
    this.renderer.appendChild(this.mapRef.nativeElement, this.app.canvas);

    // init viewport
    //TODO: actually limit viewport?
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

    //TODO: ideas:
    // - like this, global mouse listener
    // - global ticker that checks mouse pos
    // - make single hex entities and listen on them

    // Listen to events
    /// UI
    this.viewport.onpointertap = (e) => {
      let hex = this.game.grid.pointToHex(this.viewport.toWorld(e.screen), {allowOutside: false});
      if (hex) {
        e.stopPropagation(); // stop bubbling
        this.game.onHexClicked(hex);
      }
    }
    //TODO: fix mouseover not triggering sometimes
    this.viewport.onmouseover = (e) => {
      let hex = this.game.grid.pointToHex(this.viewport.toWorld(e.screen), {allowOutside: false});
      if (hex) {
        e.stopPropagation(); // stop bubbling
        this.game.onHexHovered(hex);
      }
    }

    /// Game
    this.game.onChipSelected.subscribe({next: (c: Chip) => this.selectChip(c)});
    this.game.onChipDeselected.subscribe({next: (c: Chip) => this.deselectChip(c)});
    this.game.onChipMoved.subscribe({next: (params: { chip: Chip; hex: GameHex; }) => this.moveChip(params.chip, params.hex)});
    this.game.onHidePreview.subscribe({next: () => this.hidePreview});
    this.game.onShowPreview.subscribe({next: (v: GameHex) => this.showPreview(v)});

    // Build map
    for (let fortress of this.game.elements.fortress) {
      await this.createFortress(fortress);
    }

    for (let isle of this.game.elements.isles) {
      await this.createIsle(isle);
    }
    for (let earthscape of this.game.elements.earthscapes) {
      await this.createEarthscape(earthscape);
    }
    for (let chip of this.game.elements.chips) {
      switch (chip.type) {
        case ChipType.HERO:
          await this.createHero(chip as Hero);
          break;
        case ChipType.LANDMARK:
          await this.createLandmark(chip as Landmark);
          break;
        case ChipType.SPIRE:
          await this.createSpire(chip as Spire);
          break;
        default:
          console.error(`Unknown type: ${chip.type}`);
          break;
      }
    }

    // Hex overlay
    this.hexOverlay.zIndex = ZOrder.HexOverlay;
    this.game.grid.forEach((hex) => {
      let key = hex.getKey();
      if (!this.renderNonMapHexes && !this.game.hexes[key]) {
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
          this.game.hexes[key] ? Colors.Red : Colors.Green,
          hex.pos(),
          ZOrder.CoordinateOverlay);
      }
    });
    this.viewport.addChild(this.hexOverlay);

    //TODO: center/fit view?
  }

  // Functions
  //TODO: replace tint with outline
  private selectChip(chip: Chip) {
    let sprite = this.getChipSprite(chip);
    sprite.tint = Colors.Highlight;
    // get possible move hexes
    let hexes = this.game.getMovementHexes(chip);
    // highlight each hex
    for (let hex of hexes) {
      let fake = this.createFakeChip(sprite.texture);
      fake.position = hex.hex.pos();
      this.fakeChips.push(fake);
    }
  }

  private deselectChip(chip: Chip) {
    let sprite = this.getChipSprite(chip);
    sprite.tint = Colors.NoTint;
    // remove highlights
    this.viewport.removeChild(...this.fakeChips);
    this.fakeChips = [];
  }

  private moveChip(chip: Chip, hex: GameHex) {
    this.getElementContainer(chip).position = hex.hex.pos();
  }

  //TODO: disable previews as they arent that useful/good?
  private hidePreview() {
    for (let fake of this.fakeChips) {
      fake.tint = Colors.NoTint;
    }
  }

  private showPreview(hex: GameHex) {
    let pos = hex.hex.pos();
    for (let fake of this.fakeChips) {
      if (fake.position.equals(pos)) {
        fake.tint = Colors.Yellow;
      } else {
        fake.tint = Colors.NoTint;
      }
    }
  }

  // Helpers
  private getElementContainer(el: GameElement) {
    return this.sprites[el.uid];
  }

  private getChipSprite(chip: Chip) {
    return this.getElementContainer(chip).getChildByName("sprite")! as PIXI.Sprite;
  }

  private async loadSpriteFromUrl(url: string) {
    let texture = await PIXI.Assets.load(url);
    return PIXI.Sprite.from(texture);
  }

  label(text: PIXI.TextString, color: ColorSource, strokeColor: ColorSource | null, pos: PointData, zIndex: ZOrder, label?: string) {
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

  createFakeChip(texture: Texture) {
    let fake = new Sprite({
      texture: texture,
      scale: (this.game.HEX_SIZE * this.SPRITE_CHIP_MULT) / this.SPRITE_CHIP_WIDTH,
      zIndex: ZOrder.HoverOverlay,
      anchor: 0.5,
      visible: true,
      alpha: 0.5
    });
    this.viewport.addChild(fake);
    return fake;
  }

  chipOverlay(chip: Chip, text: PIXI.TextString, color: Colors, type: string, cornerIndex: number) {
    this.sprites[chip.uid].addChild(this.label(
      text,
      color,
      Colors.Black,
      this.relativeCorner(chip, cornerIndex, 0.85),
      ZOrder.ChipOverlay,
      type
    ));
  }

  relativeCorner(chip: Chip, i: number, percent: number = 1.0) {
    let pos = this.sprites[chip.uid].position;
    let corner = chip.hex!.hex.corners[i];
    return {x: (pos.x - corner.x) * percent, y: (pos.y - corner.y) * percent}
  }

  private async createIsle(isle: Isle) {
    let hex = isle.hex;
    let sprite = await this.loadSpriteFromUrl(`${this.RESOURCE_BASE_PATH}/${isle.getFileName()}`);
    sprite.eventMode = "static";
    sprite.zIndex = ZOrder.Tile; // lowest z
    sprite.angle = 60 * isle.rotation;
    sprite.anchor.set(0.5); // center
    sprite.position = hex.pos();
    // add to stage
    this.viewport.addChild(sprite);
    // add to list
    this.sprites[isle.uid] = sprite;
    return sprite;
  }

  async createEarthscape(earthscape: Earthscape) {
    let hex = earthscape.hex;
    let sprite = await this.loadSpriteFromUrl(`${this.RESOURCE_BASE_PATH}/${earthscape.getFileName()}`);
    sprite.eventMode = "static";
    sprite.zIndex = ZOrder.Earthscape;
    sprite.angle = (Number(earthscape.isDown) * 180) + 120 * earthscape.rotation;
    sprite.anchor.set(0.5, 0.57); // center
    sprite.position = {x: hex.x, y: hex.y + (earthscape.isDown ? -hex.dimensions.yRadius : hex.dimensions.yRadius)};
    // add to stage
    this.viewport.addChild(sprite);
    // add to list
    this.sprites[earthscape.uid] = sprite;
    return sprite;
  }

  private async createChip(chip: Chip): Promise<PIXI.Container> {
    let container = new PIXI.Container();
    container.zIndex = ZOrder.Chip;
    container.position = chip.hex!.hex.pos();
    let sprite = await this.loadSpriteFromUrl(`${this.RESOURCE_BASE_PATH}/${chip.getFileName()}`);
    // make chip diameter as wide as the hex lines, plus a bit of extra (*1.5)
    sprite.label = "sprite";
    sprite.scale = (this.game.HEX_SIZE * this.SPRITE_CHIP_MULT) / sprite.width;
    sprite.zIndex = ZOrder.Chip;
    sprite.eventMode = "static";
    sprite.anchor.set(0.5);
    container.addChild(sprite);
    this.viewport.addChild(container);
    // add to list
    this.sprites[chip.uid] = container;
    return container;
  }

  private async createHero(hero: Hero) {
    let container = await this.createChip(hero);
    // add labels
    this.chipOverlay(hero, hero.health, Colors.Health, "health", 1);
    this.chipOverlay(hero, hero.fortification, Colors.Fortification, "fortification", 0);
    this.chipOverlay(hero, hero.attack, Colors.Attack, "attack", 2);
    this.chipOverlay(hero, hero.range, Colors.Range, "range", 3);
    return container;
  }

  private async createLandmark(landmark: Landmark) {
    let container = await this.createChip(landmark);
    // add labels
    this.chipOverlay(landmark, landmark.health, Colors.Health, "health", 1);
    this.chipOverlay(landmark, landmark.attack, Colors.Attack, "attack", 2);
    return container;
  }

  private async createSpire(spire: Spire) {
    let container = await this.createChip(spire);
    // add labels
    this.chipOverlay(spire, spire.attack, Colors.Attack, "attack", 1);
    this.chipOverlay(spire, spire.fortification, Colors.Fortification, "fortification", 2);
    this.chipOverlay(spire, spire.range, Colors.Range, "range", 3);
    return container;
  }

  private async createFortress(fortress: Fortress) {
    let hex = fortress.gateHex;
    //TODO: container
    let sprite = await this.loadSpriteFromUrl(`${this.RESOURCE_BASE_PATH}/${fortress.getFileName()}`);
    sprite.eventMode = "static";
    sprite.zIndex = ZOrder.Fortress; // lowest z
    sprite.angle = 30 + 60 * fortress.rotation;
    sprite.anchor.set(0.5, 0.155); // set center on the gate
    sprite.position = hex.pos();
    // add to stage
    this.viewport.addChild(sprite);
    // add to list
    this.sprites[fortress.uid] = sprite;
    //TODO: show health + source
    return sprite;
  }

}
