// src/three/elements/entranceArch.js
import * as THREE from "three";
import { CIRCUS, ENTRANCE_SIGN } from "../constants.js";

function makeStripeTexture({
  stripes = 6,
  colorA = "#f2f2f2",
  colorB = "#c81e1e",
  width = 512,
  height = 512,
} = {}) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");

  const stripeW = width / stripes;
  for (let i = 0; i < stripes; i++) {
    ctx.fillStyle = i % 2 === 0 ? colorA : colorB;
    ctx.fillRect(i * stripeW, 0, stripeW, height);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.ClampToEdgeWrapping;
  tex.wrapT = THREE.ClampToEdgeWrapping;
  tex.anisotropy = 4;
  tex.needsUpdate = true;
  return tex;
}

function plane(w, h, mat) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h, 1, 1), mat);
  m.castShadow = false;
  m.receiveShadow = false;
  return m;
}

function ringFrame({ outerW, outerH, innerW, innerH, mat }) {
  const g = new THREE.Group();

  const t = (outerW - innerW) / 2;
  const s = (outerH - innerH) / 2;

  const top = plane(outerW, s, mat);
  top.position.set(0, innerH / 2 + s / 2, 0);

  const bottom = plane(outerW, s, mat);
  bottom.position.set(0, -(innerH / 2) - s / 2, 0);

  const left = plane(t, innerH, mat);
  left.position.set(-(innerW / 2) - t / 2, 0, 0);

  const right = plane(t, innerH, mat);
  right.position.set(innerW / 2 + t / 2, 0, 0);

  g.add(top, bottom, left, right);
  return g;
}

function buildBulbFrame({
  width,
  height,
  z = 0.06,
  offset = 0.10,
  countLong = 18,
  countShort = 7,
  bulbRadius = 0.06,
  emissive = 0xffe8a3,
  emissiveIntensity = 2.2,
  roughness = 0.25,
  metalness = 0.0,
  addPointLights = false,
  pointLightIntensity = 0.6,
  pointLightDistance = 2.2,
} = {}) {
  const g = new THREE.Group();
  g.name = "SignBulbs";

  const bulbMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    emissive: new THREE.Color(emissive),
    emissiveIntensity, // ✅ “encendidas” por defecto (luego tú controlas desde init)
    roughness,
    metalness,
  });

  const geo = new THREE.SphereGeometry(bulbRadius, 14, 10);

  // ✅ HALO barato (se ve siempre, y con bloom se ve increíble)
  const haloMat = new THREE.MeshBasicMaterial({
    color: new THREE.Color(emissive),
    transparent: true,
    opacity: 0.35,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const haloGeo = new THREE.SphereGeometry(bulbRadius * 1.8, 10, 8);

  const halfW = width / 2 + offset;
  const halfH = height / 2 + offset;

  function addBulb(x, y) {
    const bulb = new THREE.Mesh(geo, bulbMat);
    bulb.position.set(x, y, z);
    bulb.castShadow = false;
    bulb.receiveShadow = false;

    // ✅ tags para control ON/OFF/TWINKLE
    bulb.userData.isBulb = true;
    bulb.userData.baseEmissiveIntensity = emissiveIntensity;
    bulb.userData.baseColorHex = bulb.material.color.getHex();
    bulb.userData.offColorHex = 0x3a3a3a; // gris oscuro "ampolleta apagada"

    g.add(bulb);

     // ✅ halo (siempre visible, solo cambia opacidad en twinkle)
    const halo = new THREE.Mesh(haloGeo, haloMat.clone());
    halo.position.set(x, y, z);
    halo.castShadow = false;
    halo.receiveShadow = false;
    halo.userData.isBulbHalo = true;
    halo.userData.baseOpacity = 0.35;
    g.add(halo);

    if (addPointLights) {
      const light = new THREE.PointLight(0xfff2c2, pointLightIntensity, pointLightDistance);
      light.position.set(x, y, z + 0.05);

      light.userData.isBulbLight = true;
      light.userData.baseIntensity = pointLightIntensity;

      g.add(light);
    }
  }

  // arriba/abajo
  for (let i = 0; i < countLong; i++) {
    const t = countLong === 1 ? 0.5 : i / (countLong - 1);
    const x = THREE.MathUtils.lerp(-halfW, halfW, t);
    addBulb(x, halfH);
    addBulb(x, -halfH);
  }

  // lados
  for (let i = 1; i < countShort - 1; i++) {
    const t = i / (countShort - 1);
    const y = THREE.MathUtils.lerp(-halfH, halfH, t);
    addBulb(-halfW, y);
    addBulb(halfW, y);
  }

  return g;
}

/**
 * Entrada “flat” con PUERTA REAL (hueco) + CARTEL con textura + ampolletas visibles
 */
export function createEntranceArch({
  // Posición/orientación
  angle = 0,
  angleOffset = Math.PI / 2,
  radius = CIRCUS.radius + 0.14,
  pushOut = 0.75,

  // Tamaño general
  facadeWidth = 8.0,
  facadeHeight = 5.8,

  // Zona superior / cartel
  topBandHeight = 2.15,
  signYOffset = -0.55,

  // Puerta (hueco)
  openingWidth = 4.5,
  openingHeight = 3.2,
  openingBottomY = 0.05,

  // Rayas
  stripeCount = 6,
  sideStripeWidth = 1.25,

  // Colores
  stripeColorA = 0xf2f2f2,
  stripeColorB = 0xc81e1e,
  redColor = 0x7a0f0f,
  goldColor = 0xf7c948,

  // Bordes
  goldThickness = 0.06,
  doorGoldThickness = 0.055,

  // Cartel
  withSign = true,
  signTextureUrl = ENTRANCE_SIGN?.textureUrl || null,
  signOpacity = 1.0,
  signFramePadding = 0.14,

  // Bombillas
  withBulbs = ENTRANCE_SIGN?.bulbs?.enabled ?? true,
  bulbs = ENTRANCE_SIGN?.bulbs ?? {},

  // (Opcional) túnel
  withTunnel = false,
  tunnelDarkness = 0x050508,
  tunnelOpacity = 0.65,
  tunnelInset = 0.18,
} = {}) {
  const group = new THREE.Group();
  group.name = "EntranceArch";

  const W = facadeWidth;
  const H = facadeHeight;

  // Materiales base
  const matRed = new THREE.MeshStandardMaterial({
    color: redColor,
    roughness: 0.95,
    metalness: 0.0,
  });

  const matGold = new THREE.MeshStandardMaterial({
    color: goldColor,
    roughness: 0.35,
    metalness: 0.25,
  });

  const matTunnel = new THREE.MeshStandardMaterial({
    color: tunnelDarkness,
    roughness: 1.0,
    metalness: 0.0,
    transparent: tunnelOpacity < 1,
    opacity: tunnelOpacity,
    depthWrite: true,
  });

  // anti z-fighting
  matGold.polygonOffset = true;
  matGold.polygonOffsetFactor = -8;
  matGold.polygonOffsetUnits = -8;

  // Textura rayas
  const stripeTex = makeStripeTexture({
    stripes: stripeCount,
    colorA: `#${stripeColorA.toString(16).padStart(6, "0")}`,
    colorB: `#${stripeColorB.toString(16).padStart(6, "0")}`,
  });

  const matStripes = new THREE.MeshStandardMaterial({
    map: stripeTex,
    roughness: 0.95,
    metalness: 0.0,
    side: THREE.DoubleSide,
  });

  // Capas Z (frente)
  const zRed = 0.0;
  const zStripes = 0.01;
  const zGold = 0.02;
  const zDoorGold = 0.025;
  const zSign = 0.03;

  // Capas Z túnel (atrás)
  const zTunnelBack = -0.18;
  const zTunnelWalls = -0.14;

  // Medidas útiles
  const bodyH = Math.max(0.5, H - topBandHeight);
  const doorCenterY = openingBottomY + openingHeight / 2;
  const doorTopY = openingBottomY + openingHeight;

  // =========================================================
  // 1) Fondo rojo RECORTADO (para que la puerta sea hueco real)
  // =========================================================
  const topH = Math.max(0.001, H - doorTopY);
  if (topH > 0.001) {
    const topPanel = plane(W, topH, matRed);
    topPanel.position.set(0, doorTopY + topH / 2, zRed);
    group.add(topPanel);
  }

  const bottomH = Math.max(0.001, openingBottomY);
  if (bottomH > 0.001) {
    const bottomPanel = plane(W, bottomH, matRed);
    bottomPanel.position.set(0, bottomH / 2, zRed);
    group.add(bottomPanel);
  }

  const sidePanelW = Math.max(0.001, W / 2 - openingWidth / 2);
  if (sidePanelW > 0.001) {
    const leftPanel = plane(sidePanelW, openingHeight, matRed);
    leftPanel.position.set(-(openingWidth / 2) - sidePanelW / 2, doorCenterY, zRed);
    group.add(leftPanel);

    const rightPanel = plane(sidePanelW, openingHeight, matRed);
    rightPanel.position.set(openingWidth / 2 + sidePanelW / 2, doorCenterY, zRed);
    group.add(rightPanel);
  }

  // =========================================================
  // 2) Rayas laterales bajo zona superior
  // =========================================================
  const stripesH = bodyH;

  const leftStripes = plane(sideStripeWidth, stripesH, matStripes);
  leftStripes.position.set(-W / 2 + sideStripeWidth / 2, stripesH / 2, zStripes);

  const rightStripes = plane(sideStripeWidth, stripesH, matStripes);
  rightStripes.position.set(W / 2 - sideStripeWidth / 2, stripesH / 2, zStripes);

  group.add(leftStripes, rightStripes);

  // =========================================================
  // 3) Marco exterior dorado
  // =========================================================
  const outerFrame = ringFrame({
    outerW: W,
    outerH: H,
    innerW: W - goldThickness * 2,
    innerH: H - goldThickness * 2,
    mat: matGold,
  });
  outerFrame.position.set(0, H / 2, zGold);
  group.add(outerFrame);

  // =========================================================
  // 4) Marco dorado del hueco
  // =========================================================
  const doorOuterW = openingWidth + doorGoldThickness * 2;
  const doorOuterH = openingHeight + doorGoldThickness * 2;

  const doorFrame = ringFrame({
    outerW: doorOuterW,
    outerH: doorOuterH,
    innerW: openingWidth,
    innerH: openingHeight,
    mat: matGold,
  });
  doorFrame.position.set(0, doorCenterY, zDoorGold);
  group.add(doorFrame);

  // =========================================================
  // 5) Túnel opcional (baja opacidad desde init con tunnelOpacity)
  // =========================================================
  if (withTunnel) {
    const holeW = Math.max(0.2, openingWidth - tunnelInset * 2);
    const holeH = Math.max(0.2, openingHeight - tunnelInset * 2);

    const back = plane(holeW * 0.92, holeH * 0.92, matTunnel);
    back.position.set(0, doorCenterY, zTunnelBack);
    group.add(back);

    const wallThickness = 0.18;
    const wallH = holeH * 0.92;

    const leftWall = plane(wallThickness, wallH, matTunnel);
    leftWall.position.set(-holeW * 0.92 / 2 + wallThickness / 2, doorCenterY, zTunnelWalls);
    group.add(leftWall);

    const rightWall = plane(wallThickness, wallH, matTunnel);
    rightWall.position.set(holeW * 0.92 / 2 - wallThickness / 2, doorCenterY, zTunnelWalls);
    group.add(rightWall);

    const ceiling = plane(holeW * 0.92, wallThickness, matTunnel);
    ceiling.position.set(0, doorCenterY + wallH / 2 - wallThickness / 2, zTunnelWalls);
    group.add(ceiling);
  }

  // =========================================================
  // 6) CARTEL: textura + marco + ampolletas
  // =========================================================
  const signBlockCenterY = bodyH + topBandHeight / 2;

  if (withSign) {
    const signW = W * 0.78;
    const signH = Math.max(0.55, topBandHeight * 0.48);

    let signMat;
    if (signTextureUrl) {
      const tex = new THREE.TextureLoader().load(signTextureUrl);
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.anisotropy = 8;

      signMat = new THREE.MeshStandardMaterial({
        map: tex,
        transparent: signOpacity < 1,
        opacity: signOpacity,
        roughness: 0.85,
        metalness: 0.0,
        side: THREE.DoubleSide,
        alphaTest: 0.01,
      });
    } else {
      signMat = new THREE.MeshStandardMaterial({
        color: 0x000000,
        roughness: 0.85,
        metalness: 0.0,
      });
    }

    const sign = plane(signW, signH, signMat);
    sign.position.set(0, signBlockCenterY + signYOffset + 1, zSign);

    const signFrame = ringFrame({
      outerW: signW + signFramePadding,
      outerH: signH + signFramePadding,
      innerW: signW,
      innerH: signH,
      mat: matGold,
    });
    signFrame.position.copy(sign.position);
    signFrame.position.z = zSign + 0.001;

    group.add(sign, signFrame);

    if (withBulbs) {
      const bulbGroup = buildBulbFrame({
        width: signW + signFramePadding,
        height: signH + signFramePadding,
        z: zSign + 0.03,
        offset: bulbs.offset ?? 0.10,
        countLong: bulbs.countPerSideLong ?? 18,
        countShort: bulbs.countPerSideShort ?? 7,
        bulbRadius: bulbs.radius ?? 0.06,
        emissive: bulbs.emissive ?? 0xffe8a3,
        emissiveIntensity: bulbs.emissiveIntensity ?? 2.2,
        roughness: bulbs.roughness ?? 0.25,
        metalness: bulbs.metalness ?? 0.0,
        addPointLights: bulbs.addPointLights ?? false,
        pointLightIntensity: bulbs.pointLightIntensity ?? 0.6,
        pointLightDistance: bulbs.pointLightDistance ?? 2.2,
      });

      bulbGroup.position.set(0, sign.position.y, 0);
      group.add(bulbGroup);
    }
  }

  // =========================================================
  // Posicionar en perímetro
  // =========================================================
  const finalAngle = angle + angleOffset;
  const r = radius + pushOut;

  group.position.set(Math.cos(finalAngle) * r, 0, Math.sin(finalAngle) * r);
  group.lookAt(0, 0, 0);
  group.rotateY(Math.PI);

  group.userData.openingWidth = openingWidth;
  group.userData.openingHeight = openingHeight;
  group.userData.openingBottomY = openingBottomY;

  // ✅ default modo (lo controla initScene)
  group.userData.bulbsMode = "off";

  return group;
}
