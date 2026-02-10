// src/three/applyView.js
import * as THREE from "three";
import { viewsConfig } from "./viewsConfig.js";
import { logger } from "./utils/logger.js";

function vec3FromArray(arr) {
  return new THREE.Vector3(arr[0], arr[1], arr[2]);
}

/**
 * Aplica una vista del viewsConfig a cámara + orbit controls.
 * @param {object} params
 * @param {THREE.PerspectiveCamera} params.camera
 * @param {OrbitControls} params.controls
 * @param {string} params.viewName
 * @param {number} params.durationMs
 */
export function applyView({ camera, controls, viewName, durationMs = 550 }) {
  const cfg = viewsConfig[viewName];
  if (!cfg) {
    logger.warn("[applyView] vista no existe", { viewName });
    return;
  }

  const toPos = vec3FromArray(cfg.position);
  const toTarget = vec3FromArray(cfg.lookAt);

  logger.debug("[applyView] applying", {
    viewName,
    toPos: cfg.position,
    toTarget: cfg.lookAt,
    durationMs,
  });

  // Sin transición (por si duration = 0)
  if (!durationMs || durationMs <= 0) {
    camera.position.copy(toPos);
    controls.target.copy(toTarget);
    controls.update();
    return;
  }

  // Transición suave: interpolamos posición y target
  const fromPos = camera.position.clone();
  const fromTarget = controls.target.clone();

  const t0 = performance.now();

  function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  function tick(now) {
    const raw = (now - t0) / durationMs;
    const t = Math.min(1, Math.max(0, raw));
    const k = easeInOutCubic(t);

    camera.position.lerpVectors(fromPos, toPos, k);
    controls.target.lerpVectors(fromTarget, toTarget, k);

    controls.update();

    if (t < 1) requestAnimationFrame(tick);
  }

  requestAnimationFrame(tick);
}
