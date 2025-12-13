// src/three/elements/base.js
import * as THREE from "three";
import { CIRCUS } from "../constants.js";

export function createCircusBase() {
  const geometry = new THREE.CircleGeometry(CIRCUS.radius, 128);

  const material = new THREE.MeshStandardMaterial({
    color: 0x00f0f0,
    roughness: 0.95,
    metalness: 0.02,
    side: THREE.DoubleSide,
  });

  const base = new THREE.Mesh(geometry, material);
  base.rotation.x = -Math.PI / 2;
  base.receiveShadow = true;

  return base;
}
