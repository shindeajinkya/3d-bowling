import * as THREE from "three";
import Experience from "..";
import Resources from "../Utils/Resources";
import Floor from "./Floor";
import Environment from "./Environment";
import Walls from "./Walls";
import Pins from "./Pins";
import Bowl from "./Bowl";
import Camera from "../Camera";

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

  constructor() {
    this.experience = new Experience(null);
    this.scene = this.experience.scene;
    this.resources = this.experience.resources;
    this.camera = this.experience.camera;

    if (!this.resources) return;
    // load meshes after resources are ready
    this.resources.on("ready", () => {
      this.floor = new Floor();
      this.walls = new Walls();
      this.pins = new Pins();
      this.bowl = new Bowl();
      this.environment = new Environment();
    });
  }

  update() {
    // this.walls?.update();
    this.pins?.update();
    this.bowl?.update();

    if (!this.bowl?.mesh || !this.camera?.instance) return;

    this.camera.instance.position.x =
      this.bowl?.mesh?.position.x < 0 ? this.bowl?.mesh?.position.x - 2 : -2;
  }
}
