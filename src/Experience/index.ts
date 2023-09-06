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
import { isTouchDevice } from "../utils/index";

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
  isDraggingBall = false;
  dragStart = new THREE.Vector2();
  dragEnd = new THREE.Vector2();

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

    window?.addEventListener("mousedown", (event) => {
      const isTouch = isTouchDevice();
      if (this.world?.bowl?.cursorOnBall && !isTouch) {
        this.isDraggingBall = true;
        this.dragStart.set(event.clientX, event.clientY);
      }
    });

    window.addEventListener("touchstart", (event) => {
      if (!this.sizes || !this.camera?.instance || !this.world?.bowl) return;
      const touchStart = event.changedTouches[0];
      this.dragStart.set(touchStart.clientX, touchStart.clientY);
      const pointer = new THREE.Vector2(
        (touchStart.clientX / this.sizes.width) * 2 - 1,
        -(touchStart.clientY / this.sizes.height) * 2 + 1
      );
      this.raycaster?.instance?.setFromCamera(pointer, this.camera?.instance);
      this.isDraggingBall = this.world?.bowl?.isMeshIntersecting();
    });

    window.addEventListener("touchend", (event) => {
      const touchEnd = event.changedTouches[0];
      this.dragEnd.set(touchEnd.clientX, touchEnd.clientY);
      this.handleLaunch();
    });

    window?.addEventListener("mouseup", (event) => {
      const isTouch = isTouchDevice();
      if (!isTouch) {
        this.dragEnd.set(event.clientX, event.clientY);
        this.handleLaunch();
      }
    });
  }

  handleLaunch() {
    if (this.isDraggingBall) {
      const difference = this.dragEnd.clone().sub(this.dragStart);
      if (difference.y < 0) {
        alert("drag down");
        this.isDraggingBall = false;
        return;
      }

      const upperLimitX = 300;
      const upperLimitZ = 500;
      const intensityX =
        (difference.y < upperLimitX ? difference.y : upperLimitX) / upperLimitX;
      const intensityZ =
        Math.abs(difference.x) < upperLimitZ ? -difference.x : upperLimitZ;
      this.world?.bowl?.launch(4000 + 1000 * intensityX, intensityZ);
      this.isDraggingBall = false;
    }
    this.dragStart.set(0, 0);
    this.dragEnd.set(0, 0);
  }

  resize() {
    this.camera?.resize();
    this.renderer?.resize();
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
