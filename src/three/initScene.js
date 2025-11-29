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
    200
  );
  scene.add(camera);

  // Lights
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
  scene.add(ambientLight);

  const dirLight = new THREE.DirectionalLight(0xffffff, 1.1);
  dirLight.position.set(6, 10, 4);
  scene.add(dirLight);

  // 🔹 Piso general
  const floorGeometry = new THREE.PlaneGeometry(60, 60);
  const floorMaterial = new THREE.MeshStandardMaterial({
    color: 0x050506,
    roughness: 0.9,
    metalness: 0.05,
  });
  const floor = new THREE.Mesh(floorGeometry, floorMaterial);
  floor.rotation.x = -Math.PI / 2;
  scene.add(floor);

  // 🔹 Ring central
  const ringGeometry = new THREE.CylinderGeometry(6, 6, 0.5, 64);
  const ringMaterial = new THREE.MeshStandardMaterial({
    color: 0x8a1b3a, // rojo circo
    roughness: 0.5,
  });
  const ring = new THREE.Mesh(ringGeometry, ringMaterial);
  ring.position.y = 0.25;
  scene.add(ring);

  // 🔹 Cubo central (placeholder de acto)
  const cubeGeometry = new THREE.BoxGeometry(1.5, 1.5, 1.5);
  const cubeMaterial = new THREE.MeshStandardMaterial({ color: 0xff0055 });
  const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
  cube.position.y = 1.25;
  scene.add(cube);

  // 🔹 Estructura de trapecio (poste + plataforma)
  const postGeom = new THREE.CylinderGeometry(0.2, 0.2, 10, 16);
  const postMat = new THREE.MeshStandardMaterial({ color: 0xcccccc });
  const postLeft = new THREE.Mesh(postGeom, postMat);
  postLeft.position.set(-2.5, 5, 2);
  scene.add(postLeft);

  const postRight = postLeft.clone();
  postRight.position.x = 2.5;
  scene.add(postRight);

  const barGeom = new THREE.BoxGeometry(5.5, 0.2, 0.3);
  const bar = new THREE.Mesh(barGeom, postMat);
  bar.position.set(0, 9.5, 2);
  scene.add(bar);

  // plataforma donde estaría el volante
  const platGeom = new THREE.BoxGeometry(2, 0.2, 1.2);
  const platMat = new THREE.MeshStandardMaterial({ color: 0x1e293b });
  const platform = new THREE.Mesh(platGeom, platMat);
  platform.position.set(0, 8, 3.2);
  scene.add(platform);

  // 🔹 Gradas (público)
  const stepGeom = new THREE.BoxGeometry(14, 1, 3);
  const stepMat = new THREE.MeshStandardMaterial({ color: 0x0b1120 });
  const step1 = new THREE.Mesh(stepGeom, stepMat);
  step1.position.set(0, 0.5, -9);
  scene.add(step1);

  const step2 = step1.clone();
  step2.scale.set(0.9, 1, 1);
  step2.position.set(0, 1.5, -11);
  scene.add(step2);

  const step3 = step1.clone();
  step3.scale.set(0.8, 1, 1);
  step3.position.set(0, 2.5, -13);
  scene.add(step3);

  // 🔹 Entrada del circo (arco)
  const columnGeom = new THREE.BoxGeometry(0.8, 4, 0.8);
  const columnMat = new THREE.MeshStandardMaterial({ color: 0x16a34a });
  const colLeft = new THREE.Mesh(columnGeom, columnMat);
  colLeft.position.set(-10, 2, 2);
  scene.add(colLeft);

  const colRight = colLeft.clone();
  colRight.position.z = 6;
  scene.add(colRight);

  const archGeom = new THREE.BoxGeometry(0.8, 6, 4.8);
  const arch = new THREE.Mesh(archGeom, columnMat);
  arch.position.set(-10, 5, 4);
  scene.add(arch);

  // 🔹 Vestidores (bloque lateral)
  const vestGeom = new THREE.BoxGeometry(8, 3, 6);
  const vestMat = new THREE.MeshStandardMaterial({ color: 0x1d4ed8 });
  const vestidores = new THREE.Mesh(vestGeom, vestMat);
  vestidores.position.set(10, 1.5, 4);
  scene.add(vestidores);

  // 🔹 Zona equipos (bloque al fondo)
  const eqGeom = new THREE.BoxGeometry(12, 3, 4);
  const eqMat = new THREE.MeshStandardMaterial({ color: 0xfacc15 });
  const equipos = new THREE.Mesh(eqGeom, eqMat);
  equipos.position.set(0, 1.5, 10);
  scene.add(equipos);

  // 🔹 Utilería (bloque de cajas)
  const crateGeom = new THREE.BoxGeometry(1.2, 1.2, 1.2);
  const crateMat = new THREE.MeshStandardMaterial({ color: 0xa855f7 });

  const crate1 = new THREE.Mesh(crateGeom, crateMat);
  crate1.position.set(-7, 0.6, -7);
  scene.add(crate1);

  const crate2 = crate1.clone();
  crate2.position.set(-6, 0.6, -8.5);
  scene.add(crate2);

  const crate3 = crate1.clone();
  crate3.position.set(-8, 1.8, -7.5);
  scene.add(crate3);

  // Controls
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;

  function setView(name) {
    const view = viewsConfig[name];
    if (!view) return;

    const [px, py, pz] = view.position;
    const [lx, ly, lz] = view.lookAt;

    camera.position.set(px, py, pz);
    controls.target.set(lx, ly, lz);
    controls.update();
  }

  // vista inicial
  setView('center');
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
