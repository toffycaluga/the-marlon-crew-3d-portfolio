// src/three/elements/circusPerimeterTentWall.js
import * as THREE from "three";
import { CIRCUS, TENT } from "../constants.js";

/**
 * Cilindro liso en el perímetro del circo (pared/lona vertical)
 * - Liso
 * - Fuera blanco / dentro azul
 * - Útil como “falda” o cierre perimetral
 */
export function createCircusPerimeterTentWall({
  // Alturas
  topY = TENT.bottomY,   // desde dónde cuelga (por defecto: donde termina la carpa)
  groundY = 0.0,         // hasta dónde llega (suelo)

  // Radios
  radius = CIRCUS.radius + 0.05, // apenas por fuera (evita z-fighting)
  radialSegments = 180,
  heightSegments = 8,

  openEnded = true,

  outsideColor = TENT.colors.outside, // blanco
  insideColor = TENT.colors.inside,   // azul
} = {}) {
  const group = new THREE.Group();
  group.name = "CircusPerimeterTentWall";

  const height = Math.max(0.001, topY - groundY);
  const centerY = groundY + height / 2;

  const geom = new THREE.CylinderGeometry(
    radius,           // top radius
    radius,           // bottom radius
    height,
    radialSegments,
    heightSegments,
    openEnded
  );

  // Centrar el cilindro entre groundY y topY
  geom.translate(0, centerY, 0);

  // ✅ Importante:
  // - Caras del cilindro apuntan hacia afuera -> FrontSide muestra el exterior
  // - Para ver desde adentro (centro del circo) necesitas BackSide
  const matOutside = new THREE.MeshStandardMaterial({
    color: outsideColor,
    roughness: TENT.material.roughness,
    metalness: TENT.material.metalness,
    transparent: TENT.material.opacity < 1,
    opacity: TENT.material.opacity,
    side: THREE.FrontSide, // EXTERIOR
  });

  const matInside = new THREE.MeshStandardMaterial({
    color: insideColor,
    roughness: TENT.material.roughness,
    metalness: TENT.material.metalness,
    transparent: TENT.material.opacity < 1,
    opacity: TENT.material.opacity,
    side: THREE.BackSide, // INTERIOR
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
