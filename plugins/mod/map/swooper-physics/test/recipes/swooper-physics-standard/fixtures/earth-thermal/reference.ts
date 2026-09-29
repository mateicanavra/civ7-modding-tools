import source from "./noaa-low-relief-land.json";

/** Independent diagnostic evidence; source meters never become model relief units. */
export const earthThermalReference = source;

/**
 * Frozen comparisons, deliberately independent of migrating map configs. The fit uses the
 * identifiable land intercept with landCoolingC = 0; it is not a recommended authored profile.
 */
export const earthThermalReferenceProfiles = {
  alternatingBandFit: {
    declinationsDegrees: [0, 23.44, 0, -23.44],
    forcing: {
      strategy: "latitude-insolation",
      config: { equatorInsolation: 1, poleInsolation: 0.25, latitudeExponent: 1.2 },
    },
    thermal: {
      strategy: "insolation-lapse-rate",
      config: {
        baseTemperatureC: -3.612945666608553,
        insolationScaleC: 72.58464582463931,
        lapseRateCPerElevationUnit: 0,
        landCoolingC: 0,
        minC: -40,
        maxC: 50,
      },
    },
  },
  originalNeutralBaseline: {
    declinationsDegrees: [0, 23.44, 0, -23.44],
    forcing: {
      strategy: "latitude-insolation",
      config: { equatorInsolation: 1.5, poleInsolation: 0.22, latitudeExponent: 1.2 },
    },
    thermal: {
      strategy: "insolation-lapse-rate",
      config: {
        baseTemperatureC: 8,
        insolationScaleC: 50,
        lapseRateCPerElevationUnit: -0.0065,
        landCoolingC: 3.2,
        minC: -40,
        maxC: 50,
      },
    },
  },
  retiredNeutralRefine: {
    declinationsDegrees: [0],
    forcing: {
      strategy: "latitude-insolation",
      config: { equatorInsolation: 0.9, poleInsolation: 0.1, latitudeExponent: 1 },
    },
    thermal: {
      strategy: "insolation-lapse-rate",
      config: {
        baseTemperatureC: 9,
        insolationScaleC: 50,
        lapseRateCPerElevationUnit: -0.15,
        landCoolingC: 0.32,
        minC: -60,
        maxC: 50,
      },
    },
  },
} as const;
