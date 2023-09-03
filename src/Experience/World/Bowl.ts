import * as THREE from "three";
import { GLTF } from "three/examples/jsm/loaders/GLTFLoader.js";
import Experience from "..";
import Resources from "../Utils/Resources";

export default class Bowl {
  experience: Experience | null = null;
  scene?: THREE.Scene;
  resources?: Resources;
  resource?: GLTF;

  constructor() {
    this.experience = new Experience(null);
    this.scene = this.experience.scene;
    this.resources = this.experience.resources;

    // Setup
    this.resource = this.resources?.items.bowlModel as GLTF;
    this.resource.scene.scale.set(1.45, 1.45, 1.45);

    this.createSphereWithGeometry();
  }

  createSphereWithGeometry() {
    if (!this.resource) return;
    // createSphere(0.2, new THREE.Vector3(-6.5, 0.2, 0), gltf.scene);
    this.resource.scene.position.y = 0.2;
    this.resource.scene.position.x = -6.5;

    const sphereGeometry = new THREE.SphereGeometry(0.2, 20, 20);
    const sphereMaterial = new THREE.MeshStandardMaterial({
      wireframe: true,
    });
    const sphereMesh = new THREE.Mesh(sphereGeometry, sphereMaterial);
    sphereMesh.visible = false;
    sphereMesh.position.set(-6.5, 0.2, 0);

    this.scene?.add(this.resource.scene);
    this.scene?.add(sphereMesh);
  }
}
