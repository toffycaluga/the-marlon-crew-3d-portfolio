import * as THREE from "three";
import { CIRCUS, TENT } from "../constants.js";

function degToRad(d) {
  return (d * Math.PI) / 180;
}

/**
 * Cortinas de entrada (SIN arco)
 * Ideal para:
 * - animarlas después (abrir/cerrar)
 * - cambiar tela sin tocar estructura
 *
 * Convención:
 * - angle = 0 apunta al SUR (+Z)
 */
export function createEntranceCurtains({
  // ORIENTACIÓN / POSICIÓN
  angle = 0,
  angleOffset = Math.PI / 2,
  radius = CIRCUS.radius + 0.12,

  // ALTURAS
  groundY = 0,
  topY = TENT.bottomY,

  // DIMENSIONES
  openingWidth = 4.5,
  openingHeight = 3.2,
  depth = 0.45,

  // ESTILO
  curtainColor = 0xb91c1c,
  foldAmp = 0.03,
  foldFreq = 8,
  sideYawDeg = 8,

  // ESTADO (para futuro)
  open = 0.0, // 0 cerrado, 1 abierto (por ahora solo posiciona)
} = {}) {
  const group = new THREE.Group();
  group.name = "EntranceCurtains";

  // Material
  const matCurtain = new THREE.MeshStandardMaterial({
    color: curtainColor,
    roughness: 0.95,
    metalness: 0.0,
    side: THREE.DoubleSide,
  });

  const curtainW = openingWidth * 0.55;
  const curtainH = Math.min(openingHeight, Math.max(0.2, topY - groundY));
  const geom = new THREE.PlaneGeometry(curtainW, curtainH, 18, 14);

  // Pliegues simples
  const pos = geom.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const wave = Math.sin((x / curtainW) * Math.PI * foldFreq) * foldAmp;
    const sag = (1 - (y / curtainH + 0.5)) * (foldAmp * 0.75);
    pos.setZ(i, wave + sag);
  }
  pos.needsUpdate = true;
  geom.computeVertexNormals();

  // Offset para “abrir” (por ahora básico)
  const openOffset = (openingWidth * 0.22) + open * (openingWidth * 0.18);

  const left = new THREE.Mesh(geom, matCurtain);
  left.position.set(-openOffset, groundY + curtainH / 2, depth / 2 + 0.03);
  left.rotation.y = degToRad(sideYawDeg);
  left.castShadow = true;
  left.receiveShadow = false;
  left.renderOrder = 5;

  const right = new THREE.Mesh(geom, matCurtain);
  right.position.set(openOffset, groundY + curtainH / 2, depth / 2 + 0.03);
  right.rotation.y = degToRad(-sideYawDeg);
  right.castShadow = true;
  right.receiveShadow = false;
  right.renderOrder = 5;

  group.add(left, right);

  // Posicionar en el perímetro
  const finalAngle = angle + angleOffset + Math.PI;
  group.position.set(Math.cos(finalAngle) * radius, 0, Math.sin(finalAngle) * radius);

  group.lookAt(0, 0, 0);
  group.rotateY(Math.PI);

  // Guardar refs para animar después (opcional)
  group.userData.left = left;
  group.userData.right = right;
  group.userData.open = open;

  return group;
}
