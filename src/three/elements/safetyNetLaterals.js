import * as THREE from "three";
import { SAFETY_NET } from "../constants.js";

function createLateralMesh({ lengthX, lengthZ, sagDrop, subdivisionsX, subdivisionsZ, opacity, wireframe }) {
  // PlaneGeometry en XY
  const geom = new THREE.PlaneGeometry(lengthX, lengthZ, subdivisionsX, subdivisionsZ);

  // Deformación: cuelga más lejos del borde del marco
  const pos = geom.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const distOut = (pos.getY(i) + lengthZ / 2) / lengthZ; // 0..1
    pos.setZ(i, -distOut * sagDrop);
  }
  geom.computeVertexNormals();

  const mat = new THREE.MeshBasicMaterial({
    color: 0x2dd4bf,
    transparent: true,
    opacity,
    wireframe,
    side: THREE.DoubleSide,
  });

  return new THREE.Mesh(geom, mat);
}

/**
 * Crea UNA red lateral pegada a un lado del marco (Z edge),
 * pero con control individual: offset + rotation.
 */
function buildOneLateral({ side, outwardSign }) {
  const { length, width, y } = SAFETY_NET.frame;

  const baseZEdge = outwardSign * (width / 2);

  const sagDrop = SAFETY_NET.laterals.drop;
  const subdivisionsX = SAFETY_NET.laterals.subdivisionsX;
  const subdivisionsZ = SAFETY_NET.laterals.subdivisionsZ;

  const opacity = SAFETY_NET.net.opacity;
  const wireframe = SAFETY_NET.net.wireframe;

  const cfg = SAFETY_NET.laterals[side];
  const lenZ = cfg.length;

  const mesh = createLateralMesh({
    lengthX: length,
    lengthZ: lenZ,
    sagDrop,
    subdivisionsX,
    subdivisionsZ,
    opacity,
    wireframe,
  });

  // Pasa a horizontal (XZ)
  mesh.rotation.x = -Math.PI / 2;

  // Posición base pegada al borde del marco
  // (la malla se centra en su propio largo, por eso sumamos lenZ/2 hacia afuera)
  mesh.position.set(
    0,
    y,
    baseZEdge + outwardSign * (lenZ / 2)
  );

  // ✅ Aplicar control individual
  const off = cfg.offset ?? { x: 0, y: 0, z: 0 };
  mesh.position.x += off.x ?? 0;
  mesh.position.y += off.y ?? 0;
  mesh.position.z += off.z ?? 0;

  const rot = cfg.rotation ?? { x: 0, y: 0, z: 0 };
  mesh.rotation.x += rot.x ?? 0;
  mesh.rotation.y += rot.y ?? 0;
  mesh.rotation.z += rot.z ?? 0;

  mesh.castShadow = false;
  mesh.receiveShadow = false;

  return mesh;
}

export function createSafetyNetLaterals() {
  const g = new THREE.Group();

  // Left = Z negativo, sale hacia -Z
  g.add(buildOneLateral({ side: "left", outwardSign: -1 }));

  // Right = Z positivo, sale hacia +Z
  g.add(buildOneLateral({ side: "right", outwardSign: 1 }));

  return g;
}
