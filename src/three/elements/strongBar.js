// src/three/elements/strongBar.js
import * as THREE from "three";
import { STRONG_BAR } from "../constants.js";

function createCylinderBetween(from, to, radius, material, radialSegments = 12) {
  const dir = new THREE.Vector3().subVectors(to, from);
  const length = dir.length();

  const geom = new THREE.CylinderGeometry(radius, radius, length, radialSegments);
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

export function createStrongBar() {
  const group = new THREE.Group();

  const ropeMat = new THREE.MeshStandardMaterial({
    color: STRONG_BAR.ropeColor,
    roughness: 0.9,
    metalness: 0.05,
  });

  const barMat = new THREE.MeshStandardMaterial({
    color: STRONG_BAR.barColor,
    roughness: 0.35,
    metalness: 0.85,
  });

  // Posición base en el plano XZ (polar)
  const x = Math.cos(STRONG_BAR.angle) * STRONG_BAR.radiusFromCenter;
  const z = Math.sin(STRONG_BAR.angle) * STRONG_BAR.radiusFromCenter;

  // Alturas
  const topY = STRONG_BAR.hangHeight;

  // Si no quieres mantener barHeight en constante, lo calculamos:
  const barY = STRONG_BAR.barHeight ?? (STRONG_BAR.hangHeight - STRONG_BAR.ropeLength);

  // Puntos superiores donde se amarran las cuerdas
  const halfSep = STRONG_BAR.ropeSeparation / 2;

  // Las cuerdas quedan separadas en X local del grupo,
  // pero como estamos en mundo, lo hacemos en el eje perpendicular al ángulo:
  // perpendicular en XZ: (-sin, cos)
  const px = -Math.sin(STRONG_BAR.angle);
  const pz = Math.cos(STRONG_BAR.angle);

  const topLeft = new THREE.Vector3(x + px * (-halfSep), topY, z + pz * (-halfSep));
  const topRight = new THREE.Vector3(x + px * (halfSep), topY, z + pz * (halfSep));

  // Puntos inferiores (donde está la barra)
  const bottomLeft = new THREE.Vector3(topLeft.x, barY, topLeft.z);
  const bottomRight = new THREE.Vector3(topRight.x, barY, topRight.z);

  // Cuerdas
  const ropeLeft = createCylinderBetween(topLeft, bottomLeft, STRONG_BAR.ropeRadius, ropeMat, 10);
  const ropeRight = createCylinderBetween(topRight, bottomRight, STRONG_BAR.ropeRadius, ropeMat, 10);
  group.add(ropeLeft, ropeRight);

  // Barra (tubo) entre los dos puntos inferiores
  const bar = createCylinderBetween(bottomLeft, bottomRight, STRONG_BAR.barRadius, barMat, 16);
  group.add(bar);

  return group;
}
