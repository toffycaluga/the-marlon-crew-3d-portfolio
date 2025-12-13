// src/three/initScene.js
import * as THREE from "three";

import { createCamera } from "./camera.js";
import { createLights } from "./lights.js";

import { createCircusBase } from "./elements/base.js";
import { createStage } from "./elements/stage.js";
import { createGallery } from "./elements/gallery.js";
import { createCircusTowers } from "./elements/towers.js";


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
  scene.add(createCircusTowers());

  
  function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
  }

  animate();
}
