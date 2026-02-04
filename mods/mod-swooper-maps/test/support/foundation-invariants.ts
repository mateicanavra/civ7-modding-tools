import type { ValidationInvariant, ValidationInvariantContext } from "./validation-harness.js";
import { foundationArtifacts } from "../../src/recipes/standard/stages/foundation/artifacts.js";

const EPS = 1e-6;
const POTENTIAL_MIN_ABS = 0.12;
const POTENTIAL_STD_MIN = 0.05;
const FORCING_MAG_MAX_MIN = 0.2;
const FORCING_MAG_MEAN_MIN = 0.02;
const STRESS_MAX_MIN = 0.2;
const PLATE_RMS_RATIO_MAX = 1.2;
const PLATE_QUALITY_MEAN_MIN = 40;
const CELL_FIT_OK_MAX = 180;
const CELL_FIT_OK_FRACTION_MIN = 0.5;

type FloatStats = {
  min: number;
  max: number;
  mean: number;
  std: number;
  count: number;
  nonFinite: number;
};

type ByteStats = {
  min: number;
  max: number;
  mean: number;
  count: number;
};

function scanFloat(values: Float32Array): FloatStats {
  let min = Number.POSITIVE_INFINITY;
  let max = Number.NEGATIVE_INFINITY;
  let sum = 0;
  let sumSq = 0;
  let count = 0;
  let nonFinite = 0;

  for (let i = 0; i < values.length; i++) {
    const v = values[i] ?? 0;
    if (!Number.isFinite(v)) {
      nonFinite += 1;
      continue;
    }
    if (v < min) min = v;
    if (v > max) max = v;
    sum += v;
    sumSq += v * v;
    count += 1;
  }

  const mean = count > 0 ? sum / count : 0;
  const variance = count > 0 ? sumSq / count - mean * mean : 0;
  return {
    min: count > 0 ? min : 0,
    max: count > 0 ? max : 0,
    mean,
    std: Math.sqrt(Math.max(0, variance)),
    count,
    nonFinite,
  };
}

function scanBytes(values: Uint8Array | Int8Array): ByteStats {
  let min = Number.POSITIVE_INFINITY;
  let max = Number.NEGATIVE_INFINITY;
  let sum = 0;
  const count = values.length;
  for (let i = 0; i < values.length; i++) {
    const v = values[i] ?? 0;
    if (v < min) min = v;
    if (v > max) max = v;
    sum += v;
  }
  return {
    min: count > 0 ? min : 0,
    max: count > 0 ? max : 0,
    mean: count > 0 ? sum / count : 0,
    count,
  };
}

function meanSpeed(u: Float32Array, v: Float32Array): number {
  let sum = 0;
  let count = 0;
  const len = Math.min(u.length, v.length);
  for (let i = 0; i < len; i++) {
    const ux = u[i] ?? 0;
    const vy = v[i] ?? 0;
    if (!Number.isFinite(ux) || !Number.isFinite(vy)) continue;
    sum += Math.hypot(ux, vy);
    count += 1;
  }
  return count > 0 ? sum / count : 0;
}

function requireArtifact<T>(ctx: ValidationInvariantContext, id: string, label: string): T | null {
  if (!ctx.context.artifacts.has(id)) {
    return null;
  }
  const value = ctx.context.artifacts.get(id);
  if (!value || typeof value !== "object") {
    return null;
  }
  return value as T;
}

const mantlePotentialInvariant: ValidationInvariant = {
  name: "foundation-mantle-potential-range",
  description: "Mantle potential must be finite, normalized, and non-degenerate.",
  check: (ctx) => {
    const mantle = requireArtifact<{ potential?: unknown; sourceCount?: unknown }>(
      ctx,
      foundationArtifacts.mantlePotential.id,
      "mantlePotential"
    );
    if (!mantle || !(mantle.potential instanceof Float32Array)) {
      return { name: "foundation-mantle-potential-range", ok: false, message: "Missing mantlePotential.potential." };
    }
    const stats = scanFloat(mantle.potential);
    if (stats.nonFinite > 0) {
      return {
        name: "foundation-mantle-potential-range",
        ok: false,
        message: "mantlePotential contains non-finite values.",
        details: { nonFinite: stats.nonFinite },
      };
    }
    const range = stats.max - stats.min;
    if (stats.max < POTENTIAL_MIN_ABS || stats.min > -POTENTIAL_MIN_ABS || range < POTENTIAL_MIN_ABS * 2) {
      return {
        name: "foundation-mantle-potential-range",
        ok: false,
        message: "mantlePotential is too flat or not centered (degenerate driver).",
        details: { min: stats.min, max: stats.max, range },
      };
    }
    if (stats.std < POTENTIAL_STD_MIN) {
      return {
        name: "foundation-mantle-potential-range",
        ok: false,
        message: "mantlePotential variance is too low.",
        details: { std: stats.std, threshold: POTENTIAL_STD_MIN },
      };
    }
    return {
      name: "foundation-mantle-potential-range",
      ok: true,
      details: { min: stats.min, max: stats.max, std: stats.std },
    };
  },
};

const mantleForcingInvariant: ValidationInvariant = {
  name: "foundation-mantle-forcing-nonzero",
  description: "Mantle forcing must be finite, bounded, and non-degenerate.",
  check: (ctx) => {
    const forcing = requireArtifact<{
      forcingMag?: unknown;
      stress?: unknown;
      forcingU?: unknown;
      forcingV?: unknown;
      divergence?: unknown;
    }>(ctx, foundationArtifacts.mantleForcing.id, "mantleForcing");
    if (
      !forcing ||
      !(forcing.forcingMag instanceof Float32Array) ||
      !(forcing.stress instanceof Float32Array) ||
      !(forcing.forcingU instanceof Float32Array) ||
      !(forcing.forcingV instanceof Float32Array) ||
      !(forcing.divergence instanceof Float32Array)
    ) {
      return { name: "foundation-mantle-forcing-nonzero", ok: false, message: "Missing mantleForcing arrays." };
    }
    const magStats = scanFloat(forcing.forcingMag);
    const stressStats = scanFloat(forcing.stress);
    const divStats = scanFloat(forcing.divergence);

    if (magStats.nonFinite > 0 || stressStats.nonFinite > 0 || divStats.nonFinite > 0) {
      return {
        name: "foundation-mantle-forcing-nonzero",
        ok: false,
        message: "mantleForcing contains non-finite values.",
        details: { nonFinite: { mag: magStats.nonFinite, stress: stressStats.nonFinite, divergence: divStats.nonFinite } },
      };
    }

    if (magStats.min < -EPS || magStats.max > 1 + EPS) {
      return {
        name: "foundation-mantle-forcing-nonzero",
        ok: false,
        message: "mantleForcing.forcingMag out of bounds (expected 0..1).",
        details: { min: magStats.min, max: magStats.max },
      };
    }
    if (stressStats.min < -EPS || stressStats.max > 1 + EPS) {
      return {
        name: "foundation-mantle-forcing-nonzero",
        ok: false,
        message: "mantleForcing.stress out of bounds (expected 0..1).",
        details: { min: stressStats.min, max: stressStats.max },
      };
    }
    if (divStats.min < -1 - EPS || divStats.max > 1 + EPS) {
      return {
        name: "foundation-mantle-forcing-nonzero",
        ok: false,
        message: "mantleForcing.divergence out of bounds (expected -1..1).",
        details: { min: divStats.min, max: divStats.max },
      };
    }

    if (magStats.max < FORCING_MAG_MAX_MIN || magStats.mean < FORCING_MAG_MEAN_MIN) {
      return {
        name: "foundation-mantle-forcing-nonzero",
        ok: false,
        message: "mantleForcing magnitude too low (degenerate driver).",
        details: { max: magStats.max, mean: magStats.mean },
      };
    }
    if (stressStats.max < STRESS_MAX_MIN) {
      return {
        name: "foundation-mantle-forcing-nonzero",
        ok: false,
        message: "mantleForcing stress too low (degenerate driver).",
        details: { max: stressStats.max },
      };
    }

    const speedMean = meanSpeed(forcing.forcingU, forcing.forcingV);
    return {
      name: "foundation-mantle-forcing-nonzero",
      ok: true,
      details: { forcingMag: { max: magStats.max, mean: magStats.mean }, stressMax: stressStats.max, speedMean },
    };
  },
};

const plateCouplingInvariant: ValidationInvariant = {
  name: "foundation-plate-motion-coupling",
  description: "Plate motion must remain coupled to mantle forcing residuals.",
  check: (ctx) => {
    const forcing = requireArtifact<{ forcingU?: unknown; forcingV?: unknown }>(
      ctx,
      foundationArtifacts.mantleForcing.id,
      "mantleForcing"
    );
    const motion = requireArtifact<{
      plateFitRms?: unknown;
      plateQuality?: unknown;
      cellFitError?: unknown;
    }>(ctx, foundationArtifacts.plateMotion.id, "plateMotion");
    if (
      !forcing ||
      !(forcing.forcingU instanceof Float32Array) ||
      !(forcing.forcingV instanceof Float32Array) ||
      !motion ||
      !(motion.plateFitRms instanceof Float32Array) ||
      !(motion.plateQuality instanceof Uint8Array) ||
      !(motion.cellFitError instanceof Uint8Array)
    ) {
      return { name: "foundation-plate-motion-coupling", ok: false, message: "Missing plate motion arrays." };
    }

    const meanForcing = meanSpeed(forcing.forcingU, forcing.forcingV);
    if (meanForcing <= EPS) {
      return {
        name: "foundation-plate-motion-coupling",
        ok: false,
        message: "Mean mantle forcing speed is near zero (cannot validate coupling).",
        details: { meanForcing },
      };
    }

    const rmsStats = scanFloat(motion.plateFitRms);
    const meanRatio = rmsStats.mean / Math.max(meanForcing, EPS);
    const qualityStats = scanBytes(motion.plateQuality);
    const cellStats = scanBytes(motion.cellFitError);
    let okFraction = 0;
    if (motion.cellFitError.length > 0) {
      let okCount = 0;
      for (let i = 0; i < motion.cellFitError.length; i++) {
        if ((motion.cellFitError[i] ?? 0) <= CELL_FIT_OK_MAX) okCount += 1;
      }
      okFraction = okCount / motion.cellFitError.length;
    }

    if (meanRatio > PLATE_RMS_RATIO_MAX) {
      return {
        name: "foundation-plate-motion-coupling",
        ok: false,
        message: "Plate motion residuals exceed allowed ratio (coupling drift).",
        details: { meanRatio, threshold: PLATE_RMS_RATIO_MAX, meanForcing, rmsMean: rmsStats.mean },
      };
    }
    return {
      name: "foundation-plate-motion-coupling",
      ok: true,
      details: {
        meanForcing,
        rmsMean: rmsStats.mean,
        meanRatio,
        meanQuality: qualityStats.mean,
        cellFitOkFraction: okFraction,
      },
    };
  },
};

const couplingDiagnostics: ValidationInvariant = {
  name: "foundation-plate-motion-diagnostics",
  description: "Diagnostic coupling metrics (non-gating).",
  check: (ctx) => {
    const motion = requireArtifact<{
      plateFitP90?: unknown;
      plateFitRms?: unknown;
      plateQuality?: unknown;
    }>(ctx, foundationArtifacts.plateMotion.id, "plateMotion");
    if (
      !motion ||
      !(motion.plateFitP90 instanceof Float32Array) ||
      !(motion.plateFitRms instanceof Float32Array) ||
      !(motion.plateQuality instanceof Uint8Array)
    ) {
      return { name: "foundation-plate-motion-diagnostics", ok: false, message: "Missing diagnostic arrays." };
    }
    const p90Stats = scanFloat(motion.plateFitP90);
    const rmsStats = scanFloat(motion.plateFitRms);
    const qualityStats = scanBytes(motion.plateQuality);
    const cellStats = motion.cellFitError instanceof Uint8Array ? scanBytes(motion.cellFitError) : null;
    let okFraction = 0;
    if (motion.cellFitError instanceof Uint8Array && motion.cellFitError.length > 0) {
      let okCount = 0;
      for (let i = 0; i < motion.cellFitError.length; i++) {
        if ((motion.cellFitError[i] ?? 0) <= CELL_FIT_OK_MAX) okCount += 1;
      }
      okFraction = okCount / motion.cellFitError.length;
    }
    const ok = qualityStats.mean >= PLATE_QUALITY_MEAN_MIN && okFraction >= CELL_FIT_OK_FRACTION_MIN;
    return {
      name: "foundation-plate-motion-diagnostics",
      ok,
      details: {
        plateFitP90: { mean: p90Stats.mean, max: p90Stats.max },
        plateFitRms: { mean: rmsStats.mean, max: rmsStats.max },
        plateQuality: { mean: qualityStats.mean, min: qualityStats.min, max: qualityStats.max },
        cellFitError: cellStats ? { mean: cellStats.mean, okFraction } : null,
      },
      message: "Plate motion diagnostics below preferred quality/residual thresholds.",
    };
  },
};

export const M1_FOUNDATION_GATES: ValidationInvariant[] = [
  mantlePotentialInvariant,
  mantleForcingInvariant,
  plateCouplingInvariant,
];

export const M1_FOUNDATION_DIAGNOSTICS: ValidationInvariant[] = [couplingDiagnostics];
