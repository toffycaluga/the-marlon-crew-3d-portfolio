// src/three/initScene.js
import * as THREE from "three";

import { createCamera } from "./camera.js";
import { createLights } from "./lights.js";

import { createCircusBase } from "./elements/base.js";
import { createStage } from "./elements/stage.js";
import { createGallery } from "./elements/gallery.js";
import { createCircusTowers } from "./elements/towers.js";
import { createDomeTruss } from "./elements/dome.js";
import { createRectangularTruss } from "./elements/rectTruss.js";
import { createTrapezePlatform } from "./elements/trapezePlatform.js";
import { createStrongBar } from "./elements/strongBar.js";
import { createTrapezeBar } from "./elements/trapezeBar.js";
import { createSafetyNetBase } from "./elements/safetyNetBase.js";
import { createSafetyNetSides } from "./elements/safetyNetSides.js";
import { createSafetyNetLaterals } from "./elements/safetyNetLaterals.js";
import { createSafetyNetLateralsAnchored } from "./elements/safetyNetLateralsAnchored.js";
import { createSafetyNetWalls } from "./elements/safetyNetWalls.js";
import { createGallerySeats } from "./elements/gallerySeats.js";

import { createBackstage } from "./elements/backstage.js";

import { createBackstageCurtains } from "./elements/backstageCurtains.js";
import { createBackstageSideCurtains } from "./elements/backstageSideCurtains.js";













export function initThreeScene(canvas) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x050509);

  const { camera, controls } = createCamera(renderer);
  scene.add(camera);

  createLights(scene);

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
  // scene.add(createSafetyNetLaterals());
  
  // scene.add(createSafetyNetLateralsAnchored());
  scene.add(createSafetyNetWalls());
  scene.add(createBackstage());
  scene.add(createBackstageCurtains());
  
  scene.add(createBackstageSideCurtains());


  function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
  }

  animate();
}
