import * as THREE from "three";
import { SAFETY_NET } from "../constants.js";

function createDeformedNetPlane(length, width) {
  const { drop, subdivisionsX, subdivisionsZ, opacity, wireframe } = SAFETY_NET.net;

  const geom = new THREE.PlaneGeometry(length, width, subdivisionsX, subdivisionsZ);

  // Deformamos: los vértices más cerca del centro bajan más (forma tipo V/bowl)
  const pos = geom.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const z = pos.getY(i); // OJO: PlaneGeometry está en XY, luego rotamos. Aquí "Y" actuará como ancho.

    // normalizamos distancia al centro (0..1)
    const nx = Math.abs(x) / (length / 2);
    const nz = Math.abs(z) / (width / 2);
    const t = Math.max(nx, nz);         // 0 en el centro, 1 en el borde
    const sag = (1 - t) * drop;         // más caída en el centro

    pos.setZ(i, -sag);
  }

  geom.computeVertexNormals();

  const mat = new THREE.MeshBasicMaterial({
    color: 0x393939,
    transparent: true,
    opacity,
    wireframe,
    side: THREE.DoubleSide,
  });

  const mesh = new THREE.Mesh(geom, mat);
  return mesh;
}

/**
 * Crea 2 redes laterales que "parten" del marco y caen al centro.
 * En esta versión, hacemos una sola malla completa dentro del marco (lo más simple y realista).
 * Luego, si quieres “solo laterales”, la dividimos en panel izquierdo + derecho.
 */
export function createSafetyNetSides() {
  const g = new THREE.Group();

  const { length, width, y } = SAFETY_NET.frame;

  const net = createDeformedNetPlane(length, width);

  // El plane está en XY, lo giramos para que sea XZ (horizontal)
  net.rotation.x = -Math.PI / 2;

  // Lo ponemos justo bajo el marco (la malla cuelga desde el marco)
  net.position.set(0, y, 0);

  g.add(net);
  return g;
}
