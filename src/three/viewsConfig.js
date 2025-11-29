// Presets de cámara para cada vista del circo

export const viewsConfig = {
  center: {
    // Vista general del circo
    position: [0, 5, 14],
    lookAt: [0, 1.5, 0],
  },
  trapecio: {
    // Plataforma / estructura del trapecio
    position: [0, 8, 3],
    lookAt: [0, 4, 0],
  },
  publico: {
    // Gradas, viendo hacia el ring
    position: [0, 3, -12],
    lookAt: [0, 2, 0],
  },
  entrada: {
    // Entrada del circo (arco verde)
    position: [-15, 1, 5],
    lookAt: [1, 3, 3],
  },
  vestidores: {
    // Bloque azul de vestidores
    position: [14, 3, 4],
    lookAt: [8, 2, 4],
  },
  equipos: {
    // Bloque amarillo de equipos, un poco alejado y elevado
    position: [0, 7, 23],
    lookAt: [0, 2, 8],
  },
  utileria: {
    // Cajas violetas en la esquina
    position: [-10, 4, -10],
    lookAt: [-7, 2, -7],
  },
  contacto: {
    // Zona contacto / oficina (bloque verde)
    position: [18, 2, -5],
    lookAt: [8, 2, -4],
  },
};
