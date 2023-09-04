import * as THREE from "three";
import * as CANNON from "cannon-es";
import Experience from "..";
import PhysicsWorld from "./PhysicsWorld";

interface Dimensions {
  width: number;
  height: number;
  depth: number;
}

interface DataToUpdate {
  body: CANNON.Body;
  mesh: THREE.Mesh;
}

export default class Walls {
  experience: Experience | null = null;
  scene?: THREE.Scene;
  material = new THREE.MeshStandardMaterial();
  physicsWorld?: PhysicsWorld;
  objectsToUpdate: DataToUpdate[] = [];

  constructor() {
    this.experience = new Experience(null);
    this.scene = this.experience.scene;
    this.physicsWorld = this.experience.physicsWorld;

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
    const physicsBody = this.createPhysicsBody(
      dimensions,
      position,
      shouldRotateY
    );
    wall.castShadow = true;
    wall.position.set(x, y, z);
    if (shouldRotateY) {
      wall.rotation.y = -Math.PI * 0.5;
    }
    this.scene?.add(wall);
    this.objectsToUpdate.push({
      mesh: wall,
      body: physicsBody,
    });
  }

  createPhysicsBody(
    dimensions: Dimensions,
    position: THREE.Vector3,
    shouldRotateY = false
  ): CANNON.Body {
    const { width, height, depth } = dimensions;
    const { x, y, z } = position;

    const shape = new CANNON.Box(
      new CANNON.Vec3(width * 0.5, height * 0.5, depth * 0.5)
    );

    const body = new CANNON.Body({
      mass: 10000,
      position: new CANNON.Vec3(x, y, z),
      shape,
      material: this.physicsWorld?.defaultMaterial,
    });

    if (shouldRotateY) {
      body.quaternion.setFromAxisAngle(
        new CANNON.Vec3(0, -1, 0),
        Math.PI * 0.5
      );
    }

    this.physicsWorld?.instance?.addBody(body);
    return body;
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

  update() {
    for (const object of this.objectsToUpdate) {
      object.mesh.quaternion.copy(object.body.quaternion as any);
      object.mesh.position.copy(object.body.position as any);
    }
  }
}
