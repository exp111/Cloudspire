import {GameService} from "../../game.service";

declare global {
  interface Window {
    Scenario: Scenario;
  }
}

export abstract class Scenario {
  constructor(public game: GameService) {
    window.Scenario = this;
  }

  abstract name: string;
  abstract amountWaves: number;

  // runs the setup like creating the map, factions, start units, etc
  abstract setup(): void;

  // called to run scenario specific event phase logic
  abstract handleEventPhase(): void;
}
