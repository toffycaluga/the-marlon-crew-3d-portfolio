// src/three/viewsConfig.js

// Configuración de vistas para la cámara
// [x, y, z] posición de cámara
// [x, y, z] punto al que mira

export const viewsConfig = {
  center: {
    position: [0, 6, 20],
    lookAt: [0, 2, 0]
  },
  trapecio: {
    position: [0, 7, 10],
    lookAt: [0, 5, 2]
  },
  publico: {
    position: [0, 4, -20],
    lookAt: [0, 5, 0]
  },
  entrada: {
    position: [-15, 4, 4],
    lookAt: [-10, 3, 4]
  },
  vestidores: {
    position: [15, 5, 4],
    lookAt: [10, 2, 4]
  },
  equipos: {
    position: [0, 5, 16],
    lookAt: [0, 2, 10]
  },
  utileria: {
    position: [-10, 3, -10],
    lookAt: [-7, 1.5, -7]
  },
  contacto: {
    position: [16, 5, -6],
    lookAt: [9, 2, -4]
  }
};
