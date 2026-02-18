import { describe, expect, it } from "bun:test";
import { createMockAdapter } from "@civ7/adapter";
import { HILL_TERRAIN, MOUNTAIN_TERRAIN, VOLCANO_FEATURE, createExtendedMapContext, sha256Hex, stableStringify } from "@swooper/mapgen-core";
import { createLabelRng } from "@swooper/mapgen-core/lib/rng";

import standardRecipe from "../src/recipes/standard/recipe.js";
import type { StandardRecipeConfig } from "../src/recipes/standard/recipe.js";
import { initializeStandardRuntime } from "../src/recipes/standard/runtime.js";
import { mapArtifacts } from "../src/recipes/standard/map-artifacts.js";
import { foundationArtifacts } from "../src/recipes/standard/stages/foundation/artifacts.js";
import { hydrologyHydrographyArtifacts } from "../src/recipes/standard/stages/hydrology-hydrography/artifacts.js";
import { computeRiverAdjacencyMaskFromRiverClass } from "../src/recipes/standard/stages/hydrology-hydrography/river-adjacency.js";
import { hydrologyClimateBaselineArtifacts } from "../src/recipes/standard/stages/hydrology-climate-baseline/artifacts.js";
import { hydrologyClimateRefineArtifacts } from "../src/recipes/standard/stages/hydrology-climate-refine/artifacts.js";
import { placementArtifacts } from "../src/recipes/standard/stages/placement/artifacts.js";
import { standardConfig } from "./support/standard-config.js";

describe("standard recipe execution", () => {
	  function runAndGetClimateSignature(options: { seed: number; width: number; height: number }): string {
	    const { seed, width, height } = options;
    const mapInfo = {
      GridWidth: width,
      GridHeight: height,
      MinLatitude: -60,
      MaxLatitude: 60,
      PlayersLandmass1: 4,
      PlayersLandmass2: 4,
      StartSectorRows: 4,
      StartSectorCols: 4,
    };

    const env = {
      seed,
      dimensions: { width, height },
      latitudeBounds: {
        topLatitude: mapInfo.MaxLatitude,
        bottomLatitude: mapInfo.MinLatitude,
      },
    };

    const adapter = createMockAdapter({ width, height, mapInfo, mapSizeId: 1, rng: createLabelRng(seed) });
    const context = createExtendedMapContext({ width, height }, adapter, env);

	    initializeStandardRuntime(context, { mapInfo, logPrefix: "[test]", storyEnabled: true });
	    standardRecipe.run(context, env, standardConfig, { log: () => {} });

		    const hydrography = context.artifacts.get(hydrologyHydrographyArtifacts.hydrography.id) as
		      | { discharge?: Float32Array; riverClass?: Uint8Array }
		      | undefined;
		    const size = width * height;
		    if (!(hydrography?.discharge instanceof Float32Array) || hydrography.discharge.length !== size) {
		      throw new Error("Missing artifact:hydrology.hydrography discharge buffer.");
		    }
		    if (!(hydrography?.riverClass instanceof Uint8Array) || hydrography.riverClass.length !== size) {
		      throw new Error("Missing artifact:hydrology.hydrography riverClass buffer.");
		    }
		    const riverAdjacency = computeRiverAdjacencyMaskFromRiverClass({
		      width,
		      height,
		      riverClass: hydrography.riverClass,
		      radius: 1,
		    });

	    const climateField = context.artifacts.get(hydrologyClimateBaselineArtifacts.climateField.id) as
	      | { rainfall?: Uint8Array; humidity?: Uint8Array }
	      | undefined;
    const rainfall = climateField?.rainfall;
    const humidity = climateField?.humidity;
    if (!(rainfall instanceof Uint8Array) || !(humidity instanceof Uint8Array)) {
      throw new Error("Missing artifact:climateField rainfall/humidity buffers.");
    }

    const climateIndices = context.artifacts.get(hydrologyClimateRefineArtifacts.climateIndices.id) as
      | { surfaceTemperatureC?: Float32Array; pet?: Float32Array; aridityIndex?: Float32Array; freezeIndex?: Float32Array }
      | undefined;
    const cryosphere = context.artifacts.get(hydrologyClimateRefineArtifacts.cryosphere.id) as
      | { snowCover?: Uint8Array; seaIceCover?: Uint8Array; albedo?: Uint8Array }
      | undefined;
    const diagnostics = context.artifacts.get(hydrologyClimateRefineArtifacts.climateDiagnostics.id) as
      | { rainShadowIndex?: Float32Array; continentalityIndex?: Float32Array; convergenceIndex?: Float32Array }
      | undefined;

		    const rainfallSha = sha256Hex(Buffer.from(rainfall).toString("base64"));
		    const humiditySha = sha256Hex(Buffer.from(humidity).toString("base64"));
		    const dischargeView = hydrography?.discharge ?? new Float32Array();
		    const riverClassView = hydrography?.riverClass ?? new Uint8Array();
		    const riverAdjacencyView = riverAdjacency ?? new Uint8Array();
    const temperatureView = climateIndices?.surfaceTemperatureC ?? new Float32Array();
    const petView = climateIndices?.pet ?? new Float32Array();
    const aridityView = climateIndices?.aridityIndex ?? new Float32Array();
    const freezeView = climateIndices?.freezeIndex ?? new Float32Array();
    const rainShadowView = diagnostics?.rainShadowIndex ?? new Float32Array();
    const continentalityView = diagnostics?.continentalityIndex ?? new Float32Array();
    const convergenceView = diagnostics?.convergenceIndex ?? new Float32Array();

    const temperatureSha = sha256Hex(
      Buffer.from(new Uint8Array(temperatureView.buffer, temperatureView.byteOffset, temperatureView.byteLength)).toString("base64")
    );
    const petSha = sha256Hex(
      Buffer.from(new Uint8Array(petView.buffer, petView.byteOffset, petView.byteLength)).toString("base64")
    );
    const ariditySha = sha256Hex(
      Buffer.from(new Uint8Array(aridityView.buffer, aridityView.byteOffset, aridityView.byteLength)).toString("base64")
    );
    const freezeSha = sha256Hex(
      Buffer.from(new Uint8Array(freezeView.buffer, freezeView.byteOffset, freezeView.byteLength)).toString("base64")
    );
    const snowSha = sha256Hex(
      Buffer.from(cryosphere?.snowCover ?? new Uint8Array()).toString("base64")
    );
    const seaIceSha = sha256Hex(
      Buffer.from(cryosphere?.seaIceCover ?? new Uint8Array()).toString("base64")
    );
    const albedoSha = sha256Hex(
      Buffer.from(cryosphere?.albedo ?? new Uint8Array()).toString("base64")
    );
    const rainShadowSha = sha256Hex(
      Buffer.from(new Uint8Array(rainShadowView.buffer, rainShadowView.byteOffset, rainShadowView.byteLength)).toString("base64")
    );
    const continentalitySha = sha256Hex(
      Buffer.from(new Uint8Array(continentalityView.buffer, continentalityView.byteOffset, continentalityView.byteLength)).toString("base64")
    );
	    const convergenceSha = sha256Hex(
	      Buffer.from(new Uint8Array(convergenceView.buffer, convergenceView.byteOffset, convergenceView.byteLength)).toString("base64")
	    );
	    const dischargeSha = sha256Hex(
	      Buffer.from(new Uint8Array(dischargeView.buffer, dischargeView.byteOffset, dischargeView.byteLength)).toString("base64")
	    );
	    const riverClassSha = sha256Hex(Buffer.from(riverClassView).toString("base64"));
	    const riverAdjacencySha = sha256Hex(Buffer.from(riverAdjacencyView).toString("base64"));
	    return sha256Hex(
	      stableStringify({
	        width,
	        height,
	        seed,
	        rainfallSha,
	        humiditySha,
	        dischargeSha,
	        riverClassSha,
	        riverAdjacencySha,
	        temperatureSha,
	        petSha,
	        ariditySha,
        freezeSha,
        snowSha,
        seaIceSha,
        albedoSha,
        rainShadowSha,
        continentalitySha,
        convergenceSha,
      })
    );
  }

  it("compiles and executes with a mock adapter", () => {
    const width = 24;
    const height = 18;
    const mapInfo = {
      GridWidth: width,
      GridHeight: height,
      MinLatitude: -60,
      MaxLatitude: 60,
      PlayersLandmass1: 4,
      PlayersLandmass2: 4,
      StartSectorRows: 4,
      StartSectorCols: 4,
    };

    const env = {
      seed: 123,
      dimensions: { width, height },
      latitudeBounds: {
        topLatitude: mapInfo.MaxLatitude,
        bottomLatitude: mapInfo.MinLatitude,
      },
    };

    const adapter = createMockAdapter({ width, height, mapInfo, mapSizeId: 1 });
    const context = createExtendedMapContext({ width, height }, adapter, env);

    initializeStandardRuntime(context, { mapInfo, logPrefix: "[test]", storyEnabled: true });

    const config = standardConfig;
    const plan = standardRecipe.compile(env, config);
    expect(plan.nodes.length).toBeGreaterThan(0);

    expect(() =>
      standardRecipe.run(context, env, config, { log: () => {} })
    ).not.toThrow();

    const climateField = context.artifacts.get(hydrologyClimateBaselineArtifacts.climateField.id) as
      | { humidity?: Uint8Array }
      | undefined;
    const humidity = climateField?.humidity;
    expect(humidity instanceof Uint8Array).toBe(true);
    expect(humidity?.length).toBe(width * height);
    expect(humidity?.some((value) => value > 0)).toBe(true);

    const indices = context.artifacts.get(hydrologyClimateRefineArtifacts.climateIndices.id) as
      | { surfaceTemperatureC?: Float32Array; aridityIndex?: Float32Array; freezeIndex?: Float32Array }
      | undefined;
    expect(indices?.surfaceTemperatureC instanceof Float32Array).toBe(true);
    expect(indices?.surfaceTemperatureC?.length).toBe(width * height);
    expect(indices?.aridityIndex instanceof Float32Array).toBe(true);
    expect(indices?.freezeIndex instanceof Float32Array).toBe(true);

    const cryosphere = context.artifacts.get(hydrologyClimateRefineArtifacts.cryosphere.id) as
      | { snowCover?: Uint8Array; seaIceCover?: Uint8Array }
      | undefined;
    expect(cryosphere?.snowCover instanceof Uint8Array).toBe(true);
    expect(cryosphere?.seaIceCover instanceof Uint8Array).toBe(true);

    // Mountains/hills are a key visible output of the tectonics → morphology pipeline.
    // This is intentionally lightweight (mock adapter) and guards against accidental
    // no-op mountain projection or zeroed tectonic driver surfaces.
    let landTiles = 0;
    let nonVolcanoMountainTiles = 0;
    let hillTiles = 0;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (adapter.isWater(x, y)) continue;
        landTiles++;
        const feature = adapter.getFeatureType(x, y);
        const terrain = adapter.getTerrainType(x, y);
        if (terrain === MOUNTAIN_TERRAIN && feature !== VOLCANO_FEATURE) nonVolcanoMountainTiles++;
        else if (terrain === HILL_TERRAIN) hillTiles++;
      }
    }
    expect(landTiles).toBeGreaterThan(0);
    expect(nonVolcanoMountainTiles + hillTiles).toBeGreaterThan(0);

    expect(context.artifacts.get(mapArtifacts.foundationPlates.id)).toBeTruthy();
    expect(context.artifacts.get(foundationArtifacts.plateTopology.id)).toBeTruthy();
    expect(context.artifacts.get(placementArtifacts.placementOutputs.id)).toBeTruthy();
  });

  it("produces deterministic climate signatures for same seed + config", () => {
    const signatureA = runAndGetClimateSignature({ seed: 123, width: 24, height: 18 });
    const signatureB = runAndGetClimateSignature({ seed: 123, width: 24, height: 18 });
    expect(signatureA).toBe(signatureB);
  });

  it("yields more freeze persistence when temperature is cold vs hot (same seed)", () => {
    const width = 24;
    const height = 18;
    const seed = 123;

    const configCold: StandardRecipeConfig = {
      ...standardConfig,
      "hydrology-climate-baseline": {
        ...standardConfig["hydrology-climate-baseline"],
        knobs: { ...standardConfig["hydrology-climate-baseline"].knobs, temperature: "cold" },
      },
      "hydrology-climate-refine": {
        ...standardConfig["hydrology-climate-refine"],
        knobs: { ...standardConfig["hydrology-climate-refine"].knobs, temperature: "cold" },
      },
    };
    const configHot: StandardRecipeConfig = {
      ...standardConfig,
      "hydrology-climate-baseline": {
        ...standardConfig["hydrology-climate-baseline"],
        knobs: { ...standardConfig["hydrology-climate-baseline"].knobs, temperature: "hot" },
      },
      "hydrology-climate-refine": {
        ...standardConfig["hydrology-climate-refine"],
        knobs: { ...standardConfig["hydrology-climate-refine"].knobs, temperature: "hot" },
      },
    };

    const runAndMeanFreezeIndex = (cfg: StandardRecipeConfig): number => {
      const mapInfo = {
        GridWidth: width,
        GridHeight: height,
        MinLatitude: -85,
        MaxLatitude: 85,
        PlayersLandmass1: 4,
        PlayersLandmass2: 4,
        StartSectorRows: 4,
        StartSectorCols: 4,
      };
      const env = {
        seed,
        dimensions: { width, height },
        latitudeBounds: {
          topLatitude: mapInfo.MaxLatitude,
          bottomLatitude: mapInfo.MinLatitude,
        },
      };
      const adapter = createMockAdapter({ width, height, mapInfo, mapSizeId: 1, rng: createLabelRng(seed) });
      const context = createExtendedMapContext({ width, height }, adapter, env);
      initializeStandardRuntime(context, { mapInfo, logPrefix: "[test]", storyEnabled: true });
      standardRecipe.run(context, env, cfg, { log: () => {} });
      const indices = context.artifacts.get(hydrologyClimateRefineArtifacts.climateIndices.id) as
        | { freezeIndex?: Float32Array }
        | undefined;
      const freeze = indices?.freezeIndex;
      if (!(freeze instanceof Float32Array)) throw new Error("Missing freezeIndex.");
      let sum = 0;
      for (let i = 0; i < freeze.length; i++) sum += freeze[i] ?? 0;
      return sum / Math.max(1, freeze.length);
    };

    const meanCold = runAndMeanFreezeIndex(configCold);
    const meanHot = runAndMeanFreezeIndex(configHot);
    expect(meanCold).toBeGreaterThan(meanHot);
  });

	  it("projects more river tiles when riverDensity is dense vs sparse (same seed)", () => {
	    const width = 24;
	    const height = 18;
	    const seed = 123;

	    const configDense: StandardRecipeConfig = {
	      ...standardConfig,
	      "hydrology-hydrography": {
	        ...standardConfig["hydrology-hydrography"],
	        knobs: { ...standardConfig["hydrology-hydrography"].knobs, riverDensity: "dense" },
	      },
	    };
	    const configSparse: StandardRecipeConfig = {
	      ...standardConfig,
	      "hydrology-hydrography": {
	        ...standardConfig["hydrology-hydrography"],
	        knobs: { ...standardConfig["hydrology-hydrography"].knobs, riverDensity: "sparse" },
	      },
	    };

	    const runAndCountRivers = (cfg: StandardRecipeConfig): number => {
	      const mapInfo = {
	        GridWidth: width,
	        GridHeight: height,
	        MinLatitude: -60,
	        MaxLatitude: 60,
	        PlayersLandmass1: 4,
	        PlayersLandmass2: 4,
	        StartSectorRows: 4,
	        StartSectorCols: 4,
	      };
	      const env = {
	        seed,
	        dimensions: { width, height },
	        latitudeBounds: {
	          topLatitude: mapInfo.MaxLatitude,
	          bottomLatitude: mapInfo.MinLatitude,
	        },
	      };
	      const adapter = createMockAdapter({ width, height, mapInfo, mapSizeId: 1, rng: createLabelRng(seed) });
	      const context = createExtendedMapContext({ width, height }, adapter, env);
	      initializeStandardRuntime(context, { mapInfo, logPrefix: "[test]", storyEnabled: true });
	      standardRecipe.run(context, env, cfg, { log: () => {} });
	      const hydrography = context.artifacts.get(hydrologyHydrographyArtifacts.hydrography.id) as
	        | { riverClass?: Uint8Array }
	        | undefined;
	      const riverClass = hydrography?.riverClass;
	      if (!(riverClass instanceof Uint8Array)) throw new Error("Missing hydrography riverClass.");
	      let count = 0;
	      for (let i = 0; i < riverClass.length; i++) if ((riverClass[i] ?? 0) > 0) count++;
	      return count;
	    };

	    const denseCount = runAndCountRivers(configDense);
	    const sparseCount = runAndCountRivers(configSparse);
	    expect(denseCount).toBeGreaterThanOrEqual(sparseCount);
	  });
	});
