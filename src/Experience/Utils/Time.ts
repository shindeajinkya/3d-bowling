import * as THREE from "three";
import { EventEmitter } from "./EventEmitter";

export default class Time extends EventEmitter {
  clock = new THREE.Clock();
  start: number = Date.now();
  current: number = this.start;
  elapsed = 0;
  delta = 16;

  constructor() {
    super();

    // Setup
    this.start = this.clock.getElapsedTime();
    this.current = this.start;

    window.requestAnimationFrame(() => {
      this.tick();
    });
  }

  tick() {
    const currentTime = this.clock.getElapsedTime();
    this.delta = currentTime - this.current;
    this.current = currentTime;
    this.elapsed = this.current - this.start;

    this.trigger("tick");

    window.requestAnimationFrame(() => {
      this.tick();
    });
  }
}
