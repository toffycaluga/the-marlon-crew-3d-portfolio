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

export const DOME = {
  diameter: 12,
  height: 15,

  trussThickness: 0.6,
  ringWidth: 0.8,

  tubeRadius: 0.04,
  braceRadius: 0.025,
  segments: 48,

  // Estructura central (elige 1)
  center: {
    mode: "cross", // "semicircles" | "cross"
    diameter: 10,        // diámetro de la estructura central (puede ser igual al dome)
    arcRise: 1.0,        // altura máxima del arco hacia arriba (en metros)
    crossThickness: 0.35 // grosor vertical del truss de la cruz (si mode="cross")
  },
};


export const RECT_TRUSS = {
  length: 13,        // largo total (X)
  width: 3,          // ancho (Z)
  thickness: 0.5,    // espesor vertical del truss
  height: 14,        // altura en Y donde se ubica

  tubeRadius: 0.04,
  braceRadius: 0.025,

  segments: 12,       // divisiones a lo largo (más = más detalle)

  // Torre secundaria
  secondaryTower: {
    enabled: true,
    positionRatio: 2 / 3, // 2/3 del largo
    height: 2.5,          // altura de la torre secundaria
    width: 0.7,
  },
};


export const TRAPEZE_PLATFORM = {
  totalLength: 1.2,
  width: 3.5,
  thickness: 0.15,

  deckSection: .5,
  middleGap: 0,

  trussHeight: 13.7,
  ladderDrop: 3.5,

  attachEnd: "right",
  offsetX: -0.5,
  rotationY: Math.PI, // 180° (cámbialo a Math.PI/2, -Math.PI/2, etc.)


  ladder: {
    tubeRadius: 0.035,
    braceRadius: 0.022,

    // ancho del panel (distancia entre los 2 tubos verticales)
    panelWidth: 0.55,

    // peldaños
    rungEvery: 0.28,

    // diagonales (look truss)
    withDiagonals: false,

    // separación en Z de las dos escaleras (para que no se monten)
    zSeparation: 1.5,
  },
};


export const STRONG_BAR = {
  ropeLength: 4.0,      // metros
  barWidth: 0.80,       // metros (tubo)
  barRadius: 0.03,      // grosor del tubo (3 cm)
  ropeRadius: 0.015,    // grosor cuerda (1.5 cm)

  // dónde cuelga desde (por ahora desde la cúpula/truss superior)
  hangHeight: 13.7,     // punto superior donde cuelgan las cuerdas
  barHeight: 9.95,       // altura aproximada de la barra (hangHeight - ropeLength)

  // ubicación alrededor del escenario
  radiusFromCenter: -6.5, // distancia horizontal desde el centro (ajústalo)
  angle: -Math.PI,    // "otro lado": cambia a Math.PI, -Math.PI/2, etc.

  // separación entre cuerdas = ancho de la barra (normalmente)
  ropeSeparation: 0.80,
};
// fuerte a volante :8.5 , 3.75 largo fuerte ; 3,65 tiro volante 
// fuerte a volante :8.5 , 3.75 largo fuerte ; 3,65 tiro volante


// fuerte a volante :8.5 , 3.75 largo fuerte ; 3,65 tiro volante
export const TRAPEZE_BAR = {
  ropeLength: 2,
  barWidth: 0.80,
  barRadius: 0.03,
  ropeRadius: 0.015,

  // anclaje superior (centro)
  anchor: {
    x: -1,
    y: 13.7,
    z: 0.0,
    separation: 0.80,
  },

  // centro de barra relativo al anclaje
  barOffset: {
    x: -5.2,
    y: -2.0,
    z: 0,
  },

  bottomSeparation: 0.80,

  // ✅ orientación (igual lógica que STRONG_BAR)
  angle: -Math.PI,
};
