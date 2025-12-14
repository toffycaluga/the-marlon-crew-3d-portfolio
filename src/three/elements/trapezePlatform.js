// src/three/elements/trapezePlatform.js
import * as THREE from "three";
import { TRAPEZE_PLATFORM, RECT_TRUSS } from "../constants.js";

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

function createLadderTrussPanel({
  topY,
  bottomY,
  panelWidth,
  rungEvery,
  tubeRadius,
  braceRadius,
  withDiagonals,
}) {
  const g = new THREE.Group();

  const mat = new THREE.MeshStandardMaterial({
    color: TRAPEZE_PLATFORM.escaleraColor,
    roughness: 0.35,
    metalness: 0.85,
  });

  const halfW = panelWidth / 2;
  const height = topY - bottomY;

  const leftBottom = new THREE.Vector3(-halfW, bottomY, 0);
  const leftTop = new THREE.Vector3(-halfW, topY, 0);
  const rightBottom = new THREE.Vector3(halfW, bottomY, 0);
  const rightTop = new THREE.Vector3(halfW, topY, 0);

  g.add(createTube(leftBottom, leftTop, tubeRadius, mat));
  g.add(createTube(rightBottom, rightTop, tubeRadius, mat));

  g.add(createTube(leftTop, rightTop, braceRadius, mat));
  g.add(createTube(leftBottom, rightBottom, braceRadius, mat));

  const rungCount = Math.max(2, Math.floor(height / rungEvery));
  for (let i = 0; i <= rungCount; i++) {
    const y = bottomY + (height * i) / rungCount;
    g.add(createTube(new THREE.Vector3(-halfW, y, 0), new THREE.Vector3(halfW, y, 0), braceRadius, mat));
  }

  if (withDiagonals) {
    for (let i = 0; i < rungCount; i++) {
      const y1 = bottomY + (height * i) / rungCount;
      const y2 = bottomY + (height * (i + 1)) / rungCount;

      const L1 = new THREE.Vector3(-halfW, y1, 0);
      const R1 = new THREE.Vector3(halfW, y1, 0);
      const L2 = new THREE.Vector3(-halfW, y2, 0);
      const R2 = new THREE.Vector3(halfW, y2, 0);

      if (i % 2 === 0) g.add(createTube(L1, R2, braceRadius, mat));
      else g.add(createTube(R1, L2, braceRadius, mat));
    }
  }

  return g;
}

export function createTrapezePlatform() {
  // ✅ Este group es el "módulo completo" (tarima + escaleras)
  const module = new THREE.Group();

  const matPlatform = new THREE.MeshStandardMaterial({
    color: TRAPEZE_PLATFORM.baseColor,
    roughness: 0.6,
    metalness: 0.15,
  });

  const {
    totalLength,
    width,
    thickness,
    deckSection,
    middleGap,
    trussHeight,
    ladderDrop,
    attachEnd,
    offsetX,
    rotationY,
    ladder,
  } = TRAPEZE_PLATFORM;

  const sign = attachEnd === "left" ? -1 : 1;
  const halfTruss = RECT_TRUSS.length / 2;

  const topY = trussHeight;
  const platformY = trussHeight - ladderDrop;

  // Punto base del módulo (posición central de la plataforma)
  const baseX =
    sign * halfTruss +
    sign * (totalLength / 2 + offsetX);

  // -----------------------------
  // Plataforma
  // -----------------------------
  const platformGeom = new THREE.BoxGeometry(totalLength, thickness, width);
  const platform = new THREE.Mesh(platformGeom, matPlatform);
  platform.position.set(baseX, platformY + thickness / 2, 0);
  platform.castShadow = true;
  platform.receiveShadow = true;
  module.add(platform);

  // -----------------------------
  // Escaleras (panel truss 1 cara)
  // -----------------------------
  const leftDeckEndLocal = -totalLength / 2 + deckSection;
  const ladder1X = baseX + sign * leftDeckEndLocal;
  const ladder2X = baseX + sign * (leftDeckEndLocal + middleGap);

  const zSep = ladder.zSeparation / 2;

  function addPanelAt(x, z) {
    const panel = createLadderTrussPanel({
      topY,
      bottomY: platformY,
      panelWidth: ladder.panelWidth,
      rungEvery: ladder.rungEvery,
      tubeRadius: ladder.tubeRadius,
      braceRadius: ladder.braceRadius,
      withDiagonals: ladder.withDiagonals,
    });

    panel.position.set(x, 0, z);
    module.add(panel);
  }

  addPanelAt(ladder1X, -zSep);
  addPanelAt(ladder2X, zSep);

  // ✅ Rotamos el módulo completo alrededor del origen (0,0,0)
  // Si tu escena usa el escenario en (0,0,0), esto te lo puede girar “al otro lado”.
  // Si quieres girarlo alrededor de SU PROPIO centro (la plataforma), usa el pivote abajo.
  if (rotationY) module.rotation.y = rotationY;

  return module;
}
