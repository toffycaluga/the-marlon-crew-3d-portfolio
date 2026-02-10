// src/three/initScene.js
import * as THREE from "three";
import { DOME, TENT, CIRCUS } from "./constants.js";

import { createCamera } from "./camera.js";
import { createLights } from "./lights.js";
import { applyView } from "./applyView.js";
import { logger } from "./utils/logger.js";

// Postprocessing (Bloom)
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";

// Elements (base / structure)
import { createCircusBase } from "./elements/base.js";
import { createStage } from "./elements/stage.js";
import { createGallery } from "./elements/gallery.js";
import { createGallerySeats } from "./elements/gallerySeats.js";

// Elements (rigs / trusses / towers)
import { createCircusTowers } from "./elements/towers.js";
import { createDomeTruss } from "./elements/dome.js";
import { createRectangularTruss } from "./elements/rectTruss.js";
import { createTrapezePlatform } from "./elements/trapezePlatform.js";
import { createStrongBar } from "./elements/strongBar.js";
import { createTrapezeBar } from "./elements/trapezeBar.js";

// Safety net
import { createSafetyNetBase } from "./elements/safetyNetBase.js";
import { createSafetyNetSides } from "./elements/safetyNetSides.js";
import { createSafetyNetWalls } from "./elements/safetyNetWalls.js";

// Backstage
import { createBackstage } from "./elements/backstage.js";
import { createBackstageCurtains } from "./elements/backstageCurtains.js";
import { createBackstageSideCurtains } from "./elements/backstageSideCurtains.js";

// Tent / perimeter
import { createPerimeterPoles } from "./elements/perimeterPoles.js";
import { createCircusTent } from "./elements/tent.js";
import { createTowerTentHoles } from "./elements/towerTentHoles.js";
import { createDomeTentRing } from "./elements/domeTentRing.js";
import { createInvertedConeUp } from "./elements/invertedCone.js";

// Entrance
import { createCircusPerimeterWithEntrance } from "./elements/circusPerimeterEntrance.js";
import { createEntranceArch } from "./elements/entranceArch.js";
import { createEntranceCurtains } from "./elements/entranceCurtains.js";

// Controllers
import { createEntranceBulbsController } from "./controllers/entranceBulbsController.js";

// Moving heads (rig)
import { createLightsRig } from "./lights/lightsRig.js";
import { createLightsController } from "./lights/lightsController.js";

// ============================================================
// Config (un solo lugar)
// ============================================================
const CONFIG = {
  renderer: {
    antialias: true,
    shadows: true,
    shadowType: THREE.PCFSoftShadowMap,
    outputColorSpace: THREE.SRGBColorSpace,
    toneMapping: THREE.ACESFilmicToneMapping,
    exposure: 1.0,
    maxPixelRatio: 2,
  },
  scene: {
    background: 0x050509,
  },
  bloom: {
    strength: 1.2,
    radius: 0.4,
    threshold: 0.15,
  },
  entrance: {
    angle: Math.PI,
    width: 4.5,
    arch: {
      facadeWidth: 8.0,
      facadeHeight: 5.8,
      topBandHeight: 3.8,
      signYOffset: -0.35,
      openingWidth: 4.5,
      openingHeight: 3.2,
      openingBottomY: 0.05,
      stripeCount: 6,
      sideStripeWidth: 1.25,
      pushOut: 0.75,
      withSign: true,
      signTextureUrl: "/textures/caceres_sign.png",
      withBulbs: true,
      bulbs: {
        radius: 0.06,
        emissiveIntensity: 2.2,
        countPerSideLong: 18,
        countPerSideShort: 7,
        addPointLights: false,
      },
      withTunnel: true,
      tunnelOpacity: 0.65,
    },
  },
};

// ============================================================
// Helpers: setup por responsabilidad
// ============================================================
function setupRenderer(canvas) {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: CONFIG.renderer.antialias,
  });

  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(
    Math.min(window.devicePixelRatio || 1, CONFIG.renderer.maxPixelRatio)
  );

  if (CONFIG.renderer.shadows) {
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = CONFIG.renderer.shadowType;
  }

  renderer.outputColorSpace = CONFIG.renderer.outputColorSpace;
  renderer.toneMapping = CONFIG.renderer.toneMapping;
  renderer.toneMappingExposure = CONFIG.renderer.exposure;

  return renderer;
}

function setupScene() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(CONFIG.scene.background);
  return scene;
}

function setupPostFX(renderer, scene, camera) {
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));

  const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    CONFIG.bloom.strength,
    CONFIG.bloom.radius,
    CONFIG.bloom.threshold
  );
  composer.addPass(bloomPass);

  return { composer, bloomPass };
}

function buildSceneObjects(scene) {
  scene.add(createCircusBase());
  scene.add(createStage());
  scene.add(createGallery());
  scene.add(createGallerySeats());

  scene.add(createCircusTowers());
  scene.add(createDomeTruss());
  scene.add(createRectangularTruss());
  scene.add(createTrapezePlatform());
  scene.add(createStrongBar());
  scene.add(createTrapezeBar());

  scene.add(createSafetyNetBase());
  scene.add(createSafetyNetSides());
  scene.add(createSafetyNetWalls());

  scene.add(createBackstage());
  scene.add(createBackstageCurtains());
  scene.add(createBackstageSideCurtains());

  const poles = createPerimeterPoles({
    excludeAngleRanges: [
      { center: -Math.PI / 2, width: THREE.MathUtils.degToRad(10) },
      { center: Math.PI / 2, width: THREE.MathUtils.degToRad(10) },
    ],
  });
  scene.add(poles);

  scene.add(createCircusTent());

  scene.add(
    createTowerTentHoles({
      sink: -5.5,
      innerRadius: 0.62,
      outerRadius: 1.45,
    })
  );

  scene.add(createDomeTentRing({ height: 0.8 }));

  scene.add(
    createInvertedConeUp({
      yBase: DOME.height - 0.01,
      height: 5,
      baseRadius: DOME.diameter / 2,
      tipRadius: 0,
    })
  );

  return { poles };
}

function buildEntrance(scene) {
  const { angle: entranceAngle, width: entranceWidth, arch } = CONFIG.entrance;

  scene.add(
    createCircusPerimeterWithEntrance({
      entranceWidthMeters: entranceWidth,
      entranceAngle,
    })
  );

  const entranceArch = createEntranceArch({
    angle: entranceAngle,
    ...arch,
  });

  const entranceCurtains = createEntranceCurtains({
    radius: CIRCUS.radius + 0.12,
    groundY: 0,
    topY: TENT.bottomY,
    openingWidth: 4.5,
    openingHeight: 3.2,
    depth: 0.45,
    curtainColor: 0xb91c1c,
    foldAmp: 0.03,
    foldFreq: 8,
    sideYawDeg: 8,
    open: 0.0,
  });

  scene.add(entranceCurtains);
  scene.add(entranceArch);

  const bulbsController = createEntranceBulbsController(entranceArch);
  bulbsController.setMode("off");

  return { entranceArch, bulbsController };
}

function bindViewButtons({ camera, controls, entranceBulbs, lightsController }) {
  const buttons = document.querySelectorAll("[data-view]");
  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const viewName = btn.dataset.view;

      logger.info("[ui] view click", { viewName });

      applyView({ camera, controls, viewName, durationMs: 550 });

      // ✅ luces por vista
      lightsController.applyView(viewName);

      // ✅ bulbs rule actual
      if (viewName === "center") entranceBulbs.setMode("twinkle");
      else entranceBulbs.setMode("off");
    });
  });
}

function createResizeHandler({ renderer, composer, bloomPass, camera }) {
  return function onResize() {
    const w = window.innerWidth;
    const h = window.innerHeight;

    renderer.setSize(w, h);

    camera.aspect = w / h;
    camera.updateProjectionMatrix();

    composer.setSize(w, h);
    bloomPass.setSize(w, h);
  };
}

// ============================================================
// Public API
// ============================================================
export function initThreeScene(canvas) {
  const renderer = setupRenderer(canvas);
  const scene = setupScene();

  const { camera, controls } = createCamera(renderer);
  scene.add(camera);

  createLights(scene);

  // ✅ Rig moving heads
  const lightsRig = createLightsRig(scene, { intensityScale: 1, beamVisible: true });
  const lightsController = createLightsController(lightsRig);

  const { composer, bloomPass } = setupPostFX(renderer, scene, camera);

  buildSceneObjects(scene);

  const { entranceArch, bulbsController } = buildEntrance(scene);

  bindViewButtons({
    camera,
    controls,
    entranceBulbs: bulbsController,
    lightsController,
  });

  // Vista inicial
  applyView({ camera, controls, viewName: "center", durationMs: 0 });
  lightsController.applyView("center");
  logger.info("[init] initial view applied", { viewName: "center" });

  const onResize = createResizeHandler({ renderer, composer, bloomPass, camera });
  window.addEventListener("resize", onResize);

  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);

    const delta = clock.getDelta();
    const elapsed = clock.elapsedTime;

    bulbsController.update(delta, elapsed);

    // ✅ update moving heads
    lightsRig.update(delta);

    controls.update();
    composer.render();
  }

  animate();

  function dispose() {
    window.removeEventListener("resize", onResize);
    logger.info("[dispose] removed listeners");
  }

  return {
    scene,
    camera,
    controls,
    renderer,
    composer,
    bloomPass,
    entranceArch,
    bulbsController,
    lightsRig,
    lightsController,
    dispose,
  };
}
