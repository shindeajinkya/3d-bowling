import Experience from "..";
import * as THREE from "three";

export default class Environment {
  experience: Experience | null = null;
  scene?: THREE.Scene;

  constructor() {
    this.experience = new Experience(null);
    this.scene = this.experience.scene;

    this.setAmbientLight();
    this.setDirectionalLight();
  }

  setAmbientLight() {
    const ambientLight = new THREE.AmbientLight();
    this.scene?.add(ambientLight);
  }

  setDirectionalLight() {
    const directionalLight = new THREE.DirectionalLight("#ffffff", 3);
    directionalLight.castShadow = true;
    directionalLight.shadow.camera.far = 20;
    directionalLight.shadow.mapSize.set(1024, 1024);
    directionalLight.shadow.normalBias = 0.1;
    directionalLight.position.set(-8, 2, 0.25);
    this.scene?.add(directionalLight);

    directionalLight.target.position.set(0, 0, 0);
    directionalLight.target.updateWorldMatrix(false, false);
  }
}
