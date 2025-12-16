// src/three/elements/backstageSideCurtains.js
import * as THREE from "three";
import {
  BACKSTAGE,
  BACKSTAGE_CURTAINS,
  BACKSTAGE_SIDE_CURTAINS,
  CIRCUS,
} from "../constants.js";

/**
 * Intersección de un rayo (start + t*dir) con el círculo x^2+z^2 = R^2 en plano XZ.
 * Devuelve t (>=0) o null si no hay intersección hacia adelante.
 */
function rayCircleIntersectT(startWorld, dirXZ, radius) {
  const sx = startWorld.x;
  const sz = startWorld.z;
  const dx = dirXZ.x;
  const dz = dirXZ.z;

  const a = dx * dx + dz * dz;
  const b = 2 * (sx * dx + sz * dz);
  const c = sx * sx + sz * sz - radius * radius;

  const disc = b * b - 4 * a * c;
  if (disc < 0) return null;

  const sqrt = Math.sqrt(disc);
  const t1 = (-b - sqrt) / (2 * a);
  const t2 = (-b + sqrt) / (2 * a);

  const candidates = [t1, t2].filter((t) => t > 0.001);
  if (!candidates.length) return null;

  return Math.min(...candidates);
}

/**
 * Deforma la cortina para que:
 * - abajo sea siempre recto (y=0)
 * - arriba baje desde heightNear hasta heightFar a lo largo de X
 * - pliegues opcionales sobre Z (en el propio plano)
 */
function deformCurtainGeometry(geom, length, heightNear, heightFar, foldAmp, foldFreq) {
  const pos = geom.attributes.position;

  // PlaneGeometry está centrado. Nosotros lo vamos a "traducir" para que:
  // - x vaya de 0..length
  // - y vaya de 0..maxHeight
  // Esto lo hacemos ANTES con geom.translate(...)

  const maxH = Math.max(heightNear, heightFar);

  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i); // 0..length
    const y = pos.getY(i); // 0..maxH

    const u = length > 0 ? x / length : 0;        // 0 (cerca) -> 1 (lejos)
    const targetH = heightNear + (heightFar - heightNear) * u; // 6 -> 4

    // Mantener abajo recto:
    // reescalamos la altura local y para que el "top" sea targetH
    const v = maxH > 0 ? y / maxH : 0; // 0..1
    const newY = v * targetH;
    pos.setY(i, newY);

    // Pliegues (en Z local del plano) — suave, y más abajo se nota más
    if (foldAmp > 0) {
      const fold = Math.sin(u * Math.PI * foldFreq) * foldAmp;
      const zAdd = fold * (0.2 + 0.8 * v);
      pos.setZ(i, pos.getZ(i) + zAdd);
    }
  }

  pos.needsUpdate = true;
  geom.computeVertexNormals();
}

function buildSideCurtain({ side, mat }) {
  const cfg = BACKSTAGE_SIDE_CURTAINS;

  const redHalf = BACKSTAGE_CURTAINS.width / 2;

  // Punto de arranque (cerca de la roja) en coordenadas locales del grupo (que se cuelga en BACKSTAGE.position)
  const nearX = side === "left" ? -redHalf : redHalf;
  const nearZ = cfg.zNearOffset ?? 0;

  // Punto de arranque en mundo para calcular intersección con el círculo
  const startWorld = new THREE.Vector3(
    BACKSTAGE.position.x + nearX,
    BACKSTAGE.position.y + cfg.topY,
    BACKSTAGE.position.z + nearZ
  );

  // Dirección diagonal
  const angle = side === "left" ? cfg.leftAngle : cfg.rightAngle;
  const dirXZ = new THREE.Vector3(Math.cos(angle), 0, Math.sin(angle)).normalize();

  // Largo real hasta el círculo
  const t = rayCircleIntersectT(startWorld, dirXZ, CIRCUS.radius);
  if (t == null) return new THREE.Group();

  // Longitud en metros (en XZ)
  const length = BACKSTAGE_SIDE_CURTAINS.length;

  // Alturas: cerca (roja) -> lejos (borde circo)
  const heightNear = cfg.heightNearRed; // ej 6
  const heightFar = cfg.heightAtCircus; // ej 4
  const maxH = Math.max(heightNear, heightFar);

  // Crear plano en el “espacio local” del panel:
  // - x: 0..length (hacia afuera)
  // - y: 0..maxH (desde el piso de la cortina)
  const geom = new THREE.PlaneGeometry(length, maxH, cfg.segmentsU, cfg.segmentsV);

  // PlaneGeometry viene centrado: x en [-L/2,L/2] y y en [-H/2,H/2]
  // Lo movemos para que el origen sea la esquina inferior-cercana (0,0)
  geom.translate(length / 2, maxH / 2, 0);

  deformCurtainGeometry(
    geom,
    length,
    heightNear,
    heightFar,
    cfg.foldAmp ?? 0,
    cfg.foldFreq ?? 0
  );

  const mesh = new THREE.Mesh(geom, mat);
  mesh.castShadow = true;
  mesh.receiveShadow = true;

  // Rotar el panel para que siga la diagonal
  mesh.rotation.y = angle;

  // Posicionar la esquina inferior-cercana del panel en el punto nearX/nearZ
  mesh.position.set(nearX, 0, nearZ);

  // Empujar un poquito hacia atrás para evitar z-fighting con el truss/cortina roja
  if (cfg.zOffset) {
    mesh.position.z += cfg.zOffset;
  }

  return mesh;
}

export function createBackstageSideCurtains() {
  const cfg = BACKSTAGE_SIDE_CURTAINS;

  const mat = new THREE.MeshStandardMaterial({
    color: cfg.material.color,
    roughness: cfg.material.roughness,
    metalness: cfg.material.metalness,
    transparent: true,
    opacity: cfg.material.opacity,
    side: THREE.DoubleSide,
  });

  const group = new THREE.Group();
  group.add(
    buildSideCurtain({ side: "left", mat }),
    buildSideCurtain({ side: "right", mat })
  );

  // Se cuelgan desde el travesaño del backstage
  group.position.set(
    BACKSTAGE.position.x,
    BACKSTAGE.position.y + cfg.topY,
    BACKSTAGE.position.z
  );

  return group;
}
