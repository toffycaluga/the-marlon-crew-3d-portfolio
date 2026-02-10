// src/three/lights/presets/byView.js
export const lightingPresetsByView = {
  center: [
    { group: "cupula", on: true, dimmer: 0.7, zoomDeg: 22, color: "#ffffff", target: [0, 2, 0] },
    { group: "front_stage", on: true, dimmer: 1.0, zoomDeg: 14, color: "#ffffff", target: [0, 2, 0] },
  ],

  trapecio: [
    { group: "towers", on: true, dimmer: 1.0, zoomDeg: 10, color: "#00ccff", target: [0, 6, 0] },
    { group: "cupula", on: true, dimmer: 0.35, zoomDeg: 24, color: "#ffffff", target: [0, 3, 0] },
  ],

  entrada: [
    { group: "entrance", on: true, dimmer: 1.0, zoomDeg: 18, color: "#ffffff", target: [-10, 3, 4] },
  ],

  publico: [
    { group: "cupula", on: true, dimmer: 0.25, zoomDeg: 28, color: "#ffffff", target: [0, 2, 0] },
    { group: "stage", on: true, dimmer: 0.6, zoomDeg: 18, color: "#ffffff", target: [0, 2, 0] },
  ],

  vestidores: [
    { group: "backstage", on: true, dimmer: 0.7, zoomDeg: 20, color: "#ffffff", target: [0, 2, -6] },
  ],
};
