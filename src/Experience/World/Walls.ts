import * as THREE from "three";
import Experience from "..";

interface Dimensions {
  width: number;
  height: number;
  depth: number;
}

export default class Walls {
  experience: Experience | null = null;
  scene?: THREE.Scene;
  material = new THREE.MeshStandardMaterial();

  constructor() {
    this.experience = new Experience(null);
    this.scene = this.experience.scene;

    this.setWalls();
  }

  getGeomtryWithDimensions(dimensions: Dimensions): THREE.BoxGeometry {
    const { width, height, depth } = dimensions;
    const geometry = new THREE.BoxGeometry(width, height, depth);
    return geometry;
  }

  addWall(
    dimensions: Dimensions,
    position: THREE.Vector3,
    shouldRotateY = false
  ) {
    const { x, y, z } = position;
    const wall = new THREE.Mesh(
      this.getGeomtryWithDimensions(dimensions),
      this.material
    );
    wall.position.set(x, y, z);
    if (shouldRotateY) {
      wall.rotation.y = -Math.PI * 0.5;
    }
    this.scene?.add(wall);
  }

  setWalls() {
    const wallDataSides: Dimensions = {
      width: 0.1,
      height: 0.4,
      depth: 14.9,
    };

    const wallDataFront: Dimensions = {
      width: 0.1,
      height: 0.4,
      depth: 2.4,
    };

    this.addWall(wallDataFront, new THREE.Vector3(-7.5, 0.2, 0));
    this.addWall(wallDataFront, new THREE.Vector3(7.5, 0.2, 0));
    this.addWall(wallDataSides, new THREE.Vector3(0, 0.2, -1.25), true);
    this.addWall(wallDataSides, new THREE.Vector3(0, 0.2, 1.25), true);
  }
}
