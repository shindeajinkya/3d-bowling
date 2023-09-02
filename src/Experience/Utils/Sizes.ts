import { EventEmitter } from "./EventEmitter";

/**
 * To handle viewport
 */
export default class Sizes extends EventEmitter {
  width: number = 0;
  height: number = 0;
  pixelRatio: number = 0;

  constructor() {
    super();

    // Setup
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.pixelRatio = Math.min(window.devicePixelRatio, 2);

    // Resize event
    window.addEventListener("resize", () => {
      this.width = window.innerWidth;
      this.height = window.innerHeight;
      this.pixelRatio = Math.min(window.devicePixelRatio, 2);
      this.trigger("resize");
    });
  }
}
