import Experience from "..";
import * as THREE from "three";
import Resources from "../Utils/Resources";

export default class Environment {
  experience: Experience | null = null;
  scene?: THREE.Scene;
  resources?: Resources;
  environmentMap?: {
    texture: THREE.Texture;
  };
  environmentMapIntensity = 0.4;

  constructor() {
    this.experience = new Experience(null);
    this.scene = this.experience.scene;
    this.resources = this.experience.resources;

    this.setAmbientLight();
    this.setDirectionalLight();
    this.setEnviromentMap();
  }

  setAmbientLight() {
    const ambientLight = new THREE.AmbientLight();
    this.scene?.add(ambientLight);
  }

  setDirectionalLight() {
    const directionalLight = new THREE.DirectionalLight("#ffffff", 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.camera.far = 20;
    directionalLight.shadow.mapSize.set(1024, 1024);
    directionalLight.shadow.normalBias = 0.1;
    directionalLight.position.set(-8, 2, 0.25);
    this.scene?.add(directionalLight);

    directionalLight.target.position.set(0, 0, 0);
    directionalLight.target.updateWorldMatrix(false, false);
  }

  setEnviromentMap() {
    if (!this.resources || !this.scene) return;
    this.environmentMap = {
      texture: this.resources.items.environmentMapTexture as THREE.Texture,
    };

    this.scene.background = this.environmentMap.texture;
    this.scene.environment = this.environmentMap.texture;

    this.scene.traverse((child) => {
      if (
        child instanceof THREE.Mesh &&
        child.material instanceof THREE.MeshStandardMaterial
      ) {
        child.material.envMap = this.environmentMap?.texture ?? null;
        child.material.envMapIntensity = this.environmentMapIntensity;
        child.material.needsUpdate = true;
      }
    });
  }
}
