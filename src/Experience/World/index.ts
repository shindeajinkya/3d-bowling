import * as THREE from "three";
import Experience from "..";

export default class World {
  experience: Experience | null = null;
  scene?: THREE.Scene;

  constructor() {
    this.experience = new Experience(null);
    this.scene = this.experience.scene;

    // Test cube
    const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
    const cubeMaterial = new THREE.MeshBasicMaterial();

    const cubeMesh = new THREE.Mesh(cubeGeometry, cubeMaterial);

    this.scene.add(cubeMesh);
  }
}
