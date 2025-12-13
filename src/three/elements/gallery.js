// src/three/elements/gallery.js
import * as THREE from "three";
import { STAGE, CIRCUS, GALLERY } from "../constants.js";

const TAU = Math.PI * 2;
const EPS = 1e-4;

function normalizeAngle(a) {
  a = a % TAU;
  return a < 0 ? a + TAU : a;
}

/**
 * Convierte un hueco angular (center + angleWidth) en intervalos [start,end] dentro de [0, 2π).
 * Si cruza 0, se parte en dos intervalos.
 */
function gapToIntervals(center, angleWidth) {
  const half = angleWidth / 2;
  const start = normalizeAngle(center - half);
  const end = normalizeAngle(center + half);

  if (start <= end) return [[start, end]];
  return [
    [0, end],
    [start, TAU],
  ];
}

/** Resta [gs, ge] de un conjunto de intervalos permitidos */
function subtractInterval(allowed, gs, ge) {
  const out = [];
  for (const [as, ae] of allowed) {
    // sin cruce
    if (ge <= as || gs >= ae) {
      out.push([as, ae]);
      continue;
    }
    // con cruce: quedan trozos
    if (gs > as) out.push([as, gs]);
    if (ge < ae) out.push([ge, ae]);
  }
  return out;
}

/** Calcula intervalos permitidos a partir de intervalos de huecos */
function allowedIntervalsFromGaps(gapIntervals) {
  let allowed = [[0, TAU]];
  for (const [gs, ge] of gapIntervals) {
    allowed = subtractInterval(allowed, gs, ge);
    if (!allowed.length) break;
  }
  return allowed.filter(([s, e]) => e - s > EPS);
}

/** Crea forma del anillo para un tramo angular [startAngle, endAngle] */
function createRingShape(innerRadius, outerRadius, startAngle, endAngle) {
  const shape = new THREE.Shape();
  const segments = 180;

  shape.moveTo(Math.cos(startAngle) * outerRadius, Math.sin(startAngle) * outerRadius);

  // arco exterior
  for (let i = 1; i <= segments; i++) {
    const t = i / segments;
    const a = startAngle + (endAngle - startAngle) * t;
    shape.lineTo(Math.cos(a) * outerRadius, Math.sin(a) * outerRadius);
  }

  // arco interior (vuelta)
  for (let i = segments; i >= 0; i--) {
    const t = i / segments;
    const a = startAngle + (endAngle - startAngle) * t;
    shape.lineTo(Math.cos(a) * innerRadius, Math.sin(a) * innerRadius);
  }

  shape.closePath();
  return shape;
}

export function createGallery() {
  const group = new THREE.Group();

  // =========================================================
  // CONFIG: 2 GAPS SEPARADOS, OPUESTOS (frente a frente)
  // =========================================================

  // Dirección base: artistas al frente (-Z)
  const artistsExitCenter = -Math.PI / 2;

  // Público queda “frente a frente” (180° al otro lado)
  const publicExitCenter = artistsExitCenter + Math.PI;

  // Tamaños INDEPENDIENTES (EDITABLES)
  // 90° = Math.PI/2 (1/4)
  const artistsExitAngle = Math.PI / 3; // <-- ajusta libremente
  const publicExitAngle = Math.PI / 9;  // <-- ajusta libremente

  const material = new THREE.MeshStandardMaterial({
    color: 0xff2d9a,
    roughness: 0.7,
    metalness: 0.08,
  });

  for (let i = 0; i < GALLERY.tiers; i++) {
    const inner = STAGE.radius + 1.2 + i * (GALLERY.ringWidth + GALLERY.gap);
    const outer = inner + GALLERY.ringWidth;
    if (outer >= CIRCUS.radius) break;

    const y = GALLERY.baseY + i * GALLERY.heightStep;

    // Huecos como intervalos
    const gapIntervals = [
      ...gapToIntervals(artistsExitCenter, artistsExitAngle),
      ...gapToIntervals(publicExitCenter, publicExitAngle),
    ];

    // Intervalos que SÍ se dibujan
    const allowed = allowedIntervalsFromGaps(gapIntervals);

    // Una malla por cada trozo permitido (así se ve limpio)
    for (const [startA, endA] of allowed) {
      const shape = createRingShape(inner, outer, startA, endA);

      const geometry = new THREE.ExtrudeGeometry(shape, {
        depth: GALLERY.thickness,
        bevelEnabled: false,
        curveSegments: 24,
        steps: 1,
      });

      const mesh = new THREE.Mesh(geometry, material);
      mesh.rotation.x = -Math.PI / 2; // depth -> altura en Y
      mesh.position.y = y;

      mesh.castShadow = true;
      mesh.receiveShadow = true;

      group.add(mesh);
    }
  }

  return group;
}
