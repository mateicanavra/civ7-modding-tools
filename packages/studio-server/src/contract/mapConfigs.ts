import { oc } from "@orpc/contract";
import { z } from "zod";

import { mapConfigsErrors } from "./errors.js";

/**
 * `mapConfigs.*` namespace — save config to repo + deploy (no Civ restart).
 *
 * Source of truth: audit/05-server-contracts.md endpoints #15 (status) and #16
 * (saveDeploy). The output schema reproduces `MapConfigSaveDeployStatus` from
 * apps/mapgen-studio/src/features/mapConfigSave/status.ts faithfully.
 */

const saveDeployPhase = z.enum([
  "idle",
  "queued",
  "saving",
  "deploying",
  "complete",
  "failed",
]);

const saveDeployKind = z.enum(["idle", "running", "complete", "failed"]);

/** `MapConfigSaveDeployStatus` — returned by both saveDeploy (#16, 202) and status (#15, 200). */
export const saveDeployStatusSchema = z.object({
  ok: z.boolean(),
  requestId: z.string(),
  phase: saveDeployPhase,
  status: saveDeployKind,
  startedAt: z.string(),
  updatedAt: z.string(),
  path: z.string().optional(),
  saved: z.boolean().optional(),
  deployed: z.boolean().optional(),
  error: z.string().optional(),
  deploy: z
    .object({
      build: z
        .object({
          task: z.string().optional(),
          stdout: z.string().optional(),
          stderr: z.string().optional(),
        })
        .optional(),
      targetDir: z.string().optional(),
      modsDir: z.string().optional(),
      filesCopied: z.number().optional(),
    })
    .optional(),
  details: z.record(z.string(), z.unknown()).optional(),
  recoveryActions: z.array(z.string()).optional(),
});

// ---------------------------------------------------------------------------
// #15 mapConfigs.status — GET /api/map-configs/status?requestId=
// ---------------------------------------------------------------------------
// Query: requestId (REQUIRED). Success 200: MapConfigSaveDeployStatus.
// Errors: 400 (missing); 404 { ok:false, error, serverInstanceId,
// serverStartedAt }.
//
// S1.2 PARITY INVARIANT: the 404 now matches runInGame.status and echoes
// `serverInstanceId`/`serverStartedAt` so the client can distinguish a missing
// request id from a daemon restart.
export const status = oc
  .errors(mapConfigsErrors)
  .input(
    z.object({
      requestId: z.string().min(1),
    }),
  )
  .output(saveDeployStatusSchema);

// ---------------------------------------------------------------------------
// #16 mapConfigs.saveDeploy — POST /api/map-configs
// ---------------------------------------------------------------------------
// Body: { requestId?, id, sourcePath?, envelope, restart?, verifyRestart? }.
// `restart`/`verifyRestart` MUST be falsy → else 400.
// Success 202: MapConfigSaveDeployStatus (async). 202 idempotent (same active
// requestId returns current). Errors: 409 (run-in-game active OR different save/
// deploy active); 400 on validation — declared as the defined
// SAVE_DEPLOY_BLOCKED/INVALID/UNAVAILABLE/FAILED codes (./errors.ts).
//
// PARITY NOTE (audit/05 #16): write-then-deploy with ROLLBACK on deploy-phase
// failure; idempotent requestId reuse; path-jail (configRoot prefix + .config.json
// suffix); kebab-case id; requestId pattern ^[a-zA-Z0-9._:-]+$. Validation +
// rollback land in MapConfigStore (A2) / handler (A3). `restart`/`verifyRestart`
// are typed as optional booleans here; the falsy-only enforcement lives in
// `parseMapConfigSaveRequest`.
export const saveDeploy = oc
  .errors(mapConfigsErrors)
  .input(
    z.object({
      requestId: z.string().optional(),
      id: z.string(),
      sourcePath: z.string().optional(),
      envelope: z.unknown(),
      restart: z.boolean().optional(),
      verifyRestart: z.boolean().optional(),
    }),
  )
  .output(saveDeployStatusSchema);
