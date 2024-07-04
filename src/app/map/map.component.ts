import {Component, ElementRef, OnInit, Renderer2, ViewChild} from '@angular/core';
import {NgOptimizedImage} from "@angular/common";
import {defineHex, Grid, Hex, HexCoordinates, rectangle} from "honeycomb-grid";
import * as PIXI from "pixi.js";
import {PointData} from "pixi.js";
import {Viewport} from "pixi-viewport";

enum ZOrder {
  Background = 0,
  Tiles = Background,
  Fortress = Tiles,
  HexOverlay = 1,
  Chips = 2,
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
    const hexSize = 154;
    // you may want the origin to be the top left corner of a hex's bounding box
    // instead of its center (which is the default)
    const Hex = defineHex({ dimensions: hexSize, origin: "topLeft" });
    const grid = new Grid(Hex, rectangle({ width: 10, height: 15 }));

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
    async function createTile(url: string, hexPos: HexCoordinates, rotation: number = 0) {
      let hex = grid.getHex(hexPos)!;
      let sprite = await loadSpriteFromUrl(url);
      sprite.eventMode = "static";
      sprite.zIndex = ZOrder.Tiles; // lowest z
      sprite.angle = 30 + 60 * rotation;
      sprite.anchor.set(0.5); // center
      sprite.position = {x: hex.x, y: hex.y};
      // add to stage
      viewport.addChild(sprite);
      //TODO: click event?
      return sprite;
    }

    async function createChip(url: string, hexPos: HexCoordinates) {
      let hex = grid.getHex(hexPos)!;
      let sprite = await loadSpriteFromUrl(url);
      // make chip diameter as wide as the hex lines, plus a bit of extra (*1.5)
      sprite.scale = (hexSize * 1.5) / sprite.width;
      sprite.zIndex = ZOrder.Chips;
      sprite.eventMode = "static";
      sprite.anchor.set(0.5);
      sprite.position = {x: hex.x, y: hex.y};
      viewport.addChild(sprite);
      sprite.onclick = (_) => {
        //TODO: outline
      };
      return sprite;
    }

    async function createFortress(url: string, hexPos: HexCoordinates, rotation: number = 0) {
      let hex = grid.getHex(hexPos)!;
      let sprite = await loadSpriteFromUrl(url);
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

    await createFortress("assets/fortress/grovetenders.png", {col: 2, row: 2}, 1);
    await createFortress("assets/fortress/brawnen.png", {col: 4, row: 10}, -1);

    await createTile("assets/tiles/8.png", {col: 4, row: 2}, 1);
    await createTile("assets/tiles/4.png", {col: 6, row: 5}, 4);
    await createTile("assets/tiles/1.png", {col: 3, row: 6}, 2);
    // sprite.onclick = (event) => {
    //  sprite.texture = sprite.texture == tile1 ? tile2 : tile1;
    // }

    await createChip("assets/chips/awsh_front.png", {col: 0, row: 0});

    function renderHex(hex: Hex) {
      graphics.poly(hex.corners);
      graphics.stroke({ width: 2, color: 0x000000 });
      graphics.circle(hex.x, hex.y, 2);
      graphics.fill({ color: 0xff0000 });
      let label = new PIXI.Text({
        text: `${hex.col},${hex.row}`,
        position: {x: hex.x, y: hex.y},
        anchor: 0.5
      });
      label.zIndex = ZOrder.Background;
      viewport.addChild(label);
      console.log(hex);
    }
  }

}
