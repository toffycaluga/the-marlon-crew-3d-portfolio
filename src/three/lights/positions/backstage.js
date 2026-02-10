// src/three/lights/positions/backstage.js
import { BACKSTAGE } from "../../constants.js";

/**
 * Backstage = 10 moving heads:
 * - 3 en torre izquierda (low/mid/high)
 * - 3 en torre derecha (low/mid/high)
 * - 4 en travesaño (beam) repartidas
 *
 * Formato: { key, name, position: [x,y,z], target: [x,y,z] }
 * position y target están en COORDENADAS MUNDO (world).
 */

const { tower, span, position } = BACKSTAGE;

// Centro del rig en mundo
const cx = position.x;
const cy = position.y;
const cz = position.z;

// X de torres en mundo
const leftX = cx - span.width / 2;
const rightX = cx + span.width / 2;

// “Cara hacia el circo”: pegada a Z- del truss
// (si te quedan mirando al revés, cambia a cz + (tower.size/2 + offset))
const zFace = cz - (tower.size / 2 + 0.06);

// Alturas en mundo (3 por torre)
const yLow = cy + 0.90;
const yMid = cy + tower.height * 0.52;
const yHigh = cy + tower.height - 0.45;

// Beam: está a la altura top de torre
const yBeam = cy + tower.height;

// Beam: 4 puntos repartidos entre torres (evitando extremos)
const beamXs = [
  leftX + span.width * 0.20,
  leftX + span.width * 0.40,
  leftX + span.width * 0.60,
  leftX + span.width * 0.80,
];

// Target por defecto (puedes cambiarlo después desde tu controlador)
const DEFAULT_TARGET = [0, 2, 0];

export const backstagePositions = [
  // ===== Torre izquierda (3) =====
  {
    key: "bs_left_low",
    name: "mh_backstage_left_low",
    position: [leftX, yLow, zFace],
    target: DEFAULT_TARGET,
  },
  {
    key: "bs_left_mid",
    name: "mh_backstage_left_mid",
    position: [leftX, yMid, zFace],
    target: DEFAULT_TARGET,
  },
  {
    key: "bs_left_high",
    name: "mh_backstage_left_high",
    position: [leftX, yHigh, zFace],
    target: DEFAULT_TARGET,
  },

  // ===== Torre derecha (3) =====
  {
    key: "bs_right_low",
    name: "mh_backstage_right_low",
    position: [rightX, yLow, zFace],
    target: DEFAULT_TARGET,
  },
  {
    key: "bs_right_mid",
    name: "mh_backstage_right_mid",
    position: [rightX, yMid, zFace],
    target: DEFAULT_TARGET,
  },
  {
    key: "bs_right_high",
    name: "mh_backstage_right_high",
    position: [rightX, yHigh, zFace],
    target: DEFAULT_TARGET,
  },

  // ===== Travesaño (4) =====
  {
    key: "bs_beam_1",
    name: "mh_backstage_beam_1",
    position: [beamXs[0], yBeam, zFace],
    target: DEFAULT_TARGET,
  },
  {
    key: "bs_beam_2",
    name: "mh_backstage_beam_2",
    position: [beamXs[1], yBeam, zFace],
    target: DEFAULT_TARGET,
  },
  {
    key: "bs_beam_3",
    name: "mh_backstage_beam_3",
    position: [beamXs[2], yBeam, zFace],
    target: DEFAULT_TARGET,
  },
  {
    key: "bs_beam_4",
    name: "mh_backstage_beam_4",
    position: [beamXs[3], yBeam, zFace],
    target: DEFAULT_TARGET,
  },
];
