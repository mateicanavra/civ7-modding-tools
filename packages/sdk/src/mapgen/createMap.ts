/// <reference types="@civ7/types" />

import type { MapInfo, MapInitParams, MapSizeId } from "@civ7/adapter";
import { createCiv7Adapter } from "@civ7/adapter/civ7";
import { admitMapSetup, createMapContext, type MapContext } from "@swooper/mapgen-core";
import type { RecipeModule } from "@swooper/mapgen-core/authoring";

type RecipePublicConfigOfRecipe<TRecipe extends RecipeModule<any, any>> =
  TRecipe extends RecipeModule<infer TPublicConfig, any> ? TPublicConfig : never;

/** Geographic bounds a map declaration may use to override Civ7's initialization bounds. */
export type MapLatitudeBounds = Readonly<{
  topLatitude: number;
  bottomLatitude: number;
}>;

/** Exact request and artifact identities required to correlate a Studio-generated map run. */
export type MapRunCorrelation = Readonly<{
  requestId: string;
  runArtifactId: string;
  canonicalConfigDigest: string;
  launchEnvelopeDigest: string;
  generationManifestDigest: string;
}>;

type MapDefinitionCore<TRecipe extends RecipeModule<any, any>> = Readonly<{
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
export type MapDefinition<TRecipe extends RecipeModule<any, any>> = MapDefinitionCore<TRecipe> &
  (MapDefinitionCatalogEvidence | MapDefinitionRunSource);

type MapDefinitionInput<TRecipe extends RecipeModule<any, any>> = MapDefinition<TRecipe>;

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

function mapEvidencePayloadIdentityFor(def: MapDefinition<any>): MapEvidencePayloadIdentity {
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

function assertCompleteRunCorrelation(def: MapDefinition<any>): void {
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

function resolveSeed(def: MapDefinition<any>): number {
  const seed = def.seed ?? GameplayMap.getRandomSeed();
  if (!Number.isFinite(seed)) {
    throw new Error(
      `${def.logPrefix ?? "[SWOOPER_MOD]"} Missing map seed (GameplayMap.getRandomSeed() returned non-finite).`
    );
  }
  return seed;
}

function resolveLatitudeBounds(
  def: MapDefinition<any>,
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
  def: MapDefinition<any>,
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

/**
 * Registers a Civ7 map entrypoint while keeping map authors on the recipe public config contract.
 *
 * Generation captures Civ7's initialization values, admits one physical setup, creates one context
 * from that setup, and compiles and runs the recipe against the same identity. This SDK authoring
 * API is runtime-bound and must only be imported by code that executes inside the Civ7 map loader.
 */
export function createMap<const TRecipe extends RecipeModule<any, any>>(
  def: MapDefinitionInput<TRecipe>
): MapDefinition<TRecipe> {
  assertCompleteRunCorrelation(def);
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

    const adapter = createCiv7Adapter();
    const setup = admitMapSetup({
      mapSeed: seed,
      dimensions: { width, height },
      latitudeBounds: { topLatitude, bottomLatitude },
    });

    const context = createMapContext({ setup, adapter });

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
      def.recipe.run(context, def.config, {
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
