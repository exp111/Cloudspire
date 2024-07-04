import {Component, ElementRef, OnInit, Renderer2, ViewChild} from '@angular/core';
import {NgOptimizedImage} from "@angular/common";
import {defineHex, Grid, Hex, HexCoordinates, rectangle} from "honeycomb-grid";
import * as PIXI from "pixi.js";
import {Viewport} from "pixi-viewport";
import {Sprite} from "pixi.js";

enum ZOrder {
  Background = 0,
  Tile = Background,
  Fortress = Tile,
  Earthscape = 1,
  HexOverlay = 2,
  CoordinateOverlay = 4,
  Chip = 3,
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

  async ngOnInit() {
    const resourceBasePath = "assets";
    const hexSize = 154;
    // you may want the origin to be the top left corner of a hex's bounding box
    // instead of its center (which is the default)
    const Hex = defineHex({ dimensions: hexSize, origin: "topLeft" });
    const grid = new Grid(Hex, rectangle({ width: 9, height: 14 }));

    let selectedChip: Sprite | null = null;

    const app = new PIXI.Application();
    await app.init({ backgroundAlpha: 0 });
    app.resizeTo = this.mapRef.nativeElement;
    this.renderer.appendChild(this.mapRef.nativeElement, app.canvas);
    const viewport = new Viewport({
      screenWidth: window.innerWidth,
      screenHeight: window.innerHeight,
      worldWidth: 1000,
      worldHeight: 1000,
      disableOnContextMenu: true,

      events: app.renderer.events // the interaction module is important for wheel to work properly when renderer.view is placed or scaled
    });
    app.stage.addChild(viewport);
    viewport
      .drag()
      .pinch()
      .wheel();

    const graphics = new PIXI.Graphics();
    graphics.zIndex = ZOrder.HexOverlay;
    grid.forEach(renderHex);
    viewport.addChild(graphics);

    async function loadSpriteFromUrl(url: string) {
      let texture = await PIXI.Assets.load(url);
      return PIXI.Sprite.from(texture);
    }
    async function createTile(tile: number, hexPos: HexCoordinates, rotation: number = 0) {
      let hex = grid.getHex(hexPos)!;
      let sprite = await loadSpriteFromUrl(`${resourceBasePath}/tile/${tile}.png`);
      sprite.eventMode = "static";
      sprite.zIndex = ZOrder.Tile; // lowest z
      sprite.angle = 30 + 60 * rotation;
      sprite.anchor.set(0.5); // center
      sprite.position = {x: hex.x, y: hex.y};
      // add to stage
      viewport.addChild(sprite);
      //TODO: click event?
      return sprite;
    }

    async function createEarthscape(earthscape: number, hexPos: HexCoordinates, rotation: number = 0) {
      let hex = grid.getHex(hexPos)!;
      let sprite = await loadSpriteFromUrl(`${resourceBasePath}/earthscape/${earthscape}.png`);
      sprite.eventMode = "static";
      sprite.zIndex = ZOrder.Earthscape;
      sprite.angle = 60 * rotation;
      sprite.anchor.set(0.5, 0.285); // center
      sprite.position = {x: hex.x, y: hex.y};
      // add to stage
      viewport.addChild(sprite);
      //TODO: click event?
      return sprite;
    }

    async function createChip(name: string, hexPos: HexCoordinates) {
      let hex = grid.getHex(hexPos)!;
      let sprite = await loadSpriteFromUrl(`${resourceBasePath}/chip/${name}_front.png`);
      // make chip diameter as wide as the hex lines, plus a bit of extra (*1.5)
      sprite.scale = (hexSize * 1.5) / sprite.width;
      sprite.zIndex = ZOrder.Chip;
      sprite.eventMode = "static";
      sprite.anchor.set(0.5);
      sprite.position = {x: hex.x, y: hex.y};
      viewport.addChild(sprite);
      sprite.onclick = (e) => {
        //TODO: replace tint with outline

        // remove tint
        sprite.tint = 0xffffff;
        if (selectedChip == sprite) {
          // unselect if it was selected
          selectedChip = null;
        } else {
          sprite.tint = sprite.tint == 0xff0000 ? 0x00ff00 : 0xff0000;
          selectedChip = sprite;
        }
      };
      return sprite;
    }

    async function createFortress(faction: string, hexPos: HexCoordinates, rotation: number = 0) {
      let hex = grid.getHex(hexPos)!;
      let sprite = await loadSpriteFromUrl(`${resourceBasePath}/fortress/${faction}.png`);
      sprite.eventMode = "static";
      sprite.zIndex = ZOrder.Fortress; // lowest z
      sprite.angle = 30 + 60 * rotation;
      sprite.anchor.set(0.5, 0.155); // set center on the gate
      sprite.position = {x: hex.x, y: hex.y};
      // add to stage
      viewport.addChild(sprite);
      //TODO: click event?
      return sprite;
    }

    await createFortress("grovetenders", {col: 2, row: 2}, 1);
    await createFortress("brawnen", {col: 4, row: 10}, -1);

    await createTile(8, {col: 4, row: 2}, 1);
    await createTile(4, {col: 6, row: 5}, 4);
    await createTile(1, {col: 3, row: 6}, 2);

    await createEarthscape(10, {col: 6, row: 1});
    await createEarthscape(13, {col: 5, row: 3}, 1);
    await createEarthscape(16, {col: 2, row: 9}, -1);
    await createEarthscape(16, {col: 5, row: 8}, 1);

    await createChip("awsh", {col: 1, row: 7});

    function renderHex(hex: Hex) {
      //TODO: hover event
      graphics.poly(hex.corners);
      graphics.stroke({ width: 2, color: 0x000000 });
      graphics.circle(hex.x, hex.y, 2);
      graphics.fill({ color: 0xff0000 });
      let label = new PIXI.Text({
        text: `${hex.col},${hex.row}`,
        position: {x: hex.x, y: hex.y},
        anchor: 0.5
      });
      label.zIndex = ZOrder.CoordinateOverlay;
      label.style = {
        fill: {color: 0xff0000},
      };
      viewport.addChild(label);
      console.log(hex);
    }
  }

}
