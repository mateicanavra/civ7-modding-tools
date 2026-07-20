import { createStrategy } from "@swooper/mapgen-core/authoring";
import { getHexNeighborIndicesOddQ } from "@swooper/mapgen-core/lib/grid";

import DeriveHabitatFieldsContract from "../contract.js";

/**
 * Habitat lane derivation (placement-realignment S3 step 2).
 *
 * Predicates are deliberately simple, documented combinations of the physical
 * fields. Thresholds are absolute where the unit is physical (temperature C,
 * aridity 0..1, vegetation 0..1) and quantile-relative where the input is an
 * uncalibrated potential (orogeny/uplift/rift/stress u8 fields, elevation),
 * so the lanes stay meaningful across map sizes and tectonic regimes.
 */

type Grids = {
  size: number;
  width: number;
  height: number;
  land: (i: number) => boolean;
  lake: (i: number) => boolean;
  water: (i: number) => boolean;
  landNotLake: (i: number) => boolean;
};

function percentileOf(sortedValues: readonly number[], q: number): number {
  if (sortedValues.length === 0) return 0;
  const pos = Math.min(
    sortedValues.length - 1,
    Math.max(0, Math.round(q * (sortedValues.length - 1)))
  );
  return sortedValues[pos]!;
}

/**
 * Derives every canonical resource habitat/suppression mask and family intensity on one
 * map-sized pass. Optional physical inputs use explicit neutral handling; output keys remain
 * fixed by the shared habitat-field vocabulary.
 */
export const defaultStrategy = createStrategy(DeriveHabitatFieldsContract, "default", {
  run: (input) => {
    const width = input.width;
    const height = input.height;
    const size = width * height;
    const landMask = input.landMask;
    const lakeMask = input.lakeMask;
    const coastalWater = input.coastalWater;
    const shelfWater = input.shelfWater;
    const riverClass = input.riverClass;
    const temperature = input.surfaceTemperature;
    const aridity = input.aridityIndex;
    const moisture = input.effectiveMoisture;
    const vegetation = input.vegetationDensity;
    const fertility = input.fertility;
    const elevation = input.elevation;
    const hillMask = input.hillMask;
    const mountainMask = input.mountainMask;
    const foothillMask = input.foothillMask;
    const orogeny = input.orogenyPotential;
    const uplift = input.upliftPotential;
    const rift = input.riftPotential;
    const stress = input.tectonicStress;
    const collision = input.collisionPotential;
    const seaIce = input.seaIceCover;
    const freezeIndex = input.freezeIndex;

    const grids: Grids = {
      size,
      width,
      height,
      land: (i) => landMask[i] === 1,
      lake: (i) => lakeMask[i] === 1,
      water: (i) => landMask[i] !== 1,
      landNotLake: (i) => landMask[i] === 1 && lakeMask[i] !== 1,
    };

    // --- land-relative calibrations -----------------------------------------------------------
    const landMoisture: number[] = [];
    const landElevation: number[] = [];
    const landOrogeny: number[] = [];
    const landUplift: number[] = [];
    const landRift: number[] = [];
    const landStress: number[] = [];
    const landCollision: number[] = [];
    for (let i = 0; i < size; i++) {
      if (!grids.landNotLake(i)) continue;
      landMoisture.push(moisture[i] ?? 0);
      landElevation.push(elevation[i] ?? 0);
      if (orogeny) landOrogeny.push(orogeny[i] ?? 0);
      if (uplift) landUplift.push(uplift[i] ?? 0);
      if (rift) landRift.push(rift[i] ?? 0);
      if (stress) landStress.push(stress[i] ?? 0);
      if (collision) landCollision.push(collision[i] ?? 0);
    }
    landMoisture.sort((a, b) => a - b);
    landElevation.sort((a, b) => a - b);
    landOrogeny.sort((a, b) => a - b);
    landUplift.sort((a, b) => a - b);
    landRift.sort((a, b) => a - b);
    landStress.sort((a, b) => a - b);
    landCollision.sort((a, b) => a - b);

    // Aridity is an uncalibrated P-vs-PET proxy (observed land max ~0.42 on
    // the flagship Earth-like map), so arid/humid lane thresholds are
    // land-RANK-relative, not absolute. Tiles below a small absolute floor
    // never count as arid even on uniformly wet maps.
    const landAridity: number[] = [];
    for (let i = 0; i < size; i++) {
      if (grids.landNotLake(i)) landAridity.push(aridity[i] ?? 0);
    }
    landAridity.sort((a, b) => a - b);
    const aridityRankOf = (value: number): number => {
      if (landAridity.length === 0) return 0;
      let lo = 0;
      let hi = landAridity.length;
      while (lo < hi) {
        const mid = (lo + hi) >> 1;
        if (landAridity[mid]! <= value) lo = mid + 1;
        else hi = mid;
      }
      return lo / landAridity.length;
    };
    const ARIDITY_ABSOLUTE_FLOOR = 0.05;

    const moistMin = landMoisture.length ? landMoisture[0]! : 0;
    const moistMax = landMoisture.length ? landMoisture[landMoisture.length - 1]! : 1;
    const moistRange = Math.max(1e-6, moistMax - moistMin);
    const moistN = (i: number): number =>
      Math.min(1, Math.max(0, ((moisture[i] ?? moistMin) - moistMin) / moistRange));

    const elevP60 = percentileOf(landElevation, 0.6);
    const elevP75 = percentileOf(landElevation, 0.75);
    const oroP75 = percentileOf(landOrogeny, 0.75);
    const oroP40 = percentileOf(landOrogeny, 0.4);
    const upP80 = percentileOf(landUplift, 0.8);
    const riftP85 = percentileOf(landRift, 0.85);
    const riftP90 = percentileOf(landRift, 0.9);
    const stressP30 = percentileOf(landStress, 0.3);
    const stressP40 = percentileOf(landStress, 0.4);
    const stressP60 = percentileOf(landStress, 0.6);
    const stressP70 = percentileOf(landStress, 0.7);
    const colP80 = percentileOf(landCollision, 0.8);

    const T = (i: number): number => temperature[i] ?? 0;
    /** Land-rank aridity (0..1 percentile among land tiles; 0 below the absolute floor). */
    const A = (i: number): number => {
      const raw = aridity[i] ?? 0;
      if (raw < ARIDITY_ABSOLUTE_FLOOR) return 0;
      return aridityRankOf(raw);
    };
    const V = (i: number): number => vegetation[i] ?? 0;
    const F = (i: number): number => fertility[i] ?? 0;
    const relief = (i: number): boolean =>
      hillMask[i] === 1 || (foothillMask?.[i] ?? 0) === 1 || (elevation[i] ?? 0) >= elevP75;
    const flat = (i: number): boolean => !relief(i) && mountainMask[i] !== 1;
    const cold = (i: number): boolean => T(i) <= 0 || (freezeIndex?.[i] ?? 0) >= 0.6;

    const mask = (predicate: (i: number) => boolean): Uint8Array => {
      const out = new Uint8Array(size);
      for (let i = 0; i < size; i++) if (predicate(i)) out[i] = 1;
      return out;
    };
    const landMaskOf = (predicate: (i: number) => boolean): Uint8Array =>
      mask((i) => grids.landNotLake(i) && predicate(i));

    // --- aquatic lanes -------------------------------------------------------------------------
    const sea = (i: number): boolean => grids.water(i) && !grids.lake(i);
    const seaCoastal = (i: number): boolean => sea(i) && coastalWater[i] === 1;
    const seaShelf = (i: number): boolean => sea(i) && shelfWater[i] === 1;
    const coastalWaterMask = mask(seaCoastal);
    const shelfMaskOut = mask(seaShelf);
    const warmShallowWaterMask = mask((i) => (seaCoastal(i) || seaShelf(i)) && T(i) >= 19);
    const coldProductiveWaterMask = mask((i) => (seaCoastal(i) || seaShelf(i)) && T(i) <= 12);
    const reefOrProtectedShallowsMask = mask((i) => (seaCoastal(i) || seaShelf(i)) && T(i) >= 22);
    const iceMask = mask((i) => sea(i) && ((seaIce?.[i] ?? 0) >= 128 || T(i) <= -4));

    const riverAdjacentWater = (minClass: number): Uint8Array =>
      mask((i) => {
        if (!seaCoastal(i)) return false;
        const y = (i / width) | 0;
        const x = i - y * width;
        for (const n of getHexNeighborIndicesOddQ(x, y, width, height)) {
          if (landMask[n] === 1 && (riverClass[n] ?? 0) >= minClass) return true;
        }
        return false;
      });
    const estuaryMask = riverAdjacentWater(1);
    const navigableRiverMouthMask = riverAdjacentWater(2);

    // --- terrestrial lanes ---------------------------------------------------------------------
    const aridRangelandMask = landMaskOf((i) => A(i) >= 0.85 && V(i) <= 0.5 && T(i) >= 5);
    const openGrassPlainsMask = landMaskOf(
      (i) => V(i) <= 0.5 && A(i) >= 0.3 && A(i) <= 0.9 && T(i) >= 5 && T(i) <= 28
    );
    const tundraColdEdgeMask = landMaskOf(cold);
    const hillHighlandMask = landMaskOf(relief);
    const savannaWateringHoleMask = landMaskOf(
      (i) => T(i) >= 20 && A(i) >= 0.7 && A(i) <= 0.94 && V(i) >= 0.15 && V(i) <= 0.6
    );
    const tropicalForestEdgeMask = landMaskOf((i) => T(i) >= 21 && V(i) >= 0.35 && V(i) <= 0.6);
    const taigaBorealForestMask = landMaskOf((i) => T(i) >= -12 && T(i) <= 6 && V(i) >= 0.4);
    const moistWoodlandEdgeMask = landMaskOf(
      (i) => A(i) <= 0.75 && V(i) >= 0.35 && V(i) <= 0.7 && T(i) >= 5 && T(i) <= 22
    );
    const tropicalForestMask = landMaskOf((i) => T(i) >= 21 && V(i) >= 0.55 && A(i) <= 0.8);
    const diverseWildHabitatMask = landMaskOf((i) => V(i) >= 0.25 && V(i) <= 0.7 && F(i) >= 0.25);
    const tropicalHighlandMask = landMaskOf((i) => relief(i) && T(i) >= 17);
    const coldMask = landMaskOf((i) => T(i) <= -2 || (freezeIndex?.[i] ?? 0) >= 0.7);
    const aridWithoutWaterMask = landMaskOf((i) => A(i) >= 0.92 && (riverClass[i] ?? 0) === 0);
    const denseForestMask = landMaskOf((i) => V(i) >= 0.7);
    const cultivatedPressureMask = landMaskOf((i) => F(i) >= 0.75 && V(i) <= 0.3);

    // --- cultivated lanes ----------------------------------------------------------------------
    const lakeAdjacent = (i: number): boolean => {
      const y = (i / width) | 0;
      const x = i - y * width;
      for (const n of getHexNeighborIndicesOddQ(x, y, width, height)) {
        if (lakeMask[n] === 1) return true;
      }
      return false;
    };
    const warmAlluvialMask = landMaskOf(
      (i) => T(i) >= 16 && (riverClass[i] ?? 0) >= 1 && F(i) >= 0.45
    );
    const floodplainOrRiverMask = landMaskOf((i) => (riverClass[i] ?? 0) >= 1);
    const warmGrassPlainsMask = landMaskOf((i) => T(i) >= 14 && V(i) <= 0.55 && A(i) <= 0.85);
    const oasisOrDesertWaterMask = landMaskOf(
      (i) => A(i) >= 0.85 && ((riverClass[i] ?? 0) >= 1 || lakeAdjacent(i))
    );
    const aridDryWoodlandMask = landMaskOf(
      (i) => A(i) >= 0.72 && A(i) <= 0.96 && V(i) >= 0.15 && V(i) <= 0.55 && T(i) >= 15
    );
    const wetTropicsMask = landMaskOf((i) => T(i) >= 21 && moistN(i) >= 0.55);
    const temperateDryPlainsMask = landMaskOf(
      (i) => T(i) >= 8 && T(i) <= 20 && A(i) >= 0.6 && A(i) <= 0.9 && V(i) <= 0.55
    );
    const savannaForestMask = mask(
      (i) => savannaWateringHoleMask[i] === 1 || tropicalForestEdgeMask[i] === 1
    );
    const tropicalFruitMask = landMaskOf((i) => T(i) >= 21 && A(i) <= 0.8);
    const wetlandPaddyMask = landMaskOf(
      (i) => T(i) >= 16 && ((riverClass[i] ?? 0) >= 1 || moistN(i) >= 0.7)
    );
    const coolTemperatePlainsMask = landMaskOf(
      (i) => T(i) >= 3 && T(i) <= 14 && V(i) <= 0.6 && A(i) <= 0.85
    );
    const waterloggedMask = landMaskOf((i) => moistN(i) >= 0.93);

    // --- geological lanes ----------------------------------------------------------------------
    const oroHigh = (i: number): boolean =>
      (orogeny ? (orogeny[i] ?? 0) >= oroP75 && oroP75 > 0 : false) ||
      (uplift ? (uplift[i] ?? 0) >= upP80 && upP80 > 0 : false) ||
      ((mountainMask[i] === 1 || hillMask[i] === 1) &&
        (stress ? (stress[i] ?? 0) >= stressP70 : true));
    const orogenyMask = landMaskOf(oroHigh);
    const alluvialPlacerMask = landMaskOf((i) => (riverClass[i] ?? 0) >= 1);
    const tundraDesertHillMask = landMaskOf((i) => relief(i) && (T(i) <= 0 || A(i) >= 0.85));
    const evaporiteBasinMask = landMaskOf((i) => A(i) >= 0.85 && flat(i));
    const sedimentaryBasinMask = landMaskOf((i) => flat(i) && (elevation[i] ?? 0) <= elevP60);
    const ultramaficMask = landMaskOf((i) =>
      rift ? (rift[i] ?? 0) >= riftP85 && riftP85 > 0 : false
    );
    const weatheringClayFlatMask = landMaskOf((i) => A(i) <= 0.7 && flat(i) && T(i) >= 12);
    const carbonateBeltMask = landMaskOf(
      (i) => relief(i) && A(i) <= 0.9 && (stress ? (stress[i] ?? 0) <= stressP60 : true)
    );
    const cratonMask = landMaskOf(
      (i) => flat(i) && (stress ? (stress[i] ?? 0) <= stressP30 : true)
    );
    const closedBasinMask = landMaskOf(
      (i) => A(i) >= 0.85 && (riverClass[i] ?? 0) === 0 && flat(i)
    );
    const aridSoilMask = landMaskOf((i) => A(i) >= 0.8);
    const forestWetlandBasinMask = landMaskOf((i) => (V(i) >= 0.5 || moistN(i) >= 0.65) && flat(i));
    const wetAlluvialMask = landMaskOf((i) => (riverClass[i] ?? 0) >= 1 || moistN(i) >= 0.7);
    const collisionBeltMask = collision
      ? landMaskOf((i) => (collision[i] ?? 0) >= colP80 && colP80 > 0)
      : orogenyMask;
    const flatNonGeologicMask = landMaskOf(
      (i) =>
        flat(i) &&
        (orogeny ? (orogeny[i] ?? 0) <= oroP40 : true) &&
        (stress ? (stress[i] ?? 0) <= stressP40 : true)
    );
    const wetSuppressionMask = landMaskOf((i) => moistN(i) >= 0.85);
    const humidSuppressionMask = landMaskOf((i) => A(i) <= 0.3);
    const offshoreMask = mask((i) => grids.water(i));
    const igneousTerrainMask = landMaskOf((i) =>
      rift ? (rift[i] ?? 0) >= riftP90 && riftP90 > 0 : false
    );

    // --- intensities ---------------------------------------------------------------------------
    const aquaticIntensity = new Float32Array(size);
    const cultivatedIntensity = new Float32Array(size);
    const terrestrialIntensity = new Float32Array(size);
    const geologicalIntensity = new Float32Array(size);
    const oroMax = Math.max(1, percentileOf(landOrogeny, 1));
    const upMax = Math.max(1, percentileOf(landUplift, 1));
    const stressMax = Math.max(1, percentileOf(landStress, 1));
    for (let i = 0; i < size; i++) {
      if (sea(i)) {
        aquaticIntensity[i] = Math.min(
          1,
          0.4 + (coastalWater[i] === 1 ? 0.3 : 0) + (shelfWater[i] === 1 ? 0.3 : 0)
        );
        continue;
      }
      if (!grids.landNotLake(i)) continue;
      terrestrialIntensity[i] = Math.min(1, 0.35 + 0.65 * V(i));
      cultivatedIntensity[i] = Math.min(1, 0.3 + 0.7 * F(i));
      const geoSignal = Math.max(
        orogeny ? (orogeny[i] ?? 0) / oroMax : 0,
        uplift ? (uplift[i] ?? 0) / upMax : 0,
        stress ? (stress[i] ?? 0) / stressMax : 0
      );
      geologicalIntensity[i] = Math.min(1, 0.3 + 0.7 * geoSignal);
    }

    return {
      width,
      height,
      coastalWaterMask,
      shelfMask: shelfMaskOut,
      warmShallowWaterMask,
      coldProductiveWaterMask,
      reefOrProtectedShallowsMask,
      estuaryMask,
      navigableRiverMouthMask,
      lakeMask: mask((i) => grids.lake(i)),
      iceMask,
      aridRangelandMask,
      openGrassPlainsMask,
      tundraColdEdgeMask,
      hillHighlandMask,
      savannaWateringHoleMask,
      tropicalForestEdgeMask,
      taigaBorealForestMask,
      moistWoodlandEdgeMask,
      tropicalForestMask,
      diverseWildHabitatMask,
      tropicalHighlandMask,
      coldMask,
      aridWithoutWaterMask,
      denseForestMask,
      cultivatedPressureMask,
      warmAlluvialMask,
      floodplainOrRiverMask,
      warmGrassPlainsMask,
      oasisOrDesertWaterMask,
      aridDryWoodlandMask,
      coastalMarineMask: coastalWaterMask,
      humidTropicalForestMask: tropicalForestMask,
      wetTropicsMask,
      highlandOrReliefMask: hillHighlandMask,
      temperateDryPlainsMask,
      savannaForestMask,
      tropicalFruitMask,
      wetlandPaddyMask,
      coolTemperatePlainsMask,
      waterloggedMask,
      orogenyMask,
      alluvialPlacerMask,
      tundraDesertHillMask,
      evaporiteBasinMask,
      sedimentaryBasinMask,
      ultramaficMask,
      weatheringClayFlatMask,
      carbonateBeltMask,
      cratonMask,
      closedBasinMask,
      aridSoilMask,
      forestWetlandBasinMask,
      hydrocarbonBasinMask: sedimentaryBasinMask,
      wetAlluvialMask,
      graniteBeltMask: orogenyMask,
      oilAdjacencyMask: sedimentaryBasinMask,
      metamorphicBeltMask: orogenyMask,
      collisionBeltMask,
      flatNonGeologicMask,
      wetSuppressionMask,
      humidSuppressionMask,
      offshoreMask,
      igneousTerrainMask,
      aquaticIntensity,
      cultivatedIntensity,
      terrestrialIntensity,
      geologicalIntensity,
    };
  },
});
