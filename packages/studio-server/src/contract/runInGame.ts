import { oc } from "@orpc/contract";
import { z } from "zod";

import { runInGameErrors } from "./errors.js";
import { unknownRecord } from "./shared.js";

/**
 * `runInGame.*` namespace — launch + poll the run-current-config-in-Civ7 pipeline.
 *
 * Source of truth: audit/05-server-contracts.md endpoints #13 (status) and #14
 * (start). The output schema reproduces `RunInGameOperationStatus` from
 * apps/mapgen-studio/src/features/runInGame/status.ts faithfully (the package must
 * NOT import app code — the schema is mirrored here).
 */

// --- enums mirrored from features/runInGame/status.ts -----------------------

const runInGamePhase = z.enum([
  "idle",
  "materializing",
  "deploying",
  "restarting-civ",
  "checking-civ7",
  "reload-needed",
  "preparing-setup",
  "starting-game",
  "waiting-for-proof",
  "complete",
  "blocked",
  "failed",
  "uncertain",
]);

const runInGameOperationKind = z.enum([
  "idle",
  "running",
  "complete",
  "blocked",
  "failed",
  "uncertain",
]);

// RunInGameFileIdentity
const fileIdentity = z.object({
  path: z.string(),
  sha256: z.string(),
  sizeBytes: z.number(),
  mtimeMs: z.number(),
  mtimeIso: z.string(),
});

const contentMarkerProof = z.object({
  id: z.string(),
  marker: z.string(),
  present: z.boolean(),
});

const fileContentProof = z.object({
  path: z.string(),
  markers: z.array(contentMarkerProof),
});

// RunInGameSourceSnapshotProof
const sourceSnapshotProof = z.object({
  identityHash: z.string(),
  requestId: z.string(),
  recipeSettings: z.unknown().optional(),
  worldSettings: z.unknown().optional(),
  pipelineConfig: z.unknown().optional(),
  setupConfig: z.unknown().optional(),
  materializationMode: z.string().optional(),
  selectedConfig: z.unknown().optional(),
  configHash: z.string().optional(),
  envelopeHash: z.string().optional(),
});

// RunInGameMaterializationStatus
const materializationStatus = z.object({
  mode: z.string().optional(),
  path: z.string().optional(),
  mapScript: z.string().optional(),
  configHash: z.string().optional(),
  envelopeHash: z.string().optional(),
  sourceConfig: fileIdentity.optional(),
  generatedSourceScript: fileIdentity.optional(),
  localModScript: fileIdentity.optional(),
  deployedModScript: fileIdentity.optional(),
  localModScriptContent: fileContentProof.optional(),
  deployedModScriptContent: fileContentProof.optional(),
});

// RunInGameRequestStatus
const requestStatus = z.object({
  recipeId: z.string().optional(),
  seed: z.number().optional(),
  mapSize: z.string().optional(),
  playerCount: z.number().optional(),
  resources: z.string().optional(),
  selectedConfigId: z.string().optional(),
  setupConfig: z.unknown().optional(),
  setupConfigSource: z.string().optional(),
  materializationMode: z.string().optional(),
  restartCivProcess: z.boolean().optional(),
  fingerprint: z.string().optional(),
  sourceSnapshot: sourceSnapshotProof.optional(),
});

// RunInGameProcessRestartStatus — { command?, launchAttempts?, [key]: unknown }
const processRestartStatus = z
  .object({
    command: z.string().optional(),
    launchAttempts: z.unknown().optional(),
  })
  .catchall(z.unknown());

// RunInGameFailureDetails — open record with known optional fields.
const failureDetails = z
  .object({
    failureClass: z.string().optional(),
    code: z.string().optional(),
    phase: runInGamePhase.optional(),
    mapScript: z.string().optional(),
    materialization: materializationStatus.optional(),
    reloadRequired: z.boolean().optional(),
    reloadBoundary: z.string().optional(),
    reloadAttempted: z.boolean().optional(),
    dismissNotificationRequired: z.boolean().optional(),
    recoveryBoundary: z.string().optional(),
    recoveryHint: z.string().optional(),
    completedPhases: z.array(runInGamePhase).optional(),
    directControlCode: z.string().optional(),
    cause: z.unknown().optional(),
  })
  .catchall(z.unknown());

// RunInGameExactAuthorshipProof — large nested proof. The `log` sub-tree is deep
// and opaque (proof markers, per-domain stats) — modelled permissively; the stable
// top-level shape (status/requestId/createdAt/request/materialization/civSetup/
// runtime/unresolvedLinks) is reproduced.
const exactAuthorshipProof = z.object({
  status: z.enum(["complete", "unresolved"]),
  requestId: z.string(),
  createdAt: z.string(),
  sourceSnapshot: sourceSnapshotProof.optional(),
  request: z.object({
    recipeId: z.string().optional(),
    seed: z.number().optional(),
    mapSize: z.string().optional(),
    playerCount: z.number().optional(),
    resources: z.string().optional(),
    selectedConfigId: z.string().optional(),
    setupConfigSource: z.string().optional(),
    fingerprint: z.string().optional(),
  }),
  materialization: materializationStatus,
  civSetup: z
    .object({
      mapScript: z.string().optional(),
      mapSize: z.unknown().optional(),
      mapSeed: z.unknown().optional(),
      gameSeed: z.unknown().optional(),
      playerCount: z.unknown().optional(),
      rowCount: z.number().optional(),
    })
    .catchall(z.unknown()),
  runtime: z
    .object({
      seed: z.number().optional(),
      width: z.number().optional(),
      height: z.number().optional(),
      plotCount: z.number().optional(),
      turn: z.number().optional(),
      gameHash: z.number().optional(),
      sourceSnapshotId: z.string().optional(),
      snapshotHash: z.string().optional(),
    })
    .catchall(z.unknown()),
  // RunInGameExactAuthorshipProof["log"] — deep proof payload. Opaque (see shared.ts).
  log: unknownRecord.optional(),
  unresolvedLinks: z.array(z.string()),
});

/**
 * `RunInGameOperationStatus` — the operation state returned by BOTH start (#14,
 * 202) and status-poll (#13, 200), reproduced from features/runInGame/status.ts.
 */
export const operationStatusSchema = z.object({
  ok: z.boolean(),
  requestId: z.string(),
  phase: runInGamePhase,
  status: runInGameOperationKind,
  startedAt: z.string(),
  updatedAt: z.string(),
  serverInstanceId: z.string().optional(),
  serverStartedAt: z.string().optional(),
  completedPhases: z.array(runInGamePhase),
  request: requestStatus.optional(),
  materialization: materializationStatus.optional(),
  processRestart: processRestartStatus.optional(),
  exactAuthorshipProof: exactAuthorshipProof.optional(),
  error: z.string().optional(),
  details: failureDetails.optional(),
  result: z.unknown().optional(),
  recoveryActions: z.array(z.string()).optional(),
});

// ---------------------------------------------------------------------------
// #13 runInGame.status — GET /api/civ7/run-in-game/status?requestId=
// ---------------------------------------------------------------------------
// Query: requestId (REQUIRED). Success 200: RunInGameOperationState.
// Errors: 400 { ok:false, error:"Missing requestId" };
//         404 { ok:false, error, serverInstanceId, serverStartedAt }.
//
// PARITY INVARIANT (audit/05 #13, target-arch §1): the 404 echoes
// `serverInstanceId`/`serverStartedAt` so the client detects a server restart that
// lost the op. TTL pruning (30min) → pruned op yields 404. The miss is the defined
// `RUN_IN_GAME_STATUS_NOT_FOUND` error (./errors.ts), whose `data` carries the echo.
export const status = oc
  .errors(runInGameErrors)
  .input(
    z.object({
      requestId: z.string().min(1),
    }),
  )
  .output(operationStatusSchema);

// ---------------------------------------------------------------------------
// #14 runInGame.start — POST /api/civ7/run-in-game
// ---------------------------------------------------------------------------
// Body: the full setup request. Success 202: RunInGameOperationState (async).
// 202 dup (same fingerprint → details.duplicateRequest). Errors: 409 (run-in-game
// OR save/deploy active), 400/500/503 via RunInGameHttpError (details carries
// code/materialization/recovery boundaries) — declared as the defined
// RUN_IN_GAME_BLOCKED/INVALID/FAILED/UNAVAILABLE codes (./errors.ts).
//
// SECURITY BOUNDARY (target-arch §1): the handler runs `assertNoRawControlFields`
// — a deep scan rejecting `command|script|javascript|rawJs|rawCommand` keys. The
// input is therefore intentionally permissive at the contract layer (the deep scan
// + recipe pinning + kebab-case id + seed/mapSize/playerCount validation live in
// `parseRunInGameSetupRequest`, ported in A2/A3). Known top-level fields are typed;
// the body is otherwise passed through for the validator to reject raw-control keys.
export const start = oc
  .errors(runInGameErrors)
  .input(
    z
      .object({
        recipeId: z.string().optional(),
        seed: z.union([z.number(), z.string()]).optional(),
        mapSize: z.string().optional(),
        playerCount: z.number().int().optional(),
        resources: z.string().optional(),
        materialization: z
          .object({
            mode: z.string(),
          })
          .optional(),
        recovery: z
          .object({
            restartCivProcess: z.boolean().optional(),
          })
          .optional(),
        setupConfig: z.unknown().optional(),
        config: z.unknown().optional(),
        sourceSnapshot: z.unknown().optional(),
        selectedConfig: z
          .object({
            // `id` is OPTIONAL: disposable runs send `selectedConfig` without one,
            // and `parseRunInGameSetupRequest` (apps/.../server/runInGame/
            // requestValidation.ts) reads `selected.id` defensively (defaulting to
            // "studio-current" when absent). Declaring it required forced the caller
            // to launder the request through an `as unknown as Parameters<…>` cast;
            // making it optional here aligns the contract with the validator + engine
            // and restores end-to-end input type safety on the
            // `assertNoRawControlFields`-protected start path.
            id: z.string().optional(),
            label: z.string().optional(),
            description: z.string().optional(),
            sourcePath: z.string().optional(),
            sortIndex: z.number().optional(),
            latitudeBounds: z.unknown().optional(),
          })
          .optional(),
      })
      // Preserve unknown keys so `assertNoRawControlFields` can inspect/reject them.
      .catchall(z.unknown()),
  )
  .output(operationStatusSchema);
