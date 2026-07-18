import { createStep } from "@swooper/mapgen-core/authoring";
import { ProjectRainfallStepContract } from "./config.js";

/**
 * Projects the final-refined rainfall surface into Civ7 without recomputing,
 * clamping, or retaining a second mutable climate representation.
 */
export const ProjectRainfallStep = createStep(ProjectRainfallStepContract, {
  run: (context, _config, _ops, deps) => {
    const { width, height } = context.dimensions;
    const { rainfall } = deps.artifacts.climateField.read(context);

    for (let y = 0; y < height; y++) {
      const rowOffset = y * width;
      for (let x = 0; x < width; x++) {
        const sample = rainfall[rowOffset + x];
        if (sample === undefined) {
          throw new Error(`Final climate rainfall is missing tile (${x}, ${y}).`);
        }
        context.adapter.setRainfall(x, y, sample);
      }
    }
  },
});
