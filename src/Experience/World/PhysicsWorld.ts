import * as CANNON from "cannon-es";
import Experience from "..";
import Time from "../Utils/Time";

export default class PhysicsWorld {
  experience: Experience | null = null;
  time?: Time;
  instance?: CANNON.World;
  defaultMaterial?: CANNON.Material;
  defaultContactMaterial?: CANNON.ContactMaterial;

  constructor() {
    this.experience = new Experience(null);
    this.time = this.experience.time;

    // Setup
    this.instance = new CANNON.World();
    this.instance.broadphase = new CANNON.SAPBroadphase(this.instance);
    this.instance.allowSleep = true;
    this.instance.gravity.set(0, -9.82, 0);

    this.setMaterials();
  }

  setMaterials() {
    if (!this.instance) return;
    this.defaultMaterial = new CANNON.Material("default");
    this.defaultContactMaterial = new CANNON.ContactMaterial(
      this.defaultMaterial,
      this.defaultMaterial,
      {
        friction: 0.1,
        restitution: 0.7,
      }
    );
    this.instance.addContactMaterial(this.defaultContactMaterial);
    this.instance.defaultContactMaterial = this.defaultContactMaterial;
  }

  update() {
    if (!this.time) return;
    this.instance?.step(1 / 60, this.time.delta, 3);
  }
}
