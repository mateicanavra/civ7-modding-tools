import { I8_VECTOR_MAX_ABS } from "@swooper/mapgen-core/lib/grid";
import type { DeepReadonly } from "@swooper/mapgen-core/authoring";
import type { AtmosphericSample } from "../../../model/atoms/atmospheric-sample.schema.js";
import type { ClimateSamplingModel } from "../../../model/atoms/climate-phase.schema.js";

type Grid = Readonly<{ width: number; height: number }>;
type PhaseWeights = Readonly<{ model: ClimateSamplingModel; weights: readonly number[] }>;
type Reduction = Grid & (
  | (PhaseWeights & { reduction: "thermal-centering"; samples: readonly DeepReadonly<Float32Array>[] })
  | { reduction: "ground-thermal-mean"; samples: readonly DeepReadonly<Float32Array>[] }
  | { reduction: "weather-members"; samples: readonly DeepReadonly<AtmosphericSample>[] }
  | (PhaseWeights & { reduction: "annual"; samples: readonly DeepReadonly<AtmosphericSample>[] })
);

function assertWeights(weights: readonly number[], count: number, model: ClimateSamplingModel) {
  if (model !== "legacy-snapshots" && model !== "periodic-cycle") throw new RangeError("Unknown climate sampling model.");
  if (weights.length !== count || weights.some((value) => !Number.isFinite(value) || value <= 0) ||
      Math.abs(weights.reduce((sum, value) => sum + value, 0) - 1) > Number.EPSILON * Math.max(8, count * 4) ||
      (model === "legacy-snapshots" && weights.some((value) => value !== 1 / count))) {
    throw new RangeError("Atmospheric samples require aligned, normalized weights; legacy weights must be equal.");
  }
}

/** Reduces coeval weather or phase samples without changing their physical computation. */
export function reduceAtmosphere(input: Reduction) {
  const size = input.width * input.height;
  if (!Number.isSafeInteger(input.width) || input.width < 1 || !Number.isSafeInteger(input.height) ||
      input.height < 1 || !Number.isSafeInteger(size) || input.samples.length === 0) {
    throw new RangeError("Atmospheric reduction requires a positive grid and nonempty samples.");
  }
  if (input.reduction !== "thermal-centering" && input.reduction !== "ground-thermal-mean" &&
      input.reduction !== "weather-members" && input.reduction !== "annual") {
    throw new RangeError("Unknown atmospheric reduction.");
  }
  const phaseReduction = input.reduction === "thermal-centering" || input.reduction === "annual";
  if (phaseReduction) assertWeights(input.weights, input.samples.length, input.model);
  const weights = phaseReduction && input.model === "periodic-cycle" ? input.weights : undefined;
  const count = input.samples.length;
  const assertField = (field: DeepReadonly<Float32Array | Int8Array>, kind: "float" | "vector") => {
    if (!(kind === "float" ? field instanceof Float32Array : field instanceof Int8Array) ||
        field.length !== size || !field.every(Number.isFinite)) {
      throw new RangeError("Atmospheric fields must be finite, grid-aligned typed arrays.");
    }
  };
  const meanFloat = (fields: readonly DeepReadonly<Float32Array>[], roundAccumulation: boolean) => {
    const mean = new Float32Array(size);
    if (roundAccumulation) {
      // Preserve legacy per-addition Float32 rounding, including its original iteration order.
      for (const field of fields) {
        for (let index = 0; index < size; index++) mean[index]! += field[index]!;
      }
      for (let index = 0; index < size; index++) mean[index]! /= count;
    } else {
      for (let index = 0; index < size; index++) {
        let sum = 0;
        for (let sample = 0; sample < count; sample++) {
          sum += fields[sample]![index]! * (weights ? weights[sample]! : 1);
        }
        mean[index] = weights ? sum : sum / count;
      }
    }
    return mean;
  };
  if (input.reduction === "thermal-centering" || input.reduction === "ground-thermal-mean") {
    for (const field of input.samples) assertField(field, "float");
    return {
      reduction: input.reduction,
      meanSurfaceTemperatureC: meanFloat(input.samples, input.reduction === "thermal-centering" && input.model === "legacy-snapshots"),
    };
  }
  for (const sample of input.samples) {
    assertField(sample.pressure, "float");
    for (const key of ["windU", "windV", "currentU", "currentV"] as const) assertField(sample[key], "vector");
  }
  const meanVector = (key: "windU" | "windV" | "currentU" | "currentV") => {
    const mean = new Int8Array(size);
    for (let index = 0; index < size; index++) {
      let sum = 0;
      for (let sample = 0; sample < count; sample++) {
        sum += input.samples[sample]![key][index]! * (weights ? weights[sample]! : 1);
      }
      mean[index] = Math.max(-I8_VECTOR_MAX_ABS, Math.min(I8_VECTOR_MAX_ABS, Math.round(weights ? sum : sum / count)));
    }
    return mean;
  };
  return {
    reduction: input.reduction,
    pressure: meanFloat(input.samples.map((sample) => sample.pressure), input.reduction === "annual" && input.model === "legacy-snapshots"),
    windU: meanVector("windU"), windV: meanVector("windV"),
    currentU: meanVector("currentU"), currentV: meanVector("currentV"),
  };
}
