import * as THREE from "three";
import { ResourceWithPath } from "../sources";
import { EventEmitter } from "./EventEmitter";
import { GLTF, GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

interface Loaders {
  textureLoader: THREE.TextureLoader;
  gltfLoader: GLTFLoader;
}

export default class Resources extends EventEmitter {
  sources: ResourceWithPath[] | null = null;
  items: Record<string, THREE.Texture | GLTF> = {};
  toLoad = 0;
  loaded = 0;
  loaders: Loaders = {
    textureLoader: new THREE.TextureLoader(),
    gltfLoader: new GLTFLoader(),
  };

  constructor(sources: ResourceWithPath[]) {
    super();

    // Options
    this.sources = sources;

    // Setup
    this.toLoad = this.sources.length;
    this.loaded = 0;

    this.setLoading();
  }

  setLoading() {
    if (!this.sources) return;
    for (const source of this.sources) {
      if (source.type === "texture") {
        this.loaders.textureLoader.load(source.path, (file) => {
          this.sourceLoaded(source, file);
        });
      } else if (source.type === "gltfModel") {
        this.loaders.gltfLoader.load(source.path, (gltf) => {
          this.sourceLoaded(source, gltf);
        });
      } else if (source.type === "texture-ldr") {
        this.loaders.textureLoader.load(source.path, (file) => {
          file.mapping = THREE.EquirectangularReflectionMapping;
          file.colorSpace = THREE.SRGBColorSpace;

          this.sourceLoaded(source, file);
        });
      }
    }
  }

  sourceLoaded(source: ResourceWithPath, texture: THREE.Texture | GLTF) {
    this.items[source.name] = texture;
    this.loaded++;
    if (this.loaded === this.toLoad) {
      this.trigger("ready");
    }
  }
}
