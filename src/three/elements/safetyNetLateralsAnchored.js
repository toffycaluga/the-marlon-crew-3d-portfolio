import * as THREE from "three";
import { SAFETY_NET_LATERALS } from "../constants.js";

// Construye un plano entre 4 puntos (quad) usando BufferGeometry
function createQuadGeometry(a, b, c, d, segU, segV) {
  // a----b
  // |    |
  // d----c
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

// Deforma la red para que “cuelgue” (drop) hacia el exterior/centro
function applySag(geom, drop) {
  const pos = geom.attributes.position;

  // aproximación simple:
  // bajamos más los puntos que están “más afuera” (según Z relativo al centro del quad)
  // esto funciona bien si el lateral sale mayormente en Z.
  // Si lo rotas mucho, igual se verá bien como wireframe.
  let minZ = Infinity, maxZ = -Infinity;
  for (let i = 0; i < pos.count; i++) {
    const z = pos.getZ(i);
    if (z < minZ) minZ = z;
    if (z > maxZ) maxZ = z;
  }
  const span = Math.max(0.0001, maxZ - minZ);

  for (let i = 0; i < pos.count; i++) {
    const z = pos.getZ(i);
    const t = (z - minZ) / span; // 0..1
    pos.setY(i, pos.getY(i) - t * drop);
  }

  pos.needsUpdate = true;
  geom.computeVertexNormals();
}

function buildLateral(cfg, mat) {
  const a = new THREE.Vector3(cfg.anchorStart.x, cfg.anchorStart.y, cfg.anchorStart.z);
  const b = new THREE.Vector3(cfg.anchorEnd.x, cfg.anchorEnd.y, cfg.anchorEnd.z);

  // borde exterior = anclaje + offset
  const off = new THREE.Vector3(cfg.outOffset.x, cfg.outOffset.y, cfg.outOffset.z);

  const d = a.clone().add(off);
  const c = b.clone().add(off);

  const geom = createQuadGeometry(
    a, b, c, d,
    SAFETY_NET_LATERALS.subdivisionsU,
    SAFETY_NET_LATERALS.subdivisionsV
  );

  applySag(geom, SAFETY_NET_LATERALS.drop);

  const mesh = new THREE.Mesh(geom, mat);
  mesh.castShadow = false;
  mesh.receiveShadow = false;
  return mesh;
}

export function createSafetyNetLateralsAnchored() {
  const group = new THREE.Group();

  const mat = new THREE.MeshBasicMaterial({
    color: 0x2dd4bf,
    transparent: true,
    opacity: SAFETY_NET_LATERALS.opacity,
    wireframe: SAFETY_NET_LATERALS.wireframe,
    side: THREE.DoubleSide,
  });

  group.add(buildLateral(SAFETY_NET_LATERALS.left, mat));
  group.add(buildLateral(SAFETY_NET_LATERALS.right, mat));

  return group;
}
