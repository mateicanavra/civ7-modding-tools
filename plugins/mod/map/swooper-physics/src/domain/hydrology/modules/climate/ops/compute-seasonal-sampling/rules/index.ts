import type { ClimatePhaseFrame, ClimateSamplingModel } from "../../../model/atoms/climate-phase.schema.js";

const CIRCULATION_MIGRATION_FRACTION = 0.35;
const TRANSIENT_SALT_MULTIPLIER = 0x9e3779b1;

/** Owns latitude construction and numerical phase identity, not thermal forcing. */
export function computeSampling(
  input: Readonly<{
    width: number; height: number; topLatitude: number; bottomLatitude: number;
    modeCount: 2 | 4; axialTiltDeg: number; rngSeed: number;
  }>,
  model: ClimateSamplingModel,
  phaseCount?: number
) {
  if (!Number.isSafeInteger(input.width) || input.width < 1 ||
      !Number.isSafeInteger(input.height) || input.height < 1 ||
      !Number.isSafeInteger(input.width * input.height)) {
    throw new RangeError("Seasonal sampling requires positive finite grid dimensions.");
  }
  if (![input.topLatitude, input.bottomLatitude].every((value) => Number.isFinite(value) && Math.abs(value) <= 90) ||
      !Number.isFinite(input.axialTiltDeg) || input.axialTiltDeg < 0 || input.axialTiltDeg > 90 ||
      (input.modeCount !== 2 && input.modeCount !== 4) ||
      !Number.isInteger(input.rngSeed) || input.rngSeed < 0 || input.rngSeed > 2_147_483_647) {
    throw new RangeError("Invalid seasonal latitude, tilt, observation mode or seed.");
  }
  if (model === "periodic-cycle" && ![12, 24, 48, 96].includes(phaseCount!)) {
    throw new RangeError("Periodic phase count must be 12, 24, 48 or 96.");
  }
  const clampFrame = (latitude: number) => Math.max(-89.999, Math.min(89.999, latitude));
  const latitudeByRow = new Float32Array(input.height);
  const clampTrue = model === "legacy-snapshots" ? clampFrame : (latitude: number) => latitude;
  if (input.height === 1) {
    latitudeByRow[0] = clampTrue((input.topLatitude + input.bottomLatitude) / 2);
  } else {
    const step = (input.bottomLatitude - input.topLatitude) / (input.height - 1);
    for (let y = 0; y < input.height; y++) {
      latitudeByRow[y] = clampTrue(input.topLatitude + step * y);
    }
  }
  const phases = model === "legacy-snapshots"
    ? input.modeCount === 4 ? [0, 0.25, 0.5, 0.75] : [0.25, 0.75]
    : Array.from({ length: phaseCount! }, (_, index) => index / phaseCount!);
  const weights = phases.map(() => 1 / phases.length);
  const observationIndices = model === "legacy-snapshots"
    ? phases.map((_, index) => index)
    : (input.modeCount === 4 ? [0, 1, 2, 3] : [1, 3]).map((quarter) => quarter * phases.length / 4);
  const frames: ClimatePhaseFrame[] = phases.map((phase, index) => {
    const declinationDeg = input.axialTiltDeg * Math.sin(2 * Math.PI * phase);
    const circulationLatitude = new Float32Array(input.height);
    const thermalLatitude = new Float32Array(input.height);
    for (let y = 0; y < input.height; y++) {
      circulationLatitude[y] = clampFrame(latitudeByRow[y]! - declinationDeg * CIRCULATION_MIGRATION_FRACTION);
      thermalLatitude[y] = clampFrame(latitudeByRow[y]! - declinationDeg);
    }
    // All qualified grids divide 96. This rational phase key is invariant at shared phases,
    // unlike an array index; legacy identity intentionally remains unchanged.
    const phaseKey = model === "legacy-snapshots" ? index : Math.round(phase * 96);
    const transientSalt = Math.abs(input.axialTiltDeg) >= 1e-6
      ? (Math.imul(input.rngSeed ^ (phaseKey + 1), TRANSIENT_SALT_MULTIPLIER) >>> 1) | 0
      : 0;
    return { phase, circulationLatitude, thermalLatitude, transientSalt };
  });
  return { model, latitudeByRow, phases, weights, observationIndices, frames };
}
