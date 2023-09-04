import * as THREE from "three";
import Experience from ".";
import Sizes from "./Utils/Sizes";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

export default class Camera {
  experience: Experience | null = null;
  canvas: HTMLCanvasElement | null = null;
  sizes: Sizes | null = null;
  scene?: THREE.Scene;
  instance?: THREE.PerspectiveCamera;
  controls?: OrbitControls;

  constructor() {
    this.experience = new Experience(null);
    this.sizes = this.experience.sizes;
    this.scene = this.experience.scene;
    this.canvas = this.experience.canvas;

    this.setInstance();
    this.setOrbitControls();
  }

  setInstance() {
    if (!this.sizes || !this.scene) return;
    this.instance = new THREE.PerspectiveCamera(
      35,
      this.sizes?.width / this.sizes?.height,
      0.1,
      100
    );
    this.instance.position.set(-8, 1, 0);
    this.scene.add(this.instance);
  }

  setOrbitControls() {
    if (!this.instance || !this.canvas) return;
    this.controls = new OrbitControls(this.instance, this.canvas);
    this.controls.enabled = false;
    this.controls.enableDamping = true;
  }

  resize() {
    if (!this.sizes || !this.instance) return;
    this.instance.aspect = this.sizes?.width / this.sizes?.height;
    this.instance.updateProjectionMatrix();
  }

  update() {
    if (!this.controls) return;
    // this.controls.update();
  }
}
