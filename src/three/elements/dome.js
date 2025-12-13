// src/three/elements/dome.js
import * as THREE from "three";
import { DOME } from "../constants.js";

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

function pointOnCircle(radius, angle, y) {
  return new THREE.Vector3(Math.cos(angle) * radius, y, Math.sin(angle) * radius);
}

// Crea una curva de arco (semicírculo) en el plano XZ con “alzamiento” (arcRise) en Y.
// axis = "x" => arco va de izquierda a derecha (variación en X)
// axis = "z" => arco va de adelante a atrás (variación en Z)
function createRaisedSemiArc({ radius, baseY, arcRise, axis = "x", segments = 32 }) {
  const points = [];

  // ángulo de 0..PI (semicírculo)
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const a = Math.PI * t;

    // coordenada a lo largo del diámetro [-R..+R]
    const u = Math.cos(a) * radius;

    // altura del arco (0 en extremos, arcRise en el centro)
    const y = baseY + Math.sin(a) * arcRise;

    if (axis === "x") {
      points.push(new THREE.Vector3(u, y, 0));
    } else {
      points.push(new THREE.Vector3(0, y, u));
    }
  }

  return points;
}

// Opción A: 2 semicírculos “levantados” cruzados (uno en X y otro en Z)
function addCenterSemiCircles(group, mat) {
  const R = DOME.center.diameter / 2;
  const baseY = DOME.height;
  const rise = DOME.center.arcRise;
  const seg = 40;

  const arcX = createRaisedSemiArc({ radius: R, baseY, arcRise: rise, axis: "x", segments: seg });
  const arcZ = createRaisedSemiArc({ radius: R, baseY, arcRise: rise, axis: "z", segments: seg });

  // Conectamos puntos con tubos (truss simple)
  for (let i = 0; i < arcX.length - 1; i++) {
    group.add(createTube(arcX[i], arcX[i + 1], DOME.tubeRadius, mat));
  }
  for (let i = 0; i < arcZ.length - 1; i++) {
    group.add(createTube(arcZ[i], arcZ[i + 1], DOME.tubeRadius, mat));
  }

  // “costillas” extras para que se vea más estructural (diagonales cortas hacia el centro)
  const centerTop = new THREE.Vector3(0, baseY + rise, 0);
  group.add(createTube(arcX[Math.floor(arcX.length / 2)], centerTop, DOME.braceRadius, mat));
  group.add(createTube(arcZ[Math.floor(arcZ.length / 2)], centerTop, DOME.braceRadius, mat));
}

// Opción B: Cruz tipo truss (dos vigas: una en X y otra en Z)
function addCenterCross(group, mat) {
  const R = DOME.center.diameter / 2;
  const yTop = DOME.height;
  const yBot = DOME.height - DOME.center.crossThickness;

  // extremos cruz (en X y en Z)
  const x1t = new THREE.Vector3(-R, yTop, 0);
  const x2t = new THREE.Vector3( R, yTop, 0);
  const z1t = new THREE.Vector3(0, yTop, -R);
  const z2t = new THREE.Vector3(0, yTop,  R);

  const x1b = new THREE.Vector3(-R, yBot, 0);
  const x2b = new THREE.Vector3( R, yBot, 0);
  const z1b = new THREE.Vector3(0, yBot, -R);
  const z2b = new THREE.Vector3(0, yBot,  R);

  // vigas principales arriba/abajo
  group.add(createTube(x1t, x2t, DOME.tubeRadius, mat));
  group.add(createTube(x1b, x2b, DOME.tubeRadius, mat));
  group.add(createTube(z1t, z2t, DOME.tubeRadius, mat));
  group.add(createTube(z1b, z2b, DOME.tubeRadius, mat));

  // postes en extremos
  group.add(createTube(x1b, x1t, DOME.braceRadius, mat));
  group.add(createTube(x2b, x2t, DOME.braceRadius, mat));
  group.add(createTube(z1b, z1t, DOME.braceRadius, mat));
  group.add(createTube(z2b, z2t, DOME.braceRadius, mat));

  // diagonales hacia el centro (para look truss)
  const cTop = new THREE.Vector3(0, yTop, 0);
  const cBot = new THREE.Vector3(0, yBot, 0);

  group.add(createTube(x1b, cTop, DOME.braceRadius, mat));
  group.add(createTube(x2b, cTop, DOME.braceRadius, mat));
  group.add(createTube(z1b, cTop, DOME.braceRadius, mat));
  group.add(createTube(z2b, cTop, DOME.braceRadius, mat));

  group.add(createTube(x1t, cBot, DOME.braceRadius, mat));
  group.add(createTube(x2t, cBot, DOME.braceRadius, mat));
  group.add(createTube(z1t, cBot, DOME.braceRadius, mat));
  group.add(createTube(z2t, cBot, DOME.braceRadius, mat));
}

export function createDomeTruss() {
  const group = new THREE.Group();

  const mat = new THREE.MeshStandardMaterial({
    color: 0xd1d5db,
    roughness: 0.35,
    metalness: 0.85,
  });

  const R = DOME.diameter / 2;
  const innerR = Math.max(0.1, R - DOME.ringWidth);

  const yTop = DOME.height;
  const yBot = DOME.height - DOME.trussThickness;

  const seg = DOME.segments;

  const outerTop = [];
  const outerBot = [];
  const innerTop = [];
  const innerBot = [];

  for (let i = 0; i < seg; i++) {
    const a = (i / seg) * Math.PI * 2;
    outerTop.push(pointOnCircle(R, a, yTop));
    outerBot.push(pointOnCircle(R, a, yBot));
    innerTop.push(pointOnCircle(innerR, a, yTop));
    innerBot.push(pointOnCircle(innerR, a, yBot));
  }

  const next = (i) => (i + 1) % seg;

  // 1) Aros horizontales
  for (let i = 0; i < seg; i++) {
    const j = next(i);

    group.add(createTube(outerTop[i], outerTop[j], DOME.tubeRadius, mat));
    group.add(createTube(outerBot[i], outerBot[j], DOME.tubeRadius, mat));

    group.add(createTube(innerTop[i], innerTop[j], DOME.tubeRadius, mat));
    group.add(createTube(innerBot[i], innerBot[j], DOME.tubeRadius, mat));
  }

  // 2) Postes verticales
  for (let i = 0; i < seg; i++) {
    group.add(createTube(outerBot[i], outerTop[i], DOME.braceRadius, mat));
    group.add(createTube(innerBot[i], innerTop[i], DOME.braceRadius, mat));
  }

  // 3) Conexiones radiales
  for (let i = 0; i < seg; i++) {
    group.add(createTube(innerTop[i], outerTop[i], DOME.braceRadius, mat));
    group.add(createTube(innerBot[i], outerBot[i], DOME.braceRadius, mat));
  }

  // 4) Diagonales alternadas
  for (let i = 0; i < seg; i++) {
    const j = next(i);

    if (i % 2 === 0) {
      group.add(createTube(outerBot[i], outerTop[j], DOME.braceRadius, mat));
      group.add(createTube(innerBot[i], innerTop[j], DOME.braceRadius, mat));
    } else {
      group.add(createTube(outerTop[i], outerBot[j], DOME.braceRadius, mat));
      group.add(createTube(innerTop[i], innerBot[j], DOME.braceRadius, mat));
    }
  }

  // 5) Estructura central: semicircles o cross
  if (DOME.center.mode === "semicircles") {
    addCenterSemiCircles(group, mat);
  } else if (DOME.center.mode === "cross") {
    addCenterCross(group, mat);
  }

  return group;
}
