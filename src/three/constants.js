// src/three/constants.js

export const METERS = 1; // 1 unidad = 1 metro

export const CIRCUS = {
  radius: 18,        // 34m diámetro
};

export const STAGE = {
  radius: 7,         // 8m diámetro
  height: 0.35,
};

export const GALLERY = {
  tiers: 12,
  ringWidth: .80,
  gap: 0.001,
  baseY: 0.20,
  heightStep: 0.3,
  thickness: .55,
};

export const GALLERY_SEATS = {
  // Medidas (en metros)
  seat: {
    size: 0.40,        // 40cm x 40cm (ancho en tangente y fondo radial)
    height: 0.12,      // altura base del asiento (puedes ajustar)
  },
  backrest: {
    height: 0.40,      // espaldar 40cm
    thickness: 0.06,   // grosor del espaldar
  },

  // Separación entre butacas (tangencial, para que no choquen)
  spacing: 0.15,

  // Qué tan “atrás” van dentro del anillo (desde el borde exterior)
  // mientras más pequeño, más pegadas al borde exterior
  outerInset: 0.06,

  // Levantar butacas sobre la galería (para que no se z-fight con el piso)
  lift: 0.01,

  // Colores (editables)
  colors: {
    seat: 0x902C3E ,
    backrest: 0x902C3E ,
  },

  // Huecos tipo escaleras (en metros de ancho)
  // centerAngle en radianes (0 = +X, PI/2 = +Z, -PI/2 = -Z)
  stairs: [
    // ejemplo: una escalera cerca de la entrada de público
    { centerAngle: Math.PI  - 1/4, widthMeters: 1.5 },

    // ejemplo: otra escalera levemente corrida
    { centerAngle: Math.PI  + Math.PI / 4, widthMeters: 1.5 },

    { centerAngle: Math.PI  + 2.4, widthMeters: 1.5 },

    // ejemplo: otra escalera levemente corrida
    { centerAngle: Math.PI + 3.5  , widthMeters: 1.5 },
  ],
};



export const TOWERS = {
  // lado del cuadrado (ideal: igual al diámetro del escenario)
  // si tu STAGE.radius = 4 (diámetro 8), entonces side = 8
  squareSide: 16,

  height: 18,     // metros
  width: 0.7,     // 60 a 80 cm (0.6 - 0.8). aquí 0.7 por defecto

  // detalles visuales del truss
  postRadius: 0.04,    // grosor de tubos (4 cm)
  braceRadius: 0.025,  // grosor diagonales (2.5 cm)
  segments: 10,        // cuántas “secciones” verticales (más = más detalle)
};

export const DOME = {
  diameter: 17,
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
  baseColor:0xf3f3f3,
  escaleraColor:0xf1f1f1,
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
  barColor: 0xffffff,
  ropeColor: 0xff5522,
  ropeLength: 4.0,      // metros
  barWidth: 0.80,       // metros (tubo)
  barRadius: 0.03,      // grosor del tubo (3 cm)
  ropeRadius: 0.035,    // grosor cuerda (1.5 cm)

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
  barColor: 0xffffff,
  ropeColor: 0xffffff,
  ropeLength: 2,
  barWidth: 0.80,
  barRadius: 0.03,
  ropeRadius: 0.035,

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


export const SAFETY_NET = {
  frame: {
    length: 14.0,
    width: 7.0,
    tubeRadius: 0.007,
    y: 5.0,
  },

  net: {
    drop: 0.2,
    subdivisionsX: 50,
    subdivisionsZ: 40,
    opacity: 0.08,
    wireframe: true,
  },

  laterals: {
    drop: 1.2,
    subdivisionsX: 18,
    subdivisionsZ: 10,

    // ✅ Red lateral A (9m)
    left: {
      length: 5.0,

      // offsets (mueves esta red sin afectar la otra)
      offset: { x: -12, y: 10, z: 10 },

      // rotación (la clave para orientar dónde “apunta”)
      rotation: { x: 0, y: 0, z: 0 },
    },

    // ✅ Red lateral B (11m)
    right: {
      length: 11.0,
      offset: { x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
    },
  },
};

// export const SAFETY_NET_LATERALS = {
//   // Material / malla
//   opacity: 0.28,
//   wireframe: true,
//   drop: 1.2,        // caída visual (solo deformación)
//   subdivisionsU: 20,
//   subdivisionsV: 10,

//   // Lateral A (9m)
//   left: {
//     outLength: 5.0,

//     // Línea de anclaje (pegada al borde del marco/red principal)
//     anchorStart: { x: -13, y: 11.0, z: 0 },
//     anchorEnd:   { x:  -7.2, y: 5.5, z: 2.5 },

//     // Hacia dónde va la punta exterior (control tipo "barOffset")
//     // (si pones solo z negativo, sale recta; si metes x también, queda diagonal)
//     outOffset: { x: 0.0, y: 0.0, z: -5.0 },
//   },

//   // Lateral B (11m)
//   right: {
//     outLength: 11.0,
//     anchorStart: { x: -7, y: 3.0, z:  2.5 },
//     anchorEnd:   { x:  7, y: 3.0, z:  2.5 },
//     outOffset: { x: 0.0, y: 0.0, z: 11.0 },
//   },
// };


export const SAFETY_NET_LATERALS = {
  opacity: 0.08,
  wireframe: true,
  subdivisionsU: 50,
  subdivisionsV: 40,

  // ✅ Pared en la punta X negativa (izquierda del largo)
  endA: {
    height:5.9,                 // 9m
    topOffset: { x: - 1.5, z: 0 },    // opcional (inclinar arriba)
  },

  // ✅ Pared en la punta X positiva (derecha del largo)
  endB: {
    height: 4.0,                // 11m
    topOffset: { x: 3, z: 0 },
  },
   // ✅ NUEVA: pared corta desde el “final” de endB
  // ✅ NUEVO: extensión desde ARRIBA de endB
  endBTopExtension: {
    height: 6,           // sube 4m más desde el borde superior
    topOffset: { x: -5, z: 0 }, // opcional (inclinar arriba sin torcer)
  },
};


export const BACKSTAGE = {
  tower: {
    height: 6.0,
    size: 0.7,        // ✅ 60–80cm típico (0.6 a 0.8)
    tubeRadius: 0.035, // 3.5cm
    bayHeight: 1.0,    // cada 1m un “módulo”
  },

  span: {
    width: 7.5,       // distancia entre torres
  },

  position: {
    x: 0,
    y: 0,
    z: 8,
  },

  material: {
    color: 0xbfc5cc,
    roughness: 0.35,
    metalness: 0.85,
  },
};

export const BACKSTAGE_CURTAINS = {
  // tamaño de la cortina (en metros)
  width: 7.0,       // debe coincidir con BACKSTAGE.span.width (o un poco más)
  height: 6.0,       // cuánto cuelga hacia abajo

  // posición relativa al travesaño
  // cuelga desde la altura de la torre (8m) y se baja
  topY: 6.0,         // normalmente = BACKSTAGE.tower.height
  zOffset: 0.3,      // para que quede un poquito atrás del truss

  bottomInset: 0.0, // metros: cuánto “se mete” hacia adentro el borde inferior externo

  // pliegues
  segmentsX: 40,
  segmentsY: 18,
  foldAmp: 0.12,     // amplitud pliegues (m)
  foldFreq: 15.0,    // frecuencia pliegues

  // abertura (opcional)
  // 0 = cerrada total, 1 = abierta (mitades hacia los lados)
  open: 0.51,

  material: {
    color: 0xb91c1c,     // rojo cortina
    roughness: 0.9,
    metalness: 0.0,
    opacity: 0.95,
  },
};

export const BACKSTAGE_SIDE_CURTAINS = {
  topY: 0.0,

  // altura de tela en cada extremo
  heightNearRed: 6.0,
  heightAtCircus: 4.0,

  length:8,

  // desde dónde parten (usar borde de la roja)
  // se lee desde BACKSTAGE_CURTAINS.width

  // ✅ Direcciones (diagonal) en radianes, EN MUNDO (se calcula al borde del círculo real)
  // Ajusta esto hasta que coincida con la diagonal de tu galería
  leftAngle:  Math.PI * -0.65,  // hacia izquierda + un poco hacia arriba/atrás
  rightAngle: Math.PI * -0.35,  // hacia derecha + un poco hacia arriba/atrás

  // pequeño offset en Z para que no choque con el truss
  zNearOffset: 0,

  // pliegues
  segmentsU: 30,
  segmentsV: 18,
  foldAmp: 0.06,
  foldFreq: 7.0,

  material: {
    color: 0x08162f,
    roughness: 0.95,
    metalness: 0.0,
    opacity: 0.96,
  },
};


export const POLES = {
  count: 36,
  height: 4.5,
  diameter: 0.12,

  // "Punta" ahora es cilindro macizo
  tipHeight: 0.20,     // 20cm de largo
  tipDiameter: 0.03,   // 3cm de diámetro

  inset: 0.15,
  radialSegments: 24,
};

export const TENT = {
  // Radio superior (usa el domo por defecto desde tent.js)
  // Radio inferior (usa CIRCUS.radius por defecto desde tent.js)

  // A qué altura llega la carpa abajo (ideal: cerca del tope de los parales)
  bottomY: 4.5, // ajusta si quieres más baja (ej: 3.6) o más alta (ej: 4.5)

  // Suavidad de la malla
  segmentsAround: 160,
  segmentsHeight: 28,

  // ✅ LISO: sin pliegues
  foldAmp: 0,
  foldFreq: 0.0,

  // ✅ Caída tipo lona (máx en el centro del “alto”)
  // 0 = totalmente recta/tensa
  sagAmount: 2.0, // recomendado 1.2–2.5

  // ✅ Colores (IMPORTANTE: fuera blanco, dentro azul)
  colors: {
    outside: 0xf2f2f2, // blanco exterior
    inside: 0x0b2a6f,  // azul interior
  },

  material: {
    roughness: 0.95,
    metalness: 0.0,
    opacity: 1, // 1.0 = sólida (sin transparencia)
  },
};


export const ENTRANCE_SIGN = {
  textureUrl: "/textures/caceres_sign.png",

  // Bombillas
  bulbs: {
    enabled: true,
    countPerSideLong: 18,  // arriba/abajo
    countPerSideShort: 7,  // lados
    radius: 0.06,          // tamaño ampolleta
    offset: 0.10,          // separa del marco
    emissive: 0xffe8a3,
    emissiveIntensity: 2.2,
    metalness: 0.0,
    roughness: 0.25,
    addPointLights: false, // true si quieres luz real (más costoso)
    pointLightIntensity: 0.6,
    pointLightDistance: 2.2,
  },
};
