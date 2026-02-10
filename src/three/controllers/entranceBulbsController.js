// src/three/controllers/entranceBulbsController.js

export function createEntranceBulbsController(entranceArch, opts = {}) {
  const options = {
    bulbsGroupName: "SignBulbs",
    twinkleSpeed: 7,
    minV: 0.25,
    maxV: 1.0,
    ...opts,
  };

  const state = {
    mode: "off", // "off" | "on" | "twinkle"
    power: 0,
  };

  function getBulbsGroup() {
    return entranceArch?.getObjectByName(options.bulbsGroupName) ?? null;
  }

  function setPower(power = 1) {
    state.power = power;

    const bulbs = getBulbsGroup();
    if (!bulbs) return;

    bulbs.traverse((o) => {
      // Mesh bombilla
      if (o.isMesh && o.userData?.isBulb && o.material) {
        const base = o.userData.baseEmissiveIntensity ?? 2.2;

        o.material.emissiveIntensity = base * power;

        const onHex = o.userData.baseColorHex ?? 0xffffff;
        const offHex = o.userData.offColorHex ?? 0x3a3a3a;
        o.material.color.setHex(power <= 0 ? offHex : onHex);

        o.material.needsUpdate = true;
      }

      // Halo
      if (o.isMesh && o.userData?.isBulbHalo && o.material) {
        const baseOp = o.userData.baseOpacity ?? 0.35;
        o.material.opacity = baseOp * power; // 0 = invisible
        o.material.needsUpdate = true;
      }

      // PointLight opcional
      if (o.isLight && o.userData?.isBulbLight) {
        const base = o.userData.baseIntensity ?? 0.6;
        o.intensity = base * power;
      }
    });
  }

  function setMode(mode) {
    state.mode = mode;

    if (mode === "off") setPower(0);
    if (mode === "on") setPower(1);
    // twinkle se actualiza con update()
  }

  function update(deltaSeconds, elapsedSeconds) {
    if (!entranceArch) return;
    if (state.mode !== "twinkle") return;

    const bulbs = getBulbsGroup();
    if (!bulbs) return;

    const t = elapsedSeconds;

    bulbs.traverse((o) => {
      const seed = (o.id % 60) * 0.37;

      // v: min..max
      const sin01 = 0.5 + 0.5 * Math.sin(t * options.twinkleSpeed + seed);
      const v = options.minV + (options.maxV - options.minV) * sin01;

      if (o.isMesh && o.userData?.isBulb && o.material) {
        const base = o.userData.baseEmissiveIntensity ?? 2.2;
        o.material.emissiveIntensity = base * v;
      }

      if (o.isMesh && o.userData?.isBulbHalo && o.material) {
        const baseOp = o.userData.baseOpacity ?? 0.35;
        o.material.opacity = (0.15 + baseOp) * v;
      }
    });
  }

  return {
    setMode,
    setPower,
    update,
    get mode() {
      return state.mode;
    },
  };
}
