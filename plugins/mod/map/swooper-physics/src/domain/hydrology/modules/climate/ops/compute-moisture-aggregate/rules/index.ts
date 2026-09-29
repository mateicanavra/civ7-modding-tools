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

/** Weather rainfall/humidity are reduced before phase demand; annual demand is never recomputed. */
export function reduceMoisture(input: Reduction) {
  const size = input.width * input.height;
  const count = input.samples.length;
  if (!Number.isSafeInteger(input.width) || input.width < 1 || !Number.isSafeInteger(input.height) ||
      input.height < 1 || !Number.isSafeInteger(size) || count === 0) {
    throw new RangeError("Moisture reduction requires a positive grid and nonempty samples.");
  }
  if (input.reduction !== "weather-members" && input.reduction !== "annual") throw new RangeError("Unknown moisture reduction.");
  if (input.reduction === "annual") {
    if (input.model !== "legacy-snapshots" && input.model !== "periodic-cycle") throw new RangeError("Unknown climate sampling model.");
    if (input.weights.length !== count || input.weights.some((value) => !Number.isFinite(value) || value <= 0) ||
        Math.abs(input.weights.reduce((sum, value) => sum + value, 0) - 1) > Number.EPSILON * Math.max(8, count * 4) ||
        (input.model === "legacy-snapshots" && input.weights.some((value) => value !== 1 / count))) {
      throw new RangeError("Moisture samples require aligned, normalized weights; legacy weights must be equal.");
    }
    for (const sample of input.samples) {
      if (!Array.isArray(sample.potentialDemand) || sample.potentialDemand.length !== size ||
          sample.potentialDemand.some((value) => !Number.isFinite(value) || value < 0)) {
        throw new RangeError("Potential demand must be finite, nonnegative and grid-aligned.");
      }
    }
  }
  for (const sample of input.samples) {
    if (!(sample.rainfall instanceof Uint8Array) || !(sample.humidity instanceof Uint8Array) ||
        sample.rainfall.length !== size || sample.humidity.length !== size) {
      throw new RangeError("Moisture fields must be grid-aligned Uint8Arrays.");
    }
  }
  const weights = input.reduction === "annual" && input.model === "periodic-cycle" ? input.weights : undefined;
  const rainfall = new Uint8Array(size);
  const humidity = new Uint8Array(size);
  const potentialDemand = new Float32Array(size);
  const rainfallAmplitude = new Uint8Array(size);
  const humidityAmplitude = new Uint8Array(size);
  for (let index = 0; index < size; index++) {
    let rainSum = 0, humidSum = 0, demandSum = 0;
    let rainMin = 255, rainMax = 0, humidMin = 255, humidMax = 0;
    for (let phase = 0; phase < count; phase++) {
      const sample = input.samples[phase]!;
      const rain = sample.rainfall[index]!;
      const humid = sample.humidity[index]!;
      const weight = weights ? weights[phase]! : 1;
      rainSum += rain * weight;
      humidSum += humid * weight;
      if (input.reduction === "annual") demandSum += input.samples[phase]!.potentialDemand[index]! * weight;
      rainMin = Math.min(rainMin, rain); rainMax = Math.max(rainMax, rain);
      humidMin = Math.min(humidMin, humid); humidMax = Math.max(humidMax, humid);
    }
    rainfall[index] = Math.max(0, Math.min(input.reduction === "annual" ? 200 : 255, Math.round(weights ? rainSum : rainSum / count)));
    humidity[index] = Math.max(0, Math.min(255, Math.round(weights ? humidSum : humidSum / count)));
    potentialDemand[index] = weights ? demandSum : demandSum / count;
    rainfallAmplitude[index] = Math.max(0, Math.min(255, Math.round((rainMax - rainMin) / 2)));
    humidityAmplitude[index] = Math.max(0, Math.min(255, Math.round((humidMax - humidMin) / 2)));
  }
  return input.reduction === "weather-members"
    ? { reduction: input.reduction, rainfall, humidity }
    : { reduction: input.reduction, rainfall, humidity, potentialDemand, rainfallAmplitude, humidityAmplitude };
}
