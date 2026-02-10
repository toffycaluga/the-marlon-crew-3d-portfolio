// src/three/elements/towerTentHoles.js
import * as THREE from "three";
import { CIRCUS, DOME, TENT, TOWERS } from "../constants.js";

/**
 * Devuelve Y de la tent principal dado un radio r desde el centro.
 * Usa la misma lógica de tent.js (lerp + sagAmount*sin(pi*v)).
 */
function tentYAtRadius(
  r,
  {
    topRadius = DOME.diameter / 2,
    topY = DOME.height - 0.5,
    bottomRadius = CIRCUS.radius,
    bottomY = TENT.bottomY,
    sagAmount = TENT.sagAmount,
  } = {}
) {
  const denom = bottomRadius - topRadius;
  let v = denom !== 0 ? (r - topRadius) / denom : 0;
  v = THREE.MathUtils.clamp(v, 0, 1);

  const yBase = THREE.MathUtils.lerp(topY, bottomY, v);
  const sag = sagAmount * Math.sin(Math.PI * v);
  return yBase - sag;
}

/**
 * Construye una “falda” de lona (mini tent) alrededor de una torre:
 * - Outer ring: calza con la tent principal
 * - Inner ring: queda recto (misma Y para todo el anillo) y se hunde (sink)
 */
function buildTowerTentSkirtGeometry({
  towerPos,
  innerRadius,
  outerRadius,
  segments = 72,
  sink = 0.35,
  tentParams = {},
  innerFlat = true, // ✅ punta interior recta
}) {
  const positions = [];
  const uvs = [];
  const indices = [];

  // ✅ Y constante para el anillo interior: se calcula con el radio del centro de la torre
  const rCenter = Math.sqrt(towerPos.x * towerPos.x + towerPos.z * towerPos.z);
  const yCenterOnTent = tentYAtRadius(rCenter, tentParams);

  // 2 anillos: 0 = inner (agujero), 1 = outer (fusión con tent)
  for (let ring = 0; ring < 2; ring++) {
    const rr = ring === 0 ? innerRadius : outerRadius;

    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const a = t * Math.PI * 2;

      const x = towerPos.x + Math.cos(a) * rr;
      const z = towerPos.z + Math.sin(a) * rr;

      // Outer ring = exactamente sobre la tent (varía por rGlobal)
      const rGlobal = Math.sqrt(x * x + z * z);
      const yOuter = tentYAtRadius(rGlobal, tentParams);

      // Inner ring = recto (yCenterOnTent) o siguiendo la tent (si innerFlat=false)
      const yInnerBase = innerFlat ? yCenterOnTent : yOuter;

      // Aplico hundimiento al anillo interior
      const y = ring === 1 ? yOuter : yInnerBase - sink;

      positions.push(x, y, z);
      uvs.push(t, ring);
    }
  }

  const row = segments + 1;

  // Conectar anillos (strip)
  for (let i = 0; i < segments; i++) {
    const a = i; // inner
    const b = i + row; // outer
    const c = b + 1; // outer next
    const d = a + 1; // inner next

    indices.push(a, b, d);
    indices.push(b, c, d);
  }

  const geom = new THREE.BufferGeometry();
  geom.setIndex(indices);
  geom.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geom.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  geom.computeVertexNormals();
  geom.computeBoundingSphere();

  return geom;
}

function createTowerTentSkirt({
  towerPos,

  // tamaños: por defecto derivados de TOWERS.width (0.7)
  innerRadius = Math.max(0.35, TOWERS.width * 0.55),
  outerRadius = Math.max(0.95, TOWERS.width * 1.8),

  segments = 72,
  sink = 0.35,

  // Deben calzar con tu tent.js (mismos defaults)
  topRadius = DOME.diameter / 2,
  topY = DOME.height - 0.5,
  bottomRadius = CIRCUS.radius,
  bottomY = TENT.bottomY,
  sagAmount = TENT.sagAmount,

  // Colores (fuera blanco, dentro azul)
  outsideColor = TENT.colors.outside,
  insideColor = TENT.colors.inside,
} = {}) {
  const group = new THREE.Group();
  group.name = "TowerTentSkirt";

  const tentParams = { topRadius, topY, bottomRadius, bottomY, sagAmount };

  const geom = buildTowerTentSkirtGeometry({
    towerPos,
    innerRadius,
    outerRadius,
    segments,
    sink,
    tentParams,
    innerFlat: true, // ✅ punta interior recta siempre
  });

  // ⚠️ Mantengo EXACTO tu tent.js para que NO se inviertan colores:
  // - outside usa BackSide
  // - inside usa FrontSide
  const matOutside = new THREE.MeshStandardMaterial({
    color: outsideColor,
    roughness: TENT.material.roughness,
    metalness: TENT.material.metalness,
    transparent: TENT.material.opacity < 1,
    opacity: TENT.material.opacity,
    side: THREE.BackSide,
  });

  const matInside = new THREE.MeshStandardMaterial({
    color: insideColor,
    roughness: TENT.material.roughness,
    metalness: TENT.material.metalness,
    transparent: TENT.material.opacity < 1,
    opacity: TENT.material.opacity,
    side: THREE.FrontSide,
  });

  const outside = new THREE.Mesh(geom, matOutside);
  outside.castShadow = true;
  outside.receiveShadow = true;

  const inside = new THREE.Mesh(geom, matInside);
  inside.castShadow = false;
  inside.receiveShadow = true;

  group.add(outside, inside);

  return group;
}

export function createTowerTentHoles({
  // tuneos rápidos
  innerRadius,
  outerRadius,
  sink = 0.35,
  segments = 72,
} = {}) {
  const group = new THREE.Group();
  group.name = "TowerTentHoles";

  const side = TOWERS.squareSide;
  const halfSide = side / 2;

  // mismas posiciones que towers.js
  const positions = [
    new THREE.Vector3(-halfSide, 0, -halfSide),
    new THREE.Vector3(halfSide, 0, -halfSide),
    new THREE.Vector3(halfSide, 0, halfSide),
    new THREE.Vector3(-halfSide, 0, halfSide),
  ];

  for (const pos of positions) {
    const skirt = createTowerTentSkirt({
      towerPos: pos,
      innerRadius: innerRadius ?? Math.max(0.35, TOWERS.width * 0.55),
      outerRadius: outerRadius ?? Math.max(0.95, TOWERS.width * 1.8),
      sink,
      segments,
    });

    group.add(skirt);
  }

  return group;
}
