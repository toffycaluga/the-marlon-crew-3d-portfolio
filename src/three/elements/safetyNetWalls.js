// src/three/elements/safetyNetWalls.js
import * as THREE from "three";
import { SAFETY_NET, SAFETY_NET_LATERALS } from "../constants.js";

/**
 * Crea una geometría tipo quad (a-b-c-d) subdividida
 */
function createQuadGeometry(a, b, c, d, segU, segV) {
  const positions = [];
  const indices = [];

  for (let v = 0; v <= segV; v++) {
    const tv = v / segV;
    const ab = new THREE.Vector3().lerpVectors(a, b, tv);
    const dc = new THREE.Vector3().lerpVectors(d, c, tv);

    for (let u = 0; u <= segU; u++) {
      const tu = u / segU;
      const p = new THREE.Vector3().lerpVectors(ab, dc, tu);
      positions.push(p.x, p.y, p.z);
    }
  }

  const row = segU + 1;
  for (let v = 0; v < segV; v++) {
    for (let u = 0; u < segU; u++) {
      const i0 = v * row + u;
      const i1 = i0 + 1;
      const i2 = i0 + row;
      const i3 = i2 + 1;

      indices.push(i0, i2, i1);
      indices.push(i1, i2, i3);
    }
  }

  const geom = new THREE.BufferGeometry();
  geom.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geom.setIndex(indices);
  geom.computeVertexNormals();
  return geom;
}

/**
 * Construye una pared vertical en una punta del marco (±X)
 */
function buildEndWall({ xEdge, baseY, zStart, zEnd, cfg, mat }) {
  const a = new THREE.Vector3(xEdge, baseY, zStart);
  const b = new THREE.Vector3(xEdge, baseY, zEnd);

  const topOffsetX = cfg.topOffset?.x ?? 0;
  const topOffsetZ = cfg.topOffset?.z ?? 0;

  const d = new THREE.Vector3(a.x + topOffsetX, a.y + cfg.height, a.z + topOffsetZ);
  const c = new THREE.Vector3(b.x + topOffsetX, b.y + cfg.height, b.z + topOffsetZ);

  const geom = createQuadGeometry(
    a,
    b,
    c,
    d,
    SAFETY_NET_LATERALS.subdivisionsU,
    SAFETY_NET_LATERALS.subdivisionsV
  );

  return new THREE.Mesh(geom, mat);
}

export function createSafetyNetWalls() {
  const group = new THREE.Group();

  const mat = new THREE.MeshBasicMaterial({
    color: 0x393939,
    transparent: true,
    opacity: SAFETY_NET_LATERALS.opacity,
    wireframe: SAFETY_NET_LATERALS.wireframe,
    side: THREE.DoubleSide,
  });

  const { length, width, y } = SAFETY_NET.frame;

  const hx = length / 2;
  const hz = width / 2;

  // -------------------------------------------------
  // PARED EN PUNTA X NEGATIVA (endA)
  // -------------------------------------------------
  group.add(
    buildEndWall({
      xEdge: -hx,
      baseY: y,
      zStart: -hz,
      zEnd: hz,
      cfg: SAFETY_NET_LATERALS.endA,
      mat,
    })
  );

  // -------------------------------------------------
  // PARED EN PUNTA X POSITIVA (endB)
  // -------------------------------------------------
  group.add(
    buildEndWall({
      xEdge: hx,
      baseY: y,
      zStart: -hz,
      zEnd: hz,
      cfg: SAFETY_NET_LATERALS.endB,
      mat,
    })
  );

  // -------------------------------------------------
  // EXTENSIÓN VERTICAL DESDE ARRIBA DE endB (4 m)
  // -------------------------------------------------
  const extTop = SAFETY_NET_LATERALS.endBTopExtension;
  if (extTop) {
    const topBaseY = y + SAFETY_NET_LATERALS.endB.height;

    group.add(
      buildEndWall({
        xEdge: hx +3 ,
        baseY: topBaseY ,
        zStart: -hz,
        zEnd: hz,
        cfg: extTop ,
        mat,
      })
    );
  }

  return group;
}
