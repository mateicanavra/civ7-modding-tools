/// <reference types="@civ7/types" />

import {
  type Civ7MapGenerationSetupCapture,
  captureCiv7MapGenerationSetup,
  type MapInfo,
  type MapInitParams,
  type MapSizeId,
} from "@civ7/adapter";
import { createCiv7Adapter } from "@civ7/adapter/civ7";
import { createMapContext } from "@swooper/mapgen-core";
import {
  type BasePhysicalInitialSetupDefinition,
  basePhysicalInitialSetupDefinition,
  type RecipeInitialSetupDefinitionOf,
  type RecipeInitialSetupInputOf,
  type RecipeModule,
} from "@swooper/mapgen-core/authoring";

type AnyRecipe = RecipeModule<any, any, any>;

type RecipePublicConfigOfRecipe<TRecipe extends AnyRecipe> =
  TRecipe extends RecipeModule<infer TPublicConfig, any, any> ? TPublicConfig : never;

/** Geographic bounds a map declaration may use to override Civ7's initialization bounds. */
export type MapLatitudeBounds = Readonly<{
  topLatitude: number;
  bottomLatitude: number;
}>;

/** Exact request and artifact identities required to correlate a Studio-generated map run. */
type MapRunCorrelation = Readonly<{
  requestId: string;
  runArtifactId: string;
  canonicalConfigDigest: string;
  launchEnvelopeDigest: string;
  generationManifestDigest: string;
}>;

type MapDefinitionCore<TRecipe extends AnyRecipe> = Readonly<{
  id: string;
  name: string;
  recipe: TRecipe;
  config: RecipePublicConfigOfRecipe<TRecipe>;
  description?: string;
  latitudeBounds?: MapLatitudeBounds;
  logPrefix?: string;
  sourceConfigId?: string;
  seed?: number;
}>;

/**
 * Civ7 capture request and product projection for one recipe-owned initial setup authority.
 *
 * Option keys remain explicit because Civ7 offers keyed reads rather than a supported complete
 * option enumeration. The projector consumes detached capture evidence and must return the exact
 * full setup input inferred from the recipe's TypeBox authority.
 */
export type MapInitialSetupProjection<
  TRecipe extends AnyRecipe,
  TMapOptionKeys extends readonly string[] = readonly string[],
  TGameOptionKeys extends readonly string[] = readonly string[],
> = Readonly<{
  requestedMapOptionKeys: TMapOptionKeys;
  requestedGameOptionKeys: TGameOptionKeys;
  project: (
    capture: Civ7MapGenerationSetupCapture<TMapOptionKeys[number], TGameOptionKeys[number]>
  ) => RecipeInitialSetupInputOf<TRecipe>;
}>;

type MapDefinitionInitialSetup<
  TRecipe extends AnyRecipe,
  TMapOptionKeys extends readonly string[],
  TGameOptionKeys extends readonly string[],
> =
  RecipeInitialSetupDefinitionOf<TRecipe> extends BasePhysicalInitialSetupDefinition
    ? Readonly<{
        initialSetup?: MapInitialSetupProjection<TRecipe, TMapOptionKeys, TGameOptionKeys>;
      }>
    : Readonly<{
        initialSetup: MapInitialSetupProjection<TRecipe, TMapOptionKeys, TGameOptionKeys>;
      }>;

type MapDefinitionCatalogEvidence = Readonly<{
  requestId?: never;
  runArtifactId?: never;
  canonicalConfigDigest?: never;
  configHash?: string;
  envelopeHash?: string;
  launchEnvelopeDigest?: never;
  generationManifestDigest?: never;
  runCorrelation?: never;
}>;

type MapDefinitionRunSource = Readonly<{
  runCorrelation: MapRunCorrelation;
  requestId?: never;
  runArtifactId?: never;
  canonicalConfigDigest?: never;
  launchEnvelopeDigest?: never;
  generationManifestDigest?: never;
  configHash?: never;
  envelopeHash?: never;
}>;

/**
 * Complete Civ7 map-loader declaration for one recipe and its public authoring configuration.
 *
 * Catalog maps carry static evidence, while request-generated maps require the full run
 * correlation tuple so deployment and in-game diagnostics cannot silently cross runs.
 */
export type MapDefinition<
  TRecipe extends AnyRecipe,
  TMapOptionKeys extends readonly string[] = readonly string[],
  TGameOptionKeys extends readonly string[] = readonly string[],
> = MapDefinitionCore<TRecipe> &
  MapDefinitionInitialSetup<TRecipe, TMapOptionKeys, TGameOptionKeys> &
  (MapDefinitionCatalogEvidence | MapDefinitionRunSource);

type MapDefinitionInput<
  TRecipe extends AnyRecipe,
  TMapOptionKeys extends readonly string[],
  TGameOptionKeys extends readonly string[],
> = MapDefinition<TRecipe, TMapOptionKeys, TGameOptionKeys>;

type CivEngine = {
  on: (event: string, handler: (...args: any[]) => void) => void;
  call: (method: string, ...args: any[]) => unknown;
};

type InitCapture = {
  mapSizeId: MapSizeId;
  mapInfo: MapInfo;
  params: Required<Pick<MapInitParams, "width" | "height">> &
    Required<Pick<MapInitParams, "topLatitude" | "bottomLatitude">> &
    Pick<MapInitParams, "mapSize">;
};

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
  TRecipe extends AnyRecipe,
  TMapOptionKeys extends readonly string[],
  TGameOptionKeys extends readonly string[],
>(def: MapDefinitionInput<TRecipe, TMapOptionKeys, TGameOptionKeys>): MapEvidencePayloadIdentity {
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
  TRecipe extends AnyRecipe,
  TMapOptionKeys extends readonly string[],
  TGameOptionKeys extends readonly string[],
>(def: MapDefinitionInput<TRecipe, TMapOptionKeys, TGameOptionKeys>): void {
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
  TRecipe extends AnyRecipe,
  TMapOptionKeys extends readonly string[],
  TGameOptionKeys extends readonly string[],
>(def: MapDefinitionInput<TRecipe, TMapOptionKeys, TGameOptionKeys>): void {
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
  TRecipe extends AnyRecipe,
  TMapOptionKeys extends readonly string[],
  TGameOptionKeys extends readonly string[],
>(def: MapDefinitionInput<TRecipe, TMapOptionKeys, TGameOptionKeys>): number {
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
  base: { topLatitude: number; bottomLatitude: number }
): {
  topLatitude: number;
  bottomLatitude: number;
} {
  if (!def.latitudeBounds) return base;
  const { topLatitude, bottomLatitude } = def.latitudeBounds;
  if (!Number.isFinite(topLatitude) || !Number.isFinite(bottomLatitude)) {
    throw new Error(
      `${def.logPrefix ?? "[SWOOPER_MOD]"} Invalid latitudeBounds override (must be finite numbers).`
    );
  }
  if (topLatitude <= bottomLatitude) {
    throw new Error(
      `${def.logPrefix ?? "[SWOOPER_MOD]"} Invalid latitudeBounds override (topLatitude must be greater than bottomLatitude).`
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
  const baseTopLatitude = initParams?.topLatitude ?? mapInfo.MaxLatitude;
  const baseBottomLatitude = initParams?.bottomLatitude ?? mapInfo.MinLatitude;

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
  if (
    typeof baseTopLatitude !== "number" ||
    !Number.isFinite(baseTopLatitude) ||
    typeof baseBottomLatitude !== "number" ||
    !Number.isFinite(baseBottomLatitude)
  ) {
    throw new Error(
      `${def.logPrefix ?? "[SWOOPER_MOD]"} Missing map latitude bounds (top/bottom not provided by init params and not present in mapInfo).`
    );
  }

  const { topLatitude, bottomLatitude } = resolveLatitudeBounds(def, {
    topLatitude: baseTopLatitude,
    bottomLatitude: baseBottomLatitude,
  });

  const params: InitCapture["params"] = {
    width,
    height,
    topLatitude,
    bottomLatitude,
    mapSize: mapSizeId,
  };

  return { mapSizeId, mapInfo, params };
}

function projectRecipeInitialSetup<
  TRecipe extends AnyRecipe,
  TMapOptionKeys extends readonly string[],
  TGameOptionKeys extends readonly string[],
>(
  def: MapDefinitionInput<TRecipe, TMapOptionKeys, TGameOptionKeys>,
  capture: Civ7MapGenerationSetupCapture<TMapOptionKeys[number], TGameOptionKeys[number]>
): RecipeInitialSetupInputOf<TRecipe> {
  const projection = def.initialSetup;
  if (projection !== undefined) return projection.project(capture);
  if (def.recipe.initialSetup !== basePhysicalInitialSetupDefinition) {
    throw new Error(
      `${def.logPrefix ?? "[SWOOPER_MOD]"} Recipe "${def.recipe.id}" requires an initialSetup projector.`
    );
  }
  return {
    mapSeed: capture.mapSeed,
    dimensions: capture.dimensions,
    latitudeBounds: capture.latitudeBounds,
  } as RecipeInitialSetupInputOf<TRecipe>;
}

/**
 * Registers a Civ7 map entrypoint while keeping map authors on the recipe public config contract.
 *
 * Generation captures Civ7's initial state once, projects the recipe's complete setup, compiles one
 * immutable plan, creates the context from that plan's admitted physical setup, and executes the
 * exact plan. This SDK API is runtime-bound and must only be imported by code that executes inside
 * the Civ7 map loader.
 */
export function createMap<
  const TRecipe extends AnyRecipe,
  const TMapOptionKeys extends readonly string[] = readonly [],
  const TGameOptionKeys extends readonly string[] = readonly [],
>(
  def: MapDefinitionInput<TRecipe, TMapOptionKeys, TGameOptionKeys>
): MapDefinition<TRecipe, TMapOptionKeys, TGameOptionKeys> {
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
    const initialSetupProjection = def.initialSetup;
    const setupCapture = captureCiv7MapGenerationSetup({
      mapSeed: seed,
      dimensions: { width, height },
      latitudeBounds: { topLatitude, bottomLatitude },
      mapSizeId: captured.mapSizeId,
      mapInfo: captured.mapInfo,
      requestedMapOptionKeys: initialSetupProjection?.requestedMapOptionKeys ?? [],
      requestedGameOptionKeys: initialSetupProjection?.requestedGameOptionKeys ?? [],
    });
    const initialSetup = projectRecipeInitialSetup(def, setupCapture);

    const prefix = def.logPrefix ?? "[SWOOPER_MOD]";
    const evidenceIdentity = mapEvidencePayloadIdentityFor(def);
    const evidencePayload = {
      mapId: def.id,
      sourceConfigId: def.sourceConfigId ?? def.id,
      ...evidenceIdentity,
      seed,
      mapSize: captured.mapSizeId,
      dimensions: { width, height },
    };
    console.log(`${prefix} [mapgen-evidence] ${JSON.stringify(evidencePayload)}`);
    try {
      const plan = def.recipe.compile(initialSetup, def.config);
      const adapter = createCiv7Adapter();
      const context = createMapContext({ setup: plan.setup, adapter });
      def.recipe.execute(context, plan, {
        log: (message) => console.log(prefix, message),
      });
      console.log(`${prefix} [mapgen-complete] ${JSON.stringify(evidencePayload)}`);
    } catch (err) {
      console.error(prefix, "Map generation failed:", err);
      throw err;
    }
  });

  return def;
}
