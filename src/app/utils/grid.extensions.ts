import {Grid, Hex} from "honeycomb-grid";

export {}

declare module "honeycomb-grid" {
  interface Grid<T> {
    neighbours(hex: T): T[];
  }
}

const cube_direction_vectors = [
  {q: +1, r: 0, s: -1},
  {q: +1, r: -1, s: 0},
  {q: 0, r: -1, s: +1},
  {q: -1, r: 0, s: +1},
  {q: -1, r: +1, s: 0},
  {q: 0, r: +1, s: -1},
];

Grid.prototype.neighbours = function (hex: Hex) {
  const neighbours = [];
  for (let dir of cube_direction_vectors) {
    let coords = {q: hex.q + dir.q, r: hex.r + dir.r, s: hex.s + dir.s};
    let h = this.getHex(coords);
    neighbours.push(h);
  }
  return neighbours;
};
