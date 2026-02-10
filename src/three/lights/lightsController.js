// src/three/lights/lightsController.js
import { lightingPresetsByView } from "./presets/byView.js";
import { logger } from "../utils/logger.js";

export function createLightsController(lightsRig) {
  function applyView(viewName) {
    logger.info("[lightsController] applyView", { viewName });

    // Apaga todo primero: control total, sin residuos
    lightsRig.allOff();

    const preset = lightingPresetsByView[viewName];
    if (!preset) {
      logger.warn("[lightsController] no preset for view", { viewName });
      return;
    }

    preset.forEach((p) => {
      if (!p?.group) {
        logger.error("[lightsController] preset inválido (sin group)", { viewName, presetItem: p });
        return;
      }

      if (!lightsRig.groups?.[p.group]) {
        logger.error("[lightsController] group no existe en rig", { viewName, group: p.group, presetItem: p });
        return;
      }

      logger.debug("[lightsController] apply group", { group: p.group, presetItem: p });
      lightsRig.setGroup(p.group, p);
    });
  }

  return { applyView };
}
