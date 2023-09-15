import * as THREE from "three";
import * as CANNON from "cannon-es";
import { GLTF } from "three/examples/jsm/loaders/GLTFLoader.js";
import Experience from "..";
import Resources from "../Utils/Resources";
import PhysicsWorld from "./PhysicsWorld";
import RayCaster from "../RayCaster";

interface DataToUpdate {
  body: CANNON.Body;
  mesh: THREE.Group;
  model: THREE.Group;
}

export default class Pins {
  experience: Experience | null = null;
  scene?: THREE.Scene;
  resources?: Resources;
  resource?: GLTF;
  bottomCylinderDimensions = {
    topRadius: 0.08,
    bottomRadius: 0.06,
    height: 0.15,
  };

  middleCylinderDimensions = {
    topRadius: 0.04,
    bottomRadius: 0.08,
    height: 0.15,
  };

  topCylinderDimensions = {
    topRadius: 0.05,
    bottomRadius: 0.04,
    height: 0.23,
  };
  physicsWorld?: PhysicsWorld;
  pinsToUpdate: DataToUpdate[] = [];
  pinsInitialPositions: THREE.Vector3[] = [];
  scoreTracker: RayCaster[] = [];
  pinsArrangedByRow: THREE.Group[][] = [];
  hitSound = new Audio("/sounds/hit.mp3");

  constructor() {
    this.experience = new Experience(null);
    this.scene = this.experience.scene;
    this.resources = this.experience.resources;
    this.physicsWorld = this.experience.physicsWorld;

    // Setup
    this.resource = this.resources?.items.pinModel as GLTF;
    this.resource.scene.scale.set(0.014, 0.014, 0.014);

    this.plotPins();
  }

  createPin(x: number, z: number, index: number) {
    if (!this.resource) return;
    const clonedScene = this.resource.scene.clone();
    clonedScene.position.x = x;
    // remove y once physics in implmented
    // clonedScene.position.y = 0.217;
    clonedScene.position.z = z;

    clonedScene.traverse((child) => {
      if (
        child instanceof THREE.Mesh &&
        child.material instanceof THREE.MeshStandardMaterial
      ) {
        child.material.needsUpdate = true;
        child.castShadow = true;
      }
    });
    const mesh = this.createGeometryForPin(x, z);
    const body = this.createPhysicsBodyForPin(x, z);
    this.pinsInitialPositions.push(
      new THREE.Vector3(body.position.x, body.position.y, body.position.z)
    );
    this.scene?.add(clonedScene);
    if (this.pinsArrangedByRow[index]) {
      this.pinsArrangedByRow[index].push(mesh);
    } else [(this.pinsArrangedByRow[index] = [mesh])];
    this.pinsToUpdate.push({
      model: clonedScene,
      mesh,
      body,
    });
  }

  // Creating geometry to replicate position of the
  createGeometryForPin(x: number, z: number): THREE.Group {
    const material = new THREE.MeshStandardMaterial({
      wireframe: true,
    });

    // Bottom Cylinder
    const bottomCylinderGeometry = new THREE.CylinderGeometry(
      this.bottomCylinderDimensions.topRadius,
      this.bottomCylinderDimensions.bottomRadius,
      this.bottomCylinderDimensions.height
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
      this.middleCylinderDimensions.topRadius,
      this.middleCylinderDimensions.bottomRadius,
      this.middleCylinderDimensions.height
    );

    const middleCylinder = new THREE.Mesh(middleCylinderGeometry, material);
    middleCylinder.position.x = x;
    middleCylinder.position.y = 0.225;
    middleCylinder.position.z = z;

    // Top Cylinder
    const topCylinderGeometry = new THREE.CylinderGeometry(
      this.topCylinderDimensions.topRadius,
      this.topCylinderDimensions.bottomRadius,
      this.topCylinderDimensions.height
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
    return bottleMesh;
  }

  createPhysicsBodyForPin(x: number, z: number): CANNON.Body {
    // Shapes
    const bottomCylinderShape = new CANNON.Cylinder(
      this.bottomCylinderDimensions.topRadius,
      this.bottomCylinderDimensions.bottomRadius,
      this.bottomCylinderDimensions.height
    );
    const sphereShape = new CANNON.Sphere(0.08);
    const middleCylinderShape = new CANNON.Cylinder(
      this.middleCylinderDimensions.topRadius,
      this.middleCylinderDimensions.bottomRadius,
      this.middleCylinderDimensions.height
    );
    const topCylinderShape = new CANNON.Cylinder(
      this.topCylinderDimensions.topRadius,
      this.topCylinderDimensions.bottomRadius,
      this.topCylinderDimensions.height
    );

    // Body

    const pinBody = new CANNON.Body({
      mass: 1.6,
      material: this.physicsWorld?.pinMaterial,
    });

    // Setting position
    pinBody.position.set(x, 0.076, z);
    pinBody.addShape(bottomCylinderShape, new CANNON.Vec3(0, 0, 0));
    pinBody.addShape(sphereShape, new CANNON.Vec3(0, 0.075, 0));
    pinBody.addShape(middleCylinderShape, new CANNON.Vec3(0, 0.15, 0));
    pinBody.addShape(topCylinderShape, new CANNON.Vec3(0, 0.34, 0));

    pinBody.addEventListener("collide", (collision: any) => {
      const impactStrength = collision.contact.getImpactVelocityAlongNormal();

      if (impactStrength > 1.5) {
        this.hitSound.volume =
          (impactStrength * Math.random()) / impactStrength;
        this.hitSound.currentTime = 0;
        this.hitSound.play();
      }
    });

    // update centre of mass
    this.updateCOM(pinBody);
    pinBody.sleep();
    this.physicsWorld?.instance?.addBody(pinBody);

    return pinBody;
  }

  plotScoreTracker(x: number) {
    const tracker = new RayCaster();
    if (!tracker.instance) return;

    const rayOrigin = new THREE.Vector3(x, 0.45, -1.5);
    const rayDirection = new THREE.Vector3(0, 0, 10);
    rayDirection.normalize();

    tracker.instance.set(rayOrigin, rayDirection);
    tracker.instance.far = 3;

    const arrowHelper = new THREE.ArrowHelper(
      rayDirection,
      rayOrigin,
      tracker?.instance?.far,
      new THREE.Color("cyan")
    );
    arrowHelper.visible = false;
    this.scene?.add(arrowHelper);

    this.scoreTracker.push(tracker);
  }

  getStandingPins(): number {
    let num = 0;
    const standingPinsId: number[] = [];

    for (let i = 0; i < this.scoreTracker.length; i++) {
      const pinsIntersect = this.scoreTracker[i].instance?.intersectObjects(
        this.pinsArrangedByRow[i]
      );
      standingPinsId.push(
        ...(pinsIntersect?.map((pin) => pin.object.parent?.id ?? 0) ?? [])
      );
      num += pinsIntersect?.length ?? 0;
    }

    this.pinsToUpdate
      .filter((pin) => !standingPinsId.includes(pin.mesh.id))
      .forEach((pin) => {
        pin.model.visible = false;
        this.physicsWorld?.instance?.removeBody(pin.body);
      });
    return num;
  }

  plotPins() {
    let currentPosition = 0;
    for (let i = 0; i < 4; i++) {
      let positionZ = -(i * 0.5);
      for (let j = 0; j <= i; j++) {
        this.createPin(currentPosition * 0.5, positionZ * 0.5, i);
        positionZ++;
      }
      this.plotScoreTracker(currentPosition * 0.5);
      currentPosition++;
    }
  }

  update() {
    for (const pin of this.pinsToUpdate) {
      pin.mesh.children.forEach((child: THREE.Object3D, index: number) => {
        child.quaternion.copy(pin.body.shapeOrientations[index] as any);
        child.position.copy(pin.body.shapeOffsets[index] as any);
      });
      pin.mesh?.quaternion.copy(pin.body.quaternion as any);
      pin.mesh?.position.copy(pin.body.position as any);

      pin.model?.quaternion.copy(pin.body.quaternion as any);
      pin.model?.position.copy(pin.body.position as any);
    }
  }

  resetPinsPosition() {
    for (let i = 0; i < this.pinsToUpdate.length; i++) {
      this.pinsToUpdate[i].body.position.copy(
        this.pinsInitialPositions[i] as any
      );
      this.pinsToUpdate[i].body.quaternion.set(0, 0, 0, 1);
      this.pinsToUpdate[i].body.mass = 1.6;
      this.pinsToUpdate[i].body.sleep();

      this.physicsWorld?.instance?.addBody(this.pinsToUpdate[i].body);

      this.pinsToUpdate[i].model.visible = true;
    }
  }

  updateCOM(body: CANNON.Body) {
    //first calculate the center of mass
    // NOTE: this method assumes all the shapes are voxels of equal mass.
    // If you're not using voxels, you'll need to calculate the COM a different way.
    var com = new CANNON.Vec3();
    body.shapeOffsets.forEach(function (offset) {
      com.vadd(offset, com);
    });
    com.scale(1 / body.shapes.length, com);

    //move the shapes so the body origin is at the COM
    body.shapeOffsets.forEach(function (offset) {
      offset.vsub(com, offset);
    });

    //now move the body so the shapes' net displacement is 0
    var worldCOM = new CANNON.Vec3();
    body.vectorToWorldFrame(com, worldCOM);
    body.position.vadd(worldCOM, body.position);

    body.shapeOffsets.forEach(function (offset) {
      com.vadd(offset, com);
    });
    com.scale(1 / body.shapes.length, com);
  }
}
