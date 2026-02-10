// src/three/elements/invertedCone.js
import * as THREE from "three";
import { DOME, TENT } from "../constants.js";

/**
 * Cono invertido hacia ARRIBA (tipo “embudo” subiendo desde el domo)
 * - Base grande en el domo (yBase = DOME.height por defecto)
 * - Sube hasta yTop (por defecto: DOME.height + 5)
 * - Fuera blanco / dentro azul (liso)
 */
export function createInvertedConeUp({
  yBase = DOME.height,     // donde nace (en el domo)
  height = 5,              // cuánto sube
  baseRadius = Math.max(0.6, (DOME.center?.diameter ?? DOME.diameter) * 0.18),
  tipRadius = 0.18,        // no 0 para evitar artefactos
  radialSegments = 96,
  heightSegments = 18,
  openEnded = true,
  outsideColor = TENT.colors.outside, // blanco
  insideColor = TENT.colors.inside,   // azul
} = {}) {
  const group = new THREE.Group();
  group.name = "InvertedConeUp";

  const yTop = yBase + height;
  const h = Math.max(0.001, yTop - yBase);

  // Usamos CylinderGeometry como “cono”:
  // radiusTop = tipRadius (arriba)
  // radiusBottom = baseRadius (abajo, en el domo)
  const geom = new THREE.CylinderGeometry(
    tipRadius,     // arriba
    baseRadius,    // abajo (en el domo)
    h,
    radialSegments,
    heightSegments,
    openEnded
  );

  // Centramos el cono entre yBase..yTop
  geom.translate(0, yBase + h / 2, 0);

  // Igual que tent.js para que NO se inviertan colores:
  // outside = BackSide (se ve desde fuera), inside = FrontSide (se ve desde dentro)
  const matOutside = new THREE.MeshStandardMaterial({
    color: outsideColor,
    roughness: TENT.material.roughness,
    metalness: TENT.material.metalness,
    transparent: TENT.material.opacity < 1,
    opacity: TENT.material.opacity,
    side: THREE.FrontSide,
  });

  const matInside = new THREE.MeshStandardMaterial({
    color: insideColor,
    roughness: TENT.material.roughness,
    metalness: TENT.material.metalness,
    transparent: TENT.material.opacity < 1,
    opacity: TENT.material.opacity,
    side: THREE.BackSide,
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
