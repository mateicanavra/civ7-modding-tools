import { createStep } from "@swooper/mapgen-core/authoring";
import { config } from "./config.js";

/**
 * Projects the derived native rainfall codec into Civ7 without treating the
 * byte surface as physical precipitation or recomputing its conversion.
 */
export const ProjectRainfallStep = createStep(config, {
  run: (context, _stepConfig, _ops, deps) => {
    const { width, height } = context.setup.dimensions;
    const { rainfallCodec } = deps.artifacts.climateField.read();

    for (let y = 0; y < height; y++) {
      const rowOffset = y * width;
      for (let x = 0; x < width; x++) {
        const sample = rainfallCodec[rowOffset + x];
        if (sample === undefined) {
          throw new Error(`Final climate rainfall codec is missing tile (${x}, ${y}).`);
        }
        deps.engine.setRainfall(context, x, y, sample);
      }
    }
  },
});
