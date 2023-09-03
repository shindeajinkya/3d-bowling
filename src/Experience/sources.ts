export interface ResourceWithPath {
  name: string;
  type: string;
  path: string;
}

export default [
  {
    name: "floorColorTexture",
    type: "texture",
    path: "textures/floor/Wood066_1K_Color.jpg",
  },
  {
    name: "floorDisplacementTexture",
    type: "texture",
    path: "textures/floor/Wood066_1K_Displacement.jpg",
  },
  {
    name: "floorNormalTexture",
    type: "texture",
    path: "textures/floor/Wood066_1K_NormalGL.jpg",
  },
  {
    name: "floorRoughnessTexture",
    type: "texture",
    path: "textures/floor/Wood066_1K_Roughness.jpg",
  },
  {
    name: "pinModel",
    type: "gltfModel",
    path: "bowling_pin/scene.gltf",
  },
  {
    name: "bowlModel",
    type: "gltfModel",
    path: "bowling_ball/scene.gltf",
  },
];
