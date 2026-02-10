// src/three/elements/tent.js
import * as THREE from "three";
import { CIRCUS, DOME, TENT } from "../constants.js";

function buildTentGeometry({
  topRadius,
  topY,
  bottomRadius,
  bottomY,
  segAround,
  segH,
  foldAmp,
  foldFreq,
  sagAmount,
}) {
  const positions = [];
  const uvs = [];
  const indices = [];

  // (segH+1) * (segAround+1)
  for (let iy = 0; iy <= segH; iy++) {
    const v = iy / segH; // 0 arriba, 1 abajo

    // Radio interpolado
    const radius = THREE.MathUtils.lerp(topRadius, bottomRadius, v);

    // Altura base interpolada
    const yBase = THREE.MathUtils.lerp(topY, bottomY, v);

    // ✅ Caída tipo lona (máx en el centro)
    // v=0 => 0, v=1 => 0, v=0.5 => max
    const sag = sagAmount * Math.sin(Math.PI * v);
    const y = yBase - sag;

    for (let ia = 0; ia <= segAround; ia++) {
      const u = ia / segAround;
      const a = u * Math.PI * 2;

      // ✅ LISO: foldAmp normalmente es 0
      const fold =
        foldAmp > 0 ? foldAmp * Math.sin(a * foldFreq) * (1.0 - v) : 0;

      const r2 = Math.max(0.001, radius + fold);

      const x = Math.cos(a) * r2;
      const z = Math.sin(a) * r2;

      positions.push(x, y, z);
      uvs.push(u, v);
    }
  }

  const row = segAround + 1;
  for (let iy = 0; iy < segH; iy++) {
    for (let ia = 0; ia < segAround; ia++) {
      const a = iy * row + ia;
      const b = a + row;
      const c = b + 1;
      const d = a + 1;

      // dos triángulos
      indices.push(a, b, d);
      indices.push(b, c, d);
    }
  }

  const geom = new THREE.BufferGeometry();
  geom.setIndex(indices);
  geom.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geom.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));

  geom.computeVertexNormals();
  geom.computeBoundingSphere();

  return geom;
}

export function createCircusTent({
  // Punto superior (desde el domo)
  topRadius = DOME.diameter / 2,
  topY = DOME.height- .5,

  // Punto inferior (hasta el perímetro del circo)
  bottomRadius = CIRCUS.radius,
  bottomY = TENT.bottomY,

  // Malla
  segmentsAround = TENT.segmentsAround,
  segmentsHeight = TENT.segmentsHeight,

  // ✅ LISO (por defecto ya viene 0)
  foldAmp = TENT.foldAmp,
  foldFreq = TENT.foldFreq,

  // ✅ Caída
  sagAmount = TENT.sagAmount,

  // ✅ Colores (fuera blanco, dentro azul)
  outsideColor = TENT.colors.outside,
  insideColor = TENT.colors.inside,
} = {}) {
  const group = new THREE.Group();
  group.name = "CircusTent";

  const geom = buildTentGeometry({
    topRadius,
    topY,
    bottomRadius,
    bottomY,
    segAround: segmentsAround,
    segH: segmentsHeight,
    foldAmp,
    foldFreq,
    sagAmount,
  });

  // ✅ Exterior (blanco): FrontSide (se ve desde fuera)
  const matOutside = new THREE.MeshStandardMaterial({
    color: outsideColor,
    roughness: TENT.material.roughness,
    metalness: TENT.material.metalness,
    transparent: TENT.material.opacity < 1,
    opacity: TENT.material.opacity,
    side: THREE.BackSide,
  });

  // ✅ Interior (azul): BackSide (se ve desde dentro)
  const matInside = new THREE.MeshStandardMaterial({
    color: insideColor,
    roughness: TENT.material.roughness,
    metalness: TENT.material.metalness,
    transparent: TENT.material.opacity < 1,
    opacity: TENT.material.opacity,
    side: THREE.FrontSide,
  });

  // Dos mallas con el mismo geometry (control total de colores por lado)
  const outside = new THREE.Mesh(geom, matOutside);
  outside.castShadow = true;
  outside.receiveShadow = true;

  const inside = new THREE.Mesh(geom, matInside);
  inside.castShadow = false;
  inside.receiveShadow = true;

  group.add(outside, inside);
  return group;
}
