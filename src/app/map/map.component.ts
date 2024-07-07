import {Component, ElementRef, OnInit, Renderer2, ViewChild} from '@angular/core';
import {NgOptimizedImage} from "@angular/common";
import * as PIXI from "pixi.js";
import {ColorSource, PointData, Sprite} from "pixi.js";
import {Viewport} from "pixi-viewport";
import {Chip, ChipType, Hero, Landmark, Spire} from "../game/logic/chip";
import {Earthscape, Isle} from "../game/logic/hex";
import {Fortress} from "../game/logic/fortress";
import {GameService} from "../game/game.service";

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

  constructor(private game: GameService,
    private renderer: Renderer2) {
  }

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
  selectedChip: Chip | null = null;
  fakeChip!: Sprite;

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

    // Hover chip
    //TODO: ideas:
    // - like this, global mouse listener
    // - global ticker that checks mouse pos
    // - make single hex entities and listen on them
    this.fakeChip = new Sprite({
      scale: (this.game.HEX_SIZE * this.SPRITE_CHIP_MULT) / this.SPRITE_CHIP_WIDTH,
      zIndex: ZOrder.HoverOverlay,
      anchor: 0.5,
      visible: false,
      alpha: 0.5
    });
    this.viewport.addChild(this.fakeChip);
    /*this.viewport.onpointertap = (e) => {
      let hex = this.game.grid.pointToHex(this.viewport.toWorld(e.screen), {allowOutside: false});
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
      let hex = this.game.grid.pointToHex(this.viewport.toWorld(e.screen), {allowOutside: false});
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
    }*/

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
          console.error(`Unknwon type: ${chip.type}`);
          break;
      }
    }

    // Hex overlay
    this.hexOverlay.zIndex = ZOrder.HexOverlay;
    this.game.grid.forEach((hex) => {
      let key = this.game.getKeyFromHex(hex);
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
          {x: hex.x, y: hex.y},
          ZOrder.CoordinateOverlay);
      }
    });
    this.viewport.addChild(this.hexOverlay);

    //TODO: center/fit view?
  }

  //TODO: move these into getter/setters?
  //TODO: replace tint with outline
/*  private selectChip(selected: Chip) {
    selected.sprite.tint = Colors.Highlight;
    this.fakeChip.texture = selected.sprite.texture;
    this.selectedChip = selected;
  }

  private deselectChip(previouslySelected: Chip) {
    this.selectedChip = null;
    previouslySelected.sprite.tint = Colors.White;
    this.fakeChip.visible = false;
  }*/

  // Events
  //TODO: put the sub functions into class events
/*  private onHexClicked(hex: Hex) {
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
  }*/

  // Helpers
  private async loadSpriteFromUrl(url: string) {
    let texture = await PIXI.Assets.load(url);
    return PIXI.Sprite.from(texture);
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
    let corner = chip.hex.hex.corners[i];
    return {x: (pos.x - corner.x) * percent, y: (pos.y - corner.y) * percent}
  }

  private async createIsle(isle: Isle) {
    let hex = isle.hex;
    let sprite = await this.loadSpriteFromUrl(`${this.RESOURCE_BASE_PATH}/${isle.getFileName()}`);
    sprite.eventMode = "static";
    sprite.zIndex = ZOrder.Tile; // lowest z
    sprite.angle = 60 * isle.rotation;
    sprite.anchor.set(0.5); // center
    sprite.position = {x: hex.x, y: hex.y};
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

  private async createChip(chip: Chip) : Promise<PIXI.Container> {
    let container = new PIXI.Container();
    container.zIndex = ZOrder.Chip;
    container.position = {x: chip.hex.hex.x, y: chip.hex.hex.y};
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
    let sprite = await this.loadSpriteFromUrl(`${this.RESOURCE_BASE_PATH}/${fortress.getFileName()}`);
    sprite.eventMode = "static";
    sprite.zIndex = ZOrder.Fortress; // lowest z
    sprite.angle = 30 + 60 * fortress.rotation;
    sprite.anchor.set(0.5, 0.155); // set center on the gate
    sprite.position = {x: hex.x, y: hex.y};
    // add to stage
    this.viewport.addChild(sprite);
    // add to list
    this.sprites[fortress.uid] = sprite;
    return sprite;
  }

}
