type PlainObject = Record<string, unknown>;

function isPlainObject(value: unknown): value is PlainObject {
  if (value == null || typeof value !== "object" || Array.isArray(value)) return false;
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}

const FORBIDDEN_MERGE_KEYS = new Set(["__proto__", "prototype", "constructor"]);

export function mergeDeterministic(base: unknown, overrides: unknown): unknown {
  if (overrides === undefined) return base;
  if (!isPlainObject(base) || !isPlainObject(overrides)) return overrides;

  const out: PlainObject = { ...base };
  for (const key of Object.keys(overrides)) {
    if (FORBIDDEN_MERGE_KEYS.has(key)) continue;
    out[key] = mergeDeterministic(base[key], overrides[key]);
  }
  return out;
}

/**
 * A "known good" config fragment that enables the v2 circulation stack:
 * - winds: `earthlike`
 * - ocean currents: `earthlike`
 * - SST/sea-ice coupling: `default` (new op)
 * - moisture/precip: `vector`
 *
 * Used for both:
 * - a one-click "Apply circulation v2" button, and
 * - a Studio-only recipe variant with v2 enabled by default.
 */
export const CIRCULATION_V2_PRESET_OVERRIDES = {
  "hydrology-climate-baseline": {
    "climate-baseline": {
      computeAtmosphericCirculation: {
        strategy: "earthlike",
        config: {
          maxSpeed: 110,
          zonalStrength: 90,
          meridionalStrength: 30,
          geostrophicStrength: 70,
          pressureNoiseScale: 18,
          pressureNoiseAmp: 55,
          waveStrength: 45,
          landHeatStrength: 20,
          mountainDeflectStrength: 18,
          smoothIters: 4,
        },
      },
      computeOceanGeometry: {
        strategy: "default",
        config: {
          maxCoastDistance: 64,
          maxCoastVectorDistance: 10,
        },
      },
      computeOceanSurfaceCurrents: {
        strategy: "earthlike",
        config: {
          maxSpeed: 80,
          windStrength: 0.55,
          ekmanStrength: 0.35,
          gyreStrength: 26,
          coastStrength: 32,
          smoothIters: 3,
          projectionIters: 8,
        },
      },
      computeOceanThermalState: {
        strategy: "default",
        config: {
          equatorTempC: 28,
          poleTempC: -2,
          advectIters: 28,
          diffusion: 0.18,
          secondaryWeightMin: 0.25,
          seaIceThresholdC: -1,
        },
      },
      transportMoisture: {
        strategy: "vector",
        config: {
          iterations: 22,
          advection: 0.7,
          retention: 0.93,
          secondaryWeightMin: 0.2,
        },
      },
      computePrecipitation: {
        strategy: "vector",
        config: {
          rainfallScale: 180,
          humidityExponent: 1,
          noiseAmplitude: 6,
          noiseScale: 0.12,
          waterGradient: {
            radius: 5,
            perRingBonus: 4,
            lowlandBonus: 2,
            lowlandElevationMax: 150,
          },
          upliftStrength: 22,
          convergenceStrength: 16,
        },
      },
    },
  },
} as const satisfies PlainObject;

export function applyCirculationV2Preset(base: unknown): unknown {
  return mergeDeterministic(base, CIRCULATION_V2_PRESET_OVERRIDES);
}

