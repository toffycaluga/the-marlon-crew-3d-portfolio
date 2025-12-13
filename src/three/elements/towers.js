// src/three/elements/towers.js
import * as THREE from "three";
import { TOWERS } from "../constants.js";

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

function createTrussTower({ height, width, postRadius, braceRadius, segments }) {
  const tower = new THREE.Group();

  const mat = new THREE.MeshStandardMaterial({
    color: 0xd1d5db, // gris claro tipo aluminio
    roughness: 0.35,
    metalness: 0.85,
  });

  const half = width / 2;

  // 4 postes verticales (esquinas del truss)
  const corners = [
    new THREE.Vector3(-half, 0, -half),
    new THREE.Vector3( half, 0, -half),
    new THREE.Vector3( half, 0,  half),
    new THREE.Vector3(-half, 0,  half),
  ];

  // postes
  for (const c of corners) {
    const from = c.clone();
    const to = c.clone().setY(height);
    tower.add(createTube(from, to, postRadius, mat));
  }

  // marcos horizontales por nivel + diagonales (braces)
  for (let i = 0; i <= segments; i++) {
    const y = (height / segments) * i;

    const p0 = corners[0].clone().setY(y);
    const p1 = corners[1].clone().setY(y);
    const p2 = corners[2].clone().setY(y);
    const p3 = corners[3].clone().setY(y);

    // perímetro horizontal (cuadrado)
    tower.add(createTube(p0, p1, braceRadius, mat));
    tower.add(createTube(p1, p2, braceRadius, mat));
    tower.add(createTube(p2, p3, braceRadius, mat));
    tower.add(createTube(p3, p0, braceRadius, mat));

    // diagonales entre este nivel y el siguiente (para look truss)
    if (i < segments) {
      const y2 = (height / segments) * (i + 1);

      const q0 = corners[0].clone().setY(y2);
      const q1 = corners[1].clone().setY(y2);
      const q2 = corners[2].clone().setY(y2);
      const q3 = corners[3].clone().setY(y2);

      // Diagonales simples en dos caras (suficiente para que “lea” como truss)
      tower.add(createTube(p0, q1, braceRadius, mat));
      tower.add(createTube(p1, q0, braceRadius, mat));

      tower.add(createTube(p2, q3, braceRadius, mat));
      tower.add(createTube(p3, q2, braceRadius, mat));
    }
  }

  return tower;
}

export function createCircusTowers() {
  const group = new THREE.Group();

  const side = TOWERS.squareSide;
  const halfSide = side / 2;

  // posiciones de las 4 torres (esquinas del cuadrado)
  const positions = [
    new THREE.Vector3(-halfSide, 0, -halfSide),
    new THREE.Vector3( halfSide, 0, -halfSide),
    new THREE.Vector3( halfSide, 0,  halfSide),
    new THREE.Vector3(-halfSide, 0,  halfSide),
  ];

  for (const pos of positions) {
    const tower = createTrussTower({
      height: TOWERS.height,
      width: TOWERS.width,
      postRadius: TOWERS.postRadius,
      braceRadius: TOWERS.braceRadius,
      segments: TOWERS.segments,
    });

    tower.position.copy(pos);
    group.add(tower);
  }

  return group;
}
