import { createStrategy } from "@swooper/mapgen-core/authoring";
import { clampInt16, roundHalfAwayFromZero } from "@swooper/mapgen-core/lib/math";

import ReconcileHeightfieldFromCoastContract from "../contract.js";

export const defaultStrategy = createStrategy(ReconcileHeightfieldFromCoastContract, "default", {
  run: (input) => {
    const { width, height } = input;
    const size = width * height;

    const inputLandMask = input.landMask as Uint8Array;
    const coastMask = input.coastMask as Uint8Array;
    const inputElevation = input.elevation as Int16Array;
    const seaLevel = input.seaLevel;

    // Pure: derive fresh outputs from a copy of the input elevation; never mutate inputs.
    const landMask = new Uint8Array(size);
    const elevation = Int16Array.from(inputElevation);
    const bathymetry = new Int16Array(size);

    // Carved coast tiles drop to water; every other tile keeps its carved class. Then
    // snap elevation to its class (land >= seaLevel+1, water <= seaLevel) and re-derive
    // bathymetry from the post-snap elevation so depth and class always agree.
    const waterElevation = clampInt16(Math.floor(seaLevel));
    const landElevation = clampInt16(Math.floor(seaLevel) + 1);

    for (let i = 0; i < size; i++) {
      const desiredLand = coastMask[i] === 1 ? 0 : inputLandMask[i] === 1 ? 1 : 0;
      landMask[i] = desiredLand;

      const elev = elevation[i] ?? 0;
      if (desiredLand === 1) {
        if (elev <= seaLevel) elevation[i] = landElevation;
        bathymetry[i] = 0;
      } else {
        if (elev > seaLevel) elevation[i] = waterElevation;
        const delta = Math.min(0, (elevation[i] ?? 0) - seaLevel);
        bathymetry[i] = clampInt16(roundHalfAwayFromZero(delta));
      }
    }

    return { landMask, elevation, bathymetry };
  },
});
