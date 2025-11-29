import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

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
  camera.position.set(0, 2, 5);
  scene.add(camera);

  // Lights
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
  scene.add(ambientLight);

  const dirLight = new THREE.DirectionalLight(0xffffff, 1);
  dirLight.position.set(3, 5, 2);
  scene.add(dirLight);

  // Cube placeholder
  const geometry = new THREE.BoxGeometry(1, 1, 1);
  const material = new THREE.MeshStandardMaterial({ color: 0xff0055 });
  const cube = new THREE.Mesh(geometry, material);
  scene.add(cube);

  // Controls
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;

  // Handle resize
  function onWindowResize() {
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;

    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix();

    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  }

  window.addEventListener('resize', onWindowResize);

  // Animation loop
  function animate() {
    requestAnimationFrame(animate);

    cube.rotation.y += 0.01;
    cube.rotation.x += 0.005;

    controls.update();
    renderer.render(scene, camera);
  }

  animate();
}
