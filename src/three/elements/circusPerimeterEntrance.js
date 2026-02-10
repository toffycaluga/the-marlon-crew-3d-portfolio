import * as THREE from "three";
import { CIRCUS, TENT } from "../constants.js";

/**
 * Pared perimetral del circo CON ENTRADA
 * La entrada es un hueco angular (no booleanos)
 */
export function createCircusPerimeterWithEntrance({
  // Alturas
  topY = TENT.bottomY,
  groundY = 0,

  // Radio
  radius = CIRCUS.radius + 0.05,

  // Entrada
  entranceWidthMeters = 4.0, // ancho real de la entrada
  entranceAngle = Math.PI,   // orientación (PI = lado público)

  // Calidad
  radialSegments = 200,
  heightSegments = 8,

  outsideColor = TENT.colors.outside,
  insideColor = TENT.colors.inside,
} = {}) {
  const group = new THREE.Group();
  group.name = "CircusPerimeterWithEntrance";

  const height = topY - groundY;
  const centerY = groundY + height / 2;

  // 🔢 Convertir ancho en metros → ángulo
  const entranceAngleSize = entranceWidthMeters / radius;

  // Dejamos todo menos el hueco
  const thetaStart = entranceAngle + entranceAngleSize / 2;
  const thetaLength = Math.PI * 2 - entranceAngleSize;

  const geometry = new THREE.CylinderGeometry(
    radius,
    radius,
    height,
    radialSegments,
    heightSegments,
    true,
    thetaStart,
    thetaLength
  );

  geometry.translate(0, centerY, 0);

  const matOutside = new THREE.MeshStandardMaterial({
    color: outsideColor,
    roughness: TENT.material.roughness,
    metalness: TENT.material.metalness,
    side: THREE.FrontSide,
  });

  const matInside = new THREE.MeshStandardMaterial({
    color: insideColor,
    roughness: TENT.material.roughness,
    metalness: TENT.material.metalness,
    side: THREE.BackSide,
  });

  const outside = new THREE.Mesh(geometry, matOutside);
  outside.castShadow = true;
  outside.receiveShadow = true;

  const inside = new THREE.Mesh(geometry, matInside);
  inside.receiveShadow = true;

  group.add(outside, inside);
  return group;
}
