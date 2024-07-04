import {Component, ElementRef, OnInit, Renderer2, ViewChild} from '@angular/core';
import {NgOptimizedImage} from "@angular/common";
import {defineHex, Grid, Hex, rectangle} from "honeycomb-grid";
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
    const grid = new Grid(Hex, rectangle({ width: 10, height: 10 }));

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
    async function createTile(url: string, pos: PointData, rotation: number = 0) {
      let sprite = await loadSpriteFromUrl(url);
      sprite.eventMode = "static";
      sprite.zIndex = ZOrder.Tiles; // lowest z
      sprite.angle = 30 + 60 * rotation;
      sprite.anchor.set(0.5); // center
      sprite.position = pos;
      // add to stage
      viewport.addChild(sprite);
      //TODO: click event?
      return sprite;
    }

    async function createChip(url: string, pos: PointData) {
      let sprite = await loadSpriteFromUrl(url);
      // make chip diameter as wide as the hex lines, plus a bit of extra (*1.5)
      sprite.scale = (hexSize * 1.5) / sprite.width;
      sprite.zIndex = ZOrder.Chips;
      sprite.eventMode = "static";
      sprite.anchor.set(0.5);
      sprite.position = pos;
      viewport.addChild(sprite);
      sprite.onclick = (_) => {
        //TODO: outline
      };
      return sprite;
    }

    async function createFortress(url: string, pos: PointData, rotation: number = 0) {
      let sprite = await loadSpriteFromUrl(url);
      sprite.eventMode = "static";
      sprite.zIndex = ZOrder.Fortress; // lowest z
      sprite.scale = 0.4; //TODO: scale to tiles
      sprite.angle = 30 + 60 * rotation;
      sprite.anchor.set(0.5, 0.16); // set center on the gate
      sprite.position = pos;
      // add to stage
      viewport.addChild(sprite);
      //TODO: click event?
      return sprite;
    }

    let hex = grid.getHex({col: 2, row: 2})!;
    let hex2 = grid.getHex({col: 5, row: 1})!;
    await createTile("assets/tiles/1.png", {x: hex.x, y: hex.y}, 2);
    await createTile("assets/tiles/4.png", {x: hex2.x, y: hex2.y}, 4);
    let hex3 = grid.getHex({col: 3, row: 6})!;
    await createFortress("assets/fortress/brawnen.png", {x: hex3.x, y: hex3.y}, -1);
    // sprite.onclick = (event) => {
    //  sprite.texture = sprite.texture == tile1 ? tile2 : tile1;
    // }

    let first = grid.getHex({col: 0, row: 0})!;
    await createChip("assets/chips/awsh_front.png", {x: first.x, y: first.y});

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
      viewport.addChild(label);
      console.log(hex);
    }
  }

}
