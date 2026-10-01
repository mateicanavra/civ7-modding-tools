import { I8_VECTOR_MAX_ABS } from "@swooper/mapgen-core/lib/grid";
import type { DeepReadonly } from "@swooper/mapgen-core/authoring";
import type { AtmosphericSample } from "../../../model/atoms/atmospheric-sample.schema.js";
import type { ClimateSamplingModel } from "../../../model/atoms/climate-phase.schema.js";

type Grid = Readonly<{ width: number; height: number }>;
type PhaseWeights = Readonly<{ model: ClimateSamplingModel; weights: readonly number[] }>;
type Reduction = Grid & (
  | { reduction: "weather-members"; samples: readonly DeepReadonly<AtmosphericSample>[] }
  | (PhaseWeights & { reduction: "annual"; samples: readonly DeepReadonly<AtmosphericSample>[] })
);

function assertWeights(weights: readonly number[], count: number) {
  if (weights.length !== count || weights.some((value) => !Number.isFinite(value) || value <= 0) ||
      Math.abs(weights.reduce((sum, value) => sum + value, 0) - 1) > Number.EPSILON * Math.max(8, count * 4)) {
    throw new RangeError("Atmospheric samples require aligned, normalized weights.");
  }
}

/** Reduces coeval weather or phase samples without changing their physical computation. */
export function reduceAtmosphere(input: Reduction) {
  const size = input.width * input.height;
  if (!Number.isSafeInteger(input.width) || input.width < 1 || !Number.isSafeInteger(input.height) ||
      input.height < 1 || !Number.isSafeInteger(size) || input.samples.length === 0) {
    throw new RangeError("Atmospheric reduction requires a positive grid and nonempty samples.");
  }
  if (input.reduction !== "weather-members" && input.reduction !== "annual") {
    throw new RangeError("Unknown atmospheric reduction.");
  }
  const phaseReduction = input.reduction === "annual";
  if (phaseReduction) assertWeights(input.weights, input.samples.length);
  const weights = phaseReduction ? input.weights : undefined;
  const count = input.samples.length;
  const assertField = (field: DeepReadonly<Float32Array | Int8Array>, kind: "float" | "vector") => {
    if (!(kind === "float" ? field instanceof Float32Array : field instanceof Int8Array) ||
        field.length !== size || !field.every(Number.isFinite)) {
      throw new RangeError("Atmospheric fields must be finite, grid-aligned typed arrays.");
    }
  };
  const meanFloat = (fields: readonly DeepReadonly<Float32Array>[]) => {
    const mean = new Float32Array(size);
    for (let index = 0; index < size; index++) {
      let sum = 0;
      for (let sample = 0; sample < count; sample++) {
        sum += fields[sample]![index]! * (weights ? weights[sample]! : 1);
      }
      mean[index] = weights ? sum : sum / count;
    }
    return mean;
  };
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
    pressure: meanFloat(input.samples.map((sample) => sample.pressure)),
    windU: meanVector("windU"), windV: meanVector("windV"),
    currentU: meanVector("currentU"), currentV: meanVector("currentV"),
  };
}
