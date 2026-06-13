import { oc } from "@orpc/contract";
import { Type } from "typebox";

import { runInGameErrors } from "./errors.js";
import { contractSchema, unknownRecordSchema } from "./shared.js";

/**
 * `runInGame.*` namespace - launch + poll the run-current-config-in-Civ7 pipeline.
 *
 * Source of truth: audit/05-server-contracts.md endpoints #13 (status) and #14
 * (start). The output schema reproduces `RunInGameOperationStatus` from
 * apps/mapgen-studio/src/features/runInGame/status.ts faithfully (the package must
 * NOT import app code - the schema is mirrored here).
 */

// --- enums mirrored from features/runInGame/status.ts -----------------------

const runInGamePhase = Type.Union([
  Type.Literal("idle"),
  Type.Literal("materializing"),
  Type.Literal("deploying"),
  Type.Literal("restarting-civ"),
  Type.Literal("checking-civ7"),
  Type.Literal("reload-needed"),
  Type.Literal("preparing-setup"),
  Type.Literal("starting-game"),
  Type.Literal("waiting-for-proof"),
  Type.Literal("complete"),
  Type.Literal("blocked"),
  Type.Literal("failed"),
  Type.Literal("uncertain"),
]);

const runInGameOperationKind = Type.Union([
  Type.Literal("idle"),
  Type.Literal("running"),
  Type.Literal("complete"),
  Type.Literal("blocked"),
  Type.Literal("failed"),
  Type.Literal("uncertain"),
]);

// RunInGameFileIdentity
const fileIdentity = Type.Object(
  {
    path: Type.String(),
    sha256: Type.String(),
    sizeBytes: Type.Number(),
    mtimeMs: Type.Number(),
    mtimeIso: Type.String(),
  },
  { additionalProperties: false },
);

const contentMarkerProof = Type.Object(
  {
    id: Type.String(),
    marker: Type.String(),
    present: Type.Boolean(),
  },
  { additionalProperties: false },
);

const fileContentProof = Type.Object(
  {
    path: Type.String(),
    markers: Type.Array(contentMarkerProof),
  },
  { additionalProperties: false },
);

// RunInGameSourceSnapshotProof
const sourceSnapshotProof = Type.Object(
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
  { additionalProperties: false },
);

// RunInGameMaterializationStatus
const materializationStatus = Type.Object(
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
  { additionalProperties: false },
);

// RunInGameRequestStatus
const requestStatus = Type.Object(
  {
    recipeId: Type.Optional(Type.String()),
    seed: Type.Optional(Type.Number()),
    mapSize: Type.Optional(Type.String()),
    playerCount: Type.Optional(Type.Number()),
    resources: Type.Optional(Type.String()),
    selectedConfigId: Type.Optional(Type.String()),
    setupConfig: Type.Optional(Type.Unknown()),
    setupConfigSource: Type.Optional(Type.String()),
    materializationMode: Type.Optional(Type.String()),
    restartCivProcess: Type.Optional(Type.Boolean()),
    fingerprint: Type.Optional(Type.String()),
    sourceSnapshot: Type.Optional(sourceSnapshotProof),
  },
  { additionalProperties: false },
);

// RunInGameProcessRestartStatus - { command?, launchAttempts?, [key]: unknown }
const processRestartStatus = Type.Object(
  {
    command: Type.Optional(Type.String()),
    launchAttempts: Type.Optional(Type.Unknown()),
  },
  { additionalProperties: Type.Unknown() },
);

// RunInGameFailureDetails - open record with known optional fields.
const failureDetails = Type.Object(
  {
    failureClass: Type.Optional(Type.String()),
    code: Type.Optional(Type.String()),
    phase: Type.Optional(runInGamePhase),
    mapScript: Type.Optional(Type.String()),
    materialization: Type.Optional(materializationStatus),
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
  { additionalProperties: Type.Unknown() },
);

// RunInGameExactAuthorshipProof - large nested proof. The `log` sub-tree is deep
// and opaque (proof markers, per-domain stats) - modelled permissively; the stable
// top-level shape (status/requestId/createdAt/request/materialization/civSetup/
// runtime/unresolvedLinks) is reproduced.
const exactAuthorshipProof = Type.Object(
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
      { additionalProperties: false },
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
      { additionalProperties: Type.Unknown() },
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
      { additionalProperties: Type.Unknown() },
    ),
    // RunInGameExactAuthorshipProof["log"] - deep proof payload. Opaque (see shared.ts).
    log: Type.Optional(unknownRecordSchema),
    unresolvedLinks: Type.Array(Type.String()),
  },
  { additionalProperties: false },
);

/**
 * `RunInGameOperationStatus` - the operation state returned by BOTH start (#14,
 * 202) and status-poll (#13, 200), reproduced from features/runInGame/status.ts.
 */
const operationStatusTypeSchema = Type.Object(
  {
    ok: Type.Boolean(),
    requestId: Type.String(),
    phase: runInGamePhase,
    status: runInGameOperationKind,
    startedAt: Type.String(),
    updatedAt: Type.String(),
    serverInstanceId: Type.Optional(Type.String()),
    serverStartedAt: Type.Optional(Type.String()),
    completedPhases: Type.Array(runInGamePhase),
    request: Type.Optional(requestStatus),
    materialization: Type.Optional(materializationStatus),
    processRestart: Type.Optional(processRestartStatus),
    exactAuthorshipProof: Type.Optional(exactAuthorshipProof),
    error: Type.Optional(Type.String()),
    details: Type.Optional(failureDetails),
    result: Type.Optional(Type.Unknown()),
    recoveryActions: Type.Optional(Type.Array(Type.String())),
  },
  { additionalProperties: false },
);

export const operationStatusSchema = contractSchema(operationStatusTypeSchema);

// ---------------------------------------------------------------------------
// #13 runInGame.status - GET /api/civ7/run-in-game/status?requestId=
// ---------------------------------------------------------------------------
// Query: requestId (REQUIRED). Success 200: RunInGameOperationState.
// Errors: 400 { ok:false, error:"Missing requestId" };
//         404 { ok:false, error, serverInstanceId, serverStartedAt }.
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
        { additionalProperties: false },
      ),
    ),
  )
  .output(operationStatusSchema);

// ---------------------------------------------------------------------------
// #14 runInGame.start - POST /api/civ7/run-in-game
// ---------------------------------------------------------------------------
// Body: the full setup request. Success 202: RunInGameOperationState (async).
// 202 dup (same fingerprint -> details.duplicateRequest). Errors: 409 (run-in-game
// OR save/deploy active), 400/500/503 via StudioEngineError (details carries
// code/materialization/recovery boundaries) - declared as the defined
// RUN_IN_GAME_BLOCKED/INVALID/FAILED/UNAVAILABLE codes (./errors.ts).
//
// SECURITY BOUNDARY (target-arch section 1): the handler runs `assertNoRawControlFields`
// - a deep scan rejecting `command|script|javascript|rawJs|rawCommand` keys. The
// input is therefore intentionally permissive at the contract layer (the deep scan
// + recipe pinning + kebab-case id + seed/mapSize/playerCount validation live in
// `parseRunInGameSetupRequest`, ported in A2/A3). Known top-level fields are typed;
// the body is otherwise passed through for the validator to reject raw-control keys.
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
          materialization: Type.Optional(
            Type.Object(
              {
                mode: Type.String(),
              },
              { additionalProperties: false },
            ),
          ),
          recovery: Type.Optional(
            Type.Object(
              {
                restartCivProcess: Type.Optional(Type.Boolean()),
              },
              { additionalProperties: false },
            ),
          ),
          setupConfig: Type.Optional(Type.Unknown()),
          config: Type.Optional(Type.Unknown()),
          sourceSnapshot: Type.Optional(Type.Unknown()),
          selectedConfig: Type.Optional(
            Type.Object(
              {
                // `id` is OPTIONAL: disposable runs send `selectedConfig` without one,
                // and `parseRunInGameSetupRequest` reads `selected.id` defensively.
                id: Type.Optional(Type.String()),
                label: Type.Optional(Type.String()),
                description: Type.Optional(Type.String()),
                sourcePath: Type.Optional(Type.String()),
                sortIndex: Type.Optional(Type.Number()),
                latitudeBounds: Type.Optional(Type.Unknown()),
              },
              { additionalProperties: false },
            ),
          ),
        },
        // Preserve unknown keys so `assertNoRawControlFields` can inspect/reject them.
        { additionalProperties: Type.Unknown() },
      ),
    ),
  )
  .output(operationStatusSchema);
