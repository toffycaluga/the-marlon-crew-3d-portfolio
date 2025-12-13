// src/three/elements/trapezeBar.js
import * as THREE from "three";
import { TRAPEZE_BAR } from "../constants.js";

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

export function createTrapezeBar() {
  const group = new THREE.Group();

  const ropeMat = new THREE.MeshStandardMaterial({
    color: 0xf5f5f4,
    roughness: 0.9,
    metalness: 0.05,
  });

  const barMat = new THREE.MeshStandardMaterial({
    color: 0xcbd5e1,
    roughness: 0.35,
    metalness: 0.85,
  });

  const anchorCenter = new THREE.Vector3(
    TRAPEZE_BAR.anchor.x,
    TRAPEZE_BAR.anchor.y,
    TRAPEZE_BAR.anchor.z
  );

  // Centro de la barra abajo = anchor + offset
const barCenter = new THREE.Vector3(
  anchorCenter.x + (TRAPEZE_BAR.barOffset?.x ?? 0),
  anchorCenter.y - TRAPEZE_BAR.ropeLength,   // ← AQUÍ
  anchorCenter.z + (TRAPEZE_BAR.barOffset?.z ?? 0)
);


  // ✅ Eje perpendicular en XZ (igual que STRONG_BAR)
  const px = -Math.sin(TRAPEZE_BAR.angle);
  const pz = Math.cos(TRAPEZE_BAR.angle);

  // Separación arriba y abajo
  const topSep = TRAPEZE_BAR.anchor.separation ?? TRAPEZE_BAR.barWidth;
  const bottomSep = TRAPEZE_BAR.bottomSeparation ?? TRAPEZE_BAR.barWidth;

  const topHalf = topSep / 2;
  const bottomHalf = bottomSep / 2;

  // Puntos arriba
  const topLeft = new THREE.Vector3(
    anchorCenter.x + px * (-topHalf),
    anchorCenter.y,
    anchorCenter.z + pz * (-topHalf)
  );
  const topRight = new THREE.Vector3(
    anchorCenter.x + px * (topHalf),
    anchorCenter.y,
    anchorCenter.z + pz * (topHalf)
  );

  // Puntos abajo (barra)
  const bottomLeft = new THREE.Vector3(
    barCenter.x + px * (-bottomHalf),
    barCenter.y,
    barCenter.z + pz * (-bottomHalf)
  );
  const bottomRight = new THREE.Vector3(
    barCenter.x + px * (bottomHalf),
    barCenter.y,
    barCenter.z + pz * (bottomHalf)
  );

  // Cuerdas (diagonales si barCenter no está justo bajo el anchor)
  group.add(createCylinderBetween(topLeft, bottomLeft, TRAPEZE_BAR.ropeRadius, ropeMat, 10));
  group.add(createCylinderBetween(topRight, bottomRight, TRAPEZE_BAR.ropeRadius, ropeMat, 10));

  // Barra
  group.add(createCylinderBetween(bottomLeft, bottomRight, TRAPEZE_BAR.barRadius, barMat, 16));

  return group;
}
