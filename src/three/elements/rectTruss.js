// src/three/elements/rectTruss.js
import * as THREE from "three";
import { RECT_TRUSS } from "../constants.js";

function createTube(from, to, radius, material) {
  const dir = new THREE.Vector3().subVectors(to, from);
  const length = dir.length();

  const geom = new THREE.CylinderGeometry(radius, radius, length, 10);
  const mesh = new THREE.Mesh(geom, material);

  const mid = new THREE.Vector3().addVectors(from, to).multiplyScalar(0.5);
  mesh.position.copy(mid);

  mesh.quaternion.setFromUnitVectors(
    new THREE.Vector3(0, 1, 0),
    dir.clone().normalize()
  );

  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

export function createRectangularTruss() {
  const group = new THREE.Group();

  const mat = new THREE.MeshStandardMaterial({
    color: 0xd1d5db,
    roughness: 0.35,
    metalness: 0.85,
  });

  const {
    length,
    width,
    thickness,
    height,
    segments,
    tubeRadius,
    braceRadius,
    secondaryTower,
  } = RECT_TRUSS;

  const halfL = length / 2;
  const halfW = width / 2;

  const yTop = height + thickness / 2;
  const yBot = height - thickness / 2;

  // 4 esquinas (top y bottom)
  function corners(y) {
    return [
      new THREE.Vector3(-halfL, y, -halfW),
      new THREE.Vector3( halfL, y, -halfW),
      new THREE.Vector3( halfL, y,  halfW),
      new THREE.Vector3(-halfL, y,  halfW),
    ];
  }

  const top = corners(yTop);
  const bot = corners(yBot);

  // 1) Marcos superior e inferior
  for (let i = 0; i < 4; i++) {
    const j = (i + 1) % 4;
    group.add(createTube(top[i], top[j], tubeRadius, mat));
    group.add(createTube(bot[i], bot[j], tubeRadius, mat));
  }

  // 2) Postes verticales
  for (let i = 0; i < 4; i++) {
    group.add(createTube(bot[i], top[i], braceRadius, mat));
  }

  // 3) Refuerzos longitudinales + diagonales
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const x = -halfL + length * t;

    const pTopL = new THREE.Vector3(x, yTop, -halfW);
    const pTopR = new THREE.Vector3(x, yTop,  halfW);
    const pBotL = new THREE.Vector3(x, yBot, -halfW);
    const pBotR = new THREE.Vector3(x, yBot,  halfW);

    // travesaños
    group.add(createTube(pTopL, pTopR, braceRadius, mat));
    group.add(createTube(pBotL, pBotR, braceRadius, mat));

    // diagonales
    if (i < segments) {
      const x2 = -halfL + length * ((i + 1) / segments);

      const qTopL = new THREE.Vector3(x2, yTop, -halfW);
      const qBotR = new THREE.Vector3(x2, yBot,  halfW);

      group.add(createTube(pTopL, qBotR, braceRadius, mat));
    }
  }

  // 4) Torre secundaria (a 2/3 del largo)
  if (secondaryTower.enabled) {
    const tx = -halfL + length * secondaryTower.positionRatio;

    const towerBase = new THREE.Vector3(tx, yBot, 0);
    const towerTop = new THREE.Vector3(
      tx,
      yBot + secondaryTower.height,
      0
    );

    group.add(createTube(towerBase, towerTop, tubeRadius, mat));

    // refuerzos diagonales
    group.add(
      createTube(
        new THREE.Vector3(tx - secondaryTower.width / 2, yBot, -halfW),
        towerTop,
        braceRadius,
        mat
      )
    );
    group.add(
      createTube(
        new THREE.Vector3(tx + secondaryTower.width / 2, yBot,  halfW),
        towerTop,
        braceRadius,
        mat
      )
    );
  }

  return group;
}
