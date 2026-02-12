// src/entry/bootstrapClient.entry.js

function getScriptEl() {
  // currentScript funciona bien para scripts externos (como el tuyo con src=...).
  const el = document.currentScript;
  if (el) return el;

  // Fallback ultra seguro: busca el script que tenga el data-init-scene
  return document.querySelector('script[data-init-scene]');
}

async function loadModule(url, exportName) {
  if (!url) throw new Error(`[bootstrapClient] Falta URL para ${exportName}`);
  const mod = await import(url);
  if (!(exportName in mod)) {
    throw new Error(
      `[bootstrapClient] El módulo ${url} no exporta "${exportName}". Exporta: ${Object.keys(mod).join(", ")}`
    );
  }
  return mod[exportName];
}

window.addEventListener("DOMContentLoaded", async () => {
  const canvas = document.getElementById("three-canvas");
  if (!canvas) return;

  const scriptEl = getScriptEl();
  if (!scriptEl) throw new Error("[bootstrapClient] No se encontró el <script> actual.");

  const initSceneUrl = scriptEl.dataset.initScene;
  const i18nStateUrl = scriptEl.dataset.i18nState;
  const uiControllerUrl = scriptEl.dataset.uiController;
  const loaderUrl = scriptEl.dataset.loader;

  const initThreeScene = await loadModule(initSceneUrl, "initThreeScene");
  const initI18nState = await loadModule(i18nStateUrl, "initI18nState");
  const initUI = await loadModule(uiControllerUrl, "initUI");
  const initLoader = await loadModule(loaderUrl, "initLoader");

  initI18nState();
  initLoader();
  initUI();
  initThreeScene(canvas);
});
