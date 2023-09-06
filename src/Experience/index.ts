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
import RayCaster from "./RayCaster";

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
  raycaster?: RayCaster;

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
    this.raycaster = new RayCaster();
    this.renderer = new Renderer();
    this.world = new World();
    this.physicsWorld = new PhysicsWorld();

    this.world.bowl?.mesh?.updateMatrixWorld();

    this.sizes.on("resize", () => {
      this.resize();
    });

    // Time tick event
    this.time.on("tick", () => {
      this.update();
    });

    // raycaster events
    this.raycaster.on("mousedown", () => {
      if (!this.world?.bowl) return;
      if (this.world?.bowl?.cursorOnBall) {
        this.world.bowl.isDraggingBall = true;
      }
    });

    this.raycaster.on("touchstart", () => {
      if (!this.world?.bowl) return;
      this.world.bowl.isDraggingBall = this.world?.bowl?.isMeshIntersecting();
    });

    this.raycaster.on("touchend", () => {
      this.handleLaunch();
    });

    this.raycaster.on("mouseup", () => {
      this.handleLaunch();
    });
  }

  handleLaunch() {
    if (this.world?.bowl?.isDraggingBall && this.raycaster) {
      const difference = this.raycaster.dragEnd
        .clone()
        .sub(this.raycaster.dragStart);
      if (difference.y < 0) {
        alert("drag down");
        this.world.bowl.isDraggingBall = false;
        return;
      }

      const upperLimitX = 300;
      const upperLimitZ = 500;
      const intensityX =
        (difference.y < upperLimitX ? difference.y : upperLimitX) / upperLimitX;
      const intensityZ =
        Math.abs(difference.x) < upperLimitZ ? -difference.x : upperLimitZ;
      this.world?.bowl?.launch(4000 + 1000 * intensityX, intensityZ);
    }
    this.reset();
  }

  resize() {
    this.camera?.resize();
    this.renderer?.resize();
  }

  reset() {
    this.world?.bowl?.reset();
    this.raycaster?.reset();
  }

  update() {
    this.physicsWorld?.update();
    this.raycaster?.update();
    this.world?.update();
    this.camera?.update();
    this.renderer?.update();
  }
}

export default Experience;
