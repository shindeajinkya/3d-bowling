import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

import * as CANNON from "cannon-es";

var updateCOM = function (body: CANNON.Body) {
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
};

// Canvas
const canvas = document.querySelector("canvas.webgl");

if (!canvas) {
  throw new Error("Canvas not found");
}

// Loaders
const gltfLoader = new GLTFLoader();
const textureLoader = new THREE.TextureLoader();

// Textures
const floorColorTexture = textureLoader.load(
  "/textures/floor/Wood066_1K_Color.jpg"
);
const floorDisplacementTexture = textureLoader.load(
  "/textures/floor/Wood066_1K_Color.jpg"
);
const floorNormalTexture = textureLoader.load(
  "/textures/floor/Wood066_1K_Color.jpg"
);
const floorRoghnessTexture = textureLoader.load(
  "/textures/floor/Wood066_1K_Color.jpg"
);

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
let sphere: THREE.Mesh | null = null;
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
    mass: 10,
    position: new CANNON.Vec3(0, 0, 0),
    shape,
    material: defaultMaterial,
  });
  body.position.copy(position as any);
  // body.sleep();
  world.addBody(body);
  body.applyLocalForce(new CANNON.Vec3(4000, 0, 0), new CANNON.Vec3(0, 0, 0));

  sphere = mesh;
  // Save in objectsToUpdate
  objectsToUpdate.push({
    mesh,
    body,
    model,
  });
};

const createPin = (model: THREE.Group, x: number, z: number) => {
  // Copy and update scene position
  const copiedScene = model.clone(true);
  copiedScene.position.x = x;
  copiedScene.position.z = z;

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

  /**
   * Geometry
   */
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

  /**
   * Physics
   */
  // Shapes
  const bottomCylinderShape = new CANNON.Cylinder(
    bottomCylinderDimensions.topRadius,
    bottomCylinderDimensions.bottomRadius,
    bottomCylinderDimensions.height
  );
  const sphereShape = new CANNON.Sphere(0.08);
  const middleCylinderShape = new CANNON.Cylinder(
    middleCylinderDimensions.topRadius,
    middleCylinderDimensions.bottomRadius,
    middleCylinderDimensions.height
  );
  const topCylinderShape = new CANNON.Cylinder(
    topCylinderDimensions.topRadius,
    topCylinderDimensions.bottomRadius,
    topCylinderDimensions.height
  );

  // Body
  const pinBody = new CANNON.Body({
    mass: 0.4,
    material: defaultMaterial,
  });

  pinBody.position.set(x, 0.076, z);
  pinBody.addShape(bottomCylinderShape, new CANNON.Vec3(0, 0, 0));
  pinBody.addShape(sphereShape, new CANNON.Vec3(0, 0.075, 0));
  pinBody.addShape(middleCylinderShape, new CANNON.Vec3(0, 0.15, 0));
  pinBody.addShape(topCylinderShape, new CANNON.Vec3(0, 0.34, 0));

  updateCOM(pinBody);
  pinBody.sleep();

  // adding to scene
  scene.add(copiedScene);
  scene.add(bottleMesh);
  world.addBody(pinBody);

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

  // createPin(clonedScene, 0, 0, bottomBoxDimensions, topBoxDimensions);

  let currentPosition = 0;
  for (let i = 0; i < 4; i++) {
    let positionZ = -(i * 0.5);
    for (let j = 0; j <= i; j++) {
      const copiedScene = gltf.scene.clone();
      copiedScene.position.x = currentPosition * 0.2;
      copiedScene.position.z = positionZ * 0.35;
      createPin(clonedScene, currentPosition * 0.5, positionZ * 0.5);
      // scene.add(copiedScene);
      positionZ++;
    }
    currentPosition++;
  }
});

// Ball
gltfLoader.load("/bowling_ball/scene.gltf", (gltf) => {
  gltf.scene.scale.set(0.2, 0.2, 0.2);
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
  createSphere(0.2, new THREE.Vector3(-6.5, 0.2, 0), gltf.scene);
});

// Floor
const floorShape = new CANNON.Plane();
const floorBody = new CANNON.Body();
floorBody.mass = 0;
floorBody.addShape(floorShape);
floorBody.quaternion.setFromAxisAngle(new CANNON.Vec3(-1, 0, 0), Math.PI * 0.5);
world.addBody(floorBody);

// Adding a plane
const floorGeometry = new THREE.PlaneGeometry(15, 2.5);
const floorMaterial = new THREE.MeshStandardMaterial({
  map: floorColorTexture,
  displacementMap: floorDisplacementTexture,
  normalMap: floorNormalTexture,
  roughnessMap: floorRoghnessTexture,
  displacementScale: 0.1,
});
const floor = new THREE.Mesh(floorGeometry, floorMaterial);

floor.rotation.x = -Math.PI * 0.5;
floor.position.copy(floorBody.position as any);

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
const wallDataSides = {
  width: 0.1,
  height: 0.4,
  depth: 14.9,
};

const wallDataFront = {
  width: 0.1,
  height: 0.4,
  depth: 2.4,
};
createWall(wallDataFront, -7.5, 0.2, 0);
createWall(wallDataFront, 7.5, 0.2, 0);
createWall(wallDataSides, 0, 0.2, -1.25, true);
createWall(wallDataSides, 0, 0.2, 1.25, true);

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
directionalLight.shadow.mapSize.set(1024, 1024);
directionalLight.shadow.normalBias = 0.1;
directionalLight.position.set(3, 2, 0.25);
scene.add(directionalLight);

directionalLight.target.position.set(0, 0, 0);
directionalLight.target.updateWorldMatrix(false, false);

// const directionalLightHelper = new THREE.DirectionalLightHelper(directionalLight, 0.4);
// scene.add(directionalLightHelper);

camera.position.x = -8;
camera.position.y = 1;
camera.position.z = -0;
camera.lookAt(new THREE.Vector3());

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
controls.enabled = false;
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
    // object.body.applyForce(new CANNON.Vec3(0.5, 0, 0), object.body.position);
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
    pin.mesh.children.forEach((child: THREE.Object3D, index: number) => {
      child.quaternion.copy(pin.body.shapeOrientations[index]);
      child.position.copy(pin.body.shapeOffsets[index]);
    });
    pin.mesh?.quaternion.copy(pin.body.quaternion);
    pin.mesh?.position.copy(pin.body.position);

    pin.model?.quaternion.copy(pin.body.quaternion);
    pin.model?.position.copy(pin.body.position);
  }

  world.step(1 / 60, deltaTime, 3);

  // updating camera position to follow bowl
  if (sphere) {
    // camera.position.x = sphere.position.x - 2;
    camera.position.x = sphere.position.x < 0 ? sphere.position.x - 2 : -2;
    // camera.position.y = sphere.position.y + 0.;
    // camera.position.z =
    //   sphere.position.z < 0
    //     ? Math.cosh(sphere.position.z)
    //     : Math.sin(sphere.position.z - 2);
  }

  controls.update();

  renderer.render(scene, camera);

  requestAnimationFrame(tick);
}

tick();
