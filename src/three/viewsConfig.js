// src/three/viewsConfig.js
export const viewsConfig = {
  center: {
    // vista general del ring
    position: [0, 3, 8],
    lookAt: [0, 1, 0],
  },
  trapecio: {
    // como si estuvieras en la plataforma
    position: [0, 6, 2],
    lookAt: [0, 3, 0],
  },
  publico: {
    // desde las gradas, mirando al escenario
    position: [0, 2, -8],
    lookAt: [0, 2, 0],
  },
  entrada: {
    // cerca de la entrada al circo
    position: [-8, 2, 4],
    lookAt: [0, 1, 0],
  },
};
