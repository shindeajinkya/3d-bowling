import * as THREE from "three";
import Experience from ".";
import Sizes from "./Utils/Sizes";
import Camera from "./Camera";

class Renderer {
  experience: Experience | null = null;
  canvas: HTMLCanvasElement | null = null;
  sizes: Sizes | null = null;
  scene?: THREE.Scene;
  instance?: THREE.WebGL1Renderer;
  camera?: Camera;

  constructor() {
    this.experience = new Experience(null);
    this.canvas = this.experience.canvas;
    this.sizes = this.experience.sizes;
    this.scene = this.experience.scene;
    this.camera = this.experience.camera;

    this.setInstance();
  }

  setInstance() {
    if (!this.canvas || !this.sizes) return;
    this.instance = new THREE.WebGL1Renderer({
      antialias: true,
      canvas: this.canvas,
    });
    this.instance.useLegacyLights = false;
    this.instance.toneMapping = THREE.CineonToneMapping;
    this.instance.toneMappingExposure = 1.75;
    this.instance.shadowMap.enabled = true;
    this.instance.shadowMap.type = THREE.PCFSoftShadowMap;
    this.instance.setClearColor("#211d20");
    this.instance.setSize(this.sizes?.width, this.sizes?.height);
    this.instance.setPixelRatio(this.sizes.pixelRatio);
  }

  //   call on window resize
  resize() {
    if (!this.sizes) return;
    this.instance?.setSize(this.sizes?.width, this.sizes?.height);
    this.instance?.setPixelRatio(this.sizes.pixelRatio);
  }

  //   update function for animation
  update() {
    if (!this.camera?.instance || !this.scene) return;
    this.instance?.render(this.scene, this.camera.instance);
  }
}

export default Renderer;
