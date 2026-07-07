import { oc } from "@orpc/contract";
import { type Static, Type } from "typebox";

import { studioRecoveryActionSchema } from "./errors/errorData.js";
import { runInGameErrors } from "./errors.js";
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

export const contentMarkerProof = Type.Object(
  {
    id: Type.String(),
    marker: Type.String(),
    present: Type.Boolean(),
  },
  { additionalProperties: false }
);
export type RunInGameContentMarkerProof = Static<typeof contentMarkerProof>;

export const fileContentProof = Type.Object(
  {
    path: Type.String(),
    markers: Type.Array(contentMarkerProof),
  },
  { additionalProperties: false }
);
export type RunInGameFileContentProof = Static<typeof fileContentProof>;

// RunInGameSourceSnapshotProof
export const sourceSnapshotProof = Type.Object(
  {
    identityHash: Type.String(),
    requestId: Type.String(),
    recipeSettings: Type.Optional(Type.Unknown()),
    worldSettings: Type.Optional(Type.Unknown()),
    pipelineConfig: Type.Optional(Type.Unknown()),
    setupConfig: Type.Optional(Type.Unknown()),
    materializationMode: Type.Optional(Type.String()),
    selectedConfig: Type.Optional(Type.Unknown()),
    configHash: Type.Optional(Type.String()),
    envelopeHash: Type.Optional(Type.String()),
  },
  { additionalProperties: false }
);
export type RunInGameSourceSnapshotProof = Static<typeof sourceSnapshotProof>;

// RunInGameMaterializationStatus
export const materializationStatus = Type.Object(
  {
    mode: Type.Optional(Type.String()),
    path: Type.Optional(Type.String()),
    mapScript: Type.Optional(Type.String()),
    configHash: Type.Optional(Type.String()),
    envelopeHash: Type.Optional(Type.String()),
    sourceConfig: Type.Optional(fileIdentity),
    generatedSourceScript: Type.Optional(fileIdentity),
    localModScript: Type.Optional(fileIdentity),
    deployedModScript: Type.Optional(fileIdentity),
    localModScriptContent: Type.Optional(fileContentProof),
    deployedModScriptContent: Type.Optional(fileContentProof),
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
export type RunInGameSetupConfig = Static<typeof setupConfig>;

export const DEFAULT_RUN_IN_GAME_SETUP_CONFIG: RunInGameSetupConfig = {
  gameOptions: {},
  playerOptions: [{ playerId: 0, options: {} }],
};

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
  if (!validated.ok) return DEFAULT_RUN_IN_GAME_SETUP_CONFIG;
  return validated.value;
}

export function validateRunInGameSetupConfig(value: unknown): RunInGameSetupConfigValidation {
  if (!isRecord(value)) return { ok: true, value: DEFAULT_RUN_IN_GAME_SETUP_CONFIG };
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
    value: {
      ...(savedConfig === undefined ? {} : { savedConfig }),
      ...(mapScript.value === undefined ? {} : { mapScript: mapScript.value }),
      gameOptions: normalizeSetupOptions(value.gameOptions, RUN_IN_GAME_GAME_OPTION_ID_SET),
      playerOptions: normalizePlayerOptions(value.playerOptions),
    },
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
  if (!Array.isArray(value)) return DEFAULT_RUN_IN_GAME_SETUP_CONFIG.playerOptions;
  const players: RunInGameSetupConfig["playerOptions"] = [];
  for (const entry of value) {
    if (!isRecord(entry)) continue;
    const playerId = Number(entry.playerId);
    if (!Number.isInteger(playerId) || playerId < 0 || playerId > 64) continue;
    players.push({
      playerId,
      options: normalizeSetupOptions(entry.options, RUN_IN_GAME_PLAYER_OPTION_ID_SET),
    });
  }
  return players.length > 0 ? players : DEFAULT_RUN_IN_GAME_SETUP_CONFIG.playerOptions;
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
    selectedConfigId: Type.Optional(Type.String()),
    setupConfig: Type.Optional(setupConfig),
    setupConfigSource: Type.Optional(Type.String()),
    materializationMode: Type.Optional(Type.String()),
    restartCivProcess: Type.Optional(Type.Boolean()),
    fingerprint: Type.Optional(Type.String()),
    sourceSnapshot: Type.Optional(sourceSnapshotProof),
  },
  { additionalProperties: false }
);
export type RunInGameRequestStatus = Static<typeof requestStatus>;

// RunInGameProcessRestartStatus - { command?, launchAttempts?, [key]: unknown }
export const processRestartStatus = Type.Object(
  {
    command: Type.Optional(Type.String()),
    launchAttempts: Type.Optional(Type.Unknown()),
  },
  { additionalProperties: Type.Unknown() }
);
export type RunInGameProcessRestartStatus = Static<typeof processRestartStatus> &
  Readonly<Record<string, unknown>>;

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

// RunInGameExactAuthorshipProof - large nested proof. The `log` sub-tree is deep
// and opaque (proof markers, per-domain stats) - modelled permissively; the stable
// top-level shape (status/requestId/createdAt/request/materialization/civSetup/
// runtime/unresolvedLinks) is reproduced.
export const exactAuthorshipProof = Type.Object(
  {
    status: Type.Union([Type.Literal("complete"), Type.Literal("unresolved")]),
    requestId: Type.String(),
    createdAt: Type.String(),
    sourceSnapshot: Type.Optional(sourceSnapshotProof),
    request: Type.Object(
      {
        recipeId: Type.Optional(Type.String()),
        seed: Type.Optional(Type.Number()),
        mapSize: Type.Optional(Type.String()),
        playerCount: Type.Optional(Type.Number()),
        resources: Type.Optional(Type.String()),
        selectedConfigId: Type.Optional(Type.String()),
        setupConfigSource: Type.Optional(Type.String()),
        fingerprint: Type.Optional(Type.String()),
      },
      { additionalProperties: false }
    ),
    materialization: materializationStatus,
    civSetup: Type.Object(
      {
        mapScript: Type.Optional(Type.String()),
        mapSize: Type.Optional(Type.Unknown()),
        mapSeed: Type.Optional(Type.Unknown()),
        gameSeed: Type.Optional(Type.Unknown()),
        playerCount: Type.Optional(Type.Unknown()),
        rowCount: Type.Optional(Type.Number()),
      },
      { additionalProperties: Type.Unknown() }
    ),
    runtime: Type.Object(
      {
        seed: Type.Optional(Type.Number()),
        width: Type.Optional(Type.Number()),
        height: Type.Optional(Type.Number()),
        plotCount: Type.Optional(Type.Number()),
        turn: Type.Optional(Type.Number()),
        gameHash: Type.Optional(Type.Number()),
        sourceSnapshotId: Type.Optional(Type.String()),
        snapshotHash: Type.Optional(Type.String()),
      },
      { additionalProperties: Type.Unknown() }
    ),
    // RunInGameExactAuthorshipProof["log"] - deep proof payload. Opaque (see shared.ts).
    log: Type.Optional(unknownRecordSchema),
    unresolvedLinks: Type.Array(Type.String()),
  },
  { additionalProperties: false }
);
export type RunInGameExactAuthorshipProof = Static<typeof exactAuthorshipProof>;

const publicRunStatusBaseFields = {
    requestId: Type.String(),
    diagnosticsId: Type.Optional(Type.String()),
    recoveryActions: Type.Array(studioRecoveryActionSchema),
    createdAt: Type.String(),
    updatedAt: Type.String(),
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
      terminalAt: Type.String(),
    },
    { additionalProperties: false }
  ),
  Type.Object(
    {
      ...publicRunStatusBaseFields,
      status: Type.Literal("failed"),
      phase: Type.Literal("failed"),
      safeFailureCategory: runInGameSafeFailureCategory,
      terminalAt: Type.String(),
    },
    { additionalProperties: false }
  ),
  Type.Object(
    {
      ...publicRunStatusBaseFields,
      status: Type.Literal("cancelled"),
      phase: Type.Literal("cancelled"),
      safeFailureCategory: runInGameSafeFailureCategory,
      terminalAt: Type.String(),
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

export const runDiagnosticsRecordSchema = Type.Object(
  {
    diagnosticsId: Type.String(),
    requestId: Type.Optional(Type.String()),
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
// Missing/expired/identity-mismatched requests map to declared D3 lifecycle
// errors with daemon identity data.
//
// PARITY INVARIANT (audit/05 #13, target-arch section 1): the 404 echoes
// `serverInstanceId`/`serverStartedAt` so the client detects a server restart that
// lost the op. TTL pruning (30min) -> pruned op yields 404. The miss is the defined
// `RUN_IN_GAME_STATUS_NOT_FOUND` error (./errors.ts), whose `data` carries the echo.
export const status = oc
  .errors(runInGameErrors)
  .input(
    contractSchema(
      Type.Object(
        {
          requestId: Type.String({ minLength: 1 }),
        },
        { additionalProperties: false }
      )
    )
  )
  .output(operationStatusSchema);

export const diagnostics = oc
  .input(
    contractSchema(
      Type.Object(
        {
          diagnosticsId: Type.String({ minLength: 1 }),
        },
        { additionalProperties: false }
      )
    )
  )
  .output(contractSchema(diagnosticsLookupResultSchema));

// ---------------------------------------------------------------------------
// #14 runInGame.start - accepted operation start.
// ---------------------------------------------------------------------------
// Body: the full setup request. Success: PublicRunStatus (async). Duplicate
// same fingerprint returns the same public operation projection.
// Errors: 409 (run-in-game OR save/deploy active), 400/500/503 via declared
// RUN_IN_GAME_* codes whose data is limited to safe category/recovery fields.
// Runtime internals, source snapshots, materialization, proof, and raw messages
// belong behind explicit diagnostics lookup, never this public procedure.
//
// SECURITY BOUNDARY (target-arch section 1): the TypeBox contract rejects known
// raw-control top-level tunnel keys, while the host validator deep-scans opaque
// config/setup/source payloads for the same vocabulary before any workflow port
// runs. The package operation runtime owns canonical request admission:
// recipe pinning, kebab-case id, seed/mapSize/playerCount validation,
// materialization mode, setup config normalization, and fingerprint derivation.
export const start = oc
  .errors(runInGameErrors)
  .input(
    contractSchema(
      Type.Object(
        {
          recipeId: Type.Optional(Type.String()),
          seed: Type.Optional(Type.Union([Type.Number(), Type.String()])),
          mapSize: Type.Optional(Type.String()),
          playerCount: Type.Optional(Type.Integer()),
          resources: Type.Optional(Type.String()),
          args: Type.Optional(Type.Never()),
          command: Type.Optional(Type.Never()),
          context: Type.Optional(Type.Never()),
          javascript: Type.Optional(Type.Never()),
          operationType: Type.Optional(Type.Never()),
          rawCommand: Type.Optional(Type.Never()),
          rawJs: Type.Optional(Type.Never()),
          script: Type.Optional(Type.Never()),
          session: Type.Optional(Type.Never()),
          stateName: Type.Optional(Type.Never()),
          materialization: Type.Optional(
            Type.Object(
              {
                mode: Type.String(),
              },
              { additionalProperties: false }
            )
          ),
          recovery: Type.Optional(
            Type.Object(
              {
                restartCivProcess: Type.Optional(Type.Boolean()),
              },
              { additionalProperties: false }
            )
          ),
          setupConfig: Type.Optional(Type.Unknown()),
          config: Type.Optional(Type.Unknown()),
          sourceSnapshot: Type.Optional(Type.Unknown()),
          selectedConfig: Type.Optional(
            Type.Object(
              {
                // `id` is OPTIONAL: disposable runs send `selectedConfig` without one;
                // package runtime admission derives the canonical selected id.
                id: Type.Optional(Type.String()),
                label: Type.Optional(Type.String()),
                description: Type.Optional(Type.String()),
                sourcePath: Type.Optional(Type.String()),
                sortIndex: Type.Optional(Type.Number()),
                latitudeBounds: Type.Optional(Type.Unknown()),
              },
              { additionalProperties: false }
            )
          ),
        },
        // Preserve unknown keys so `assertNoRawControlFields` can inspect/reject them.
        { additionalProperties: Type.Unknown() }
      )
    )
  )
  .output(operationStatusSchema);
