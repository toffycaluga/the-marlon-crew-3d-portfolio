// src/three/elements/entranceFacade.js
import * as THREE from "three";
import { CIRCUS, TENT } from "../constants.js";

// Grados → Radianes
function degToRad(d) {
  return (d * Math.PI) / 180;
}

/**
 * Para evitar z-fighting (rayas feas) en superficies casi coplanares
 * (trims, marcos, letreros sobre paneles).
 */
function applyDecalFix(material, { factor = -2, units = -2 } = {}) {
  material.polygonOffset = true;
  material.polygonOffsetFactor = factor;
  material.polygonOffsetUnits = units;
}

/**
 * Fachada de entrada del circo
 * - Columnas
 * - Marco
 * - Letrero
 * - Cortinas
 * - Alfombra
 *
 * IMPORTANTE:
 * En este proyecto:
 * - angle = 0 apunta al SUR (+Z)
 * - angleOffset corrige el sistema polar para que 0 sea SUR
 */
export function createEntranceFacade({
  // ===== ORIENTACIÓN =====
  angle = 0,                 // 0 = SUR (frente)
  angleOffset = Math.PI / 2, // NO TOCAR (si se invierte, usa -Math.PI/2)

  // ===== POSICIÓN =====
  radius = CIRCUS.radius + 0.10,
  groundY = 0,
  topY = TENT.bottomY,

  // ===== DIMENSIONES =====
  openingWidth = 4.5,
  openingHeight = 3.2,
  depth = 0.35,

  // ===== COLORES =====
  stripeColorA = 0xffffff,
  stripeColorB = 0xc81e1e,
  trimColor = 0xf7c948,
  curtainColor = 0xb91c1c,
  signColor = 0x111111,
  carpetColor = 0xc81e1e,

  // ===== ALFOMBRA =====
  carpetLength = 6.0,
  carpetWidth = 2.2,
} = {}) {
  const group = new THREE.Group();
  group.name = "EntranceFacade";

  const height = Math.max(0.001, topY - groundY);
  const baseY = groundY;

  // ===== MATERIALES =====
  const matStripeA = new THREE.MeshStandardMaterial({
    color: stripeColorA,
    roughness: 0.9,
    metalness: 0.0,
  });

  const matStripeB = new THREE.MeshStandardMaterial({
    color: stripeColorB,
    roughness: 0.9,
    metalness: 0.0,
  });

  const matTrim = new THREE.MeshStandardMaterial({
    color: trimColor,
    roughness: 0.4,
    metalness: 0.2,
  });

  const matCurtain = new THREE.MeshStandardMaterial({
    color: curtainColor,
    roughness: 0.95,
    metalness: 0.0,
    side: THREE.DoubleSide,
  });

  const matSign = new THREE.MeshStandardMaterial({
    color: signColor,
    roughness: 0.8,
    metalness: 0.0,
  });

  const matCarpet = new THREE.MeshStandardMaterial({
    color: carpetColor,
    roughness: 1.0,
    metalness: 0.0,
    side: THREE.DoubleSide,
  });

  // ✅ anti z-fighting: trims y letrero sobre paneles
  applyDecalFix(matTrim, { factor: -3, units: -3 });
  applyDecalFix(matSign, { factor: -3, units: -3 });

  // ===== MEDIDAS =====
  const pillarW = 0.6;
  const pillarH = Math.min(height - 0.3, openingHeight + 1.2);
  const headerH = 0.9;
  const totalW = openingWidth + pillarW * 2;

  // ===== PILAR (con “rayas”) =====
  function makePillar() {
    const pillar = new THREE.Group();

    const segs = 6;
    const segW = pillarW / segs;

    // Rayas (bloques)
    for (let i = 0; i < segs; i++) {
      const mat = i % 2 === 0 ? matStripeA : matStripeB;
      const mesh = new THREE.Mesh(
        new THREE.BoxGeometry(segW, pillarH, depth),
        mat
      );
      mesh.position.set((-pillarW / 2) + segW / 2 + i * segW, pillarH / 2, 0);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      pillar.add(mesh);
    }

    // Marco dorado (un poco atrás para evitar coplanaridad)
    const trim = new THREE.Mesh(
      new THREE.BoxGeometry(pillarW + 0.06, pillarH + 0.06, depth + 0.02),
      matTrim
    );
    trim.position.set(0, pillarH / 2, -0.06); // ✅ antes -0.01 (z-fighting)
    trim.castShadow = true;
    trim.receiveShadow = true;

    // Dibujar después que el cuerpo (reduce flicker)
    trim.renderOrder = 2;

    pillar.add(trim);
    return pillar;
  }

  const leftPillar = makePillar();
  leftPillar.position.set(-openingWidth / 2 - pillarW / 2, baseY, 0);

  const rightPillar = makePillar();
  rightPillar.position.set(openingWidth / 2 + pillarW / 2, baseY, 0);

  // ===== MARCO SUPERIOR =====
  const header = new THREE.Mesh(
    new THREE.BoxGeometry(totalW, headerH, depth),
    matStripeB
  );
  header.position.set(0, baseY + pillarH + headerH / 2, 0);
  header.castShadow = true;
  header.receiveShadow = true;

  const headerTrim = new THREE.Mesh(
    new THREE.BoxGeometry(totalW + 0.1, headerH + 0.1, depth + 0.02),
    matTrim
  );
  headerTrim.position.copy(header.position);
  headerTrim.position.z -= 0.06; // ✅ antes -0.01
  headerTrim.castShadow = true;
  headerTrim.receiveShadow = true;
  headerTrim.renderOrder = 2;

  // ===== LETRERO =====
  const sign = new THREE.Mesh(
    new THREE.BoxGeometry(totalW * 0.65, headerH * 0.55, 0.06),
    matSign
  );
  sign.position.set(0, header.position.y + 0.02, depth / 2 + 0.05);
  sign.castShadow = true;
  sign.receiveShadow = true;
  sign.renderOrder = 3;

  const signTrim = new THREE.Mesh(
    new THREE.BoxGeometry(totalW * 0.65 + 0.08, headerH * 0.55 + 0.08, 0.05),
    matTrim
  );
  signTrim.position.copy(sign.position);
  signTrim.position.z += 0.03; // ✅ antes +0.01
  signTrim.castShadow = true;
  signTrim.receiveShadow = true;
  signTrim.renderOrder = 4;

  // ===== CORTINAS =====
  const curtainW = openingWidth * 0.55;
  const curtainH = openingHeight;

  const curtainGeom = new THREE.PlaneGeometry(curtainW, curtainH, 16, 12);
  const pos = curtainGeom.attributes.position;

  // onda + leve caída
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const wave = Math.sin((x / curtainW) * Math.PI * 8) * 0.03;
    const sag = (1 - (y / curtainH + 0.5)) * 0.02;
    pos.setZ(i, wave + sag);
  }
  pos.needsUpdate = true;
  curtainGeom.computeVertexNormals();

  const leftCurtain = new THREE.Mesh(curtainGeom, matCurtain);
  leftCurtain.position.set(-openingWidth * 0.22, baseY + curtainH / 2, depth / 2 + 0.02);
  leftCurtain.rotation.y = degToRad(8);
  leftCurtain.castShadow = true;
  leftCurtain.receiveShadow = false;
  leftCurtain.renderOrder = 5;

  const rightCurtain = new THREE.Mesh(curtainGeom, matCurtain);
  rightCurtain.position.set(openingWidth * 0.22, baseY + curtainH / 2, depth / 2 + 0.02);
  rightCurtain.rotation.y = degToRad(-8);
  rightCurtain.castShadow = true;
  rightCurtain.receiveShadow = false;
  rightCurtain.renderOrder = 5;

  // ===== ALFOMBRA =====
  const carpet = new THREE.Mesh(
    new THREE.PlaneGeometry(carpetWidth, carpetLength),
    matCarpet
  );
  carpet.rotation.x = -Math.PI / 2;

  // va hacia adentro (negativo Z local del grupo)
  carpet.position.set(0, groundY + 0.01, -carpetLength / 2 - depth / 2);

  carpet.receiveShadow = true;
  carpet.castShadow = false;
  carpet.renderOrder = 1;

  // ===== ENSAMBLE =====
  group.add(
    leftPillar,
    rightPillar,
    header,
    headerTrim,
    sign,
    signTrim,
    leftCurtain,
    rightCurtain,
    carpet
  );

  // ===== POSICIÓN EN PERÍMETRO =====
  const finalAngle = angle + angleOffset;
  const x = Math.cos(finalAngle) * radius;
  const z = Math.sin(finalAngle) * radius;
  group.position.set(x, 0, z);

  // Mirar al centro
  group.lookAt(0, 0, 0);

  // A veces queda “de espaldas”
  group.rotateY(Math.PI);

  return group;
}
