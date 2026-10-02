type ChannelTopographyParams = Readonly<{
  width: number;
  height: number;
  elevation: ArrayLike<number>;
  initialElevation: ArrayLike<number>;
  originalLandMask: ArrayLike<number>;
  externalWaterMask: ArrayLike<number>;
  seaLevel: number;
  bathymetry: ArrayLike<number>;
}>;

type ChannelTopographyResult = Readonly<{
  topography: Readonly<{
    elevation: Int16Array;
    seaLevel: number;
    landMask: Uint8Array;
    externalWaterMask: Uint8Array;
    bathymetry: Int16Array;
  }>;
  roundingDelta: number[];
  clampDelta: number[];
}>;

const MIN_GROUND = -32768;
const MAX_GROUND = 32767;

/** Rounds ground once; immutable initial water is evidence to check, never a surface to repair. */
export function sealChannelTopography(params: ChannelTopographyParams): ChannelTopographyResult {
  const { width, height, elevation, initialElevation, originalLandMask, externalWaterMask,
    seaLevel, bathymetry } = params;
  const size = width * height;
  if (!Number.isSafeInteger(width) || width < 1 || !Number.isSafeInteger(height) || height < 1 ||
      !Number.isSafeInteger(size) || !Number.isFinite(seaLevel)) {
    throw new Error("Channel topography requires positive integer dimensions and a finite sea datum.");
  }
  for (const [name, field] of Object.entries({ elevation, initialElevation, originalLandMask,
    externalWaterMask, bathymetry })) {
    if (field.length !== size) throw new Error(`Channel topography ${name} must match map dimensions.`);
  }

  let hasEligibleLand = false;
  for (let i = 0; i < size; i++) {
    const initial = initialElevation[i];
    if (!Number.isFinite(elevation[i]) || !Number.isInteger(initial) ||
        initial < MIN_GROUND || initial > MAX_GROUND ||
        !Number.isInteger(bathymetry[i]) || bathymetry[i] < MIN_GROUND || bathymetry[i] > MAX_GROUND ||
        (originalLandMask[i] !== 0 && originalLandMask[i] !== 1) ||
        (externalWaterMask[i] !== 0 && externalWaterMask[i] !== 1) ||
        (externalWaterMask[i] === 1 && originalLandMask[i] !== 0)) {
      throw new Error(`Channel topography requires valid finite ground and initial identity at tile ${i}.`);
    }
    const eligible = originalLandMask[i] === 1 && initial > seaLevel;
    hasEligibleLand ||= eligible;
    if (!eligible && elevation[i] !== initial) {
      throw new Error(`Channel topography initially submerged or non-original-land ground changed at tile ${i}.`);
    }
  }

  const landFloor = Math.floor(seaLevel) + 1;
  if (hasEligibleLand && (!Number.isSafeInteger(landFloor) || landFloor < MIN_GROUND || landFloor > MAX_GROUND)) {
    throw new Error("Channel topography original-land floor is not representable.");
  }

  const nextElevation = new Int16Array(size);
  const roundingDelta = new Array<number>(size);
  const clampDelta = new Array<number>(size);
  for (let i = 0; i < size; i++) {
    const rounded = Math.round(elevation[i]);
    let published = Math.max(MIN_GROUND, Math.min(MAX_GROUND, rounded));
    if (originalLandMask[i] === 1 && initialElevation[i] > seaLevel) {
      published = Math.max(landFloor, published);
    }
    nextElevation[i] = published;
    roundingDelta[i] = rounded - elevation[i];
    clampDelta[i] = published - rounded;
  }

  return {
    topography: {
      elevation: nextElevation,
      seaLevel,
      landMask: new Uint8Array(originalLandMask),
      externalWaterMask: new Uint8Array(externalWaterMask),
      bathymetry: new Int16Array(bathymetry),
    },
    roundingDelta,
    clampDelta,
  };
}
