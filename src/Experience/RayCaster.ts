import * as THREE from "three";
import Experience from ".";
import Sizes from "./Utils/Sizes";
import Camera from "./Camera";
import { isTouchDevice } from "../utils";
import { EventEmitter } from "./Utils/EventEmitter";

const isTouch = isTouchDevice();

export default class RayCaster extends EventEmitter {
  experience: Experience | null = null;
  sizes: Sizes | null = null;
  instance?: THREE.Raycaster;
  mouse?: THREE.Vector2;
  camera?: Camera;
  dragStart = new THREE.Vector2();
  dragEnd = new THREE.Vector2();

  constructor() {
    super();

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

    window.addEventListener("mousedown", (event) => {
      if (!isTouch) {
        this.dragStart.set(event.clientX, event.clientY);
        this.trigger("mousedown");
      }
    });

    window.addEventListener("touchstart", (event) => {
      if (!this.sizes || !this.camera?.instance) return;
      const touchStart = event.changedTouches[0];
      this.dragStart.set(touchStart.clientX, touchStart.clientY);
      const pointer = new THREE.Vector2(
        (touchStart.clientX / this.sizes.width) * 2 - 1,
        -(touchStart.clientY / this.sizes.height) * 2 + 1
      );
      this.instance?.setFromCamera(pointer, this.camera?.instance);
      this.trigger("touchstart");
    });

    window.addEventListener("touchend", (event) => {
      const touchEnd = event.changedTouches[0];
      this.dragEnd.set(touchEnd.clientX, touchEnd.clientY);
      this.trigger("touchend");
    });

    window?.addEventListener("mouseup", (event) => {
      const isTouch = isTouchDevice();
      if (!isTouch) {
        this.dragEnd.set(event.clientX, event.clientY);
        this.trigger("mouseup");
      }
    });
  }

  update() {
    const isTouch = isTouchDevice();
    if (!this.mouse || !this.camera?.instance || isTouch) return;
    this.instance?.setFromCamera(this.mouse, this.camera.instance);
  }

  reset() {
    this.dragStart.set(0, 0);
    this.dragEnd.set(0, 0);
  }
}
