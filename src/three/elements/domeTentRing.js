import * as THREE from "three";
import { DOME, TENT } from "../constants.js";

/**
 * Cilindro de lona alrededor del domo
 * - Tapa el lateral del truss del domo
 * - Liso
 * - Fuera blanco / dentro azul
 */
export function createDomeTentRing({
  // Alturas
  topY = DOME.height,                 // parte superior (pegada al domo)
  height = 2.2,                       // cuánto baja la carpa (ajústalo)

  // Radios
  radius = (DOME.diameter / 2) + 0.05, // apenas por fuera del truss
  radialSegments = 120,
  heightSegments = 6,

  openEnded = true,

  outsideColor = TENT.colors.outside,
  insideColor = TENT.colors.inside,
} = {}) {
  const group = new THREE.Group();
  group.name = "DomeTentRing";

  const bottomY = topY - height;

  const geom = new THREE.CylinderGeometry(
    radius,           // arriba
    radius,           // abajo
    height,
    radialSegments,
    heightSegments,
    openEnded
  );

  // Centrar cilindro entre topY y bottomY
  geom.translate(0, bottomY + height / 2, 0);

  // ⚠️ MISMA lógica que tent.js (importantísimo)
  // outside = BackSide
  // inside = FrontSide
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
