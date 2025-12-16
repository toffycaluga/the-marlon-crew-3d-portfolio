// src/three/elements/backstageCurtains.js
import * as THREE from "three";
import { BACKSTAGE, BACKSTAGE_CURTAINS } from "../constants.js";

function makeCurtainHalf({ side, mat }) {
  const cfg = BACKSTAGE_CURTAINS;

  // la cortina completa se divide en 2 mitades
  const halfW = cfg.width / 2;
  const h = cfg.height;

  const geom = new THREE.PlaneGeometry(
    halfW,
    h,
    cfg.segmentsX,
    cfg.segmentsY
  );

  // Deformación: pliegues (solo en X) y un poco de caída suave
  const pos = geom.attributes.position;

  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);   // -halfW/2..+halfW/2 (en cada mitad)
    const y = pos.getY(i);   // -h/2..+h/2

    // 0 en la parte de arriba, 1 en la parte de abajo
    const tDown = (h / 2 - y) / h;

    // pliegue: seno en X
    const fold = Math.sin((x / halfW) * Math.PI * cfg.foldFreq) * cfg.foldAmp;

    // hacemos que el pliegue se note más abajo que arriba
    const z = fold * (0.2 + 0.8 * tDown);

    pos.setZ(i, z);
  }

  geom.computeVertexNormals();

  const mesh = new THREE.Mesh(geom, mat);

  // Colgar desde arriba:
  // PlaneGeometry está centrado, así que subimos h/2 para que el borde superior quede en y=0 local
  mesh.position.y = -h / 2;

  // Abrir cortina: cada mitad se “corre” hacia su lado
  // side: "left" o "right"
  const open = cfg.open; // 0..1
  const slide = halfW * open;

  if (side === "left") {
    mesh.position.x = -slide;
  } else {
    mesh.position.x = slide;
    // opcional: espejar para que el pliegue se vea similar
    mesh.scale.x = -1;
  }

  return mesh;
}

export function createBackstageCurtains() {
  const g = new THREE.Group();

  const cfg = BACKSTAGE_CURTAINS;

  const mat = new THREE.MeshStandardMaterial({
    color: cfg.material.color,
    roughness: cfg.material.roughness,
    metalness: cfg.material.metalness,
    transparent: true,
    opacity: cfg.material.opacity,
    side: THREE.DoubleSide,
  });

  const left = makeCurtainHalf({ side: "left", mat });
  const right = makeCurtainHalf({ side: "right", mat });

  g.add(left, right);

  // Colgar desde el travesaño del backstage:
  // - El backstage como grupo está en BACKSTAGE.position
  // - El travesaño está a la altura BACKSTAGE.tower.height
  // - centrado en X=0
  g.position.set(
    BACKSTAGE.position.x,
    BACKSTAGE.position.y + cfg.topY,
    BACKSTAGE.position.z + cfg.zOffset
  );

  return g;
}
