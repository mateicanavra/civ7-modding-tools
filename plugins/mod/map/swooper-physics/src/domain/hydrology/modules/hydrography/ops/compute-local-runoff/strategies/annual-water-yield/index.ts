import { createStrategy } from "@swooper/mapgen-core/authoring";
import contract from "../../contract.js";
import definition from "./config.js";

/** Supplies every finite cell if dry; the basin budget replaces this with wet P-D on its final wet footprint. */
export default createStrategy(contract, definition, {
  run: (input) => {
    const size = input.width * input.height;
    if (
      input.externalWaterMask.length !== size ||
      input.precipitation.length !== size ||
      input.potentialDemand.length !== size
    )
      throw new RangeError("Local runoff requires map-grid inputs.");
    const runoff: number[] = Array(size).fill(0);
    for (let cell = 0; cell < size; cell++) {
      if (input.externalWaterMask[cell] !== 0 && input.externalWaterMask[cell] !== 1)
        throw new RangeError("Local runoff requires a binary external water mask.");
      const precipitation = input.precipitation[cell]!;
      const demand = input.potentialDemand[cell]!;
      if (!Number.isFinite(precipitation) || precipitation < 0)
        throw new RangeError("Local runoff requires finite nonnegative precipitation.");
      if (!Number.isFinite(demand) || demand < 0)
        throw new RangeError("Local runoff requires finite nonnegative potential demand.");
      if (input.externalWaterMask[cell] || precipitation === 0) continue;
      const combined = Math.hypot(precipitation, demand);
      const waterRatio = precipitation / combined;
      // Rationalize P - P*D/hypot(P,D) to preserve tiny dry-regime yield without cancellation.
      runoff[cell] = precipitation * waterRatio * waterRatio / (1 + demand / combined);
    }
    return { runoff };
  },
});
