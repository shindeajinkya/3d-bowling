import Experience from "..";
import Bowl from "./Bowl";
import Pins from "./Pins";

class Score {
  experience: Experience | null = null;
  scoreboard: Element | null;
  resetBtn: Element | null;
  pins?: Pins;
  bowl?: Bowl;
  score = 0;
  previousFrameScore = 0;
  bufferFrame = 0;
  bufferBowl = 0;
  remainingMove = 2;
  standingPins = 10;

  constructor() {
    this.experience = new Experience(null);
    this.pins = this.experience.world?.pins;
    this.bowl = this.experience.world?.bowl;
    this.scoreboard = this.experience.scoreboard;
    this.resetBtn = this.experience.resetBtn;
  }

  calculateScore() {
    if (!this?.pins || !this.scoreboard) return;
    const standingPins = this?.pins?.getStandingPins();
    this.bufferBowl = this.standingPins - standingPins;
    this.bufferFrame += this.bufferBowl;
    this.remainingMove -= 1;
    if (this.bufferFrame === 10 || this.remainingMove === 0) {
      this.score += this.bufferBowl;
    }
    console.log(this.score);

    if (
      this.bufferFrame !== 10 &&
      this.bowl &&
      this.resetBtn &&
      this.remainingMove !== 0
    ) {
      if (this.remainingMove == 1 && this.previousFrameScore === 10) {
        this.score += 10 + this.bufferBowl;
      } else {
        this.score += this.bufferBowl;
      }
      this.standingPins = standingPins;
      this.bowl.resetBallPosition();
      this.bowl.ballDetected = false;
      this.resetBtn.className = this.resetBtn.className.replace(
        "block",
        "hidden"
      );
      return;
    }

    console.log(`The score is: ${this.score}`);

    this.experience?.resetAlley();
    this.remainingMove = 2;
    this.previousFrameScore = this.bufferFrame;
    this.bufferFrame = 0;
    this.scoreboard.innerHTML = `Score: ${this.score}`;
  }
}

export default Score;
