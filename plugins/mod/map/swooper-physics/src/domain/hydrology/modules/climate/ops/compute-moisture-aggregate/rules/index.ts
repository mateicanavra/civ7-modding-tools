import type { ClimateSamplingModel } from "../../../model/atoms/climate-phase.schema.js";
import type { DeepReadonly } from "@swooper/mapgen-core/authoring";
import type { MoistureSample } from "../../../model/atoms/moisture-sample.schema.js";

type Reduction = Readonly<{ width: number; height: number }> & (
  | { reduction: "weather-members"; samples: readonly DeepReadonly<MoistureSample>[] }
  | {
    reduction: "annual"; model: ClimateSamplingModel; weights: readonly number[];
    samples: readonly (DeepReadonly<MoistureSample> & { potentialDemand: readonly number[] })[];
  }
);

/** Average precipitation and member-clamped wetness independently before phase demand. */
export function reduceMoisture(input: Reduction) {
  const size = input.width * input.height;
  const count = input.samples.length;
  if (!Number.isSafeInteger(input.width) || input.width < 1 || !Number.isSafeInteger(input.height) ||
      input.height < 1 || !Number.isSafeInteger(size) || count === 0) {
    throw new RangeError("Moisture reduction requires a positive grid and nonempty samples.");
  }
  if (input.reduction !== "weather-members" && input.reduction !== "annual") throw new RangeError("Unknown moisture reduction.");
  if (input.reduction === "annual") {
    if (input.weights.length !== count || input.weights.some((value) => !Number.isFinite(value) || value <= 0) ||
        Math.abs(input.weights.reduce((sum, value) => sum + value, 0) - 1) > Number.EPSILON * Math.max(8, count * 4)) {
      throw new RangeError("Moisture samples require aligned, normalized weights.");
    }
    for (const sample of input.samples) {
      if (!Array.isArray(sample.potentialDemand) || sample.potentialDemand.length !== size ||
          sample.potentialDemand.some((value) => !Number.isFinite(value) || value < 0)) {
        throw new RangeError("Potential demand must be finite, nonnegative and grid-aligned.");
      }
    }
  }
  for (const sample of input.samples) {
    for (let index = 0; index < size; index++) {
      if (!Number.isFinite(sample.precipitation[index]) || sample.precipitation[index]! < 0 ||
          !Number.isFinite(sample.surfaceWetness[index]) || sample.surfaceWetness[index]! < 0 || sample.surfaceWetness[index]! > 1) {
        throw new RangeError("Moisture fields require finite nonnegative precipitation and surface wetness in 0..1.");
      }
    }
  }
  const weights = input.reduction === "annual" ? input.weights : undefined;
  const precipitation = new Float32Array(size);
  const surfaceWetness = new Float32Array(size);
  const potentialDemand = new Float32Array(size);
  const precipitationAmplitude = new Float32Array(size);
  const surfaceWetnessAmplitude = new Float32Array(size);
  const rainfallCodec = new Uint8Array(size);
  for (let index = 0; index < size; index++) {
    let rainSum = 0, wetnessSum = 0, demandSum = 0;
    let rainMin = Infinity, rainMax = 0, wetnessMin = Infinity, wetnessMax = 0;
    for (let phase = 0; phase < count; phase++) {
      const sample = input.samples[phase]!;
      const rain = sample.precipitation[index]!;
      const wetness = sample.surfaceWetness[index]!;
      const weight = weights ? weights[phase]! : 1;
      rainSum += rain * weight;
      wetnessSum += wetness * weight;
      if (input.reduction === "annual") demandSum += input.samples[phase]!.potentialDemand[index]! * weight;
      rainMin = Math.min(rainMin, rain); rainMax = Math.max(rainMax, rain);
      wetnessMin = Math.min(wetnessMin, wetness); wetnessMax = Math.max(wetnessMax, wetness);
    }
    precipitation[index] = weights ? rainSum : rainSum / count;
    surfaceWetness[index] = weights ? wetnessSum : wetnessSum / count;
    potentialDemand[index] = weights ? demandSum : demandSum / count;
    precipitationAmplitude[index] = (rainMax - rainMin) / 2;
    surfaceWetnessAmplitude[index] = (wetnessMax - wetnessMin) / 2;
    if (input.reduction === "annual") rainfallCodec[index] = Math.round(Math.max(0, Math.min(200, precipitation[index]!)));
  }
  return input.reduction === "weather-members"
    ? { reduction: input.reduction, precipitation, surfaceWetness }
    : { reduction: input.reduction, precipitation, surfaceWetness, potentialDemand, precipitationAmplitude, surfaceWetnessAmplitude, rainfallCodec };
}
