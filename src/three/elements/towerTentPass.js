// src/three/elements/towerTentPasses.js
import * as THREE from "three";
import { TOWERS } from "../constants.js";

function createSleeveMaterial() {
  // blanco afuera / azul adentro (liso)
  const outerMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    side: THREE.FrontSide,
    roughness: 0.85,
    metalness: 0.0,
  });

  const innerMat = new THREE.MeshStandardMaterial({
    color: 0x1e3a8a, // azul
    side: THREE.BackSide,
    roughness: 0.75,
    metalness: 0.0,
  });

  return { outerMat, innerMat };
}

function createTowerSleeve({
  towerPos,
  center = new THREE.Vector3(0, 0, 0),
  y = 10.5,          // altura donde “pasa” la carpa (ajústalo a tu tent)
  radius = 0.55,     // tamaño del agujero visual
  length = 2.2,      // cuánto atraviesa (debe ser > TOWERS.width para que se note)
  sag = 0.12,        // caída visual (0 = recto)
}) {
  // dirección desde la torre hacia el centro (radial)
  const from = new THREE.Vector3(towerPos.x, y, towerPos.z);
  const to = new THREE.Vector3(center.x, y, center.z);
  const dir = new THREE.Vector3().subVectors(to, from).normalize();

  // cilindro abierto (tipo “manga”), un poquito más ancho en un lado para simular caída
  const rTop = radius * (1.0 + sag); // leve “caída”
  const rBot = radius;
  const geom = new THREE.CylinderGeometry(rTop, rBot, length, 28, 1, true);

  const { outerMat, innerMat } = createSleeveMaterial();

  const group = new THREE.Group();

  const outer = new THREE.Mesh(geom, outerMat);
  const inner = new THREE.Mesh(geom, innerMat);

  group.add(outer);
  group.add(inner);

  // Posición: centrado en la torre, a la altura y
  group.position.set(towerPos.x, y, towerPos.z);

  // Orientación: el cilindro va por defecto en Y, lo alineamos al vector radial
  group.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);

  // mini inclinación extra para que no se vea “perfecto”
  group.rotateZ(Math.PI * 0.02);

  group.castShadow = true;
  group.receiveShadow = true;

  return group;
}

export function createTowerTentPasses(options = {}) {
  const group = new THREE.Group();

  const side = TOWERS.squareSide;
  const halfSide = side / 2;

  // mismas posiciones que towers.js
  const positions = [
    new THREE.Vector3(-halfSide, 0, -halfSide),
    new THREE.Vector3( halfSide, 0, -halfSide),
    new THREE.Vector3( halfSide, 0,  halfSide),
    new THREE.Vector3(-halfSide, 0,  halfSide),
  ];

  // valores por defecto razonables según tu torre (width 0.7)
  const defaultRadius = Math.max(0.45, TOWERS.width * 0.75); // ~0.52
  const defaultLength = Math.max(1.8, TOWERS.width * 3.0);   // ~2.1

  for (const pos of positions) {
    const sleeve = createTowerSleeve({
      towerPos: pos,
      center: options.center ?? new THREE.Vector3(0, 0, 0),
      y: options.y ?? (TOWERS.height * 0.58), // ~10.44 si height=18
      radius: options.radius ?? defaultRadius,
      length: options.length ?? defaultLength,
      sag: options.sag ?? 0.12,
    });

    group.add(sleeve);
  }

  return group;
}
