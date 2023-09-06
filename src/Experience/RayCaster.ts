import * as THREE from "three";
import Experience from ".";
import Sizes from "./Utils/Sizes";
import Camera from "./Camera";
import { isTouchDevice } from "../utils";

export default class RayCaster {
  experience: Experience | null = null;
  sizes: Sizes | null = null;
  instance?: THREE.Raycaster;
  mouse?: THREE.Vector2;
  camera?: Camera;

  constructor() {
    this.experience = new Experience(null);
    this.sizes = this.experience.sizes;
    this.camera = this.experience.camera;
    this.instance = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();

    window.addEventListener("mousemove", (event) => {
      const isTouch = isTouchDevice();
      if (!this.mouse || !this.sizes || isTouch) return;
      this.mouse.x = (event.clientX / this.sizes?.width) * 2 - 1;
      this.mouse.y = -(event.clientY / this.sizes.height) * 2 + 1;
    });
  }

  update() {
    const isTouch = isTouchDevice();
    if (!this.mouse || !this.camera?.instance || isTouch) return;
    this.instance?.setFromCamera(this.mouse, this.camera.instance);
  }
}
