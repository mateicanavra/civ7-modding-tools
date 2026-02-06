import { forEachHexNeighborOddQ } from "@swooper/mapgen-core/lib/grid";
import { PerlinNoise } from "@swooper/mapgen-core/lib/noise";
import { deriveStepSeed } from "@swooper/mapgen-core/lib/rng";

import type { ValidationInvariant, ValidationInvariantContext } from "./validation-harness.js";
import planRidgesAndFoothills from "../../src/domain/morphology/ops/plan-ridges-and-foothills/index.js";
import { foundationArtifacts } from "../../src/recipes/standard/stages/foundation/artifacts.js";
import { morphologyArtifacts } from "../../src/recipes/standard/stages/morphology/artifacts.js";
import { deriveBeltDriversFromHistory } from "../../src/domain/morphology/ops/compute-belt-drivers/deriveFromHistory.js";

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
const EVENT_SIGNAL_THRESHOLD = 20;
const EVENT_CORRIDOR_MIN_TILES = 12;
const EVENT_BOUNDARY_COVERAGE_MIN = 0.6;
const EVENT_ORIGIN_FRACTION_MIN = 0.75;
const EVENT_BOUNDARY_FRACTION_MIN = 0.85;
const BELT_MIN_CELLS = 20;
const BELT_COMPONENT_MEAN_MIN = 8;
const BELT_COMPONENT_MAX_MIN = 12;
const BELT_NEIGHBOR_MEAN_MIN = 1.6;
const DRIVER_SIGNAL_THRESHOLD = 30;
const DRIVER_STRONG_THRESHOLD = 80;
const DRIVER_MIN_TILES = 20;
const DRIVER_COVERAGE_MIN = 0.35;
const MOUNTAIN_DRIVER_FRACTION_MIN = 0.6;

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

function countAbove(values: Uint8Array, threshold: number): number {
  let count = 0;
  for (let i = 0; i < values.length; i++) {
    if ((values[i] ?? 0) > threshold) count += 1;
  }
  return count;
}

function eraHasSignal(perEra: Array<any>, eraIndex: number, cellIndex: number, threshold: number): boolean {
  const era = perEra[eraIndex];
  if (!era) return false;
  const boundaryType = era.boundaryType?.[cellIndex] ?? 0;
  if (boundaryType > 0) return true;
  const uplift = era.upliftPotential?.[cellIndex] ?? 0;
  const rift = era.riftPotential?.[cellIndex] ?? 0;
  const shear = era.shearStress?.[cellIndex] ?? 0;
  const volcanism = era.volcanism?.[cellIndex] ?? 0;
  const fracture = era.fracture?.[cellIndex] ?? 0;
  return (
    uplift > threshold ||
    rift > threshold ||
    shear > threshold ||
    volcanism > threshold ||
    fracture > threshold
  );
}

function meanBeltNeighbors(mask: Uint8Array, width: number, height: number): number {
  let beltCells = 0;
  let neighborSum = 0;
  for (let i = 0; i < mask.length; i++) {
    if (!mask[i]) continue;
    beltCells += 1;
    const x = i % width;
    const y = Math.floor(i / width);
    let neighbors = 0;
    forEachHexNeighborOddQ(x, y, width, height, (nx, ny) => {
      const idx = ny * width + nx;
      if (mask[idx]) neighbors += 1;
    });
    neighborSum += neighbors;
  }
  return beltCells > 0 ? neighborSum / beltCells : 0;
}

function buildFractalArray(width: number, height: number, seed: number, grain: number): Int16Array {
  const fractal = new Int16Array(width * height);
  const perlin = new PerlinNoise(seed | 0);
  const scale = 1 / Math.max(1, Math.round(grain));
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = y * width + x;
      const noise = perlin.noise2D(x * scale, y * scale);
      const normalized = Math.max(0, Math.min(1, (noise + 1) / 2));
      fractal[i] = Math.round(normalized * 255);
    }
  }
  return fractal;
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
    if (rmsStats.nonFinite > 0) {
      return {
        name: "foundation-plate-motion-coupling",
        ok: false,
        message: "Plate motion residuals contain non-finite values.",
        details: { nonFinite: rmsStats.nonFinite },
      };
    }
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

const eventProvenanceInvariant: ValidationInvariant = {
  name: "foundation-event-provenance-causality",
  description: "Event corridors must drive provenance resets and boundary stamps.",
  check: (ctx) => {
    const historyTiles = requireArtifact<any>(
      ctx,
      foundationArtifacts.tectonicHistoryTiles.id,
      "tectonicHistoryTiles"
    );
    const provenanceTiles = requireArtifact<any>(
      ctx,
      foundationArtifacts.tectonicProvenanceTiles.id,
      "tectonicProvenanceTiles"
    );
    if (!historyTiles || !provenanceTiles) {
      return {
        name: "foundation-event-provenance-causality",
        ok: false,
        message: "Missing tectonic history/provenance tiles.",
      };
    }

    const width = ctx.context.dimensions.width | 0;
    const height = ctx.context.dimensions.height | 0;
    const size = Math.max(0, width * height);

    const perEra: Array<any> = historyTiles.perEra ?? [];
    const rollups = historyTiles.rollups ?? {};
    const upliftTotal: Uint8Array = rollups.upliftTotal ?? new Uint8Array(size);
    const fractureTotal: Uint8Array = rollups.fractureTotal ?? new Uint8Array(size);
    const volcanismTotal: Uint8Array = rollups.volcanismTotal ?? new Uint8Array(size);

    if (upliftTotal.length !== size || fractureTotal.length !== size || volcanismTotal.length !== size) {
      return {
        name: "foundation-event-provenance-causality",
        ok: false,
        message: "History rollup lengths do not match map dimensions.",
      };
    }

    const originEra: Uint8Array = provenanceTiles.originEra ?? new Uint8Array(size);
    const lastBoundaryEra: Uint8Array = provenanceTiles.lastBoundaryEra ?? new Uint8Array(size);

    let eventCount = 0;
    let boundaryCoverageCount = 0;

    for (let i = 0; i < size; i++) {
      const eventSignal = Math.max(upliftTotal[i] ?? 0, fractureTotal[i] ?? 0, volcanismTotal[i] ?? 0);
      if (eventSignal > EVENT_SIGNAL_THRESHOLD) {
        eventCount += 1;
        if ((lastBoundaryEra[i] ?? 255) !== 255) boundaryCoverageCount += 1;
      }
    }

    const boundaryCoverage = eventCount > 0 ? boundaryCoverageCount / eventCount : 1;

    let originCount = 0;
    let originWithSignal = 0;
    let boundaryEraCount = 0;
    let boundaryEraWithSignal = 0;

    for (let i = 0; i < size; i++) {
      const o = originEra[i] ?? 0;
      if (o >= 0 && o < perEra.length) {
        originCount += 1;
        if (eraHasSignal(perEra, o, i, EVENT_SIGNAL_THRESHOLD)) originWithSignal += 1;
      }
      const b = lastBoundaryEra[i] ?? 255;
      if (b !== 255 && b < perEra.length) {
        boundaryEraCount += 1;
        if (eraHasSignal(perEra, b, i, EVENT_SIGNAL_THRESHOLD)) boundaryEraWithSignal += 1;
      }
    }

    const originFraction = originCount > 0 ? originWithSignal / originCount : 1;
    const boundaryEraFraction = boundaryEraCount > 0 ? boundaryEraWithSignal / boundaryEraCount : 1;

    if (eventCount >= EVENT_CORRIDOR_MIN_TILES && boundaryCoverage < EVENT_BOUNDARY_COVERAGE_MIN) {
      return {
        name: "foundation-event-provenance-causality",
        ok: false,
        message: "Event corridors do not stamp lastBoundaryEra consistently.",
        details: { eventCount, boundaryCoverage },
      };
    }
    if (originCount >= EVENT_CORRIDOR_MIN_TILES && originFraction < EVENT_ORIGIN_FRACTION_MIN) {
      return {
        name: "foundation-event-provenance-causality",
        ok: false,
        message: "Origin resets lack same-era event signal.",
        details: { originCount, originFraction },
      };
    }
    if (boundaryEraCount >= EVENT_CORRIDOR_MIN_TILES && boundaryEraFraction < EVENT_BOUNDARY_FRACTION_MIN) {
      return {
        name: "foundation-event-provenance-causality",
        ok: false,
        message: "Boundary era stamps lack same-era event signal.",
        details: { boundaryEraCount, boundaryEraFraction },
      };
    }

    return {
      name: "foundation-event-provenance-causality",
      ok: true,
      details: { eventCount, boundaryCoverage, originFraction, boundaryEraFraction },
    };
  },
};

const beltContinuityInvariant: ValidationInvariant = {
  name: "morphology-belt-continuity",
  description: "Belts must be continuous and wider than single-tile walls when events are active.",
  check: (ctx) => {
    const historyTiles = requireArtifact<any>(
      ctx,
      foundationArtifacts.tectonicHistoryTiles.id,
      "tectonicHistoryTiles"
    );
    const provenanceTiles = requireArtifact<any>(
      ctx,
      foundationArtifacts.tectonicProvenanceTiles.id,
      "tectonicProvenanceTiles"
    );
    if (!historyTiles || !provenanceTiles) {
      return { name: "morphology-belt-continuity", ok: false, message: "Missing belt driver inputs." };
    }
    const width = ctx.context.dimensions.width | 0;
    const height = ctx.context.dimensions.height | 0;
    const size = Math.max(0, width * height);
    const rollups = historyTiles.rollups ?? {};
    const upliftTotal: Uint8Array = rollups.upliftTotal ?? new Uint8Array(size);
    const fractureTotal: Uint8Array = rollups.fractureTotal ?? new Uint8Array(size);
    const volcanismTotal: Uint8Array = rollups.volcanismTotal ?? new Uint8Array(size);

    let eventCount = 0;
    for (let i = 0; i < size; i++) {
      const signal = Math.max(upliftTotal[i] ?? 0, fractureTotal[i] ?? 0, volcanismTotal[i] ?? 0);
      if (signal > EVENT_SIGNAL_THRESHOLD) eventCount += 1;
    }

    const drivers = deriveBeltDriversFromHistory({
      width,
      height,
      historyTiles,
      provenanceTiles,
    });
    const beltMask = drivers.beltMask;
    const beltCellCount = countAbove(beltMask, 0);
    const componentCount = drivers.beltComponents.length;
    const meanNeighbor = beltCellCount > 0 ? meanBeltNeighbors(beltMask, width, height) : 0;

    let meanComponentSize = 0;
    let maxComponentSize = 0;
    if (componentCount > 0) {
      for (const component of drivers.beltComponents) {
        meanComponentSize += component.size;
        if (component.size > maxComponentSize) maxComponentSize = component.size;
      }
      meanComponentSize /= componentCount;
    }

    if (eventCount >= EVENT_CORRIDOR_MIN_TILES && beltCellCount < BELT_MIN_CELLS) {
      return {
        name: "morphology-belt-continuity",
        ok: false,
        message: "Belt mask too sparse for active event corridors.",
        details: { eventCount, beltCellCount },
      };
    }

    if (beltCellCount > 0) {
      if (meanComponentSize < BELT_COMPONENT_MEAN_MIN || maxComponentSize < BELT_COMPONENT_MAX_MIN) {
        return {
          name: "morphology-belt-continuity",
          ok: false,
          message: "Belt components are too small or fragmented.",
          details: { meanComponentSize, maxComponentSize, componentCount },
        };
      }
      if (meanNeighbor < BELT_NEIGHBOR_MEAN_MIN) {
        return {
          name: "morphology-belt-continuity",
          ok: false,
          message: "Belt neighborhood density suggests single-tile walls.",
          details: { meanNeighbor },
        };
      }
    }

    return {
      name: "morphology-belt-continuity",
      ok: true,
      details: { beltCellCount, componentCount, meanComponentSize, maxComponentSize, meanNeighbor },
    };
  },
};

const morphologyDriverCorrelationInvariant: ValidationInvariant = {
  name: "morphology-driver-correlation",
  description: "Mountains should align with driver corridors and avoid wall-like artifacts.",
  check: (ctx) => {
    const historyTiles = requireArtifact<any>(
      ctx,
      foundationArtifacts.tectonicHistoryTiles.id,
      "tectonicHistoryTiles"
    );
    const provenanceTiles = requireArtifact<any>(
      ctx,
      foundationArtifacts.tectonicProvenanceTiles.id,
      "tectonicProvenanceTiles"
    );
    const topography = requireArtifact<any>(ctx, morphologyArtifacts.topography.id, "topography");
    if (!historyTiles || !provenanceTiles || !topography) {
      return { name: "morphology-driver-correlation", ok: false, message: "Missing morphology driver inputs." };
    }

    const { width, height } = ctx.context.dimensions;
    const size = Math.max(0, width * height);
    const landMask: Uint8Array = topography.landMask ?? new Uint8Array(size);
    if (landMask.length !== size) {
      return { name: "morphology-driver-correlation", ok: false, message: "Topography landMask size mismatch." };
    }

    const baseSeed = deriveStepSeed(ctx.context.env.seed, "morphology:planMountains");
    const fractalMountain = buildFractalArray(width, height, baseSeed ^ 0x3d, 5);
    const fractalHill = buildFractalArray(width, height, baseSeed ^ 0x5f, 5);

    const beltDrivers = deriveBeltDriversFromHistory({ width, height, historyTiles, provenanceTiles });
    const planConfig = planRidgesAndFoothills.defaultConfig as { strategy?: string; config?: Record<string, unknown> };
    const plan = planRidgesAndFoothills.run(
      {
        width,
        height,
        landMask,
        boundaryCloseness: beltDrivers.boundaryCloseness,
        boundaryType: beltDrivers.boundaryType,
        upliftPotential: beltDrivers.upliftPotential,
        riftPotential: beltDrivers.riftPotential,
        tectonicStress: beltDrivers.tectonicStress,
        fractalMountain,
        fractalHill,
      },
      {
        strategy: planConfig?.strategy ?? "default",
        config: planConfig?.config ?? {},
      }
    );

    if (!(plan.mountainMask instanceof Uint8Array)) {
      return { name: "morphology-driver-correlation", ok: false, message: "Missing mountainMask output." };
    }

    let strongDriverCount = 0;
    let mountainCount = 0;
    let mountainOnStrong = 0;
    let mountainOffDrivers = 0;
    let driverSumMountain = 0;
    let driverSumOther = 0;
    let driverCountMountain = 0;
    let driverCountOther = 0;

    for (let i = 0; i < size; i++) {
      if (landMask[i] !== 1) continue;
      const driver = Math.max(
        beltDrivers.upliftPotential[i] ?? 0,
        beltDrivers.riftPotential[i] ?? 0,
        beltDrivers.tectonicStress[i] ?? 0
      );
      const isMountain = plan.mountainMask[i] === 1;

      if (driver >= DRIVER_STRONG_THRESHOLD) {
        strongDriverCount += 1;
        if (isMountain) mountainOnStrong += 1;
      }

      if (isMountain) {
        mountainCount += 1;
        driverSumMountain += driver;
        driverCountMountain += 1;
        if (driver < DRIVER_SIGNAL_THRESHOLD) mountainOffDrivers += 1;
      } else {
        driverSumOther += driver;
        driverCountOther += 1;
      }
    }

    const driverCoverage = strongDriverCount > 0 ? mountainOnStrong / strongDriverCount : 1;
    const mountainDriverFraction = mountainCount > 0 ? 1 - mountainOffDrivers / mountainCount : 1;
    const meanDriverMountain = driverCountMountain > 0 ? driverSumMountain / driverCountMountain : 0;
    const meanDriverOther = driverCountOther > 0 ? driverSumOther / driverCountOther : 0;

    if (strongDriverCount >= DRIVER_MIN_TILES && driverCoverage < DRIVER_COVERAGE_MIN) {
      return {
        name: "morphology-driver-correlation",
        ok: false,
        message: "Strong driver corridors are missing mountain coverage.",
        details: { strongDriverCount, driverCoverage },
      };
    }
    if (mountainCount > 0 && mountainDriverFraction < MOUNTAIN_DRIVER_FRACTION_MIN) {
      return {
        name: "morphology-driver-correlation",
        ok: false,
        message: "Too many mountains appear without driver signal.",
        details: { mountainCount, mountainDriverFraction },
      };
    }
    return {
      name: "morphology-driver-correlation",
      ok: true,
      details: {
        strongDriverCount,
        driverCoverage,
        mountainCount,
        mountainDriverFraction,
        meanDriverMountain,
        meanDriverOther,
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
  eventProvenanceInvariant,
  beltContinuityInvariant,
  morphologyDriverCorrelationInvariant,
];

export const M1_FOUNDATION_DIAGNOSTICS: ValidationInvariant[] = [couplingDiagnostics];
