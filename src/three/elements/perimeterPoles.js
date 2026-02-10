// src/three/elements/perimeterPoles.js
import * as THREE from "three";
import { CIRCUS, POLES } from "../constants.js";

function normalizeAngle0To2PI(a) {
  const twoPI = Math.PI * 2;
  return ((a % twoPI) + twoPI) % twoPI;
}

function angleInRanges(angle, ranges) {
  // ranges: [{ center: rad, width: rad }, ...]
  // width = apertura total (ej 20° => width = THREE.MathUtils.degToRad(20))
  const a = normalizeAngle0To2PI(angle);

  return ranges.some(({ center, width }) => {
    const c = normalizeAngle0To2PI(center);
    const half = width / 2;

    // distancia circular mínima
    let d = Math.abs(a - c);
    d = Math.min(d, Math.PI * 2 - d);

    return d <= half;
  });
}

function createSinglePole() {
  const group = new THREE.Group();

  // Tubo principal
  const tubeGeo = new THREE.CylinderGeometry(
    POLES.diameter / 2,
    POLES.diameter / 2,
    POLES.height,
    POLES.radialSegments
  );

  const tubeMat = new THREE.MeshStandardMaterial({
    color: 0xbfbfbf,
    roughness: 0.55,
    metalness: 0.35,
  });

  const tube = new THREE.Mesh(tubeGeo, tubeMat);
  tube.position.y = POLES.height / 2;
  tube.castShadow = true;
  tube.receiveShadow = true;

  // Punta: cilindro macizo (20cm largo, 3cm diámetro)
  const tipGeo = new THREE.CylinderGeometry(
    POLES.tipDiameter / 2,
    POLES.tipDiameter / 2,
    POLES.tipHeight,
    POLES.radialSegments
  );

  const tipMat = new THREE.MeshStandardMaterial({
    color: 0xe6e6e6,
    roughness: 0.4,
    metalness: 0.5,
  });

  const tip = new THREE.Mesh(tipGeo, tipMat);
  // lo ponemos arriba del tubo (como “extensión”)
  tip.position.y = POLES.height + POLES.tipHeight / 2;
  tip.castShadow = true;
  tip.receiveShadow = true;

  group.add(tube, tip);
  return group;
}

/**
 * excludeIndices: [0, 5, 12]  -> excluye por índice directo
 * excludeAngleRanges: [{ center: 0, width: degToRad(30) }, { center: Math.PI, width: degToRad(30) }]
 *   -> excluye por “entradas” (zonas angulares)
 */
export function createPerimeterPoles({
  count = POLES.count,
  radius = CIRCUS.radius,
  inset = POLES.inset,
  faceCenter = false,

  excludeIndices = [],
  excludeAngleRanges = [],
} = {}) {
  const group = new THREE.Group();
  group.name = "PerimeterPoles";

  const r = Math.max(0, radius - inset);
  const prototype = createSinglePole();

  for (let i = 0; i < count; i++) {
    if (excludeIndices.includes(i)) continue;

    const angle = (i / count) * Math.PI * 2;

    if (excludeAngleRanges.length && angleInRanges(angle, excludeAngleRanges)) {
      continue;
    }

    const pole = prototype.clone(true);

    const x = Math.cos(angle) * r;
    const z = Math.sin(angle) * r;

    pole.position.set(x, 0, z);

    // etiquetas útiles para debug o para borrar después
    pole.name = `pole_${i}`;
    pole.userData = { index: i, angle };

    if (faceCenter) pole.lookAt(0, 0, 0);

    group.add(pole);
  }

  return group;
}
