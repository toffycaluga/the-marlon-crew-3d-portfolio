// src/three/elements/backstage.js
import * as THREE from "three";
import { BACKSTAGE } from "../constants.js";

/**
 * Torre tipo truss (tubular) simple:
 * - 4 postes verticales
 * - diagonales por caras (X/Z)
 * - "anillos" cada N metros para dar rigidez
 */
function createTrussTower({ height, size, tubeRadius, bayHeight, material }) {
  const g = new THREE.Group();

  const half = size / 2;

  // postes (4 esquinas)
  const postGeom = new THREE.CylinderGeometry(tubeRadius, tubeRadius, height, 10);
  const postPositions = [
    [-half, height / 2, -half],
    [ half, height / 2, -half],
    [-half, height / 2,  half],
    [ half, height / 2,  half],
  ];

  for (const [x, y, z] of postPositions) {
    const post = new THREE.Mesh(postGeom, material);
    post.position.set(x, y, z);
    post.castShadow = true;
    post.receiveShadow = true;
    g.add(post);
  }

  // helper: tubo entre 2 puntos
  function tubeBetween(a, b) {
    const dir = new THREE.Vector3().subVectors(b, a);
    const len = dir.length();

    const geom = new THREE.CylinderGeometry(tubeRadius, tubeRadius, len, 8);
    const mesh = new THREE.Mesh(geom, material);

    const mid = new THREE.Vector3().addVectors(a, b).multiplyScalar(0.5);
    mesh.position.copy(mid);

    mesh.quaternion.setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      dir.normalize()
    );

    mesh.castShadow = true;
    mesh.receiveShadow = true;
    return mesh;
  }

  // marcos (rectángulos) cada bayHeight
  const bays = Math.max(1, Math.floor(height / bayHeight));
  for (let i = 0; i <= bays; i++) {
    const y = i * bayHeight;
    if (y > height) continue;

    const p1 = new THREE.Vector3(-half, y, -half);
    const p2 = new THREE.Vector3( half, y, -half);
    const p3 = new THREE.Vector3( half, y,  half);
    const p4 = new THREE.Vector3(-half, y,  half);

    g.add(tubeBetween(p1, p2));
    g.add(tubeBetween(p2, p3));
    g.add(tubeBetween(p3, p4));
    g.add(tubeBetween(p4, p1));
  }

  // diagonales por caras, por cada bay
  for (let i = 0; i < bays; i++) {
    const y0 = i * bayHeight;
    const y1 = Math.min(height, (i + 1) * bayHeight);

    // cara Z- (frente)
    g.add(tubeBetween(
      new THREE.Vector3(-half, y0, -half),
      new THREE.Vector3( half, y1, -half)
    ));
    g.add(tubeBetween(
      new THREE.Vector3( half, y0, -half),
      new THREE.Vector3(-half, y1, -half)
    ));

    // cara Z+ (atrás)
    g.add(tubeBetween(
      new THREE.Vector3(-half, y0, half),
      new THREE.Vector3( half, y1, half)
    ));
    g.add(tubeBetween(
      new THREE.Vector3( half, y0, half),
      new THREE.Vector3(-half, y1, half)
    ));

    // cara X- (izquierda)
    g.add(tubeBetween(
      new THREE.Vector3(-half, y0, -half),
      new THREE.Vector3(-half, y1,  half)
    ));
    g.add(tubeBetween(
      new THREE.Vector3(-half, y0,  half),
      new THREE.Vector3(-half, y1, -half)
    ));

    // cara X+ (derecha)
    g.add(tubeBetween(
      new THREE.Vector3(half, y0, -half),
      new THREE.Vector3(half, y1,  half)
    ));
    g.add(tubeBetween(
      new THREE.Vector3(half, y0,  half),
      new THREE.Vector3(half, y1, -half)
    ));
  }

  return g;
}

export function createBackstage() {
  const group = new THREE.Group();

  const { tower, span, position, material } = BACKSTAGE;

  const mat = new THREE.MeshStandardMaterial({
    color: material.color,
    roughness: material.roughness,
    metalness: material.metalness,
  });

  // ✅ Torres tipo truss
  const towerSize = tower.size;              // ancho/espesor (0.6–0.8)
  const tubeRadius = tower.tubeRadius;       // grosor tubo
  const bayHeight = tower.bayHeight;         // separación de diagonales

  const leftTower = createTrussTower({
    height: tower.height,
    size: towerSize,
    tubeRadius,
    bayHeight,
    material: mat,
  });
  leftTower.position.set(-span.width / 2, 0, 0);

  const rightTower = createTrussTower({
    height: tower.height,
    size: towerSize,
    tubeRadius,
    bayHeight,
    material: mat,
  });
  rightTower.position.set(span.width / 2, 0, 0);

  group.add(leftTower, rightTower);

  // ✅ Travesaño superior (también truss simple, horizontal)
  // Reutilizamos createTrussTower pero “girado”:
  // - altura = span.width
  // - size = towerSize
  // - luego rotamos para que quede horizontal en X
  const beam = createTrussTower({
    height: span.width+(tower.size),
    size: towerSize,
    tubeRadius,
    bayHeight,
    material: mat,
  });

  // beam "vertical" -> lo rotamos para que sea horizontal
  beam.rotation.z = Math.PI / 2;
  // lo subimos arriba de las torres
  beam.position.set(((span.width/2)+tower.size/2), tower.height, 0);

  group.add(beam);

  // ✅ Posición global
  group.position.set(position.x, position.y, position.z);

  return group;
}
