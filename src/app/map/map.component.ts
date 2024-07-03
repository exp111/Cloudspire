import {Component, ElementRef, OnInit, Renderer2, ViewChild} from '@angular/core';
import {NgOptimizedImage} from "@angular/common";
import {defineHex, Grid, rectangle, Hex} from "honeycomb-grid";
import {Application, Assets, Color, Graphics, Polygon, Sprite, StrokeInput, EventSystem, Circle} from "pixi.js";

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
    // you may want the origin to be the top left corner of a hex's bounding box
    // instead of its center (which is the default)
    const Hex = defineHex({ dimensions: 30, origin: "topLeft" });
    const grid = new Grid(Hex, rectangle({ width: 10, height: 10 }));

    const app = new Application();
    await app.init({ backgroundAlpha: 0 });
    app.resizeTo = this.mapRef.nativeElement;
    const graphics = new Graphics();

    this.renderer.appendChild(this.mapRef.nativeElement, app.canvas);

    grid.forEach(renderHex);
    app.stage.addChild(graphics);

    let tile1 = await Assets.load("/assets/tiles/1.png");
    let tile2 = await Assets.load("/assets/tiles/2.jpg");
    let sprite = Sprite.from(tile1);
    sprite.eventMode = "static";
    //app.stage.addChild(sprite);
    sprite.onclick = (event) => {
     sprite.texture = sprite.texture == tile1 ? tile2 : tile1;
    }

    function renderHex(hex: Hex) {
      graphics.poly(hex.corners);
      graphics.stroke({ width: 2, color: 0x000000 });
      console.log(hex);
    }
  }

}
