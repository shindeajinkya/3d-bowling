import * as THREE from "three";
import Experience from "..";
import Resources from "../Utils/Resources";
import Floor from "./Floor";
import Environment from "./Environment";
import Walls from "./Walls";
import Pins from "./Pins";
import Bowl from "./Bowl";
import Camera from "../Camera";
import Time from "../Utils/Time";
import { loaderTexture } from "../../utils/loader";

export default class World {
  experience: Experience | null = null;
  scene?: THREE.Scene;
  resources?: Resources;
  floor?: Floor;
  environment?: Environment;
  walls?: Walls;
  pins?: Pins;
  bowl?: Bowl;
  camera?: Camera;
  time?: Time;
  loader?: THREE.Mesh;

  constructor() {
    this.experience = new Experience(null);
    this.scene = this.experience.scene;
    this.resources = this.experience.resources;
    this.camera = this.experience.camera;
    this.time = this.experience.time;

    this.setupLoader();

    if (!this.resources) return;
    // load meshes after resources are ready
    this.resources.on("ready", () => {
      if (this.loader) {
        this.loader.visible = false;
      }
      this.floor = new Floor();
      this.walls = new Walls();
      this.pins = new Pins();
      this.bowl = new Bowl();
      this.environment = new Environment();
    });
  }

  setupLoader() {
    const geometry = new THREE.BoxGeometry(2, 2, 2);

    const image = new Image();
    image.src = loaderTexture;

    const texture = new THREE.Texture(image);
    texture.magFilter = THREE.NearestFilter;
    texture.minFilter = THREE.LinearFilter;
    texture.needsUpdate = true;

    const material = new THREE.MeshBasicMaterial({
      map: texture,
    });

    const mesh = new THREE.Mesh(geometry, material);

    this.loader = mesh;
    this.scene?.add(mesh);
  }

  updateLoader() {
    if (!this.loader) return;
    this.loader.rotation.y += Math.cos(Math.PI) * 0.01;
    this.loader.position.y = Math.sin(this.time?.elapsed ?? 0) * 1.5;
  }

  update() {
    // this.walls?.update();
    this.updateLoader();
    this.pins?.update();
    this.bowl?.update();

    if (!this.bowl?.mesh || !this.camera?.instance) return;

    this.camera.instance.position.x =
      this.bowl?.mesh?.position.x < 0 ? this.bowl?.mesh?.position.x - 2 : -2;
  }
}
