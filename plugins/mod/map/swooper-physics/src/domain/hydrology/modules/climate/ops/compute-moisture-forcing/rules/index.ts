import {
  bracketHexNeighborDirectionsOddQ,
  forEachHexNeighborOddQWithDirection,
  getHexNeighborDirectionVectorsOddQ,
} from "@swooper/mapgen-core/lib/grid";
import { clamp01 } from "@swooper/mapgen-core/lib/math";

const REFERENCE_WIDTH = 84;
const MINIMUM_PASSES = 64;
const MINIMUM_BRACKET_LENGTH = Math.sqrt(3) / 2;

type TransportParams = Readonly<{
  width: number;
  height: number;
  windU: ArrayLike<number>;
  windV: ArrayLike<number>;
  transportSpeed: number;
}>;

type MoistureTransport = Readonly<{
  width: number;
  height: number;
  neighbor0: ArrayLike<number>;
  neighbor1: ArrayLike<number>;
  rate0: ArrayLike<number>;
  rate1: ArrayLike<number>;
  nominalPassCount: number;
}>;

type ForcingParams = Readonly<{
  width: number;
  height: number;
  landMask: ArrayLike<number>;
  externalWaterMask: ArrayLike<number>;
  elevation: ArrayLike<number>;
  seaLevel: number;
  windU: ArrayLike<number>;
  windV: ArrayLike<number>;
  sstC: ArrayLike<number>;
  seaIceMask: ArrayLike<number>;
}>;

type ForcingOptions = Readonly<{
  marineSourceRate: number;
  backgroundExtractionRate: number;
  ascentExtractionRate: number;
  transportSpeed: number;
  terrainGradientReference: number;
  wetnessScale: number;
}>;

type IntegrationParams = Readonly<{
  transport: MoistureTransport;
  sourceRate: ArrayLike<number>;
  extractionRate: ArrayLike<number>;
  initialStock?: ArrayLike<number>;
  passCount?: number;
}>;

/** Precomputes downwind donor rays and capacity; missing Y shares keep their original rates. */
function prepareMoistureTransport(params: TransportParams): MoistureTransport {
  const { width, height, windU, windV, transportSpeed } = params;
  const size = width * height;
  const spacing = REFERENCE_WIDTH / width;
  const neighbor0 = new Int32Array(size).fill(-1);
  const neighbor1 = new Int32Array(size).fill(-1);
  const rate0 = new Float64Array(size);
  const rate1 = new Float64Array(size);
  const unitDirections = [false, true].map((isOddRow) =>
    getHexNeighborDirectionVectorsOddQ(isOddRow).map((vector) => {
      const length = Math.hypot(vector.x, vector.y);
      return { x: vector.x / length, y: vector.y / length };
    })
  );

  for (let y = 0; y < height; y++) {
    const isOddRow = (y & 1) === 1;
    const directions = unitDirections[y & 1]!;
    for (let x = 0; x < width; x++) {
      const index = y * width + x;
      const u = windU[index];
      const v = windV[index];
      const bracket = bracketHexNeighborDirectionsOddQ({ x: u, y: v }, isOddRow);
      if (!bracket) continue;

      const n0 = directions[bracket.direction0]!;
      const n1 = directions[bracket.direction1]!;
      const rho = Math.hypot(
        bracket.weight0 * n0.x + bracket.weight1 * n1.x,
        bracket.weight0 * n0.y + bracket.weight1 * n1.y
      );
      const speed = Math.min(1, Math.hypot(u, v) / 127);
      const donorRate = (transportSpeed * speed) / (spacing * rho);
      rate0[index] = donorRate * bracket.weight0;
      rate1[index] = donorRate * bracket.weight1;

      forEachHexNeighborOddQWithDirection(x, y, width, height, (nx, ny, direction) => {
        if (direction === bracket.direction0) neighbor0[index] = ny * width + nx;
        if (direction === bracket.direction1) neighbor1[index] = ny * width + nx;
      });
    }
  }

  return {
    width,
    height,
    neighbor0,
    neighbor1,
    rate0,
    rate1,
    nominalPassCount: Math.max(
      MINIMUM_PASSES,
      Math.ceil((2 * transportSpeed) / (spacing * MINIMUM_BRACKET_LENGTH))
    ),
  };
}

/**
 * Uses the admitted sea surface, not bathymetry, for coastal ascent. Other initial water has
 * no admitted atmospheric terrain height and its edges do not create or redirect ascent.
 */
function terrainHeight(input: ForcingParams, index: number): number | undefined {
  if (input.landMask[index] === 1) return input.elevation[index] - input.seaLevel;
  if (input.externalWaterMask[index] === 1) return 0;
  return undefined;
}

/** Precomputes source and signed net-inflow terrain extraction for one weather member. */
export function prepareMoistureForcing(input: ForcingParams, options: ForcingOptions) {
  const transport = prepareMoistureTransport({
    width: input.width,
    height: input.height,
    windU: input.windU,
    windV: input.windV,
    transportSpeed: options.transportSpeed,
  });
  const size = input.width * input.height;
  const sourceRate = new Float64Array(size);
  const extractionRate = new Float64Array(size);
  const incomingAscent = new Float64Array(size);

  for (let donor = 0; donor < size; donor++) {
    if (input.landMask[donor] !== 1 && input.externalWaterMask[donor] === 1) {
      const temperature = input.sstC[donor];
      if (!Number.isFinite(temperature)) {
        throw new Error(`Marine moisture supply requires finite prescribed SST at tile ${donor}.`);
      }
      const speed = Math.min(1, Math.hypot(input.windU[donor], input.windV[donor]) / 127);
      sourceRate[donor] =
        options.marineSourceRate *
        options.wetnessScale *
        clamp01((temperature + 10) / 42) *
        (input.seaIceMask[donor] === 1 ? 0.08 : 1) *
        (0.65 + 0.35 * speed);
    }

    const donorHeight = terrainHeight(input, donor);
    if (donorHeight === undefined) continue;
    const landing0 = transport.neighbor0[donor];
    const landing1 = transport.neighbor1[donor];
    if (landing0 >= 0 && input.landMask[landing0] === 1) {
      incomingAscent[landing0] +=
        transport.rate0[donor] * (input.elevation[landing0] - input.seaLevel - donorHeight);
    }
    if (landing1 >= 0 && input.landMask[landing1] === 1) {
      incomingAscent[landing1] +=
        transport.rate1[donor] * (input.elevation[landing1] - input.seaLevel - donorHeight);
    }
  }

  const ascentReference = options.transportSpeed * options.terrainGradientReference;
  for (let index = 0; index < size; index++) {
    // The positive part follows the signed sum, so opposite contour rays cancel.
    const uplift =
      input.landMask[index] === 1 && ascentReference > 0
        ? clamp01(Math.max(0, incomingAscent[index]) / ascentReference)
        : 0;
    extractionRate[index] =
      options.backgroundExtractionRate + options.ascentExtractionRate * uplift;
  }

  return { transport, sourceRate, extractionRate };
}

/** Stable fractional deposition of a constant source during exact local source/rainout. */
function sourceRainFraction(z: number, rainFraction: number): number {
  if (z < 1e-4) {
    return z / 2 - (z * z) / 6 + (z * z * z) / 24 - (z * z * z * z) / 120;
  }
  return 1 - rainFraction / z;
}

/**
 * Integrates exact local supply/rainout, then donor-bounded scatter over fixed H=1.
 * Explicit stock and pass count exist only for private manufactured controls; ordinary callers
 * start at zero and use the derived half-CFL nominal count. Last-pass arrivals remain stock.
 */
export function integrateMoisture(params: IntegrationParams) {
  const { transport, sourceRate, extractionRate, initialStock } = params;
  const size = transport.width * transport.height;
  const passCount = params.passCount ?? transport.nominalPassCount;
  if (!Number.isInteger(passCount) || passCount < 1) {
    throw new Error("Moisture pass count must be a positive integer.");
  }
  const dt = 1 / passCount;
  let stock = new Float64Array(size);
  let next = new Float64Array(size);
  const precipitation = new Float64Array(size);
  const rainFraction = new Float64Array(size);
  const sourceRain = new Float64Array(size);
  const sourceResidual = new Float64Array(size);
  const fraction0 = new Float64Array(size);
  const fraction1 = new Float64Array(size);

  for (let index = 0; index < size; index++) {
    const q = initialStock?.[index] ?? 0;
    const e = sourceRate[index];
    const k = extractionRate[index];
    if (!Number.isFinite(q) || q < 0 || !Number.isFinite(e) || e < 0 || !Number.isFinite(k) || k < 0) {
      throw new Error(`Moisture stock and local rates must be finite and nonnegative at tile ${index}.`);
    }
    const f0 = dt * transport.rate0[index];
    const f1 = dt * transport.rate1[index];
    if (!Number.isFinite(f0) || f0 < 0 || !Number.isFinite(f1) || f1 < 0 || f0 + f1 > 1) {
      throw new Error(`Moisture donor CFL exceeds one or has invalid rates at tile ${index}.`);
    }
    stock[index] = q;
    fraction0[index] = f0;
    fraction1[index] = f1;
    const z = k * dt;
    const r = -Math.expm1(-z);
    const psi = k === 0 ? 0 : sourceRainFraction(z, r);
    rainFraction[index] = r;
    sourceRain[index] = e * dt * psi;
    sourceResidual[index] = e * dt * (1 - psi);
  }

  for (let pass = 0; pass < passCount; pass++) {
    next.fill(0);
    for (let donor = 0; donor < size; donor++) {
      const q = stock[donor];
      const r = rainFraction[donor];
      precipitation[donor] += q * r + sourceRain[donor];
      const residual = q * (1 - r) + sourceResidual[donor];
      const landing0 = transport.neighbor0[donor];
      const landing1 = transport.neighbor1[donor];
      const f0 = landing0 >= 0 ? fraction0[donor] : 0;
      const f1 = landing1 >= 0 ? fraction1[donor] : 0;
      next[donor] += residual * (1 - (f0 + f1));
      if (landing0 >= 0) next[landing0] += residual * f0;
      if (landing1 >= 0) next[landing1] += residual * f1;
    }
    const swap = stock;
    stock = next;
    next = swap;
  }

  return { precipitation, finalStock: stock, passCount };
}

/** Publishes float forcing once; byte encoding and accounting readback belong to consumers/tests. */
export function publishMoistureForcing(deposition: ArrayLike<number>) {
  const precipitation = Float32Array.from(deposition);
  const surfaceWetness = new Float32Array(precipitation.length);
  for (let index = 0; index < precipitation.length; index++) {
    surfaceWetness[index] = clamp01(precipitation[index] / 200);
  }
  return { precipitation, surfaceWetness };
}
