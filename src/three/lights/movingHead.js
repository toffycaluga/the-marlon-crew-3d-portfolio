// src/three/lights/movingHead.js
import * as THREE from "three";

/**
 * Moving Head (estructura + spotlight + beam opcional)
 *
 * - Beam corregido: fino en la lámpara, ancho hacia afuera (CylinderGeometry)
 * - Beam más sutil: menor opacidad + AdditiveBlending
 * - Tamaño realista: scale 0.4
 */

function clamp(v, min, max) {
  return Math.min(max, Math.max(min, v));
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function toColor(c) {
  return c instanceof THREE.Color ? c : new THREE.Color(c);
}

export function createMovingHead({
  name = "movingHead",

  // Transform
  position = [0, 0, 0],
  rotationY = 0,

  // Apuntado
  target = [0, 0, 0],

  // Estado
  on = true,
  dimmer = 1.0,

  // Luz
  color = "#ffffff",
  intensity = 40,
  distance = 80,
  angleDeg = 18,
  penumbra = 0.35,
  decay = 2,

  // Sombras
  castShadow = false,
  shadowMapSize = 1024,

  // Beam visible
  beamVisible = true,
  beamLength = 25,
  beamRadius = 1.2, // radio final (lejos)

  // Material “lente”
  lensEmissiveIntensityOn = 3.0,
  lensEmissiveIntensityOff = 0.08,

  // Smooth
  smooth = true,
  smoothSpeed = 8.0,

  // Debug
  addHelper = false,
} = {}) {
  // ==========================================================
  // Grupo raíz
  // ==========================================================
  const group = new THREE.Group();
  group.name = name;
  group.position.set(position[0], position[1], position[2]);
  group.rotation.y = rotationY;

  // Tamaño realista (metros)
  group.scale.setScalar(0.4);

  // ==========================================================
  // Materiales
  // ==========================================================
  const matBody = new THREE.MeshStandardMaterial({
    color: 0x111111,
    roughness: 0.55,
    metalness: 0.3,
  });

  const lensColor = toColor(color);
  const matLens = new THREE.MeshStandardMaterial({
    color: 0x0b0b0b,
    roughness: 0.25,
    metalness: 0.1,
    emissive: lensColor.clone(),
    emissiveIntensity: on
      ? lensEmissiveIntensityOn
      : lensEmissiveIntensityOff,
  });

  // Beam sutil y mezclado mejor
  const matBeam = new THREE.MeshBasicMaterial({
    color: lensColor.clone(),
    transparent: true,
    opacity: 0.03, // 👈 más sutil (sube a 0.04–0.06 si quieres más visible)
    depthWrite: false,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
  });

  // ==========================================================
  // Geometría física
  // ==========================================================
  const base = new THREE.Mesh(
    new THREE.CylinderGeometry(0.7, 0.9, 0.55, 18),
    matBody
  );
  base.position.y = 0.275;
  base.castShadow = true;
  base.receiveShadow = true;
  group.add(base);

  const yoke = new THREE.Group();
  yoke.position.y = 0.55;
  group.add(yoke);

  const armL = new THREE.Mesh(
    new THREE.BoxGeometry(0.12, 0.9, 0.12),
    matBody
  );
  armL.position.set(-0.55, 0.45, 0);
  armL.castShadow = true;
  armL.receiveShadow = true;

  const armR = armL.clone();
  armR.position.x = 0.55;

  const bridge = new THREE.Mesh(
    new THREE.BoxGeometry(1.2, 0.12, 0.12),
    matBody
  );
  bridge.position.set(0, 0.9, 0);
  bridge.castShadow = true;
  bridge.receiveShadow = true;

  yoke.add(armL, armR, bridge);

  const headPivot = new THREE.Group();
  headPivot.position.y = 0.5;
  yoke.add(headPivot);

  const head = new THREE.Mesh(
    new THREE.BoxGeometry(0.9, 0.6, 0.9),
    matBody
  );
  head.position.set(0, 0.15, 0);
  head.castShadow = true;
  head.receiveShadow = true;
  headPivot.add(head);

  const lens = new THREE.Mesh(
    new THREE.CylinderGeometry(0.22, 0.22, 0.1, 18),
    matLens
  );
  lens.rotation.x = Math.PI / 2;
  lens.position.set(0, 0.12, 0.5);
  headPivot.add(lens);

  // ==========================================================
  //lym// SpotLight real
  // ==========================================================
  const spot = new THREE.SpotLight(
    lensColor.clone(),
    on ? intensity * clamp(dimmer, 0, 1) : 0,
    distance,
    THREE.MathUtils.degToRad(angleDeg),
    penumbra,
    decay
  );

  spot.position.set(0, 0.12, 0.55);
  spot.castShadow = !!castShadow;
  if (spot.castShadow) {
    spot.shadow.mapSize.set(shadowMapSize, shadowMapSize);
    spot.shadow.bias = -0.00008;
  }

  const spotTarget = new THREE.Object3D();
  spotTarget.position.set(target[0], target[1], target[2]);

  group.add(spot, spotTarget);
  spot.target = spotTarget;

  // ==========================================================
  // Beam visible (CORRECTO: fino en la lámpara, ancho afuera)
  // ==========================================================
  const beamRadiusNear = 0.03; // 👈 fino cerca del lente (0.02–0.06 recomendado)

  // CylinderGeometry(radiusTop, radiusBottom, height)
  const beamGeom = new THREE.CylinderGeometry(
    beamRadiusNear, // cerca del lente
    beamRadius,     // lejos
    beamLength,
    18,
    1,
    true
  );

  const beam = new THREE.Mesh(beamGeom, matBeam);

  // Orientarlo hacia +Z
  beam.rotation.x = - Math.PI / 2;

  // Posicionarlo desde el lente hacia afuera
  beam.position.set(0, 0.12, 0.55 + beamLength / 2);

  beam.visible = !!beamVisible && on && dimmer > 0.001;
  headPivot.add(beam);

  // ==========================================================
  // Helper
  // ==========================================================
  let helper = null;
  if (addHelper) helper = new THREE.SpotLightHelper(spot);

  // ==========================================================
  // Estado interno
  // ==========================================================
  const state = {
    on: !!on,
    dimmer: clamp(dimmer, 0, 1),
    intensity,
    color: lensColor.clone(),
    distance,
    angleDeg,
    penumbra,
    decay,
    beamVisible: !!beamVisible,
    target: new THREE.Vector3(target[0], target[1], target[2]),
  };

  const desired = {
    on: state.on,
    dimmer: state.dimmer,
    intensity: state.intensity,
    color: state.color.clone(),
    distance: state.distance,
    angleDeg: state.angleDeg,
    penumbra: state.penumbra,
    target: state.target.clone(),
    beamVisible: state.beamVisible,
  };

  function applyNow() {
    // Lente
    matLens.emissive.copy(state.color);
    matLens.emissiveIntensity = state.on
      ? lensEmissiveIntensityOn * state.dimmer
      : lensEmissiveIntensityOff;

    // Spot
    spot.color.copy(state.color);
    spot.intensity = state.on ? state.intensity * state.dimmer : 0;
    spot.distance = state.distance;
    spot.angle = THREE.MathUtils.degToRad(state.angleDeg);
    spot.penumbra = state.penumbra;

    // Beam
    matBeam.color.copy(state.color);
    beam.visible = state.beamVisible && state.on && state.dimmer > 0.001;

    // Target
    spotTarget.position.copy(state.target);

    if (helper) helper.update();
  }

  // ==========================================================
  // API
  // ==========================================================
  function setOn(v) {
    desired.on = !!v;
    if (!smooth) {
      state.on = desired.on;
      applyNow();
    }
  }

  function setDimmer(v) {
    desired.dimmer = clamp(v, 0, 1);
    if (!smooth) {
      state.dimmer = desired.dimmer;
      applyNow();
    }
  }

  function setColor(c) {
    desired.color = toColor(c);
    if (!smooth) {
      state.color.copy(desired.color);
      applyNow();
    }
  }

  function setIntensity(v) {
    desired.intensity = Math.max(0, v);
    if (!smooth) {
      state.intensity = desired.intensity;
      applyNow();
    }
  }

  function setDistance(v) {
    desired.distance = Math.max(0.1, v);
    if (!smooth) {
      state.distance = desired.distance;
      applyNow();
    }
  }

  function setZoomDeg(v) {
    desired.angleDeg = clamp(v, 1, 60);
    if (!smooth) {
      state.angleDeg = desired.angleDeg;
      applyNow();
    }
  }

  function setPenumbra(v) {
    desired.penumbra = clamp(v, 0, 1);
    if (!smooth) {
      state.penumbra = desired.penumbra;
      applyNow();
    }
  }

  function setTarget(v) {
    if (Array.isArray(v)) desired.target.set(v[0], v[1], v[2]);
    else desired.target.copy(v);
    if (!smooth) {
      state.target.copy(desired.target);
      applyNow();
    }
  }

  function setBeamVisible(v) {
    desired.beamVisible = !!v;
    if (!smooth) {
      state.beamVisible = desired.beamVisible;
      applyNow();
    }
  }

  function update(dt = 0.016) {
    if (!smooth) return;

    const t = 1 - Math.exp(-smoothSpeed * dt);

    if (state.on !== desired.on) state.on = desired.on;
    if (state.beamVisible !== desired.beamVisible)
      state.beamVisible = desired.beamVisible;

    state.dimmer = lerp(state.dimmer, desired.dimmer, t);
    state.intensity = lerp(state.intensity, desired.intensity, t);
    state.distance = lerp(state.distance, desired.distance, t);
    state.angleDeg = lerp(state.angleDeg, desired.angleDeg, t);
    state.penumbra = lerp(state.penumbra, desired.penumbra, t);

    state.color.lerp(desired.color, t);
    state.target.lerp(desired.target, t);

    applyNow();
  }

  applyNow();

  return {
    group,
    base,
    yoke,
    headPivot,
    head,
    lens,
    spot,
    spotTarget,
    beam,
    helper,

    // API
    setOn,
    setDimmer,
    setColor,
    setIntensity,
    setDistance,
    setZoomDeg,
    setPenumbra,
    setTarget,
    setBeamVisible,
    update,

    getState: () => ({
      ...state,
      color: state.color.clone(),
      target: state.target.clone(),
    }),
  };
}
