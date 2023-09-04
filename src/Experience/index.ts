import * as THREE from "three";
import { BowlingWindow } from "../Types";
import Sizes from "./Utils/Sizes";
import Renderer from "./Renderer";
import Camera from "./Camera";
import World from "./World";
import Time from "./Utils/Time";
import Resources from "./Utils/Resources";
import sources from "./sources";
import PhysicsWorld from "./World/PhysicsWorld";

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
  resources?: Resources;
  physicsWorld?: PhysicsWorld;

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
    this.resources = new Resources(sources);
    this.camera = new Camera();
    this.renderer = new Renderer();
    this.world = new World();
    this.physicsWorld = new PhysicsWorld();
    console.log(this.physicsWorld);

    this.sizes.on("resize", () => {
      this.resize();
    });

    // Time tick event
    this.time.on("tick", () => {
      this.update();
    });
  }

  resize() {
    this.camera?.resize();
    this.renderer?.resize();
  }

  update() {
    this.physicsWorld?.update();
    this.camera?.update();
    this.world?.update();
    this.renderer?.update();
  }
}

export default Experience;
