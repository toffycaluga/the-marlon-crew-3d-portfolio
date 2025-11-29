// src/three/initScene.js
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { viewsConfig } from './viewsConfig.js';

export function initThreeScene(canvas) {
  // Renderer
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
  });

  const sizes = {
    width: window.innerWidth,
    height: window.innerHeight,
  };

  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // Scene
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x050509);

  // Camera
  const camera = new THREE.PerspectiveCamera(
    45,
    sizes.width / sizes.height,
    0.1,
    100
  );
  scene.add(camera);

  // Lights
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
  scene.add(ambientLight);

  const dirLight = new THREE.DirectionalLight(0xffffff, 1);
  dirLight.position.set(3, 5, 2);
  scene.add(dirLight);

  // 🔹 Piso
  const floorGeometry = new THREE.PlaneGeometry(40, 40);
  const floorMaterial = new THREE.MeshStandardMaterial({
    color: 0x111111,
    roughness: 0.8,
    metalness: 0.1,
  });
  const floor = new THREE.Mesh(floorGeometry, floorMaterial);
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = 0;
  scene.add(floor);

  // 🔹 Ring central (cilindro fino)
  const ringGeometry = new THREE.CylinderGeometry(5, 5, 0.3, 64);
  const ringMaterial = new THREE.MeshStandardMaterial({
    color: 0x8a1b3a, // rojo circo
    roughness: 0.4,
  });
  const ring = new THREE.Mesh(ringGeometry, ringMaterial);
  ring.position.y = 0.15;
  scene.add(ring);

  // 🔹 Placeholder en el centro (por ahora mantenemos el cubo)
  const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
  const cubeMaterial = new THREE.MeshStandardMaterial({ color: 0xff0055 });
  const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
  cube.position.y = 1;
  scene.add(cube);

  // Controls
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;

  // 🔹 Función para cambiar de vista
  function setView(name) {
    const view = viewsConfig[name];
    if (!view) return;

    const [px, py, pz] = view.position;
    const [lx, ly, lz] = view.lookAt;

    camera.position.set(px, py, pz);
    controls.target.set(lx, ly, lz);
    controls.update();
  }

  // Vista inicial
  setView('center');

  // Exponer para usar desde fuera (por ahora, vía window)
  window.setThreeView = setView;

  // Resize
  function onWindowResize() {
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;

    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix();

    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  }

  window.addEventListener('resize', onWindowResize);

  // Loop
  function animate() {
    requestAnimationFrame(animate);

    cube.rotation.y += 0.01;
    cube.rotation.x += 0.005;

    controls.update();
    renderer.render(scene, camera);
  }

  animate();
}
