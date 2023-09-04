import * as THREE from "three";
import * as CANNON from "cannon-es";
import { GLTF } from "three/examples/jsm/loaders/GLTFLoader.js";
import Experience from "..";
import Resources from "../Utils/Resources";
import PhysicsWorld from "./PhysicsWorld";
import Camera from "../Camera";

export default class Bowl {
  experience: Experience | null = null;
  scene?: THREE.Scene;
  resources?: Resources;
  resource?: GLTF;
  physicsWorld?: PhysicsWorld;
  physicsBody?: CANNON.Body;
  mesh?: THREE.Mesh;

  constructor() {
    this.experience = new Experience(null);
    this.scene = this.experience.scene;
    this.resources = this.experience.resources;
    this.physicsWorld = this.experience.physicsWorld;

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
    this.mesh = new THREE.Mesh(sphereGeometry, sphereMaterial);
    this.createSpherePhysics();
    this.mesh.visible = false;
    this.mesh.position.set(-6.5, 0.2, 0);

    this.scene?.add(this.resource.scene);
    this.scene?.add(this.mesh);
  }

  createSpherePhysics() {
    const shape = new CANNON.Sphere(0.2);
    this.physicsBody = new CANNON.Body({
      mass: 10,
      position: new CANNON.Vec3(-6.5, 0.2, 0),
      shape,
      material: this.physicsWorld?.defaultMaterial,
    });
    this.physicsWorld?.instance?.addBody(this.physicsBody);
    this.physicsBody.applyLocalForce(
      new CANNON.Vec3(4000, 0, 0),
      new CANNON.Vec3(0, 0, 0)
    );
  }

  update() {
    this.mesh?.quaternion.copy(this.physicsBody?.quaternion as any);
    this.mesh?.position.copy(this.physicsBody?.position as any);
    this.resource?.scene?.quaternion.copy(this.physicsBody?.quaternion as any);
    this.resource?.scene?.position.copy(this.physicsBody?.position as any);
  }
}
