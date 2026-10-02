import { getHexNeighborIndicesOddQ } from "@swooper/mapgen-core/lib/grid";
import { DEFAULT_ELEVATION_SCALE } from "../../../../../model/policy/elevation-scale.js";

type ChannelIncisionParams = Readonly<{
  width: number;
  height: number;
  elevation: readonly number[];
  originalLandMask: ArrayLike<number>;
  externalWaterMask: ArrayLike<number>;
  exposedLandMask: ArrayLike<number>;
  wetMask: ArrayLike<number>;
  receiver: ArrayLike<number>;
  dryDischarge: readonly number[];
  waterSurface: readonly number[];
  seaLevel: number;
  erodibilityK: ArrayLike<number>;
}>;
type ChannelIncisionConfig = Readonly<{
  rate: number;
  m: number;
  n: number;
}>;
type ChannelIncisionResult = {
  elevation: number[];
  incisionDepth: number[];
};

const requireValid = (condition: unknown, message: string): void => {
  if (!condition) throw new RangeError(`Invalid channel incision input: ${message}.`);
};

/** One detachment-limited cycle; no routing, lake solve, classification, or sediment accounting. */
export function inciseChannels(input: ChannelIncisionParams, config: ChannelIncisionConfig): ChannelIncisionResult {
  const { width, height, elevation: ground, originalLandMask, externalWaterMask, exposedLandMask, wetMask, receiver, dryDischarge, waterSurface, seaLevel, erodibilityK } = input;
  const size = width * height;
  requireValid(Number.isSafeInteger(width) && width > 0 && Number.isSafeInteger(height) && height > 0 && Number.isSafeInteger(size) && size <= 0x7fffffff, "grid dimensions");
  requireValid(Number.isFinite(seaLevel), "finite sea datum");
  requireValid(Number.isFinite(config.rate) && config.rate >= 0 && config.rate <= 1 && Number.isFinite(config.m) && config.m >= 0 && config.m <= 4 && config.n === 1, "analytic n=1 process controls");
  for (const [name, values] of Object.entries({ ground, originalLandMask, externalWaterMask, exposedLandMask, wetMask, receiver, dryDischarge, waterSurface, erodibilityK })) {
    requireValid(values.length === size, `${name} cardinality`);
  }
  const dry = (cell: number): boolean => exposedLandMask[cell] === 1 && !wetMask[cell] && !externalWaterMask[cell];
  const receivingHead = (cell: number, values: readonly number[]): number => externalWaterMask[cell] ? seaLevel : wetMask[cell] ? waterSurface[cell]! : values[cell]!;
  for (let cell = 0; cell < size; cell++) {
    requireValid(Number.isFinite(ground[cell]) && ground[cell]! >= -32768 && ground[cell]! <= 32767, `finite precise ground at ${cell}`);
    for (const [name, mask] of Object.entries({ originalLandMask, externalWaterMask, exposedLandMask, wetMask })) {
      requireValid(mask[cell] === 0 || mask[cell] === 1, `binary ${name} at ${cell}`);
    }
    requireValid(!externalWaterMask[cell] || !originalLandMask[cell] && !wetMask[cell] && !exposedLandMask[cell], `external identity at ${cell}`);
    requireValid(exposedLandMask[cell] === (!externalWaterMask[cell] && !wetMask[cell] ? 1 : 0), `certified exposure at ${cell}`);
    requireValid(Number.isFinite(waterSurface[cell]), `finite water surface at ${cell}`);
    requireValid(externalWaterMask[cell] ? waterSurface[cell] === seaLevel : wetMask[cell] ? waterSurface[cell]! > ground[cell]! : waterSurface[cell] === ground[cell], `certified hydraulic surface at ${cell}`);
    requireValid(Number.isFinite(dryDischarge[cell]) && dryDischarge[cell]! >= 0 && Number.isFinite(erodibilityK[cell]) && erodibilityK[cell]! >= 0, `finite nonnegative discharge/erodibility at ${cell}`);
    requireValid(dry(cell) || dryDischarge[cell] === 0, `non-dry discharge at ${cell}`);
    const target = receiver[cell]!;
    requireValid(Number.isSafeInteger(target) && target >= -2 && target < size, `receiver index at ${cell}`);
    if (target >= 0) {
      requireValid(target !== cell && getHexNeighborIndicesOddQ(cell % width, Math.floor(cell / width), width, height).includes(target), `adjacent receiver at ${cell}`);
      if (dry(cell)) requireValid(receivingHead(target, ground) <= ground[cell]!, `ascending certified receiver at ${cell}`);
    } else requireValid(dryDischarge[cell] === 0, `unattached positive discharge at ${cell}`);
  }

  // Order the supplied dry dependency, stopping at hydraulic heads. This does not construct receivers.
  const sources = Array.from({ length: size }, (_, cell) => cell).filter(dry);
  const upstream: number[][] = Array.from({ length: size }, () => []);
  const order: number[] = [];
  for (const cell of sources) {
    const target = receiver[cell]!;
    if (target >= 0 && dry(target)) upstream[target]!.push(cell);
    else order.push(cell);
  }
  for (let head = 0; head < order.length; head++) order.push(...upstream[order[head]!]!);
  requireValid(order.length === sources.length, "cyclic supplied dry receivers");

  const elevation = Array.from(ground);
  const incisionDepth = new Array<number>(size).fill(0);
  for (const cell of order) {
    const target = receiver[cell]!;
    if (!originalLandMask[cell] || target < 0 || dryDischarge[cell] === 0 || config.rate === 0 || erodibilityK[cell] === 0) continue;
    const coefficient = config.rate * erodibilityK[cell]! * dryDischarge[cell]! ** config.m;
    requireValid(Number.isFinite(coefficient), `finite stream power at ${cell}`);
    const hydraulicHead = receivingHead(target, elevation);
    if (coefficient === 0 || ground[cell] === hydraulicHead) continue;
    const oldHeight = ground[cell]! / DEFAULT_ELEVATION_SCALE;
    const head = hydraulicHead / DEFAULT_ELEVATION_SCALE;
    // Fastscape n=1 with unit hex length/time: h_new = (h_old + a*h_receiver_new)/(1+a).
    const updated = (head + (oldHeight - head) / (1 + coefficient)) * DEFAULT_ELEVATION_SCALE;
    requireValid(Number.isFinite(updated) && updated >= -32768 && updated <= 32767, `evolved ground range at ${cell}`);
    elevation[cell] = Math.max(hydraulicHead, Math.min(ground[cell]!, updated));
    incisionDepth[cell] = ground[cell]! - elevation[cell]!;
  }
  return { elevation, incisionDepth };
}
