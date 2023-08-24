import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

import * as CANNON from "cannon-es";

interface Dimensions {
  width: number;
  height: number;
  depth: number;
}

// Canvas
const canvas = document.querySelector("canvas.webgl");

if (!canvas) {
  throw new Error("Canvas not found");
}

// Loaders
const gltfLoader = new GLTFLoader();

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

/**
 * Physics
 */
// World
const world = new CANNON.World();
world.broadphase = new CANNON.SAPBroadphase(world);
world.allowSleep = true;
world.gravity.set(0, -9.82, 0);

// Materials
const defaultMaterial = new CANNON.Material("default");

const defaultContactMaterial = new CANNON.ContactMaterial(
  defaultMaterial,
  defaultMaterial,
  {
    friction: 0.1,
    restitution: 0.7,
  }
);

world.addContactMaterial(defaultContactMaterial);
world.defaultContactMaterial = defaultContactMaterial;

// Scene
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  1000
);

//  * Update all materials
//  */
// const updateAllMaterials = () =>
// {
//     scene.traverse((child) =>
//     {
//         // console.log(child);
//         if(child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial)
//         {
//             child.material.needsUpdate = true
//             child.castShadow = true;
//             child.receiveShadow = true;
//         }
//     })
// }

// Test cube
const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const cube = new THREE.Mesh(geometry, material);

cube.position.y = 0.5;

const objectsToUpdate: any[] = [];
const pinsToUpdate: any[] = [];

const sphereGeometry = new THREE.SphereGeometry(1, 20, 20);
const sphereMaterial = new THREE.MeshBasicMaterial({
  //   metalness: 0.2,
  //   roughness: 0.4,
  opacity: 0.0,
});

const createSphere = (
  radius: number,
  position: THREE.Vector3,
  model: THREE.Group
) => {
  // Threejs mesh
  const mesh = new THREE.Mesh(sphereGeometry, sphereMaterial);
  mesh.scale.set(radius, radius, radius);
  mesh.position.copy(position);
  mesh.visible = false;
  scene.add(mesh);

  // Cannon js body
  const shape = new CANNON.Sphere(radius);

  const body = new CANNON.Body({
    mass: 2,
    position: new CANNON.Vec3(0, 0, 0),
    shape,
    material: defaultMaterial,
  });
  body.position.copy(position as any);

  world.addBody(body);
  body.applyLocalForce(new CANNON.Vec3(600, 0, 0), new CANNON.Vec3(0, 0, 0));

  // Save in objectsToUpdate
  objectsToUpdate.push({
    mesh,
    body,
    model,
  });
};

const createPin = (
  model: THREE.Group,
  x: number,
  z: number,
  bottomBoxDimensions: Dimensions,
  topBoxDimensions: Dimensions
) => {
  // Copy and update scene position
  const copiedScene = model.clone(true);
  copiedScene.position.x = x;
  copiedScene.position.z = z;

  /**
   * Geometry
   */
  const boxMaterial = new THREE.MeshStandardMaterial({
    // wireframe: true,
  });

  // bottom box
  const bottomBoxGeometry = new THREE.BoxGeometry(
    bottomBoxDimensions.width,
    bottomBoxDimensions.height,
    bottomBoxDimensions.depth
  );
  const bottomBox = new THREE.Mesh(bottomBoxGeometry, boxMaterial);
  bottomBox.position.x = x;
  bottomBox.position.y = 0.15;
  bottomBox.position.z = 0.15;

  // top box
  const topBoxGeometry = new THREE.BoxGeometry(
    topBoxDimensions.width,
    topBoxDimensions.height,
    topBoxDimensions.depth
  );

  const topBox = new THREE.Mesh(topBoxGeometry, boxMaterial);
  topBox.position.x = x;
  topBox.position.y = 0.4;
  topBox.position.z = z;

  // Bottle Mesh Group
  const bottleMesh = new THREE.Group();
  bottleMesh.add(bottomBox);
  bottleMesh.add(topBox);
  bottleMesh.visible = false;

  /**
   * Physics
   */
  // Shapes
  const bottomBoxShape = new CANNON.Box(
    new CANNON.Vec3(
      bottomBoxDimensions.width * 0.5,
      bottomBoxDimensions.height * 0.5,
      bottomBoxDimensions.depth * 0.5
    )
  );
  const topBoxShape = new CANNON.Box(
    new CANNON.Vec3(
      topBoxDimensions.width * 0.5,
      topBoxDimensions.height * 0.5,
      topBoxDimensions.depth * 0.5
    )
  );

  // Body
  const pinBody = new CANNON.Body({
    mass: 0.01,
    material: defaultMaterial,
  });

  pinBody.position.set(x, 0.16, z);
  pinBody.addShape(bottomBoxShape);
  pinBody.addShape(topBoxShape, new CANNON.Vec3(0, 0.25, 0));

  // adding to scene
  world.addBody(pinBody);
  scene.add(bottleMesh);
  scene.add(copiedScene);

  // updating pinsToUpdate
  pinsToUpdate.push({
    body: pinBody,
    mesh: bottleMesh,
    model: copiedScene,
  });
};

// Load model to the scene
// Pins
gltfLoader.load("/bowling_pin/scene2.gltf", (gltf) => {
  gltf.scene.scale.set(0.014, 0.014, 0.014);
  const clonedScene = gltf.scene.clone();

  clonedScene.traverse((child) => {
    if (
      child instanceof THREE.Mesh &&
      child.material instanceof THREE.MeshStandardMaterial
    ) {
      child.material.needsUpdate = true;
      child.castShadow = true;
    }
  });

  // scene.add(clonedScene);

  const bottomBoxDimensions = {
    width: 0.17,
    height: 0.3,
    depth: 0.17,
  };
  const topBoxDimensions = {
    width: 0.1,
    height: 0.2,
    depth: 0.1,
  };

  // createPin(clonedScene, 0, 0, 0, bottomBoxDimensions, topBoxDimensions);

  let currentPosition = 0;
  for (let i = 0; i < 4; i++) {
    let positionZ = -(i * 0.5);
    for (let j = 0; j <= i; j++) {
      const copiedScene = gltf.scene.clone();
      copiedScene.position.x = currentPosition * 0.2;
      copiedScene.position.z = positionZ * 0.35;
      createPin(
        clonedScene,
        currentPosition * 0.2,
        positionZ * 0.38,
        bottomBoxDimensions,
        topBoxDimensions
      );
      // scene.add(copiedScene);
      positionZ++;
    }
    currentPosition++;
  }
  console.log(pinsToUpdate);
});

// Ball
gltfLoader.load("/bowling_ball/scene.gltf", (gltf) => {
  gltf.scene.scale.set(0.25, 0.25, 0.25);
  gltf.scene.position.y = 1;
  gltf.scene.position.x = -1;
  scene.add(gltf.scene);
  gltf.scene.traverse((child) => {
    if (
      child instanceof THREE.Mesh &&
      child.material instanceof THREE.MeshStandardMaterial
    ) {
      child.material.needsUpdate = true;
      child.castShadow = true;
    }
  });
  createSphere(0.25, new THREE.Vector3(-1, 0.25, 0), gltf.scene);
});

// Floor
const floorShape = new CANNON.Plane();
const floorBody = new CANNON.Body();
floorBody.mass = 0;
floorBody.addShape(floorShape);
floorBody.quaternion.setFromAxisAngle(new CANNON.Vec3(-1, 0, 0), Math.PI * 0.5);
world.addBody(floorBody);

// Adding a plane
const floorGeometry = new THREE.PlaneGeometry(4, 4);
const floorMaterial = new THREE.MeshStandardMaterial();
const floor = new THREE.Mesh(floorGeometry, floorMaterial);

floor.rotation.x = -Math.PI * 0.5;

scene.add(floor);

// Adding walls

function createWall(
  dimensions: {
    width: number;
    height: number;
    depth: number;
  },
  x: number,
  y: number,
  z: number,
  shouldRotateY = false
) {
  // 3d scene mesh
  const wallGeometry = new THREE.BoxGeometry(
    dimensions.width,
    dimensions.height,
    dimensions.depth
  );

  const wallMaterial = new THREE.MeshStandardMaterial();

  const wall = new THREE.Mesh(wallGeometry, wallMaterial);
  wall.castShadow = true;
  wall.position.set(x, y, z);

  scene.add(wall);

  // Physics world body
  const wallShape = new CANNON.Box(
    new CANNON.Vec3(
      dimensions.width * 0.5,
      dimensions.height * 0.5,
      dimensions.depth * 0.5
    )
  );

  const wallBody = new CANNON.Body({
    mass: 10000,
    position: new CANNON.Vec3(0, 3, 0),
    shape: wallShape,
    material: defaultMaterial,
  });
  if (shouldRotateY) {
    wall.rotation.y = -Math.PI * 0.5;
    wallBody.quaternion.setFromAxisAngle(
      new CANNON.Vec3(0, -1, 0),
      Math.PI * 0.5
    );
  }

  wallBody.position.set(x, y, z);

  world.addBody(wallBody);

  objectsToUpdate.push({
    body: wallBody,
    mesh: wall,
  });
}
const wallData = {
  width: 0.1,
  height: 0.4,
  depth: 4,
};
createWall(wallData, -2, 0.2, 0);
createWall(wallData, 2, 0.2, 0);
createWall(wallData, 0, 0.2, -2, true);
createWall(wallData, 0, 0.2, 2, true);

// Lights
const ambientLight = new THREE.AmbientLight();
scene.add(ambientLight);

// const pointLight = new THREE.PointLight(0xffffff, 300, 10);
// pointLight.position.y = 3;
// pointLight.position.x = 1;
// pointLight.castShadow = true;
// pointLight.position.set(3, 2, 0.25)
// scene.add(pointLight);

const directionalLight = new THREE.DirectionalLight("#ffffff", 10);
directionalLight.castShadow = true;
directionalLight.shadow.camera.far = 10;
directionalLight.shadow.mapSize.set(512, 512);
// directionalLight.shadow.normalBias = 0.05
directionalLight.position.set(3, 2, 0.25);
scene.add(directionalLight);

directionalLight.target.position.set(0, 0, 0);
directionalLight.target.updateWorldMatrix(false, false);

// const directionalLightHelper = new THREE.DirectionalLightHelper(directionalLight, 0.4);
// scene.add(directionalLightHelper);

camera.position.x = 1;
camera.position.y = 1;
camera.position.z = 1.5;

window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

// Renderer
const renderer = new THREE.WebGL1Renderer({
  canvas,
  antialias: true,
});
renderer.useLegacyLights = false;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.toneMapping = THREE.CineonToneMapping;
renderer.toneMappingExposure = 1.75;

// OrbitControls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.update();

// Shadows
floor.receiveShadow = true;

/**
 * Animate
 */
const clock = new THREE.Clock();
let oldElapsedTime = 0;
function tick() {
  const elapsedTime = clock.getElapsedTime();
  const deltaTime = elapsedTime - oldElapsedTime;
  oldElapsedTime = elapsedTime;

  for (const object of objectsToUpdate) {
    // object.body.applyForce(new CANNON.Vec3(0.5, 0, 0), object.body.position)
    if (
      object.mesh.isGroup &&
      object.body.shapes.length > 1 &&
      object.mesh.children.length === object.body.shapes.length
    ) {
      object.mesh.children.forEach((child: THREE.Object3D, index: number) => {
        child.quaternion.copy(object.body.shapeOrientations[index]);
        child.position.copy(object.body.shapeOffsets[index]);
      });
    }
    object.mesh.quaternion.copy(object.body.quaternion);
    object.mesh.position.copy(object.body.position);
    object.model?.position.copy(object.mesh.position);
    object.model?.quaternion.copy(object.mesh.quaternion);
  }

  for (const pin of pinsToUpdate) {
    // pin.model.children(obj) => {
    //   obj.quaternion.copy(pin.body.quaternion);
    //   obj.position.copy(pin.body.position);
    // });
    pin.model?.quaternion.copy(pin.body.quaternion);
    pin.model?.position.copy(pin.body.position);

    pin.mesh.children.forEach((child: THREE.Object3D, index: number) => {
      child.quaternion.copy(pin.body.shapeOrientations[index]);
      child.position.copy(pin.body.shapeOffsets[index]);
    });
    pin.mesh?.quaternion.copy(pin.body.quaternion);
    pin.mesh?.position.copy(pin.body.position);
  }

  world.step(1 / 60, deltaTime, 3);

  controls.update();

  renderer.render(scene, camera);

  requestAnimationFrame(tick);
}

tick();
