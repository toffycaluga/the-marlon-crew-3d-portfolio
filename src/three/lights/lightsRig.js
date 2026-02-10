// src/three/lights/lightsRig.js
import { createMovingHead } from "./movingHead.js";
import { logger } from "../utils/logger.js";

import { backstagePositions } from "./positions/backstage.js";
import { cupulaPositions } from "./positions/cupula.js";
import { stagePositions } from "./positions/stage.js";
import { frontStagePositions } from "./positions/frontStage.js";
import { entrancePositions } from "./positions/entrance.js";
import { towersPositions } from "./positions/towers.js";

function buildGroup(scene, list, defaults, groupName) {
  const group = {};

  if (!Array.isArray(list) || list.length === 0) {
    logger.warn("[lightsRig] positions list vacía", { groupName });
    return group;
  }

  list.forEach((cfg) => {
    if (!cfg?.key || !cfg?.name || !cfg?.position || !cfg?.target) {
      logger.error("[lightsRig] cfg inválido en positions", { groupName, cfg });
      return;
    }

    const l = createMovingHead({
      ...defaults,
      name: cfg.name,
      position: cfg.position,
      target: cfg.target,
      on: false,
      dimmer: 0,
    });

    scene.add(l.group);
    group[cfg.key] = l;
  });

  logger.debug("[lightsRig] group built", {
    groupName,
    count: Object.keys(group).length,
  });

  return group;
}

export function createLightsRig(
  scene,
  { intensityScale = 1, beamVisible = true } = {}
) {
  if (!scene) {
    logger.error("[lightsRig] createLightsRig llamado sin scene");
    throw new Error("[lightsRig] scene is required");
  }

  // Defaults globales de moving head (ajustables por grupo)
  const defaults = {
    beamVisible,
    castShadow: false,
    intensity: 40 * intensityScale,
    distance: 120,
    angleDeg: 18,
    penumbra: 0.35,
    smooth: true,
    smoothSpeed: 8,
  };

  const groups = {
    backstage: buildGroup(
      scene,
      backstagePositions,
      { ...defaults, intensity: 30 * intensityScale, distance: 70, angleDeg: 18 },
      "backstage"
    ),
    cupula: buildGroup(
      scene,
      cupulaPositions,
      { ...defaults, intensity: 40 * intensityScale, distance: 120, angleDeg: 22 },
      "cupula"
    ),
    stage: buildGroup(
      scene,
      stagePositions,
      { ...defaults, intensity: 35 * intensityScale, distance: 90, angleDeg: 16 },
      "stage"
    ),
    front_stage: buildGroup(
      scene,
      frontStagePositions,
      { ...defaults, intensity: 45 * intensityScale, distance: 110, angleDeg: 14 },
      "front_stage"
    ),
    entrance: buildGroup(
      scene,
      entrancePositions,
      { ...defaults, intensity: 28 * intensityScale, distance: 80, angleDeg: 18 },
      "entrance"
    ),
    towers: buildGroup(
      scene,
      towersPositions,
      { ...defaults, intensity: 50 * intensityScale, distance: 140, angleDeg: 10 },
      "towers"
    ),
  };

  function setGroup(groupName, opts = {}) {
    const g = groups[groupName];
    if (!g) {
      logger.error("[lightsRig] group no existe", { groupName, opts });
      return false;
    }

    const keys = Object.keys(g);
    if (keys.length === 0) {
      logger.warn("[lightsRig] group existe pero está vacío", { groupName });
      return false;
    }

    // Log útil solo en debug
    logger.debug("[lightsRig] setGroup", { groupName, opts });

    Object.values(g).forEach((l) => {
      if (opts.on != null) l.setOn(opts.on);

      // Si explícitamente apagamos, dimmer 0 sí o sí.
      if (opts.dimmer != null) {
        const next = opts.on === false ? 0 : opts.dimmer;
        l.setDimmer(next);
      }

      if (opts.color) l.setColor(opts.color);
      if (opts.target) l.setTarget(opts.target);
      if (opts.zoomDeg != null) l.setZoomDeg(opts.zoomDeg);
      if (opts.intensity != null) l.setIntensity(opts.intensity);
      if (opts.beamVisible != null) l.setBeamVisible(opts.beamVisible);
    });

    return true;
  }

  function allOff() {
    logger.debug("[lightsRig] allOff");
    Object.keys(groups).forEach((k) => setGroup(k, { on: false, dimmer: 0 }));
  }

  function update(dt) {
    // dt inválido: no rompas el loop
    if (!Number.isFinite(dt) || dt <= 0) return;

    Object.values(groups).forEach((g) => {
      Object.values(g).forEach((l) => l.update(dt));
    });
  }

  // Apaga todo al iniciar
  allOff();

  logger.info("[lightsRig] ready", {
    groups: Object.fromEntries(
      Object.entries(groups).map(([k, v]) => [k, Object.keys(v).length])
    ),
  });

  return { groups, setGroup, allOff, update };
}
