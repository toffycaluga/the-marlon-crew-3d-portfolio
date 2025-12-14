import * as THREE from "three";
import { SAFETY_NET } from "../constants.js";

function tubeBetween(a, b, r, mat) {
  const dir = new THREE.Vector3().subVectors(b, a);
  const len = dir.length();

  const geom = new THREE.CylinderGeometry(r, r, len, 12);
  const mesh = new THREE.Mesh(geom, mat);

  const mid = new THREE.Vector3().addVectors(a, b).multiplyScalar(0.5);
  mesh.position.copy(mid);

  mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());

  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

export function createSafetyNetBase() {
  const g = new THREE.Group();

  const { length, width, tubeRadius, y } = SAFETY_NET.frame;

  const mat = new THREE.MeshStandardMaterial({
    color: 0x393939,
    roughness: 0.35,
    metalness: 0.85,
  });

  const hx = length / 2;
  const hz = width / 2;

  const p1 = new THREE.Vector3(-hx, y, -hz);
  const p2 = new THREE.Vector3(hx, y, -hz);
  const p3 = new THREE.Vector3(hx, y, hz);
  const p4 = new THREE.Vector3(-hx, y, hz);

  // Marco rectangular
  g.add(tubeBetween(p1, p2, tubeRadius, mat));
  g.add(tubeBetween(p2, p3, tubeRadius, mat));
  g.add(tubeBetween(p3, p4, tubeRadius, mat));
  g.add(tubeBetween(p4, p1, tubeRadius, mat));

  // (Opcional) refuerzo central longitudinal
  const midA = new THREE.Vector3(-hx, y, 0);
  const midB = new THREE.Vector3(hx, y, 0);
  g.add(tubeBetween(midA, midB, tubeRadius * 0.6, mat));

  return g;
}
