import type { MapInfo, MapInitParams, MapSizeId } from "@civ7/adapter";
import type {
  Civ7GameOptionDescriptor,
  Civ7MapOptionDescriptor,
  Civ7PlayerOptionDescriptor,
} from "@civ7/map-policy/setup";
import { createMapContext } from "@swooper/mapgen-core";
import {
  basePhysicalInitialSetupDefinition,
  type RecipeInitialSetupInputOf,
} from "@swooper/mapgen-core/authoring";
import { encodeBoundedJsonLogLines } from "@swooper/mapgen-core/lib/log";
import type {
  MapDefinition,
  MapLatitudeBounds,
  MapRecipeDefinition,
  MapRunCorrelation,
} from "@swooper/swooper-physics/standard";
import { createCiv7Adapter } from "./adapter.js";
import { captureCiv7MapGenerationSetup } from "./setup.js";

type MapSetupOptionDescriptor = Civ7MapOptionDescriptor;
type GameSetupOptionDescriptor = Civ7GameOptionDescriptor;
type PlayerSetupOptionDescriptor = Civ7PlayerOptionDescriptor;
type CivEngine = {
  on: (event: string, handler: (...args: unknown[]) => void) => void;
  call: (method: string, ...args: unknown[]) => unknown;
};

// Private host observations for the embedded map-script realization.
declare const GameplayMap: Readonly<{
  getMapSize(): MapSizeId;
  getRandomSeed(): number;
}>;
declare const engine: CivEngine;

type InitCapture = {
  mapSizeId: MapSizeId;
  mapInfo: MapInfo;
  params: Required<Pick<MapInitParams, "width" | "height">> &
    Required<Pick<MapInitParams, "topLatitude" | "bottomLatitude">> &
    Pick<MapInitParams, "mapSize">;
};

type RecipeSetupCaptureInput = Readonly<{
  mapSeed: number;
  dimensions: Readonly<{ width: number; height: number }>;
  latitudeBounds: MapLatitudeBounds;
  mapSizeId: MapSizeId;
  mapInfo: MapInfo;
}>;

type MapEvidencePayloadIdentity = Readonly<{
  requestId: string | null;
  runArtifactId: string | null;
  canonicalConfigDigest: string | null;
  generationManifestDigest: string | null;
}> &
  (
    | Readonly<{ launchEnvelopeDigest: string; envelopeHash?: never }>
    | Readonly<{ envelopeHash: string | null; launchEnvelopeDigest?: never }>
  );

function mapEvidencePayloadIdentityFor<
  TRecipe extends MapRecipeDefinition,
  TMapOptions extends readonly MapSetupOptionDescriptor[],
  TGameOptions extends readonly GameSetupOptionDescriptor[],
  TPlayerOptions extends readonly PlayerSetupOptionDescriptor[],
>(
  def: MapDefinition<TRecipe, TMapOptions, TGameOptions, TPlayerOptions>
): MapEvidencePayloadIdentity {
  if (def.runCorrelation) {
    return {
      requestId: def.runCorrelation.requestId,
      runArtifactId: def.runCorrelation.runArtifactId,
      canonicalConfigDigest: def.runCorrelation.canonicalConfigDigest,
      launchEnvelopeDigest: def.runCorrelation.launchEnvelopeDigest,
      generationManifestDigest: def.runCorrelation.generationManifestDigest,
    };
  }
  return {
    requestId: null,
    runArtifactId: null,
    canonicalConfigDigest: null,
    envelopeHash: def.envelopeHash ?? null,
    generationManifestDigest: null,
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object";
}

function isMapRunCorrelation(value: unknown): value is MapRunCorrelation {
  if (!isRecord(value)) return false;
  return (
    typeof value.requestId === "string" &&
    typeof value.runArtifactId === "string" &&
    typeof value.canonicalConfigDigest === "string" &&
    typeof value.launchEnvelopeDigest === "string" &&
    typeof value.generationManifestDigest === "string"
  );
}

function assertCompleteRunCorrelation<
  TRecipe extends MapRecipeDefinition,
  TMapOptions extends readonly MapSetupOptionDescriptor[],
  TGameOptions extends readonly GameSetupOptionDescriptor[],
  TPlayerOptions extends readonly PlayerSetupOptionDescriptor[],
>(def: MapDefinition<TRecipe, TMapOptions, TGameOptions, TPlayerOptions>): void {
  const hasDirectRunIdentity =
    "requestId" in def ||
    "runArtifactId" in def ||
    "canonicalConfigDigest" in def ||
    "launchEnvelopeDigest" in def ||
    "generationManifestDigest" in def;
  if (
    hasDirectRunIdentity ||
    ("runCorrelation" in def && !isMapRunCorrelation(def.runCorrelation))
  ) {
    throw new Error("Run maps require a complete runCorrelation.");
  }
}

function assertInitialSetupProjection<
  TRecipe extends MapRecipeDefinition,
  TMapOptions extends readonly MapSetupOptionDescriptor[],
  TGameOptions extends readonly GameSetupOptionDescriptor[],
  TPlayerOptions extends readonly PlayerSetupOptionDescriptor[],
>(def: MapDefinition<TRecipe, TMapOptions, TGameOptions, TPlayerOptions>): void {
  if (def.initialSetup === undefined) {
    if (def.recipe.initialSetup !== basePhysicalInitialSetupDefinition) {
      throw new Error(
        `${def.logPrefix ?? "[SWOOPER_MOD]"} Recipe "${def.recipe.id}" requires an initialSetup projector.`
      );
    }
    return;
  }
  if (typeof def.initialSetup.project !== "function") {
    throw new TypeError("Map initialSetup.project must be a function.");
  }
}

function resolveSeed<
  TRecipe extends MapRecipeDefinition,
  TMapOptions extends readonly MapSetupOptionDescriptor[],
  TGameOptions extends readonly GameSetupOptionDescriptor[],
  TPlayerOptions extends readonly PlayerSetupOptionDescriptor[],
>(def: MapDefinition<TRecipe, TMapOptions, TGameOptions, TPlayerOptions>): number {
  const seed = def.seed ?? GameplayMap.getRandomSeed();
  if (!Number.isFinite(seed)) {
    throw new Error(
      `${def.logPrefix ?? "[SWOOPER_MOD]"} Missing map seed (GameplayMap.getRandomSeed() returned non-finite).`
    );
  }
  return seed;
}

function resolveLatitudeBounds(
  def: Readonly<{ latitudeBounds?: MapLatitudeBounds; logPrefix?: string }>,
  initParams: Partial<MapInitParams> | null | undefined
): {
  topLatitude: number;
  bottomLatitude: number;
} {
  const topLatitude = def.latitudeBounds?.topLatitude ?? initParams?.topLatitude;
  const bottomLatitude = def.latitudeBounds?.bottomLatitude ?? initParams?.bottomLatitude;
  if (
    typeof topLatitude !== "number" ||
    !Number.isFinite(topLatitude) ||
    typeof bottomLatitude !== "number" ||
    !Number.isFinite(bottomLatitude)
  ) {
    throw new Error(
      `${def.logPrefix ?? "[SWOOPER_MOD]"} Missing map latitude bounds (RequestMapInitData did not provide finite top/bottom latitude and no authored override was supplied).`
    );
  }
  if (topLatitude <= bottomLatitude) {
    throw new Error(
      `${def.logPrefix ?? "[SWOOPER_MOD]"} Invalid map latitude bounds (topLatitude must be greater than bottomLatitude).`
    );
  }
  return { topLatitude, bottomLatitude };
}

function resolveMapInfo(mapSizeId: MapSizeId): MapInfo {
  const adapter = createCiv7Adapter();
  const mapInfo = adapter.lookupMapInfo(mapSizeId);
  if (!mapInfo) {
    throw new Error(
      `[SWOOPER_MOD] Failed to resolve mapInfo for mapSizeId=${String(mapSizeId)} (adapter.lookupMapInfo returned null).`
    );
  }
  return mapInfo;
}

function resolveInitCapture(
  def: Readonly<{ latitudeBounds?: MapLatitudeBounds; logPrefix?: string }>,
  initParams: Partial<MapInitParams> | null | undefined
): InitCapture {
  const mapSizeId: MapSizeId = initParams?.mapSize ?? GameplayMap.getMapSize();
  const mapInfo = resolveMapInfo(mapSizeId);

  const width = initParams?.width ?? mapInfo.GridWidth;
  const height = initParams?.height ?? mapInfo.GridHeight;

  if (
    typeof width !== "number" ||
    !Number.isFinite(width) ||
    typeof height !== "number" ||
    !Number.isFinite(height)
  ) {
    throw new Error(
      `${def.logPrefix ?? "[SWOOPER_MOD]"} Missing map dimensions (width/height not provided by init params and not present in mapInfo).`
    );
  }
  const { topLatitude, bottomLatitude } = resolveLatitudeBounds(def, initParams);

  const params: InitCapture["params"] = {
    width,
    height,
    topLatitude,
    bottomLatitude,
    mapSize: mapSizeId,
  };

  return { mapSizeId, mapInfo, params };
}

function captureRecipeInitialSetup<
  TRecipe extends MapRecipeDefinition,
  TMapOptions extends readonly MapSetupOptionDescriptor[],
  TGameOptions extends readonly GameSetupOptionDescriptor[],
  TPlayerOptions extends readonly PlayerSetupOptionDescriptor[],
>(
  def: MapDefinition<TRecipe, TMapOptions, TGameOptions, TPlayerOptions>,
  input: RecipeSetupCaptureInput
): RecipeInitialSetupInputOf<TRecipe> {
  const projection = def.initialSetup;
  if (projection !== undefined) {
    return projection.project(
      captureCiv7MapGenerationSetup({
        ...input,
        requestedMapOptions: projection.requestedMapOptions,
        requestedGameOptions: projection.requestedGameOptions,
        requestedPlayerOptions: projection.requestedPlayerOptions,
      })
    );
  }
  if (def.recipe.initialSetup !== basePhysicalInitialSetupDefinition) {
    throw new Error(
      `${def.logPrefix ?? "[SWOOPER_MOD]"} Recipe "${def.recipe.id}" requires an initialSetup projector.`
    );
  }
  return {
    mapSeed: input.mapSeed,
    dimensions: input.dimensions,
    latitudeBounds: input.latitudeBounds,
  } as RecipeInitialSetupInputOf<TRecipe>;
}

/**
 * Registers a Civ7 map entrypoint while keeping map authors on the recipe public config contract.
 *
 * Generation captures Civ7's initial state once, projects the recipe's complete setup, compiles one
 * immutable plan, creates the context from that plan's admitted physical setup, and executes the
 * exact plan. This realization-owned API executes only inside the Civ7 map loader.
 */
export function createMap<
  const TRecipe extends MapRecipeDefinition,
  const TMapOptions extends readonly MapSetupOptionDescriptor[] = readonly [],
  const TGameOptions extends readonly GameSetupOptionDescriptor[] = readonly [],
  const TPlayerOptions extends readonly PlayerSetupOptionDescriptor[] = readonly [],
>(
  def: MapDefinition<TRecipe, TMapOptions, TGameOptions, TPlayerOptions>
): MapDefinition<TRecipe, TMapOptions, TGameOptions, TPlayerOptions> {
  assertCompleteRunCorrelation(def);
  assertInitialSetupProjection(def);
  const engineApi = engine as unknown as CivEngine;
  let captured: InitCapture | null = null;

  engineApi.on("RequestMapInitData", (initParams) => {
    captured = resolveInitCapture(def, initParams as Partial<MapInitParams>);
    engineApi.call("SetMapInitData", captured.params);
  });

  engineApi.on("GenerateMap", () => {
    if (!captured) {
      throw new Error(
        `${def.logPrefix ?? "[SWOOPER_MOD]"} GenerateMap fired before RequestMapInitData (no init captured).`
      );
    }

    const { width, height, topLatitude, bottomLatitude } = captured.params;
    const seed = resolveSeed(def);
    const initialSetup = captureRecipeInitialSetup(def, {
      mapSeed: seed,
      dimensions: { width, height },
      latitudeBounds: { topLatitude, bottomLatitude },
      mapSizeId: captured.mapSizeId,
      mapInfo: captured.mapInfo,
    });

    const prefix = def.logPrefix ?? "[SWOOPER_MOD]";
    try {
      const plan = def.recipe.compile(initialSetup, def.config);
      const recipePlan = def.recipe.inspectPlan(plan);
      const evidencePayload = {
        mapId: def.id,
        sourceConfigId: def.sourceConfigId ?? def.id,
        ...mapEvidencePayloadIdentityFor(def),
        seed,
        mapSize: captured.mapSizeId,
        dimensions: { width, height },
        recipePlan,
      };
      emitBoundedJsonLog(prefix, "[mapgen-evidence]", evidencePayload);
      const adapter = createCiv7Adapter();
      const context = createMapContext({ setup: plan.setup, adapter });
      def.recipe.execute(context, plan, {
        log: (message) => console.log(prefix, message),
      });
      emitBoundedJsonLog(prefix, "[mapgen-complete]", evidencePayload);
    } catch (err) {
      console.error(prefix, "Map generation failed:", err);
      throw err;
    }
  });

  return def;
}

function emitBoundedJsonLog(prefix: string, marker: string, payload: unknown): void {
  for (const line of encodeBoundedJsonLogLines({ prefix, marker, payload })) console.log(line);
}
