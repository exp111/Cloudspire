import {Scenario} from "./scenario";
import {FactionType} from "../../../../data/enums";
import {AttackUpgrade, FortificationUpgrade, HealthChip, RangeUpgrade} from "../chips/chip";

export class TutorialScenario extends Scenario {
  override name = "Learning the Vines";
  override amountWaves = 3;

  //TODO: create shared roll d6 method?

  override setup(): void {
    const brawnen = this.game.createFaction(FactionType.BRAWNEN, true);
    const grovetenders = this.game.createFaction(FactionType.GROVETENDERS, false);

    this.game.createFortress(grovetenders, 2, 2, 1, 10);
    this.game.createFortress(brawnen, 4, 10, -1, 10, 0);

    this.game.createIsle(8, 4, 2, 3);
    this.game.createIsle(4, 6, 5, 0);
    this.game.createIsle(1, 3, 6, 4);

    this.game.createEarthscape(10, 6, 1, false, 0);
    this.game.createEarthscape(13, 5, 4, true, 2);
    this.game.createEarthscape(16, 3, 10, true, 1);
    this.game.createEarthscape(15, 4, 9, true, 2);

    this.game.createHero(brawnen, "Awsh", 1, 7, [new HealthChip(), new HealthChip(), new HealthChip()]);
    this.game.createLandmark(null, "Thoraxx", 3, 6, false, [new HealthChip(), new HealthChip(), new HealthChip(), new HealthChip(), new HealthChip()]);
    this.game.createSpire(grovetenders, "Reetall", 6, 1, [new AttackUpgrade(), new RangeUpgrade(), new RangeUpgrade()]);
    this.game.createSpire(grovetenders, "Shrubbery", 7, 5, [new FortificationUpgrade(), new FortificationUpgrade()]);
    this.game.createSpire(grovetenders, "Shrubbery", 6, 6, [new FortificationUpgrade(), new FortificationUpgrade()]);
    // general game setup
    this.game.placeLandmarks();
    //TODO: special scenario setup (roll d6)
  }

  override handleEventPhase() {
    switch (this.game.currentRound) {
      case 1:
        // nothing
        break;
      case 2:
      case 3:
        //TODO: roll event die
        break;
      default:
        console.error(`Invalid round: ${this.game.currentRound}`);
    }
  }
}
