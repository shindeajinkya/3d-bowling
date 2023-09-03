import * as THREE from "three";
import { GLTF } from "three/examples/jsm/loaders/GLTFLoader.js";
import Experience from "..";
import Resources from "../Utils/Resources";

export default class Pins {
  experience: Experience | null = null;
  scene?: THREE.Scene;
  resources?: Resources;
  resource?: GLTF;
  //   model?:

  constructor() {
    this.experience = new Experience(null);
    this.scene = this.experience.scene;
    this.resources = this.experience.resources;

    // Setup
    this.resource = this.resources?.items.pinModel as GLTF;
    this.resource.scene.scale.set(0.014, 0.014, 0.014);

    this.plotPins();
  }

  createPin(x: number, z: number) {
    if (!this.resource) return;
    const clonedScene = this.resource.scene.clone();
    clonedScene.position.x = x;
    // remove y once physics in implmented
    clonedScene.position.y = 0.217;
    clonedScene.position.z = z;
    this.createGeometryForPin(x, z);
    this.scene?.add(clonedScene);
  }

  // Creating geometry to replicate position of the
  createGeometryForPin(x: number, z: number) {
    const bottomCylinderDimensions = {
      topRadius: 0.08,
      bottomRadius: 0.06,
      height: 0.15,
    };

    const middleCylinderDimensions = {
      topRadius: 0.04,
      bottomRadius: 0.08,
      height: 0.15,
    };

    const topCylinderDimensions = {
      topRadius: 0.05,
      bottomRadius: 0.04,
      height: 0.23,
    };

    const material = new THREE.MeshStandardMaterial({
      wireframe: true,
    });

    // Bottom Cylinder
    const bottomCylinderGeometry = new THREE.CylinderGeometry(
      bottomCylinderDimensions.topRadius,
      bottomCylinderDimensions.bottomRadius,
      bottomCylinderDimensions.height
    );

    const bottomCylinder = new THREE.Mesh(bottomCylinderGeometry, material);
    bottomCylinder.position.x = x;
    bottomCylinder.position.y = 0.075;
    bottomCylinder.position.z = z;

    // Sphere
    const sphereGeometry = new THREE.SphereGeometry(0.08, 10, 10);
    const sphereMesh = new THREE.Mesh(sphereGeometry, material);
    sphereMesh.position.x = x;
    sphereMesh.position.y = 0.15;
    sphereMesh.position.z = z;

    // middle cylinder
    const middleCylinderGeometry = new THREE.CylinderGeometry(
      middleCylinderDimensions.topRadius,
      middleCylinderDimensions.bottomRadius,
      middleCylinderDimensions.height
    );

    const middleCylinder = new THREE.Mesh(middleCylinderGeometry, material);
    middleCylinder.position.x = x;
    middleCylinder.position.y = 0.225;
    middleCylinder.position.z = z;

    // Top Cylinder
    const topCylinderGeometry = new THREE.CylinderGeometry(
      topCylinderDimensions.topRadius,
      topCylinderDimensions.bottomRadius,
      topCylinderDimensions.height
    );
    const topCylinder = new THREE.Mesh(topCylinderGeometry, material);
    topCylinder.position.x = x;
    topCylinder.position.y = 0.34;
    topCylinder.position.z = z;

    // Bottle Mesh Group
    const bottleMesh = new THREE.Group();
    bottleMesh.add(bottomCylinder);
    bottleMesh.add(sphereMesh);
    bottleMesh.add(middleCylinder);
    bottleMesh.add(topCylinder);
    bottleMesh.visible = false;

    this.scene?.add(bottleMesh);
  }

  plotPins() {
    let currentPosition = 0;
    for (let i = 0; i < 4; i++) {
      let positionZ = -(i * 0.5);
      for (let j = 0; j <= i; j++) {
        this.createPin(currentPosition * 0.5, positionZ * 0.5);
        positionZ++;
      }
      currentPosition++;
    }
  }
}
