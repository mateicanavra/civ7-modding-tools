import { oc } from "@orpc/contract";
import { type Static, Type } from "typebox";
import { Value } from "typebox/value";

import { studioRecoveryActionSchema } from "./errors/errorData.js";
import { runInGameErrors } from "./errors.js";
import {
  type DeepReadonly,
  freezeSnapshot,
  isPortableJsonValue,
  type MapConfigEnvelope,
  mapConfigEnvelopeSchema,
  snapshotMapConfigEnvelope,
} from "./mapConfigEnvelope.js";
import {
  RUN_IN_GAME_SAFE_FAILURE_CATEGORIES,
  type RunInGameSafeFailureCategory,
  runInGameSafeFailureCategory,
} from "./runInGamePublic.js";
import { contractSchema, unknownRecordSchema } from "./shared.js";

/**
 * `runInGame.*` namespace - launch and keyed mutation-state projection for
 * the run-current-config-in-Civ7 pipeline.
 *
 * Source of truth: audit/05-server-contracts.md endpoints #13 (status) and #14
 * (start). The package TypeBox schema is the public wire DTO authority; app
 * modules derive their operation-status types from this contract and keep only
 * UI formatting/presentation helpers locally.
 */

export const RUN_IN_GAME_PHASES = [
  "resolving-source",
  "generating-artifacts",
  "deploying",
  "preparing-civ7",
  "starting-game",
  "observing-runtime",
  "completed",
  "failed",
  "cancelled",
] as const;

export type RunInGamePhase = (typeof RUN_IN_GAME_PHASES)[number];

export type RunInGameOperationKind = "running" | "completed" | "failed" | "cancelled";

export const runInGamePhase = Type.Union([
  Type.Literal("resolving-source"),
  Type.Literal("generating-artifacts"),
  Type.Literal("deploying"),
  Type.Literal("preparing-civ7"),
  Type.Literal("starting-game"),
  Type.Literal("observing-runtime"),
  Type.Literal("completed"),
  Type.Literal("failed"),
  Type.Literal("cancelled"),
]);

export const runInGameOperationKind = Type.Union([
  Type.Literal("running"),
  Type.Literal("completed"),
  Type.Literal("failed"),
  Type.Literal("cancelled"),
]);

const runInGameRunningPhase = Type.Union([
  Type.Literal("resolving-source"),
  Type.Literal("generating-artifacts"),
  Type.Literal("deploying"),
  Type.Literal("preparing-civ7"),
  Type.Literal("starting-game"),
  Type.Literal("observing-runtime"),
]);

// RunInGameFileIdentity
export const fileIdentity = Type.Object(
  {
    path: Type.String(),
    sha256: Type.String(),
    sizeBytes: Type.Number(),
    mtimeMs: Type.Number(),
    mtimeIso: Type.String(),
  },
  { additionalProperties: false }
);
export type RunInGameFileIdentity = Static<typeof fileIdentity>;

export const contentMarkerEvidence = Type.Object(
  {
    id: Type.String(),
    marker: Type.String(),
    present: Type.Boolean(),
  },
  { additionalProperties: false }
);
export type RunInGameContentMarkerEvidence = Static<typeof contentMarkerEvidence>;

export const fileContentEvidence = Type.Object(
  {
    path: Type.String(),
    markers: Type.Array(contentMarkerEvidence),
  },
  { additionalProperties: false }
);
export type RunInGameFileContentEvidence = Static<typeof fileContentEvidence>;

/**
 * The external Run in Game source request. Catalog requests carry only an
 * indexed Swooper path; editor requests carry the complete portable envelope.
 */
export const runInGameStartSource = Type.Union([
  Type.Object(
    {
      kind: Type.Literal("catalog"),
      sourcePath: Type.String({ minLength: 1 }),
    },
    { additionalProperties: false }
  ),
  Type.Object(
    {
      kind: Type.Literal("editor"),
      editorSessionId: Type.String({ minLength: 1 }),
      canonicalConfig: mapConfigEnvelopeSchema,
    },
    { additionalProperties: false }
  ),
]);
/** Mutable source DTO accepted by the public oRPC start procedure. */
export type RunInGameStartSourceWire = Static<typeof runInGameStartSource>;

/** Frozen external source request retained only while server admission runs. */
export type RunInGameStartSource = DeepReadonly<RunInGameStartSourceWire>;

/**
 * The internal resolved source retained by manifests. Every variant carries a
 * snapshot because catalog bytes are resolved server-side before this type is
 * constructed.
 */
export const configSource = Type.Union([
  Type.Object(
    {
      kind: Type.Literal("catalog"),
      sourcePath: Type.String({ minLength: 1 }),
      canonicalConfig: mapConfigEnvelopeSchema,
    },
    { additionalProperties: false }
  ),
  Type.Object(
    {
      kind: Type.Literal("editor"),
      editorSessionId: Type.String({ minLength: 1 }),
      canonicalConfig: mapConfigEnvelopeSchema,
    },
    { additionalProperties: false }
  ),
]);
/** Mutable resolved-source DTO used only for manifest serialization. */
export type ConfigSourceWire = Static<typeof configSource>;

/** The immutable source snapshot retained after portable JSON admission. */
export type ConfigSource = DeepReadonly<ConfigSourceWire>;

/** Clones an immutable source snapshot into the TypeBox-derived oRPC DTO. */
export function serializeConfigSource(source: ConfigSource): ConfigSourceWire {
  return Value.Parse(configSource, Value.Clone(source));
}

/**
 * Produces the public start DTO without leaking catalog config bytes back over
 * the browser-to-server boundary.
 */
export function serializeRunInGameStartSource(source: ConfigSource): RunInGameStartSourceWire {
  return source.kind === "catalog"
    ? { kind: "catalog", sourcePath: source.sourcePath }
    : Value.Parse(runInGameStartSource, Value.Clone(source));
}

/** Provenance retained after the envelope leaves the source boundary. */
export const configSourceProvenance = Type.Union([
  Type.Object(
    {
      kind: Type.Literal("catalog"),
      sourcePath: Type.String({ minLength: 1 }),
    },
    { additionalProperties: false }
  ),
  Type.Object(
    {
      kind: Type.Literal("editor"),
      editorSessionId: Type.String({ minLength: 1 }),
    },
    { additionalProperties: false }
  ),
]);
export type ConfigSourceProvenance =
  | Readonly<{ kind: "catalog"; sourcePath: string }>
  | Readonly<{ kind: "editor"; editorSessionId: string }>;

// RunInGameSourceSnapshotEvidence
export const sourceSnapshotEvidence = Type.Object(
  {
    requestId: Type.String(),
    source: configSourceProvenance,
    canonicalConfigDigest: Type.String(),
    launchEnvelopeDigest: Type.String(),
  },
  { additionalProperties: false }
);
export type RunInGameSourceSnapshotEvidence = DeepReadonly<Static<typeof sourceSnapshotEvidence>>;

/**
 * Private diagnostics/evidence evidence for how a Run in Game request became a
 * concrete map script. This schema intentionally admits absolute generated-mod
 * paths and tree digests, so it must stay behind diagnostics lookup and must
 * never be projected into public status.
 */
export const materializationStatus = Type.Object(
  {
    path: Type.Optional(Type.String()),
    mapScript: Type.Optional(Type.String()),
    canonicalConfigDigest: Type.Optional(Type.String()),
    launchEnvelopeDigest: Type.Optional(Type.String()),
    generationManifestDigest: Type.Optional(Type.String()),
    runArtifactId: Type.Optional(Type.String()),
    generatedModRoot: Type.Optional(Type.String()),
    generatedModFileCount: Type.Optional(Type.Number()),
    generatedModDigest: Type.Optional(Type.String()),
    mapRowId: Type.Optional(Type.String()),
    sourceConfig: Type.Optional(fileIdentity),
    generatedSourceScript: Type.Optional(fileIdentity),
    localModScript: Type.Optional(fileIdentity),
    deployedModScript: Type.Optional(fileIdentity),
    localModScriptContent: Type.Optional(fileContentEvidence),
    deployedModScriptContent: Type.Optional(fileContentEvidence),
  },
  { additionalProperties: false }
);
export type RunInGameMaterializationStatus = Static<typeof materializationStatus>;

export const setupOptionValue = Type.Union([Type.String(), Type.Number(), Type.Boolean()]);
export type RunInGameSetupOptionValue = Static<typeof setupOptionValue>;

export const savedSetupConfigRef = Type.Object(
  {
    id: Type.String(),
    displayName: Type.String(),
    fileName: Type.String(),
    path: Type.String(),
  },
  { additionalProperties: false }
);
export type RunInGameSavedSetupConfigRef = Static<typeof savedSetupConfigRef>;

export const playerSetupConfig = Type.Object(
  {
    playerId: Type.Number(),
    options: Type.Record(Type.String(), setupOptionValue),
  },
  { additionalProperties: false }
);
export type RunInGamePlayerSetupConfig = Static<typeof playerSetupConfig>;

export const setupConfig = Type.Object(
  {
    savedConfig: Type.Optional(savedSetupConfigRef),
    mapScript: Type.Optional(Type.String()),
    gameOptions: Type.Record(Type.String(), setupOptionValue),
    playerOptions: Type.Array(playerSetupConfig),
  },
  { additionalProperties: false }
);
export type RunInGameSetupConfig = DeepReadonly<Static<typeof setupConfig>>;

export const STUDIO_CURRENT_CONFIG_ID = "studio-current";

export const runInGameWorldSettings = Type.Object(
  {
    mapSize: Type.String({ minLength: 1 }),
    playerCount: Type.Optional(Type.Integer()),
    resources: Type.Optional(Type.String()),
  },
  { additionalProperties: false }
);
export type RunInGameWorldSettings = Readonly<{
  mapSize: string;
  playerCount?: number;
  resources?: string;
}>;

export const runInGameRecipeSettings = Type.Object(
  {
    preset: Type.Optional(Type.String()),
    recipe: Type.String({ minLength: 1 }),
    seed: Type.Union([Type.Number(), Type.String()]),
  },
  { additionalProperties: false }
);
export type RunInGameRecipeSettings = Readonly<{
  preset?: string;
  recipe: string;
  seed: number | string;
}>;

export const launchEnvelope = Type.Object(
  {
    recipeSettings: runInGameRecipeSettings,
    worldSettings: runInGameWorldSettings,
    setupConfig,
    source: configSource,
  },
  { additionalProperties: false }
);
/**
 * The runtime snapshot is deliberately separate from TypeBox's mutable wire
 * static type. TypeBox owns structural validation; this type owns the frozen
 * value that crosses the Studio/Swooper admission boundary.
 */
export type LaunchEnvelope = Readonly<{
  recipeSettings: RunInGameRecipeSettings;
  worldSettings: RunInGameWorldSettings;
  setupConfig: RunInGameSetupConfig;
  source: ConfigSource;
}>;

export const launchSourceDigest = Type.Object(
  {
    canonicalConfigDigest: Type.String(),
  },
  { additionalProperties: false }
);
export type LaunchSourceDigest = DeepReadonly<Static<typeof launchSourceDigest>>;
export type LaunchEnvelopeDigest = string;

/**
 * Clones and freezes the external source request without assigning recipe
 * semantics. Catalog paths deliberately remain config-free here.
 */
export function snapshotRunInGameStartSource(value: unknown): RunInGameStartSource | undefined {
  if (!isPortableJsonValue(value) || !Value.Check(runInGameStartSource, value)) return undefined;

  const kind = ownDataProperty(value, "kind");
  if (kind === "catalog") {
    const sourcePath = ownDataProperty(value, "sourcePath");
    return typeof sourcePath === "string" ? freezeSnapshot({ kind, sourcePath }) : undefined;
  }
  if (kind === "editor") {
    const editorSessionId = ownDataProperty(value, "editorSessionId");
    const canonicalConfig = snapshotMapConfigEnvelope(ownDataProperty(value, "canonicalConfig"));
    return typeof editorSessionId === "string" && canonicalConfig !== undefined
      ? freezeSnapshot({ kind, editorSessionId, canonicalConfig })
      : undefined;
  }
  return undefined;
}

/**
 * Clones and freezes an internal resolved source. This is manifest-only data:
 * both variants have a complete envelope after server-side catalog resolution.
 */
export function snapshotConfigSource(value: unknown): ConfigSource | undefined {
  if (!isPortableJsonValue(value) || !Value.Check(configSource, value)) return undefined;

  const kind = ownDataProperty(value, "kind");
  const canonicalConfig = snapshotMapConfigEnvelope(ownDataProperty(value, "canonicalConfig"));
  if (canonicalConfig === undefined) return undefined;

  if (kind === "catalog") {
    const sourcePath = ownDataProperty(value, "sourcePath");
    return typeof sourcePath === "string"
      ? freezeSnapshot({ kind, sourcePath, canonicalConfig })
      : undefined;
  }
  if (kind === "editor") {
    const editorSessionId = ownDataProperty(value, "editorSessionId");
    return typeof editorSessionId === "string"
      ? freezeSnapshot({ kind, editorSessionId, canonicalConfig })
      : undefined;
  }
  return undefined;
}

/** Creates an immutable launch envelope from the admitted source and normalized settings. */
export function snapshotLaunchEnvelope(
  args: Readonly<{
    recipeSettings: RunInGameRecipeSettings;
    worldSettings: RunInGameWorldSettings;
    setupConfig: RunInGameSetupConfig;
    source: ConfigSource;
  }>
): LaunchEnvelope {
  const source = snapshotConfigSource(args.source);
  if (source === undefined) {
    throw new TypeError("Run in Game launch source must be a portable config snapshot.");
  }
  const snapshot = {
    recipeSettings: {
      ...(args.recipeSettings.preset === undefined ? {} : { preset: args.recipeSettings.preset }),
      recipe: args.recipeSettings.recipe,
      seed: args.recipeSettings.seed,
    },
    worldSettings: {
      mapSize: args.worldSettings.mapSize,
      ...(args.worldSettings.playerCount === undefined
        ? {}
        : { playerCount: args.worldSettings.playerCount }),
      ...(args.worldSettings.resources === undefined
        ? {}
        : { resources: args.worldSettings.resources }),
    },
    setupConfig: snapshotRunInGameSetupConfig(args.setupConfig),
    source,
  };
  freezeSnapshot(snapshot);
  return snapshot;
}

/** Creates a frozen provenance-only source evidence input. */
export function snapshotConfigSourceProvenance(value: unknown): ConfigSourceProvenance | undefined {
  if (!isPortableJsonValue(value) || !Value.Check(configSourceProvenance, value)) {
    return undefined;
  }
  const kind = ownDataProperty(value, "kind");
  if (kind === "catalog") {
    const sourcePath = ownDataProperty(value, "sourcePath");
    return typeof sourcePath === "string" ? freezeSnapshot({ kind, sourcePath }) : undefined;
  }
  if (kind === "editor") {
    const editorSessionId = ownDataProperty(value, "editorSessionId");
    return typeof editorSessionId === "string"
      ? freezeSnapshot({ kind, editorSessionId })
      : undefined;
  }
  return undefined;
}

/** Used by the actual TypeBox Standard Schema adapter before it invokes TypeBox. */
export function runInGameStartPortableInputIssue(value: unknown): string | undefined {
  const source = ownDataProperty(value, "source");
  return snapshotRunInGameStartSource(source) === undefined
    ? "runInGame.start source must be a catalog path or a complete editor config envelope."
    : undefined;
}

function snapshotRunInGameSetupConfig(
  value: RunInGameSetupConfig
): DeepReadonly<RunInGameSetupConfig> {
  const gameOptions: Record<string, RunInGameSetupOptionValue> = {};
  for (const key of Object.keys(value.gameOptions)) gameOptions[key] = value.gameOptions[key];

  return freezeSnapshot({
    ...(value.savedConfig === undefined
      ? {}
      : {
          savedConfig: {
            id: value.savedConfig.id,
            displayName: value.savedConfig.displayName,
            fileName: value.savedConfig.fileName,
            path: value.savedConfig.path,
          },
        }),
    ...(value.mapScript === undefined ? {} : { mapScript: value.mapScript }),
    gameOptions,
    playerOptions: value.playerOptions.map((player) => {
      const options: Record<string, RunInGameSetupOptionValue> = {};
      for (const key of Object.keys(player.options)) options[key] = player.options[key];
      return { playerId: player.playerId, options };
    }),
  });
}

function ownDataProperty(value: unknown, key: string): unknown {
  if (value === null || typeof value !== "object") return undefined;
  try {
    const descriptor = Object.getOwnPropertyDescriptor(value, key);
    return descriptor !== undefined && "value" in descriptor ? descriptor.value : undefined;
  } catch {
    return undefined;
  }
}

/** Returns a fresh, deeply frozen setup snapshot for callers that need defaults. */
export function createDefaultRunInGameSetupConfig(): RunInGameSetupConfig {
  return snapshotRunInGameSetupConfig({
    gameOptions: {},
    playerOptions: [{ playerId: 0, options: {} }],
  });
}

export const RUN_IN_GAME_MAIN_GAME_OPTION_IDS = [
  "Difficulty",
  "GameSpeeds",
  "StartPosition",
  "AgeTransitionSetting",
  "DisasterIntensity",
  "IndependentHostility",
  "AgeLength",
  "AgeCountdownTimer",
] as const;

export const RUN_IN_GAME_CUSTOM_DIFFICULTY_OPTION_IDS = [
  "DifficultyIndependentsCombat",
  "DifficultyCombat",
  "DifficultyArmyXP",
  "DifficultyUnitProduction",
  "DifficultyBuildingProduction",
  "DifficultyFreeStuff",
  "DifficultyGold",
  "DifficultyScience",
  "DifficultyCulture",
  "DifficultyHappiness",
  "DifficultyTechCost",
  "DifficultyCivicCost",
  "DifficultyOceanDamage",
] as const;

export const RUN_IN_GAME_PLAYER_OPTION_IDS = [
  "PlayerLeader",
  "PlayerCivilization",
  "PlayerDifficulty",
] as const;

const RUN_IN_GAME_GAME_OPTION_ID_SET = new Set<string>([
  ...RUN_IN_GAME_MAIN_GAME_OPTION_IDS,
  ...RUN_IN_GAME_CUSTOM_DIFFICULTY_OPTION_IDS,
]);

const RUN_IN_GAME_PLAYER_OPTION_ID_SET = new Set<string>(RUN_IN_GAME_PLAYER_OPTION_IDS);

export type RunInGameSetupConfigValidation =
  | Readonly<{ ok: true; value: RunInGameSetupConfig }>
  | Readonly<{
      ok: false;
      message: string;
      diagnostics: Readonly<{
        code: "run-in-game-map-script-invalid";
        field: "setupConfig.mapScript";
      }>;
    }>;

export function normalizeRunInGameSetupConfig(value: unknown): RunInGameSetupConfig {
  const validated = validateRunInGameSetupConfig(value);
  if (!validated.ok) return createDefaultRunInGameSetupConfig();
  return validated.value;
}

export function validateRunInGameSetupConfig(value: unknown): RunInGameSetupConfigValidation {
  if (!isRecord(value)) return { ok: true, value: createDefaultRunInGameSetupConfig() };
  const mapScript = normalizeSetupMapScript(value.mapScript);
  if (!mapScript.ok) {
    return {
      ok: false,
      message: "Run in Game setupConfig.mapScript must be a non-empty single-line string.",
      diagnostics: {
        code: "run-in-game-map-script-invalid",
        field: "setupConfig.mapScript",
      },
    };
  }
  const savedConfig = normalizeSavedConfigRef(value.savedConfig);
  return {
    ok: true,
    value: snapshotRunInGameSetupConfig({
      ...(savedConfig === undefined ? {} : { savedConfig }),
      ...(mapScript.value === undefined ? {} : { mapScript: mapScript.value }),
      gameOptions: normalizeSetupOptions(value.gameOptions, RUN_IN_GAME_GAME_OPTION_ID_SET),
      playerOptions: normalizePlayerOptions(value.playerOptions),
    }),
  };
}

type MapScriptNormalization =
  | Readonly<{ ok: true; value: string | undefined }>
  | Readonly<{ ok: false }>;

function normalizeSetupMapScript(value: unknown): MapScriptNormalization {
  if (value === undefined || value === null) return { ok: true, value: undefined };
  if (typeof value !== "string") return { ok: true, value: undefined };
  if (value.trim().length === 0 || /[\n\r\0]/.test(value)) return { ok: false };
  return { ok: true, value };
}

function normalizeSavedConfigRef(value: unknown): RunInGameSetupConfig["savedConfig"] | undefined {
  if (!isRecord(value)) return undefined;
  if (
    typeof value.id !== "string" ||
    typeof value.displayName !== "string" ||
    typeof value.fileName !== "string" ||
    typeof value.path !== "string" ||
    value.fileName.length === 0 ||
    value.path.length === 0
  ) {
    return undefined;
  }
  return {
    id: value.id,
    displayName: value.displayName,
    fileName: value.fileName,
    path: value.path,
  };
}

function normalizePlayerOptions(value: unknown): RunInGameSetupConfig["playerOptions"] {
  if (!Array.isArray(value)) return defaultRunInGamePlayerOptions();
  const players: Array<{
    playerId: number;
    options: Record<string, RunInGameSetupOptionValue>;
  }> = [];
  for (const entry of value) {
    if (!isRecord(entry)) continue;
    const playerId = Number(entry.playerId);
    if (!Number.isInteger(playerId) || playerId < 0 || playerId > 64) continue;
    players.push({
      playerId,
      options: normalizeSetupOptions(entry.options, RUN_IN_GAME_PLAYER_OPTION_ID_SET),
    });
  }
  return players.length > 0 ? players : defaultRunInGamePlayerOptions();
}

function defaultRunInGamePlayerOptions(): RunInGameSetupConfig["playerOptions"] {
  return [{ playerId: 0, options: {} }];
}

function normalizeSetupOptions(
  value: unknown,
  allowedIds: ReadonlySet<string>
): Record<string, RunInGameSetupOptionValue> {
  if (!isRecord(value)) return {};
  const out: Record<string, RunInGameSetupOptionValue> = {};
  for (const [key, entry] of Object.entries(value)) {
    if (!allowedIds.has(key)) continue;
    if (typeof entry === "string" || typeof entry === "number" || typeof entry === "boolean") {
      out[key] = entry;
    }
  }
  return out;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

// RunInGameRequestStatus
export const requestStatus = Type.Object(
  {
    recipeId: Type.Optional(Type.String()),
    seed: Type.Optional(Type.Number()),
    mapSize: Type.Optional(Type.String()),
    playerCount: Type.Optional(Type.Number()),
    resources: Type.Optional(Type.String()),
    setupConfig: Type.Optional(setupConfig),
    setupConfigSource: Type.Optional(Type.String()),
    sourceSnapshot: Type.Optional(sourceSnapshotEvidence),
    launchSourceDigest: Type.Optional(launchSourceDigest),
    launchEnvelopeDigest: Type.Optional(Type.String()),
  },
  { additionalProperties: false }
);
export type RunInGameRequestStatus = DeepReadonly<Static<typeof requestStatus>>;

// RunInGameFailureDetails - private legacy diagnostics shape. It is not part of
// the public Run in Game status wire contract.
export const failureDetails = Type.Object(
  {
    failureClass: Type.Optional(Type.String()),
    code: Type.Optional(Type.String()),
    phase: Type.Optional(runInGamePhase),
    mapScript: Type.Optional(Type.String()),
    materialization: Type.Optional(materializationStatus),
    materializationSummary: Type.Optional(Type.String()),
    reloadRequired: Type.Optional(Type.Boolean()),
    reloadBoundary: Type.Optional(Type.String()),
    reloadAttempted: Type.Optional(Type.Boolean()),
    dismissNotificationRequired: Type.Optional(Type.Boolean()),
    recoveryBoundary: Type.Optional(Type.String()),
    recoveryHint: Type.Optional(Type.String()),
    completedPhases: Type.Optional(Type.Array(runInGamePhase)),
    directControlCode: Type.Optional(Type.String()),
    cause: Type.Optional(Type.Unknown()),
  },
  { additionalProperties: Type.Unknown() }
);
export type RunInGameFailureDetails = Static<typeof failureDetails> &
  Readonly<Record<string, unknown>>;

const exactAuthorshipRequestEvidence = Type.Object(
  {
    recipeId: Type.String(),
    seed: Type.Number(),
    mapSize: Type.String(),
    playerCount: Type.Optional(Type.Number()),
    resources: Type.Optional(Type.String()),
    setupConfigSource: Type.Optional(Type.String()),
  },
  { additionalProperties: false }
);

const partialExactAuthorshipRequestEvidence = Type.Partial(exactAuthorshipRequestEvidence);

const exactAuthorshipCivSetupEvidence = Type.Object(
  {
    mapScript: Type.String(),
    mapSize: Type.Unknown(),
    mapSeed: Type.Unknown(),
    gameSeed: Type.Unknown(),
    playerCount: Type.Optional(Type.Unknown()),
    rowCount: Type.Number(),
  },
  { additionalProperties: Type.Unknown() }
);

const partialExactAuthorshipCivSetupEvidence = Type.Partial(exactAuthorshipCivSetupEvidence);

const exactAuthorshipRuntimeEvidence = Type.Object(
  {
    seed: Type.Number(),
    width: Type.Number(),
    height: Type.Number(),
    plotCount: Type.Number(),
    turn: Type.Number(),
    gameHash: Type.Number(),
    sourceSnapshotId: Type.String(),
    snapshotHash: Type.String(),
  },
  { additionalProperties: Type.Unknown() }
);

const partialExactAuthorshipRuntimeEvidence = Type.Partial(exactAuthorshipRuntimeEvidence);

const exactAuthorshipLogEvidence = Type.Object(
  {
    logPath: Type.Optional(Type.String()),
    observedAt: Type.Optional(Type.String()),
    requestId: Type.String(),
    canonicalConfigDigest: Type.String(),
    launchEnvelopeDigest: Type.String(),
    seed: Type.Number(),
    mapSize: Type.Optional(Type.String()),
    dimensions: Type.Object(
      {
        width: Type.Number(),
        height: Type.Number(),
      },
      { additionalProperties: false }
    ),
    evidencePayload: Type.Unknown(),
    completionPayload: Type.Unknown(),
    matched: Type.Array(Type.String()),
  },
  { additionalProperties: Type.Unknown() }
);

const completeExactAuthorshipMaterializationEvidence = Type.Object(
  {
    ...materializationStatus.properties,
    mapScript: Type.String(),
    canonicalConfigDigest: Type.String(),
    launchEnvelopeDigest: Type.String(),
    generationManifestDigest: Type.String(),
    runArtifactId: Type.String(),
    generatedModRoot: Type.String(),
    generatedModFileCount: Type.Number(),
    generatedModDigest: Type.String(),
    mapRowId: Type.String(),
    localModScript: fileIdentity,
    deployedModScript: fileIdentity,
    localModScriptContent: fileContentEvidence,
    deployedModScriptContent: fileContentEvidence,
  },
  { additionalProperties: false }
);

/**
 * Exact authorship is a closed state space. Complete evidence has every
 * manifest-backed source, materialization, setup, runtime, and log fact and no
 * unresolved links. Unresolved evidence retains partial evidence and at least one
 * explicit missing or mismatched link.
 */
export const exactAuthorshipEvidence = Type.Union([
  Type.Object(
    {
      status: Type.Literal("complete"),
      requestId: Type.String(),
      createdAt: Type.String(),
      sourceSnapshot: sourceSnapshotEvidence,
      request: exactAuthorshipRequestEvidence,
      materialization: completeExactAuthorshipMaterializationEvidence,
      civSetup: exactAuthorshipCivSetupEvidence,
      runtime: exactAuthorshipRuntimeEvidence,
      log: exactAuthorshipLogEvidence,
      unresolvedLinks: Type.Tuple([]),
    },
    { additionalProperties: false }
  ),
  Type.Object(
    {
      status: Type.Literal("unresolved"),
      requestId: Type.String(),
      createdAt: Type.String(),
      sourceSnapshot: Type.Optional(sourceSnapshotEvidence),
      request: partialExactAuthorshipRequestEvidence,
      materialization: materializationStatus,
      civSetup: partialExactAuthorshipCivSetupEvidence,
      runtime: partialExactAuthorshipRuntimeEvidence,
      log: Type.Optional(unknownRecordSchema),
      unresolvedLinks: Type.Array(Type.String(), { minItems: 1 }),
    },
    { additionalProperties: false }
  ),
]);
export type RunInGameExactAuthorshipEvidence = DeepReadonly<Static<typeof exactAuthorshipEvidence>>;

/** Parses and freezes the single exact-authorship shape shared by builders and readers. */
export function snapshotRunInGameExactAuthorshipEvidence(
  value: unknown
): DeepReadonly<RunInGameExactAuthorshipEvidence> | undefined {
  if (!isPortableJsonValue(value) || !Value.Check(exactAuthorshipEvidence, value)) return undefined;
  return freezeSnapshot(Value.Parse(exactAuthorshipEvidence, Value.Clone(value)));
}

const publicRunStatusBaseFields = {
  requestId: Type.String(),
  diagnosticsId: Type.Optional(Type.String()),
  recoveryActions: Type.Array(studioRecoveryActionSchema),
} as const;

/**
 * The only public Run in Game operation projection.
 *
 * Status is the discriminant: running statuses can only expose live phases,
 * successful terminals can only expose `completed`, and abnormal terminals must
 * carry a safe public failure category. Private diagnostics, paths, commands,
 * attribution, source snapshots, generated artifacts, and raw errors are served
 * only through explicit diagnostics lookup.
 */
export const publicRunStatusTypeSchema = Type.Union([
  Type.Object(
    {
      ...publicRunStatusBaseFields,
      status: Type.Literal("running"),
      phase: runInGameRunningPhase,
    },
    { additionalProperties: false }
  ),
  Type.Object(
    {
      ...publicRunStatusBaseFields,
      status: Type.Literal("completed"),
      phase: Type.Literal("completed"),
    },
    { additionalProperties: false }
  ),
  Type.Object(
    {
      ...publicRunStatusBaseFields,
      status: Type.Literal("failed"),
      phase: Type.Literal("failed"),
      safeFailureCategory: runInGameSafeFailureCategory,
    },
    { additionalProperties: false }
  ),
  Type.Object(
    {
      ...publicRunStatusBaseFields,
      status: Type.Literal("cancelled"),
      phase: Type.Literal("cancelled"),
      safeFailureCategory: runInGameSafeFailureCategory,
    },
    { additionalProperties: false }
  ),
]);
export type PublicRunStatus = Static<typeof publicRunStatusTypeSchema>;

// Canonical operation status export for callers that consume the public Run in
// Game status DTO. The schema does not carry private diagnostics fields.
export const operationStatusTypeSchema = publicRunStatusTypeSchema;
export type RunInGameOperationStatus = Static<typeof operationStatusTypeSchema>;

export const operationStatusSchema = contractSchema(operationStatusTypeSchema);

const requestIdInputSchema = contractSchema(
  Type.Object(
    {
      requestId: Type.String({ minLength: 1 }),
    },
    { additionalProperties: false }
  ),
  { cleanUnknownProperties: false }
);

export const runDiagnosticsRecordSchema = Type.Object(
  {
    diagnosticsId: Type.String(),
    requestId: Type.String(),
    operationRevision: Type.Optional(Type.Number()),
    createdAt: Type.String(),
    updatedAt: Type.String(),
    summary: Type.Optional(Type.String()),
    sections: Type.Record(Type.String(), Type.Unknown()),
  },
  { additionalProperties: false }
);
export type RunDiagnosticsRecord = Static<typeof runDiagnosticsRecordSchema>;

export const diagnosticsLookupResultSchema = Type.Union([
  Type.Object(
    {
      ok: Type.Literal(true),
      diagnostics: runDiagnosticsRecordSchema,
    },
    { additionalProperties: false }
  ),
  Type.Object(
    {
      ok: Type.Literal(false),
      diagnosticsId: Type.String(),
      reason: Type.Union([Type.Literal("not-found"), Type.Literal("unavailable")]),
    },
    { additionalProperties: false }
  ),
]);
export type RunDiagnosticsLookupResult = Static<typeof diagnosticsLookupResultSchema>;

// ---------------------------------------------------------------------------
// #13 runInGame.status - keyed mutation-state read by requestId.
// ---------------------------------------------------------------------------
// Input: requestId (REQUIRED). Success: PublicRunStatus projection.
// Missing or expired request ids map to a declared safe lifecycle error. A
// durable non-terminal record from a prior daemon terminalizes as a public
// ownership failure instead of making the client infer ownership loss from an
// empty in-memory registry or public daemon identity.
export const status = oc
  .errors(runInGameErrors)
  .input(requestIdInputSchema)
  .output(operationStatusSchema);

// ---------------------------------------------------------------------------
// runInGame.cancel - explicit operation cancellation by requestId.
// ---------------------------------------------------------------------------
// HTTP disconnects and browser aborts are transport events, not cancellation.
// This command is the only public cancellation surface: active operations
// terminalize as `cancelled`; terminal operations return their existing public
// status; unknown request ids map to the declared safe not-found error.
export const cancel = oc
  .errors(runInGameErrors)
  .input(requestIdInputSchema)
  .output(operationStatusSchema);

/**
 * Explicit private diagnostics lookup. Public Run in Game status exposes only a
 * diagnostics id; callers must opt into this command to retrieve internal paths,
 * private attribution reports, generated artifact metadata, and bounded failure
 * details.
 */
export const diagnostics = oc
  .input(
    contractSchema(
      Type.Object(
        {
          diagnosticsId: Type.String({ minLength: 1 }),
        },
        { additionalProperties: false }
      ),
      { cleanUnknownProperties: false }
    )
  )
  .output(contractSchema(diagnosticsLookupResultSchema));

// ---------------------------------------------------------------------------
// #14 runInGame.start - accepted operation start.
// ---------------------------------------------------------------------------
// Body: one closed launch source plus launch settings. Success: PublicRunStatus
// (async). Each accepted click owns a fresh request id; control correlation uses
// request, deployment, and run-artifact identity rather than content digests.
// Errors: 409 (run-in-game OR save/deploy active), 400/500/503 via declared
// RUN_IN_GAME_* codes whose data is limited to safe category/recovery fields.
// Runtime internals, source snapshots, materialization, evidence, and raw messages
// belong behind explicit diagnostics lookup, never this public procedure.
//
// SECURITY BOUNDARY (target-arch section 1): the TypeBox contract keeps the
// public input closed, while the host validator scans the canonical source and
// setup values for raw-control vocabulary before any workflow port runs. The
// package operation runtime owns structural request admission and source
// resolution; host ports supply indexed Swooper catalog reads and Standard
// semantic admission.
export const start = oc
  .errors(runInGameErrors)
  .input(
    contractSchema(
      Type.Object(
        {
          source: runInGameStartSource,
          recipeSettings: runInGameRecipeSettings,
          worldSettings: runInGameWorldSettings,
          setupConfig: Type.Optional(Type.Unknown()),
        },
        { additionalProperties: false }
      ),
      {
        cleanUnknownProperties: false,
        precheck: runInGameStartPortableInputIssue,
      }
    )
  )
  .output(operationStatusSchema);
