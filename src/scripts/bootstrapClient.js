import { initThreeScene } from "../three/initScene.js";
import { initI18nState } from "./i18nState.js";
import { initUI } from "./uiController.js";
import { initLoader } from "./loader.js";

window.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("three-canvas");
  if (!canvas) return;

  initI18nState();
  initLoader();
  initUI();
  initThreeScene(canvas);
});
