// src/three/elements/stage.js
import * as THREE from "three";
import { STAGE } from "../constants.js";

export function createStage() {
  const geometry = new THREE.CylinderGeometry(
    STAGE.radius,
    STAGE.radius,
    STAGE.height,
    96
  );

  const material = new THREE.MeshStandardMaterial({
    color: 0x8a1b3a,
    roughness: 0.55,
    metalness: 0.15,
  });

  const stage = new THREE.Mesh(geometry, material);
  stage.position.y = STAGE.height / 2;
  stage.castShadow = true;
  stage.receiveShadow = true;

  return stage;
}
