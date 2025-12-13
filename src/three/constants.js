// src/three/constants.js

export const METERS = 1; // 1 unidad = 1 metro

export const CIRCUS = {
  radius: 17,        // 34m diámetro
};

export const STAGE = {
  radius: 7,         // 8m diámetro
  height: 0.35,
};

export const GALLERY = {
  tiers: 8,
  ringWidth: 1.6,
  gap: 0.01,
  baseY: 0.20,
  heightStep: 0.6,
  thickness: .55,
};

export const TOWERS = {
  // lado del cuadrado (ideal: igual al diámetro del escenario)
  // si tu STAGE.radius = 4 (diámetro 8), entonces side = 8
  squareSide: 11,

  height: 18,     // metros
  width: 0.7,     // 60 a 80 cm (0.6 - 0.8). aquí 0.7 por defecto

  // detalles visuales del truss
  postRadius: 0.04,    // grosor de tubos (4 cm)
  braceRadius: 0.025,  // grosor diagonales (2.5 cm)
  segments: 10,        // cuántas “secciones” verticales (más = más detalle)
};
