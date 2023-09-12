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
  resetBtn: HTMLElement | null = null;
  scoreboard: Element | null = null;
  sizes: Sizes | null = null;
  scene: THREE.Scene = new THREE.Scene();
  renderer?: Renderer;
  camera?: Camera;
  world?: World;
  time?: Time;
  resources?: Resources;
  physicsWorld?: PhysicsWorld;
  raycaster?: RayCaster;
  bowlDetector?: RayCaster;
  score = 0;
  remainingMove = 2;

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
    this.raycaster = new RayCaster(true);
    this.renderer = new Renderer();
    this.world = new World();
    this.physicsWorld = new PhysicsWorld();
    this.bowlDetector = new RayCaster();
    this.resetBtn = <HTMLElement>document.querySelector("#reset-btn");
    this.scoreboard = document.querySelector("#scoreboard");

    this.setBowlDetector();
    this.world.bowl?.mesh?.updateMatrixWorld();

    // handling reset button
    this.resetBtn?.addEventListener("click", () => {
      this.resetAlley();
    });

    // Resize event
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

  setBowlDetector() {
    if (!this.bowlDetector?.instance) return;
    // ray direction
    const rayOrigin = new THREE.Vector3(-1.5, 0.25, -1.5);
    const rayDirection = new THREE.Vector3(0, 0, 10);
    rayDirection.normalize();

    this.bowlDetector?.instance?.set(rayOrigin, rayDirection);
    this.bowlDetector.instance.far = 3;
    const arrowHelper = new THREE.ArrowHelper(
      rayDirection,
      rayOrigin,
      this.bowlDetector?.instance?.far,
      new THREE.Color("cyan")
    );
    arrowHelper.visible = false;
    this.scene.add(arrowHelper);
  }

  handleLaunch() {
    if (this.world?.bowl?.isDraggingBall && this.raycaster && this.sizes) {
      const difference = this.raycaster.dragEnd
        .clone()
        .sub(this.raycaster.dragStart);
      if (difference.y < 0 || (difference.x === 0 && difference.y === 0)) {
        alert("drag down");
        this.world.bowl.isDraggingBall = false;
        return;
      }

      const upperLimitX = 300;
      const upperLimitZ = 800;

      const isMobile = this.sizes.width <= 425;

      const normalizedDifference =
        (difference.x < 0
          ? Math.max(-213, difference.x)
          : Math.min(difference.x, 213)) / 213;

      const intensityZIncludingMobile = isMobile
        ? upperLimitZ * normalizedDifference
        : upperLimitZ;

      const intensityX =
        (difference.y < upperLimitX ? difference.y : upperLimitX) / upperLimitX;
      const intensityZ = isMobile
        ? -intensityZIncludingMobile
        : Math.abs(difference.x) < Math.abs(upperLimitZ)
        ? -difference.x
        : upperLimitZ;
      this.world?.bowl?.launch(5500 + 1000 * intensityX, intensityZ);
    }
    this.reset();
  }

  calculateScore() {
    if (!this.world?.pins || !this.scoreboard) return;
    const standingPins = this.world?.pins?.getStandingPins();
    this.score = 10 - standingPins;
    this.remainingMove -= 1;

    if (
      this.score != 10 &&
      this.world.bowl &&
      this.resetBtn &&
      this.remainingMove !== 0
    ) {
      this.world.bowl.resetBallPosition();
      this.world.bowl.ballDetected = false;
      this.resetBtn.className = this.resetBtn.className.replace(
        "block",
        "hidden"
      );
      return;
    }

    console.log(`The score is: ${this.score}`);

    this.resetAlley();
    this.remainingMove = 2;
    this.scoreboard.innerHTML = `Score: ${this.score}`;
  }

  resize() {
    this.camera?.resize();
    this.renderer?.resize();
  }

  reset() {
    this.world?.bowl?.reset();
    this.raycaster?.reset();
  }

  resetAlley() {
    if (
      !this.world?.pins ||
      !this.world.bowl ||
      !this.resetBtn ||
      !this.scoreboard
    )
      return;
    this.world.pins.resetPinsPosition();
    this.world.bowl.resetBallPosition();
    this.world.bowl.ballDetected = false;
    this.resetBtn.className = this.resetBtn.className.replace(
      "block",
      "hidden"
    );
    this.scoreboard.innerHTML = `Score: 0`;
  }

  showResetButton() {
    const isDisplayNone = this.resetBtn?.className.includes("hidden");
    if (this.world?.bowl?.ballDetected && this.resetBtn && isDisplayNone) {
      this.resetBtn.className = this.resetBtn.className.replace(
        "hidden",
        "block"
      );
      setTimeout(() => {
        this.calculateScore();
      }, 2000);
    }
  }

  update() {
    this.physicsWorld?.update();
    this.raycaster?.update();
    this.world?.update();
    this.showResetButton();
    this.camera?.update();
    this.renderer?.update();
  }
}

export default Experience;
