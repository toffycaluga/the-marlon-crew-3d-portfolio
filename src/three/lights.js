// src/three/lights.js
import * as THREE from "three";

export function createLights(scene) {
  scene.add(new THREE.AmbientLight(0xffffff, 0.35));

  const dir = new THREE.DirectionalLight(0xffffff, 1.25);
  dir.position.set(18, 26, 12);
  dir.castShadow = true;

  scene.add(dir);
}
