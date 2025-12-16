// src/three/elements/gallerySeats.js
import * as THREE from "three";
import { STAGE, CIRCUS, GALLERY, GALLERY_SEATS } from "../constants.js";

const TAU = Math.PI * 2;
const EPS = 1e-4;

function normalizeAngle(a) {
  a = a % TAU;
  return a < 0 ? a + TAU : a;
}

/**
 * Convierte hueco angular (center + angleWidth) en intervalos [start,end] dentro de [0, 2π).
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

function subtractInterval(allowed, gs, ge) {
  const out = [];
  for (const [as, ae] of allowed) {
    if (ge <= as || gs >= ae) {
      out.push([as, ae]);
      continue;
    }
    if (gs > as) out.push([as, gs]);
    if (ge < ae) out.push([ge, ae]);
  }
  return out;
}

function allowedIntervalsFromGaps(gapIntervals) {
  let allowed = [[0, TAU]];
  for (const [gs, ge] of gapIntervals) {
    allowed = subtractInterval(allowed, gs, ge);
    if (!allowed.length) break;
  }
  return allowed.filter(([s, e]) => e - s > EPS);
}

/**
 * Crea butacas (asiento + espaldar) para cada anillo permitido.
 * - Se posicionan cerca del radio exterior (outer edge) para quedar "atrás" de cada fila.
 * - Se respetan huecos de artistas/público + huecos de escaleras.
 */
export function createGallerySeats() {
  const group = new THREE.Group();

  // -----------------------------
  // Huecos principales (como tu gallery.js)
  // -----------------------------
  const artistsExitCenter = Math.PI / 2;         // -Z
  const publicExitCenter = artistsExitCenter + Math.PI;

  const artistsExitAngle = Math.PI /3;          // ajusta libremente (igual que gallery)
  const publicExitAngle = Math.PI / 9;

  // -----------------------------
  // Geometrías y materiales
  // -----------------------------
  const seatSize = GALLERY_SEATS.seat.size;
  const seatHeight = GALLERY_SEATS.seat.height;

  const backH = GALLERY_SEATS.backrest.height;
  const backT = GALLERY_SEATS.backrest.thickness;

  const spacing = GALLERY_SEATS.spacing;
  const outerInset = GALLERY_SEATS.outerInset;
  const lift = GALLERY_SEATS.lift;

  const seatGeom = new THREE.BoxGeometry(seatSize, seatHeight, seatSize);
  const backGeom = new THREE.BoxGeometry(seatSize, backH, backT);

  const seatMat = new THREE.MeshStandardMaterial({
    color: GALLERY_SEATS.colors.seat,
    roughness: 0.7,
    metalness: 0.08,
  });

  const backMat = new THREE.MeshStandardMaterial({
    color: GALLERY_SEATS.colors.backrest,
    roughness: 0.75,
    metalness: 0.06,
  });

  // Para instancing: primero calculamos cuántas butacas habrá
  // (Estimación conservadora, luego instanciamos exacto con contador real)
  let estimated = 0;
  for (let i = 0; i < GALLERY.tiers; i++) {
    const inner = STAGE.radius + 1.5 + i * (GALLERY.ringWidth + GALLERY.gap);
    const outer = inner + GALLERY.ringWidth;
    if (outer >= CIRCUS.radius) break;

    const r = outer - outerInset - seatSize / 2;
    const circumference = TAU * r;
    estimated += Math.floor(circumference / (seatSize + spacing));
  }

  const seats = new THREE.InstancedMesh(seatGeom, seatMat, Math.max(estimated, 1));
  const backs = new THREE.InstancedMesh(backGeom, backMat, Math.max(estimated, 1));
  seats.castShadow = seats.receiveShadow = true;
  backs.castShadow = backs.receiveShadow = true;

  const dummy = new THREE.Object3D();

  let idx = 0;

  for (let tier = 0; tier < GALLERY.tiers; tier++) {
    const inner = STAGE.radius + 1.5 + tier * (GALLERY.ringWidth + GALLERY.gap);
    const outer = inner + GALLERY.ringWidth;
    if (outer >= CIRCUS.radius) break;

    // altura de la fila (la galería tiene thickness levantada)
    const yBase = GALLERY.baseY + tier * GALLERY.heightStep;
    const yTop = yBase + GALLERY.thickness + lift;

    // radio donde se sientan (pegado al borde exterior)
    const rSeat = outer - outerInset - seatSize / 2;

    // Huecos: artistas + público
    const gapIntervals = [
      ...gapToIntervals(artistsExitCenter, artistsExitAngle),
      ...gapToIntervals(publicExitCenter, publicExitAngle),
    ];

    // Huecos extra: escaleras (en METROS => a ángulo según radio)
    for (const stair of GALLERY_SEATS.stairs) {
      const angleWidth = stair.widthMeters / Math.max(rSeat, 0.0001);
      gapIntervals.push(...gapToIntervals(stair.centerAngle, angleWidth));
    }

    // Intervalos permitidos (tramos donde sí ponemos butacas)
    const allowed = allowedIntervalsFromGaps(gapIntervals);

    for (const [startA, endA] of allowed) {
      const arcLen = (endA - startA) * rSeat;
      const seatPitch = seatSize + spacing; // “paso” por butaca

      const count = Math.floor(arcLen / seatPitch);
      if (count <= 0) continue;

      // centramos para que no quede una butaca pegada al borde del corte
      const usedArc = count * seatPitch;
      const arcPad = (arcLen - usedArc) / 2;

      for (let s = 0; s < count; s++) {
        const dist = arcPad + s * seatPitch + seatPitch / 2;
        const a = startA + dist / rSeat;

        // posición en círculo
        const x = Math.cos(a) * rSeat;
        const z = Math.sin(a) * rSeat;

        // mirando al centro: rotación en Y
        // (para que el “fondo” del asiento apunte radial)
        // mirando al centro (Three.js: yaw 0 mira a -Z)
        const rotY = Math.PI / 2 - a;


        // ---------------------
        // Asiento
        // ---------------------
        dummy.position.set(x, yTop + seatHeight / 2, z);
        dummy.rotation.set(0, rotY, 0);
        dummy.scale.set(1, 1, 1);
        dummy.updateMatrix();
        seats.setMatrixAt(idx, dummy.matrix);

        // ---------------------
        // Espaldar (atrás del asiento, hacia afuera)
        // ---------------------
        const rx = Math.cos(a);
        const rz = Math.sin(a);

        // offset hacia afuera = medio asiento + medio espaldar
        const backOffset = seatSize / 2 + backT / 2;

        dummy.position.set(
          x + rx * backOffset,
          yTop + seatHeight + backH / 2,
          z + rz * backOffset
        );
        dummy.rotation.set(0, rotY, 0);
        dummy.updateMatrix();
        backs.setMatrixAt(idx, dummy.matrix);

        idx++;
        if (idx >= seats.count) break; // seguridad
      }

      if (idx >= seats.count) break;
    }

    if (idx >= seats.count) break;
  }

  // Ajusta la cantidad real usada
  seats.count = idx;
  backs.count = idx;
  seats.instanceMatrix.needsUpdate = true;
  backs.instanceMatrix.needsUpdate = true;

  group.add(seats);
  group.add(backs);

  return group;
}
