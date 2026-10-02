#!/usr/bin/env bun
import { createHash } from "node:crypto";
import { readFile, stat } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";
import { createMockAdapter } from "@civ7/adapter";
import { findCiv7StandardMapSizePreset } from "@civ7/map-policy";
import { assessCiv7SignedIntSeed } from "@civ7/map-policy/setup";
import {
  applyGeneratedFilePlan,
  type GeneratedFilePlan,
} from "@civ7/plugin-files/generated-file-plan";
import { admitMapSetup, createMapContext } from "@swooper/mapgen-core";
import {
  buildStepTestDependencies,
  publishTestArtifact,
  withMapContextExecutionForTest,
} from "@swooper/mapgen-core/testing";
import { sha256Hex, stableStringify } from "@swooper/mapgen-core/trace";
import { STANDARD_STAGES } from "@swooper/swooper-physics/standard";
import {
  canonicalMapConfigContentDigest,
  canonicalMapConfigDigest,
} from "@swooper/swooper-physics/standard/map-config";
import { loadSwooperMapConfigCatalog } from "@swooper/swooper-physics/tooling/catalog-source";
import { renderSwooperCatalogMapSource } from "../../src/runtime/file-plan.js";
import { bundleCiv7MapScript } from "../../src/runtime/map-script/compiler.js";
import {
  RIVER_AUTHORED_FINALIZATION_VARIANTS,
  RIVER_AUTHORED_NEIGHBORHOOD_VARIANT,
  RIVER_AUTHORED_WRITE_ORDER_VARIANT,
  RIVER_LAKE_NAVIGATION_PROBE,
  RIVER_PROBE,
  RIVER_PROBE_VARIANTS,
  RIVER_TERRAIN_PROBE,
  type RiverProbeAtlas,
  type RiverProbeVariant,
} from "./river-contract-map.fixture.js";
import {
  FULL_MAP_RIVER_PROBE,
  FULL_MAP_RIVER_PROBE_ATLASES,
  FULL_MAP_RIVER_PROBE_EDGES,
  type FullMapProbeIdentity,
  type FullMapRiverProbeAtlas,
} from "./river-full-map.fixture.js";
import {
  assertDeclaredFiniteHeadModel,
  buildDeclaredFiniteHeadModel,
  type DeclaredFiniteHeadModel,
  isWaterConnectivityAtlas,
  WATER_CONNECTIVITY_ATLASES,
  WATER_CONNECTIVITY_REPLAY_ATLAS,
  WATER_CONNECTIVITY_STOCK_ATLAS,
  WATER_DECLARED_FINITE_HEAD_ATLAS,
  WATER_DECLARED_FINITE_HEAD_PROBE,
  WATER_LOWER_BOUND_ATLAS,
  WATER_LOWER_BOUND_PROBE,
  waterConnectivityProbe,
} from "./water-connectivity.fixture.js";
import {
  DIRECTIONAL_CLIFF_WAYPOINTS,
  RIVER_NEIGHBORHOOD_CLASS_INTERVENTION,
  readDirectionalCliffStudy,
  WATER_HEIGHT_BOUNDED_LAKE_CUTOFF_ATLAS,
  WATER_HEIGHT_BOUNDED_LAKE_CUTOFF_PROBE,
  WATER_HEIGHT_CLIFF_OBSERVATION_REVISION,
  WATER_HEIGHT_DRY_RETENTION_REPLAY_ATLAS,
  WATER_HEIGHT_DRY_RETENTION_REPLAY_PROBE,
  WATER_HEIGHT_LAKE_CUTOFF_ATLAS,
  WATER_HEIGHT_LAKE_CUTOFF_PROBE,
  WATER_HEIGHT_MAINTENANCE_ATLAS,
  WATER_HEIGHT_MAINTENANCE_PROBE,
  WATER_HEIGHT_MAX_LAKE_CUTOFF_ATLAS,
  WATER_HEIGHT_MAX_LAKE_CUTOFF_PROBE,
  WATER_HEIGHT_ORIGINAL_INPUT_CONTROL_ATLAS,
  WATER_HEIGHT_ORIGINAL_INPUT_CONTROL_PROBE,
  WATER_HEIGHT_ORIGINAL_INPUT_REPLAY_ATLAS,
  WATER_HEIGHT_ORIGINAL_INPUT_REPLAY_PROBE,
} from "./water-height-maintenance.fixture.js";

export const riverProbeAppRoot = fileURLToPath(new URL("../../", import.meta.url));
export const riverProbeOutputRoot = resolve(riverProbeAppRoot, "dist/river-contract-probe");
// The deploy CLI's --id names a directory, not the logical Mod id in the manifest.
export const riverProbeInstallDirectoryName = "mod-swooper-river-contract-v1";
export const riverProbeDeployFlags = [
  "--input",
  riverProbeOutputRoot,
  "--id",
  riverProbeInstallDirectoryName,
] as const;
export const riverProbeMapScript = `{${RIVER_PROBE.id}}/maps/river-contract.js`;
export type RiverProbeAtlasSelection =
  | RiverProbeAtlas
  | FullMapRiverProbeAtlas
  | typeof WATER_HEIGHT_MAINTENANCE_ATLAS
  | typeof WATER_HEIGHT_LAKE_CUTOFF_ATLAS
  | typeof WATER_HEIGHT_MAX_LAKE_CUTOFF_ATLAS
  | typeof WATER_HEIGHT_BOUNDED_LAKE_CUTOFF_ATLAS
  | typeof WATER_HEIGHT_ORIGINAL_INPUT_CONTROL_ATLAS
  | typeof WATER_HEIGHT_ORIGINAL_INPUT_REPLAY_ATLAS
  | typeof WATER_HEIGHT_DRY_RETENTION_REPLAY_ATLAS;
const atlases: readonly string[] = [
  "synthetic-river-v4",
  "terrain-admission",
  "lake-navigation",
  ...FULL_MAP_RIVER_PROBE_ATLASES,
  WATER_HEIGHT_MAINTENANCE_ATLAS,
  WATER_HEIGHT_LAKE_CUTOFF_ATLAS,
  WATER_HEIGHT_MAX_LAKE_CUTOFF_ATLAS,
  WATER_HEIGHT_BOUNDED_LAKE_CUTOFF_ATLAS,
  WATER_HEIGHT_ORIGINAL_INPUT_CONTROL_ATLAS,
  WATER_HEIGHT_ORIGINAL_INPUT_REPLAY_ATLAS,
  WATER_HEIGHT_DRY_RETENTION_REPLAY_ATLAS,
  ...WATER_CONNECTIVITY_ATLASES,
  WATER_CONNECTIVITY_STOCK_ATLAS,
  WATER_CONNECTIVITY_REPLAY_ATLAS,
  WATER_LOWER_BOUND_ATLAS,
  WATER_DECLARED_FINITE_HEAD_ATLAS,
];
const isFullMapAtlas = (atlas: string): atlas is FullMapRiverProbeAtlas =>
  (FULL_MAP_RIVER_PROBE_ATLASES as readonly string[]).includes(atlas);

/** Optional maintenance selection; omitted fields retain the historical Earthlike Huge diagnostic. */
export type WaterHeightDiagnosticSelection = Readonly<{
  sourceConfigId?: string;
  mapSize?: string;
  mapSeed?: number;
  gameSeed?: number;
  playerCount?: number;
  lakeSizeCutoff?: "stock" | number;
  cliffStudyPath?: string;
}>;

/** Public Standard step invocation supplies requests only; mock storage is never native proof. */
function projectDeclaredFiniteHeadRequests(physical: DeclaredFiniteHeadModel): number[] {
  assertDeclaredFiniteHeadModel(physical);
  const stage = STANDARD_STAGES.find((stage) => stage.id === "map-elevation");
  const step = stage?.steps.find((step) => step.contract.id === "build-elevation");
  if (!step) throw new Error("Standard map-elevation/build-elevation authority is unavailable.");
  const topography = step.contract.requires.find(
    (dependency) =>
      typeof dependency !== "string" && dependency.id === "artifact:morphology.topography"
  );
  const hydrography = step.contract.requires.find(
    (dependency) =>
      typeof dependency !== "string" && dependency.id === "artifact:hydrology.hydrography"
  );
  const projectedLakes = step.contract.requires.find(
    (dependency) =>
      typeof dependency !== "string" && dependency.id === "artifact:map.hydrology.projectedLakes"
  );
  if (!topography || !hydrography || !projectedLakes)
    throw new Error(
      "Standard elevation projection requires its exact declared physical artifacts."
    );
  const { width, height } = physical;
  const size = width * height;
  const physicalBefore = stableStringify(physical);
  const adapter = createMockAdapter({ width, height });
  for (let cell = 0; cell < size; cell++) {
    const terrain =
      physical.acceptedWaterMask[cell] === 1
        ? "TERRAIN_COAST"
        : physical.externalWaterMask[cell] === 1
          ? "TERRAIN_OCEAN"
          : "TERRAIN_FLAT";
    adapter.setTerrainType(
      cell % width,
      Math.floor(cell / width),
      adapter.getTerrainTypeIndex(terrain)
    );
  }
  const context = createMapContext({
    setup: admitMapSetup({
      mapSeed: WATER_DECLARED_FINITE_HEAD_PROBE.mapSeed,
      dimensions: { width, height },
      latitudeBounds: { topLatitude: 60, bottomLatitude: -60 },
    }),
    adapter,
  });
  const intended = withMapContextExecutionForTest(context, (stepContext) => {
    publishTestArtifact(stepContext, topography, {
      elevation: Int16Array.from(physical.ground),
      seaLevel: physical.seaLevel,
      landMask: Uint8Array.from(physical.externalWaterMask, (external) => (external === 0 ? 1 : 0)),
      externalWaterMask: Uint8Array.from(physical.externalWaterMask),
      bathymetry: Int16Array.from(physical.ground, (ground, cell) =>
        physical.externalWaterMask[cell] === 1 ? physical.seaLevel - ground : 0
      ),
    });
    publishTestArtifact(stepContext, hydrography, {
      model: "certified-sill-spill",
      exposedLandMask: Uint8Array.from(physical.externalWaterMask, (external, cell) =>
        external === 0 && physical.acceptedWaterMask[cell] === 0 ? 1 : 0
      ),
      riverClass: new Uint8Array(size),
      flowDir: new Int32Array(size).fill(-1),
      basinId: new Int32Array(size).fill(-1),
      terminalType: new Uint8Array(size),
      runoff: Array<number>(size).fill(0),
      discharge: Array<number>(size).fill(0),
    });
    publishTestArtifact(stepContext, projectedLakes, {
      lakeMask: Uint8Array.from(physical.acceptedWaterMask),
    });
    const observation = step.run(stepContext, {}, {}, buildStepTestDependencies(step, stepContext));
    if (observation instanceof Promise)
      throw new Error("Standard elevation projection must remain synchronous.");
    return [...observation.intended];
  });
  if (
    adapter.calls.setElevation.length !== 1 ||
    stableStringify(physical) !== physicalBefore ||
    stableStringify(adapter.calls.setElevation[0]) !== stableStringify(intended)
  )
    throw new Error(
      "Standard declared projection must preserve physical bytes and write its authentic requests once."
    );
  return intended;
}

/** Builds one diagnostic mod tree; installation identity and duplicate detection are separate concerns. */
export async function buildRiverProbePlan(
  proofId: string,
  variant: RiverProbeVariant = "authored",
  atlasKind: RiverProbeAtlasSelection,
  selectionInput?: WaterHeightDiagnosticSelection
): Promise<GeneratedFilePlan> {
  if (!/^[a-zA-Z0-9-]{1,100}$/.test(proofId))
    throw new Error("Use a short alphanumeric/hyphen proof ID.");
  if (!Object.hasOwn(RIVER_PROBE_VARIANTS, variant))
    throw new Error(`Unknown river probe variant: ${variant}`);
  if (!atlases.includes(atlasKind)) throw new Error(`Unknown river probe atlas: ${atlasKind}`);
  const authoredFinalizationVariant = Object.hasOwn(RIVER_AUTHORED_FINALIZATION_VARIANTS, variant);
  const authoredWriteOrderVariant = variant === RIVER_AUTHORED_WRITE_ORDER_VARIANT;
  const neighborhoodVariant = variant === RIVER_AUTHORED_NEIGHBORHOOD_VARIANT;
  if (
    (authoredFinalizationVariant || authoredWriteOrderVariant || neighborhoodVariant) &&
    atlasKind !== WATER_HEIGHT_MAINTENANCE_ATLAS
  )
    throw new Error("Authored finalizer ablations require the full-map-maintenance atlas.");
  if (
    atlasKind !== "synthetic-river-v4" &&
    variant !== "authored" &&
    !authoredFinalizationVariant &&
    !authoredWriteOrderVariant &&
    !neighborhoodVariant
  )
    throw new Error("Adapter atlases require the authored finalization tuple.");
  const maxLakeCutoff = atlasKind === WATER_HEIGHT_MAX_LAKE_CUTOFF_ATLAS;
  const boundedLakeCutoff = atlasKind === WATER_HEIGHT_BOUNDED_LAKE_CUTOFF_ATLAS;
  const cutoffAtlas =
    atlasKind === WATER_HEIGHT_LAKE_CUTOFF_ATLAS || maxLakeCutoff || boundedLakeCutoff;
  const dryRetention = atlasKind === WATER_HEIGHT_DRY_RETENTION_REPLAY_ATLAS;
  const originalInput =
    atlasKind === WATER_HEIGHT_ORIGINAL_INPUT_CONTROL_ATLAS ||
    atlasKind === WATER_HEIGHT_ORIGINAL_INPUT_REPLAY_ATLAS ||
    dryRetention;
  const observeOriginalInput = originalInput || boundedLakeCutoff;
  const maintenance = atlasKind === WATER_HEIGHT_MAINTENANCE_ATLAS || cutoffAtlas || originalInput;
  if (
    selectionInput !== undefined &&
    (selectionInput === null || typeof selectionInput !== "object" || Array.isArray(selectionInput))
  )
    throw new Error("Diagnostic selection must be an object.");
  const selection = selectionInput ?? {};
  if (selectionInput !== undefined && !maintenance)
    throw new Error("An explicit diagnostic selection is supported only for maintenance atlases.");
  const preset = findCiv7StandardMapSizePreset(
    selection.mapSize ?? WATER_HEIGHT_MAINTENANCE_PROBE.mapSize
  );
  if (!preset) throw new Error(`Unknown diagnostic map size: ${selection.mapSize}`);
  const mapSeed = selection.mapSeed ?? WATER_HEIGHT_MAINTENANCE_PROBE.mapSeed;
  const gameSeed = selection.gameSeed ?? WATER_HEIGHT_MAINTENANCE_PROBE.gameSeed;
  if (!assessCiv7SignedIntSeed(mapSeed).ok || !assessCiv7SignedIntSeed(gameSeed).ok)
    throw new Error("Maintenance diagnostics require independent signed 32-bit seeds.");
  const playerCount = selection.playerCount ?? preset.defaultPlayers;
  if (
    !Number.isSafeInteger(playerCount) ||
    playerCount <= 0 ||
    playerCount > preset.mapInfo.PlayersLandmass1 + preset.mapInfo.PlayersLandmass2
  )
    throw new Error(
      "Diagnostic playerCount must be a positive integer within the selected start-slot capacity."
    );
  let cliffStudyInputSha256: string | undefined;
  const directionalCliffs =
    selection.cliffStudyPath === undefined
      ? undefined
      : await (async () => {
          if (
            !boundedLakeCutoff ||
            typeof selection.cliffStudyPath !== "string" ||
            !selection.cliffStudyPath.trim()
          )
            throw new Error(
              "A cliff study path requires explicitly selected bounded-cutoff diagnostics."
            );
          const path = resolve(selection.cliffStudyPath);
          const metadata = await stat(path);
          if (!metadata.isFile() || metadata.size > 65536)
            throw new Error(
              "Directional cliff study must be a regular JSON file no larger than 65536 bytes."
            );
          const bytes = await readFile(path);
          if (bytes.length > 65536)
            throw new Error("Directional cliff study exceeds the 65536-byte input limit.");
          const parsed: unknown = JSON.parse(bytes.toString("utf8"));
          const study = readDirectionalCliffStudy(parsed, preset.dimensions);
          cliffStudyInputSha256 = createHash("sha256").update(bytes).digest("hex");
          return study;
        })();
  const defaultCutoff = maxLakeCutoff
    ? preset.dimensions.width * preset.dimensions.height
    : boundedLakeCutoff
      ? WATER_HEIGHT_BOUNDED_LAKE_CUTOFF_PROBE.expectedLakeSizeCutoff
      : cutoffAtlas
        ? WATER_HEIGHT_LAKE_CUTOFF_PROBE.expectedLakeSizeCutoff
        : preset.mapInfo.LakeSizeCutoff;
  const expectedLakeSizeCutoff =
    selection.lakeSizeCutoff === "stock"
      ? preset.mapInfo.LakeSizeCutoff
      : (selection.lakeSizeCutoff ?? defaultCutoff);
  if (
    !Number.isSafeInteger(expectedLakeSizeCutoff) ||
    expectedLakeSizeCutoff <= 0 ||
    expectedLakeSizeCutoff > preset.dimensions.width * preset.dimensions.height
  )
    throw new Error(
      "Diagnostic lake cutoff must be a positive integer no greater than the selected cell count."
    );
  if (originalInput && expectedLakeSizeCutoff !== preset.mapInfo.LakeSizeCutoff)
    throw new Error("Original-input diagnostics require the selected public stock lake cutoff.");
  if (
    neighborhoodVariant &&
    ((selection.sourceConfigId ?? "swooper-earthlike") !== "swooper-earthlike" ||
      preset.id !== "MAPSIZE_HUGE" ||
      mapSeed !== 1018 ||
      gameSeed !== 1018 ||
      playerCount !== 12 ||
      expectedLakeSizeCutoff !== 10)
  )
    throw new Error(
      "Neighborhood class ablation requires the exact pinned Huge1018/1018/12 stock selection."
    );
  // Resolve once for the observer, scoped treatment, proof, and launch receipt.
  const maintenanceProbe = {
    ...(dryRetention
      ? WATER_HEIGHT_DRY_RETENTION_REPLAY_PROBE
      : originalInput
        ? atlasKind === WATER_HEIGHT_ORIGINAL_INPUT_REPLAY_ATLAS
          ? WATER_HEIGHT_ORIGINAL_INPUT_REPLAY_PROBE
          : WATER_HEIGHT_ORIGINAL_INPUT_CONTROL_PROBE
        : boundedLakeCutoff
          ? WATER_HEIGHT_BOUNDED_LAKE_CUTOFF_PROBE
          : maxLakeCutoff
            ? WATER_HEIGHT_MAX_LAKE_CUTOFF_PROBE
            : cutoffAtlas
              ? WATER_HEIGHT_LAKE_CUTOFF_PROBE
              : WATER_HEIGHT_MAINTENANCE_PROBE),
    width: preset.dimensions.width,
    height: preset.dimensions.height,
    mapSize: preset.id,
    mapSeed,
    gameSeed,
    playerCount,
    sourceConfigId: selection.sourceConfigId ?? WATER_HEIGHT_MAINTENANCE_PROBE.sourceConfigId,
    expectedLakeSizeCutoff,
    ...(authoredFinalizationVariant
      ? {
          finalizationIntervention: {
            variant,
            requestedTuple: RIVER_PROBE_VARIANTS.authored,
            appliedTuple: RIVER_PROBE_VARIANTS[variant],
            qualification:
              "Diagnostic-only authored finalizer minima ablation; no other authentic call changes.",
          },
        }
      : {}),
    ...(neighborhoodVariant
      ? { riverNeighborhoodClassIntervention: RIVER_NEIGHBORHOOD_CLASS_INTERVENTION }
      : {}),
    ...(authoredWriteOrderVariant
      ? {
          riverWriteOrderIntervention: {
            variant: RIVER_AUTHORED_WRITE_ORDER_VARIANT,
            qualification:
              "Diagnostic-only downstream-first native delivery permutation; every declaration and the authored finalizer tuple are unchanged.",
          },
        }
      : {}),
    ...(directionalCliffs
      ? {
          diagnosticRevision: WATER_HEIGHT_CLIFF_OBSERVATION_REVISION,
          displayLabel: "Water Directional Cliff Observation V23",
          directionalCliffs,
        }
      : {}),
  };
  const lakeCutoff = maintenance && expectedLakeSizeCutoff !== preset.mapInfo.LakeSizeCutoff;
  const fullMap = isFullMapAtlas(atlasKind) || maintenance;
  const lowerBound = atlasKind === WATER_LOWER_BOUND_ATLAS;
  const declaredFiniteHead = atlasKind === WATER_DECLARED_FINITE_HEAD_ATLAS;
  const stockConnectivity =
    atlasKind === WATER_CONNECTIVITY_STOCK_ATLAS || atlasKind === WATER_CONNECTIVITY_REPLAY_ATLAS;
  const waterConnectivity = isWaterConnectivityAtlas(atlasKind) || lowerBound || declaredFiniteHead;
  const probe = declaredFiniteHead
    ? WATER_DECLARED_FINITE_HEAD_PROBE
    : lowerBound
      ? WATER_LOWER_BOUND_PROBE
      : isWaterConnectivityAtlas(atlasKind)
        ? waterConnectivityProbe(atlasKind)
        : fullMap
          ? { ...RIVER_PROBE, ...(maintenance ? maintenanceProbe : FULL_MAP_RIVER_PROBE) }
          : atlasKind === "terrain-admission"
            ? RIVER_TERRAIN_PROBE
            : atlasKind === "lake-navigation"
              ? RIVER_LAKE_NAVIGATION_PROBE
              : RIVER_PROBE;
  const scopedCutoff =
    isWaterConnectivityAtlas(atlasKind) && !stockConnectivity
      ? waterConnectivityProbe(atlasKind).expectedLakeSizeCutoff
      : lakeCutoff
        ? maintenanceProbe.expectedLakeSizeCutoff
        : undefined;
  const cutoffMapSize = waterConnectivity ? "MAPSIZE_TINY" : preset.id;
  // Civ retains registered components across warm restarts; keep this pair's file present.
  const cutoffComponent = scopedCutoff !== undefined || boundedLakeCutoff;
  const launchMapSize = maintenance ? preset.id : fullMap ? "MAPSIZE_HUGE" : "MAPSIZE_TINY";
  const launchDescription = maintenance
    ? `${preset.label}, ${playerCount} players`
    : fullMap
      ? "Huge, ten players"
      : "Tiny, four players";
  const displayLabel = "displayLabel" in probe ? probe.displayLabel : "River Contract Probe";
  const adapterImport =
    atlasKind !== "synthetic-river-v4"
      ? 'import { Civ7Adapter } from "./src/runtime/map-script/adapter.ts";\n'
      : "";
  const adapterFactory =
    atlasKind !== "synthetic-river-v4" ? ", (width, height) => new Civ7Adapter(width, height)" : "";
  let source = `${adapterImport}import { registerRiverContractProbe } from "./test/runtime/river-contract-map.fixture.ts";\nregisterRiverContractProbe(${JSON.stringify(proofId)}, ${JSON.stringify(variant)}, ${JSON.stringify(atlasKind)}${adapterFactory});`;
  let waterFixtureSourceSha256: string | undefined;
  let declaredHeadProof:
    | {
        physical: DeclaredFiniteHeadModel;
        physicalPayloadSha256: string;
        standardProjection: {
          stageId: string;
          stepId: string;
          nativeRequests: number[];
          nativeRequestsSha256: string;
        };
      }
    | undefined;
  if (declaredFiniteHead) {
    waterFixtureSourceSha256 = createHash("sha256")
      .update(await readFile(new URL("./water-connectivity.fixture.ts", import.meta.url)))
      .digest("hex");
    const physical = buildDeclaredFiniteHeadModel();
    const nativeRequests = projectDeclaredFiniteHeadRequests(physical);
    declaredHeadProof = {
      physical,
      physicalPayloadSha256: sha256Hex(stableStringify(physical)),
      standardProjection: {
        stageId: "map-elevation",
        stepId: "build-elevation",
        nativeRequests,
        nativeRequestsSha256: sha256Hex(stableStringify(nativeRequests)),
      },
    };
    source = `${adapterImport}import { registerRiverContractProbe } from "./test/runtime/river-contract-map.fixture.ts";
import { buildWaterDeclaredFiniteHeadFixture } from "./test/runtime/water-connectivity.fixture.ts";
registerRiverContractProbe(${JSON.stringify(proofId)}, ${JSON.stringify(variant)}, ${JSON.stringify(atlasKind)}${adapterFactory}, buildWaterDeclaredFiniteHeadFixture(${JSON.stringify(waterFixtureSourceSha256)}, ${JSON.stringify(nativeRequests)}, ${JSON.stringify(declaredHeadProof.physicalPayloadSha256)}, ${JSON.stringify(declaredHeadProof.standardProjection.nativeRequestsSha256)}));`;
  } else if (lowerBound) {
    waterFixtureSourceSha256 = createHash("sha256")
      .update(await readFile(new URL("./water-connectivity.fixture.ts", import.meta.url)))
      .digest("hex");
    source = `${adapterImport}import { registerRiverContractProbe } from "./test/runtime/river-contract-map.fixture.ts";
import { buildWaterLowerBoundFixture } from "./test/runtime/water-connectivity.fixture.ts";
registerRiverContractProbe(${JSON.stringify(proofId)}, ${JSON.stringify(variant)}, ${JSON.stringify(atlasKind)}${adapterFactory}, buildWaterLowerBoundFixture(${JSON.stringify(waterFixtureSourceSha256)}));`;
  } else if (isWaterConnectivityAtlas(atlasKind)) {
    waterFixtureSourceSha256 = createHash("sha256")
      .update(await readFile(new URL("./water-connectivity.fixture.ts", import.meta.url)))
      .digest("hex");
    source = `${adapterImport}import { registerRiverContractProbe } from "./test/runtime/river-contract-map.fixture.ts";
import { buildWaterConnectivityFixture } from "./test/runtime/water-connectivity.fixture.ts";
registerRiverContractProbe(${JSON.stringify(proofId)}, ${JSON.stringify(variant)}, ${JSON.stringify(atlasKind)}${adapterFactory}, buildWaterConnectivityFixture(${JSON.stringify(atlasKind)}, ${JSON.stringify(waterFixtureSourceSha256)}));`;
  }
  let identity: FullMapProbeIdentity | undefined;
  if (fullMap) {
    const sourceConfigId = maintenance
      ? maintenanceProbe.sourceConfigId
      : FULL_MAP_RIVER_PROBE.sourceConfigId;
    const [config] = await loadSwooperMapConfigCatalog({ catalogConfigIds: [sourceConfigId] });
    if (!config || config.canonicalConfig.id !== sourceConfigId)
      throw new Error(`Missing canonical ${sourceConfigId} config.`);
    identity = {
      configHash: canonicalMapConfigContentDigest(config.canonicalConfig),
      envelopeHash: canonicalMapConfigDigest(config.canonicalConfig),
      fixtureSourceSha256: createHash("sha256")
        .update(
          await readFile(
            new URL(
              maintenance ? "./water-height-maintenance.fixture.ts" : "./river-full-map.fixture.ts",
              import.meta.url
            )
          )
        )
        .digest("hex"),
    };
    const mapSource = maintenance
      ? `import { createMap } from "./src/runtime/map-script/entrypoint.js";
import type { StandardMapConfigEnvelope } from "@swooper/swooper-physics/standard/map-config";
import standardRecipe, {
  ${lakeCutoff ? "" : "projectStandardInitialSetup,"}
  STANDARD_INITIAL_GAME_OPTION_DESCRIPTORS,
  STANDARD_INITIAL_MAP_OPTION_DESCRIPTORS,
  STANDARD_INITIAL_PLAYER_OPTION_DESCRIPTORS,
} from "@swooper/swooper-physics/standard";
${lakeCutoff ? 'import { projectLakeCutoffInitialSetup } from "./test/runtime/water-height-maintenance.fixture.ts";' : ""}
const mapConfig = ${JSON.stringify(config.canonicalConfig, null, 2)} as unknown as StandardMapConfigEnvelope;
export default createMap({
  ...mapConfig,
  recipe: {
    ...standardRecipe,
    execute: (context, plan, options) => {
      standardRecipe.execute(context, plan, options);
      ${observeOriginalInput ? "finishOriginalElevation();" : ""}
      observeWaterHeightPhysicalLakes(context, plan, ${JSON.stringify(proofId)}, ${JSON.stringify(identity)}, ${JSON.stringify(maintenanceProbe)});
    },
  },
  sourceConfigId: ${JSON.stringify(config.canonicalConfig.id)},
  configHash: ${JSON.stringify(identity.configHash)},
  envelopeHash: ${JSON.stringify(identity.envelopeHash)},
  config: mapConfig.config,
  initialSetup: {
    requestedMapOptions: STANDARD_INITIAL_MAP_OPTION_DESCRIPTORS,
    requestedGameOptions: STANDARD_INITIAL_GAME_OPTION_DESCRIPTORS,
    requestedPlayerOptions: STANDARD_INITIAL_PLAYER_OPTION_DESCRIPTORS,
    project: ${lakeCutoff ? `(capture) => projectLakeCutoffInitialSetup(capture, ${maintenanceProbe.expectedLakeSizeCutoff}, ${JSON.stringify(preset.id)})` : "projectStandardInitialSetup"},
  },
});`
      : renderSwooperCatalogMapSource(config);
    source = maintenance
      ? `${adapterImport}import { installWaterHeightMaintenanceProbe, observeWaterHeightPhysicalLakes } from "./test/runtime/water-height-maintenance.fixture.ts";
${observeOriginalInput ? "const finishOriginalElevation = " : ""}installWaterHeightMaintenanceProbe(Civ7Adapter.prototype, ${JSON.stringify(proofId)}, ${JSON.stringify(identity)}, ${JSON.stringify(maintenanceProbe)});
${mapSource}`
      : `${adapterImport}import { installFullMapRiverProbe } from "./test/runtime/river-full-map.fixture.ts";
installFullMapRiverProbe(Civ7Adapter.prototype, ${JSON.stringify(proofId)}, ${JSON.stringify(atlasKind)}, ${JSON.stringify(identity)});
${renderSwooperCatalogMapSource(config)}`;
  }
  const content = await bundleCiv7MapScript({
    source,
    sourceName: "river-contract-probe.ts",
    appRoot: riverProbeAppRoot,
  });
  return {
    exclusiveSets: [
      { relativeDir: "maps", fileExtension: ".js" },
      { relativeDir: "config", fileExtension: ".xml" },
    ],
    files: [
      { relativePath: "maps/river-contract.js", content },
      {
        relativePath: "config/config.xml",
        content: `<?xml version="1.0" encoding="utf-8"?>
<Database><Maps><Row File="${riverProbeMapScript}" Name="LOC_RIVER_CONTRACT_NAME" Description="LOC_RIVER_CONTRACT_DESCRIPTION" SortIndex="999"/></Maps></Database>`,
      },
      ...(cutoffComponent
        ? [
            {
              relativePath: "config/lake-cutoff.xml",
              content: `<?xml version="1.0" encoding="utf-8"?>
${scopedCutoff === undefined ? "<Database/>" : `<Database><Maps><Update><Where MapSizeType="${cutoffMapSize}"/><Set LakeSizeCutoff="${scopedCutoff}"/></Update></Maps></Database>`}`,
            },
          ]
        : []),
      {
        relativePath: "text/en_us/MapText.xml",
        content: `<?xml version="1.0" encoding="utf-8"?>
<Database><EnglishText><Row Tag="LOC_RIVER_CONTRACT_NAME"><Text>${displayLabel}</Text></Row><Row Tag="LOC_RIVER_CONTRACT_DESCRIPTION"><Text>Disposable native river diagnostic. ${launchDescription}. Revision ${probe.diagnosticRevision}.</Text></Row></EnglishText></Database>`,
      },
      {
        relativePath: `${RIVER_PROBE.id}.modinfo`,
        content: `<?xml version="1.0" encoding="utf-8"?>
<Mod id="${RIVER_PROBE.id}" version="1" xmlns="ModInfo">
  <Properties><Name>${displayLabel}</Name><Description>Disposable native river diagnostic revision ${probe.diagnosticRevision}</Description><Authors>Swooper</Authors><Package>Mod</Package></Properties>
  <Dependencies><Mod id="base-standard" title="LOC_MODULE_BASE_STANDARD_NAME"/>${fullMap ? '<Mod id="swooper-maps" title="LOC_MODULE_SWOOPER_MAPS_NAME"/>' : ""}</Dependencies>
  <ActionCriteria><Criteria id="always"><AlwaysMet/></Criteria>${cutoffComponent ? `<Criteria id="diagnostic-map"><MapInUse>${riverProbeMapScript}</MapInUse></Criteria>` : ""}</ActionCriteria>
  <ActionGroups>
    <ActionGroup id="game-river-contract" scope="game" criteria="always"><Actions><UpdateText><Item>text/en_us/MapText.xml</Item></UpdateText><ImportFiles><Item>maps/river-contract.js</Item></ImportFiles></Actions></ActionGroup>
    <ActionGroup id="shell-river-contract" scope="shell" criteria="always"><Actions><UpdateDatabase><Item>config/config.xml</Item></UpdateDatabase><UpdateText><Item>text/en_us/MapText.xml</Item></UpdateText></Actions></ActionGroup>${cutoffComponent ? '\n    <ActionGroup id="game-lake-cutoff" scope="game" criteria="diagnostic-map"><Actions><UpdateDatabase><Item>config/lake-cutoff.xml</Item></UpdateDatabase></Actions></ActionGroup>' : ""}
  </ActionGroups>
</Mod>`,
      },
      {
        relativePath: "proof.json",
        content: JSON.stringify(
          {
            proofId,
            ...probe,
            ...identity,
            variant,
            atlasKind,
            ...(declaredHeadProof ? { declaredFiniteHead: declaredHeadProof } : {}),
            ...(directionalCliffs
              ? {
                  observation: {
                    kind: "read-only-directional-cliffs",
                    inputSha256: cliffStudyInputSha256,
                    manifestSha256: sha256Hex(stableStringify(directionalCliffs)),
                    physicalPayloadSha256: directionalCliffs.physicalPayloadSha256,
                    shoreEdgeCount: directionalCliffs.shoreEdges.length,
                    dryControlEdgeCount: directionalCliffs.dryControls.length,
                    directionalRecordCountPerWaypoint:
                      2 *
                      (directionalCliffs.shoreEdges.length + directionalCliffs.dryControls.length),
                    waypoints: DIRECTIONAL_CLIFF_WAYPOINTS,
                    qualification:
                      "Selected app-owned diagnostic only. Native adjacency and boolean flags require observed qualification. Adds no elevation, cliff generation, validation, river, area or cache mutation; no movement or cliff-threshold claim.",
                  },
                }
              : {}),
            ...(waterConnectivity
              ? {
                  fixtureSourceSha256: waterFixtureSourceSha256,
                  intervention: {
                    ...(declaredFiniteHead
                      ? {
                          kind: "declared-physical-finite-head",
                          databaseTreatment: "none; public Tiny stock row held",
                          projection:
                            "actual public Standard map-elevation/build-elevation step; build-time mock only",
                          immediateCheckpoint: "after-elevation-write",
                          qualification:
                            "Six declared physical cases, not procedural hydrology. Ground and heads remain separate; numeric native faithfulness is independent of lake category. Below-sea open cases have lower finite receivers, never marine destinations. Failure records a capability limit without ground, terrain, head or datum compensation.",
                        }
                      : lowerBound
                        ? {
                            kind: "closed-water-native-lower-bound",
                            mapSize: WATER_LOWER_BOUND_PROBE.mapSize,
                            expectedLakeSizeCutoff: WATER_LOWER_BOUND_PROBE.expectedLakeSizeCutoff,
                            databaseTreatment: "none; public Tiny stock row held",
                            elevationUnits: "native numeric setter requests",
                            immediateCheckpoint: "after-elevation-write",
                            qualification:
                              "Wet requests may be ignored. Complete body and adjacent dry-shore native observations immediately after the setter and through the existing nine maintenance checkpoints are evidence, not physical-head or product-policy acceptance.",
                          }
                        : stockConnectivity
                          ? {
                              kind: "stock-tiny-original-input-replay-diagnostic",
                              databaseTreatment: "none; public Tiny stock row held",
                              originalElevationReplayed:
                                atlasKind === WATER_CONNECTIVITY_REPLAY_ATLAS,
                              input: "original fixture Number[] snapshot; never native readbacks",
                              slot: "after genuine after-validate capture, before area and water-cache refresh",
                              replaySlotCheckpoints: [
                                "before-original-replay-slot",
                                "after-original-replay-slot",
                              ],
                              qualification:
                                "Diagnostic only. Original requests may be non-idempotent after river classification. Full native observations qualify wet, marine and dry collateral effects; no wonder, NAV-grade, movement or production preservation claim.",
                            }
                          : {
                              kind: "paired-source-water-connectivity",
                              scope: "game",
                              criterion: { MapInUse: riverProbeMapScript },
                              table: "Maps",
                              where: { MapSizeType: "MAPSIZE_TINY" },
                              set: { LakeSizeCutoff: scopedCutoff },
                              qualification:
                                "Activation requires measured Tiny metadata; all-cell native water/lake/area evidence is observed, never inferred from authored terrain. No movement success claimed.",
                            }),
                  },
                }
              : {}),
            ...(originalInput
              ? {
                  intervention: {
                    kind: dryRetention
                      ? "post-authentic-recipe-dry-retention-replay"
                      : "post-authentic-recipe-original-input-replay",
                    databaseTreatment: "none; selected public stock row held",
                    originalElevationReplayed:
                      atlasKind === WATER_HEIGHT_ORIGINAL_INPUT_REPLAY_ATLAS,
                    ...(dryRetention ? { nativeDryElevationRetained: true } : {}),
                    input: dryRetention
                      ? "native isWater selects protected original wet requests and exact available current native dry elevations; never wet readbacks"
                      : "protected Number[] snapshot before the first authentic setter; never native readbacks",
                    slot: "post-authentic-recipe, before physical-lakes observation and mapgen-complete; not the internal prepare-surface slot",
                    checkpoints: ["before-original-replay", "after-original-replay"],
                    qualification: dryRetention
                      ? "Dry-retention preservation discriminator only. One added setter requires complete native elevation and boolean water observations; no fallback, validation, cliffs, area/cache refresh or retries. Native acceptance remains measured, not selected product policy."
                      : "Two-arm preservation discriminator only. Replay adds one original-request setter and no validation, cliffs, area/cache refresh or retries. Native wonder/NAV/terrain changes remain measured outcomes, not selected product policy.",
                  },
                }
              : {}),
            ...(isFullMapAtlas(atlasKind)
              ? {
                  intervention: {
                    riverClass: "NAVIGABLE",
                    extraWriteCount: FULL_MAP_RIVER_PROBE_EDGES[atlasKind].length,
                    edges: FULL_MAP_RIVER_PROBE_EDGES[atlasKind],
                  },
                }
              : {}),
            ...(lakeCutoff
              ? {
                  intervention: {
                    kind: "source-qualified-classification-only",
                    scope: "game",
                    criterion: { MapInUse: riverProbeMapScript },
                    table: "Maps",
                    where: { MapSizeType: preset.id },
                    set: { LakeSizeCutoff: maintenanceProbe.expectedLakeSizeCutoff },
                    setupSelection: `custom; captured ${preset.label} metadata differs only at numeric LakeSizeCutoff ${maintenanceProbe.expectedLakeSizeCutoff}`,
                    qualification: `Activation requires measured MapInfo cutoff ${maintenanceProbe.expectedLakeSizeCutoff}; no height, visual or navigation success claimed.`,
                    ...(maxLakeCutoff
                      ? {
                          discriminator: `${preset.label} cell-count stress atlas, selected cutoff ${expectedLakeSizeCutoff}; not a product cutoff; changed marine lake identity is a result, not an activation refusal.`,
                        }
                      : {}),
                    ...(boundedLakeCutoff
                      ? {
                          discriminator: `Predeclared bounded cutoff40 versus stock10 on Huge42, then unchanged on Huge1018 is the legacy reference. Selected ${maintenanceProbe.sourceConfigId}/${preset.id} cutoff${expectedLakeSizeCutoff} versus stock${preset.mapInfo.LakeSizeCutoff}; not a product cutoff. Native lake coverage, original marine identity/heights and collateral fields require measured comparison; changed classifications are results, not activation refusals.`,
                        }
                      : {}),
                  },
                }
              : {}),
            settings: RIVER_PROBE_VARIANTS[variant],
            scriptSha256: createHash("sha256").update(content).digest("hex"),
            mapScript: riverProbeMapScript,
            installDirectoryName: riverProbeInstallDirectoryName,
            liveVerifierFlags: [
              "--mutate",
              "--map-script",
              riverProbeMapScript,
              "--map-size",
              launchMapSize,
              "--seed",
              String(probe.mapSeed),
              "--game-seed",
              String(probe.gameSeed),
              "--player-count",
              String(probe.playerCount),
            ],
            evidence: "built-only; no native observations",
            qualification:
              "completion means all diagnostic phases ran, not river parity or successful writes",
            networkWitness:
              "experimental bounded ordinal-to-ID-to-plots lookup; no shipped argument contract",
          },
          null,
          2
        ),
      },
    ],
  };
}

/** Requires an explicit atlas and accepts maintenance selectors only as named flags. */
export function parseRiverProbeArguments(args: readonly string[]) {
  const [proofId, variant, atlasKind, ...rest] = args;
  if (
    !proofId ||
    !variant ||
    !atlasKind ||
    !Object.hasOwn(RIVER_PROBE_VARIANTS, variant) ||
    !atlases.includes(atlasKind)
  )
    throw new Error(
      "Usage: river-contract-probe <proof-id> <variant> <atlas> [--profile id --map-size id --map-seed n --game-seed n --player-count n --lake-cutoff stock|n --cliff-study path] (build only)"
    );
  const { values } = parseArgs({
    args: rest,
    options: {
      profile: { type: "string" },
      "map-size": { type: "string" },
      "map-seed": { type: "string" },
      "game-seed": { type: "string" },
      "player-count": { type: "string" },
      "lake-cutoff": { type: "string" },
      "cliff-study": { type: "string" },
    },
  });
  const integer = (value: string): number => {
    if (!/^-?\d+$/.test(value))
      throw new Error(`Expected an integer diagnostic selector: ${value}`);
    return Number(value);
  };
  const selection: WaterHeightDiagnosticSelection | undefined =
    Object.keys(values).length === 0
      ? undefined
      : {
          ...(values.profile === undefined ? {} : { sourceConfigId: values.profile }),
          ...(values["map-size"] === undefined ? {} : { mapSize: values["map-size"] }),
          ...(values["map-seed"] === undefined ? {} : { mapSeed: integer(values["map-seed"]) }),
          ...(values["game-seed"] === undefined ? {} : { gameSeed: integer(values["game-seed"]) }),
          ...(values["player-count"] === undefined
            ? {}
            : { playerCount: integer(values["player-count"]) }),
          ...(values["lake-cutoff"] === undefined
            ? {}
            : {
                lakeSizeCutoff:
                  values["lake-cutoff"] === "stock" ? "stock" : integer(values["lake-cutoff"]),
              }),
          ...(values["cliff-study"] === undefined ? {} : { cliffStudyPath: values["cliff-study"] }),
        };
  return {
    proofId,
    variant: variant as RiverProbeVariant,
    atlasKind: atlasKind as RiverProbeAtlasSelection,
    selection,
  };
}

if (import.meta.main) {
  const { proofId, variant, atlasKind, selection } = parseRiverProbeArguments(
    process.argv.slice(2)
  );
  const plan = await buildRiverProbePlan(proofId, variant, atlasKind, selection);
  const proofContent = plan.files.find((file) => file.relativePath === "proof.json")?.content;
  if (typeof proofContent !== "string") throw new Error("Missing diagnostic proof receipt.");
  const proof = JSON.parse(proofContent);
  await applyGeneratedFilePlan(plan, { outputRoot: riverProbeOutputRoot });
  console.log(
    JSON.stringify(
      {
        outputRoot: riverProbeOutputRoot,
        proofId,
        variant,
        atlasKind,
        mapScript: riverProbeMapScript,
        installDirectoryName: riverProbeInstallDirectoryName,
        deployFlags: riverProbeDeployFlags,
        liveVerifierFlags: proof.liveVerifierFlags,
        status: "built-only; installation and live launch require separate authorization",
      },
      null,
      2
    )
  );
}
