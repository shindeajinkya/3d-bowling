import * as THREE from "three";
import { BowlingWindow } from "../Types";
import Sizes from "./Utils/Sizes";
import Renderer from "./Renderer";
import Camera from "./Camera";
import World from "./World";
import Time from "./Utils/Time";

declare let window: BowlingWindow;

let instance: Experience | null = null;

class Experience {
  canvas: HTMLCanvasElement | null = null;
  sizes: Sizes | null = null;
  scene: THREE.Scene = new THREE.Scene();
  renderer?: Renderer;
  camera?: Camera;
  world?: World;
  time?: Time;

  constructor(canvas: HTMLCanvasElement | null) {
    if (instance) {
      return instance;
    }
    instance = this;

    // Global Access
    window.experience = this;

    this.canvas = canvas;

    // Setup
    this.sizes = new Sizes();
    this.time = new Time();
    this.camera = new Camera();
    this.renderer = new Renderer();
    this.world = new World();

    this.sizes.on("resize", () => {
      this.resize();
    });

    // Time tick event
    this.time.on("tick", () => {
      this.update();
    });
  }

  resize() {
    console.log("called", this.sizes);
    this.camera?.resize();
    this.renderer?.resize();
  }

  update() {
    this.camera?.update();
    // this.world?.update();
    this.renderer?.update();
  }
}

export default Experience;
