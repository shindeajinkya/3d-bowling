import * as THREE from "three";
import * as CANNON from "cannon-es";
import Experience from "..";
import Resources from "../Utils/Resources";
import PhysicsWorld from "./PhysicsWorld";

export default class Floor {
  experience: Experience | null = null;
  scene?: THREE.Scene;
  resources?: Resources;
  geometry?: THREE.PlaneGeometry;
  material?: THREE.MeshStandardMaterial;
  mesh?: THREE.Mesh;
  textures: Record<string, THREE.Texture> = {};
  physicsWorld?: PhysicsWorld;
  physicsBody?: CANNON.Body;

  constructor() {
    this.experience = new Experience(null);
    this.scene = this.experience.scene;
    this.resources = this.experience.resources;
    this.physicsWorld = this.experience.physicsWorld;

    this.setGeometry();
    this.setTexture();
    this.setMaterial();
    this.setMesh();
    this.setPhysicsBody();
  }

  setGeometry() {
    this.geometry = new THREE.PlaneGeometry(15, 2.5);
  }

  setTexture() {
    if (!this.resources) return;
    this.textures.normal = this.resources.items
      .floorNormalTexture as THREE.Texture;
    this.textures.normal.repeat.set(1.5, 1.5);
    this.textures.normal.wrapS = THREE.RepeatWrapping;
    this.textures.normal.wrapT = THREE.RepeatWrapping;

    this.textures.roughness = this.resources.items
      .floorRoughnessTexture as THREE.Texture;
    this.textures.roughness.repeat.set(1.5, 1.5);
    this.textures.roughness.wrapS = THREE.RepeatWrapping;
    this.textures.roughness.wrapT = THREE.RepeatWrapping;

    this.textures.displacement = this.resources.items
      .floorDisplacementTexture as THREE.Texture;
    // this.textures.displacement.repeat.set(1.5, 1.5);
    // this.textures.displacement.wrapS = THREE.RepeatWrapping;
    // this.textures.displacement.wrapT = THREE.RepeatWrapping;

    this.textures.color = this.resources.items
      .floorColorTexture as THREE.Texture;
    this.textures.color.colorSpace = THREE.SRGBColorSpace;
    this.textures.color.repeat.set(1.5, 1.5);
    this.textures.color.wrapS = THREE.RepeatWrapping;
    this.textures.color.wrapT = THREE.RepeatWrapping;
  }

  setMaterial() {
    this.material = new THREE.MeshStandardMaterial({
      map: this.textures.color,
      displacementMap: this.textures.displacement,
      normalMap: this.textures.normal,
      roughnessMap: this.textures.roughness,
      displacementScale: 0,
    });
  }

  setMesh() {
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.mesh.rotation.x = -Math.PI * 0.5;
    this.mesh.receiveShadow = true;
    // TODO will have to copy physics body position to this mesh
    this.scene?.add(this.mesh);
  }

  setPhysicsBody() {
    const floorShape = new CANNON.Plane();
    this.physicsBody = new CANNON.Body();

    this.physicsBody.mass = 0;
    this.physicsBody.addShape(floorShape);
    this.physicsBody.quaternion.setFromAxisAngle(
      new CANNON.Vec3(-1, 0, 0),
      Math.PI * 0.5
    );
    this.physicsWorld?.instance?.addBody(this.physicsBody);
    this.mesh?.position.copy(this.physicsBody.position as any);
  }
}
