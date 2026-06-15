import { oc } from "@orpc/contract";
import { type Static, Type } from "typebox";

import { mapConfigsErrors } from "./errors.js";
import { contractSchema } from "./shared.js";

/**
 * `mapConfigs.*` namespace - save config to repo + deploy (no Civ restart).
 *
 * Source of truth: audit/05-server-contracts.md endpoints #15 (status) and #16
 * (saveDeploy). The package TypeBox schema is the public wire DTO authority;
 * app modules derive their operation-status types from this contract and keep
 * only UI formatting/presentation helpers locally.
 */

export const MAP_CONFIG_SAVE_DEPLOY_PHASES = [
  "idle",
  "queued",
  "saving",
  "deploying",
  "complete",
  "failed",
] as const;

export type MapConfigSaveDeployPhase = (typeof MAP_CONFIG_SAVE_DEPLOY_PHASES)[number];

export type MapConfigSaveDeployKind = "idle" | "running" | "complete" | "failed";

export const saveDeployPhase = Type.Union([
  Type.Literal("idle"),
  Type.Literal("queued"),
  Type.Literal("saving"),
  Type.Literal("deploying"),
  Type.Literal("complete"),
  Type.Literal("failed"),
]);

export const saveDeployKind = Type.Union([
  Type.Literal("idle"),
  Type.Literal("running"),
  Type.Literal("complete"),
  Type.Literal("failed"),
]);

/** `MapConfigSaveDeployStatus` - returned by both saveDeploy (#16, 202) and status (#15, 200). */
export const saveDeployStatusTypeSchema = Type.Object(
  {
    ok: Type.Boolean(),
    requestId: Type.String(),
    phase: saveDeployPhase,
    status: saveDeployKind,
    startedAt: Type.String(),
    updatedAt: Type.String(),
    path: Type.Optional(Type.String()),
    saved: Type.Optional(Type.Boolean()),
    deployed: Type.Optional(Type.Boolean()),
    error: Type.Optional(Type.String()),
    deploy: Type.Optional(
      Type.Object(
        {
          build: Type.Optional(
            Type.Object(
              {
                task: Type.Optional(Type.String()),
                stdout: Type.Optional(Type.String()),
                stderr: Type.Optional(Type.String()),
              },
              { additionalProperties: false }
            )
          ),
          targetDir: Type.Optional(Type.String()),
          modsDir: Type.Optional(Type.String()),
          filesCopied: Type.Optional(Type.Number()),
        },
        { additionalProperties: false }
      )
    ),
    details: Type.Optional(Type.Record(Type.String(), Type.Unknown())),
    recoveryActions: Type.Optional(Type.Array(Type.String())),
  },
  { additionalProperties: false }
);
export type MapConfigSaveDeployStatus = Static<typeof saveDeployStatusTypeSchema>;

export const saveDeployStatusSchema = contractSchema(saveDeployStatusTypeSchema);

// ---------------------------------------------------------------------------
// #15 mapConfigs.status - GET /api/map-configs/status?requestId=
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
    contractSchema(
      Type.Object(
        {
          requestId: Type.String({ minLength: 1 }),
        },
        { additionalProperties: false }
      )
    )
  )
  .output(saveDeployStatusSchema);

// ---------------------------------------------------------------------------
// #16 mapConfigs.saveDeploy - POST /api/map-configs
// ---------------------------------------------------------------------------
// Body: { requestId?, id, sourcePath?, envelope, restart?, verifyRestart? }.
// `restart`/`verifyRestart` MUST be falsy -> else 400.
// Success 202: MapConfigSaveDeployStatus (async). 202 idempotent (same active
// requestId returns current). Errors: 409 (run-in-game active OR different save/
// deploy active); 400 on validation - declared as the defined
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
    contractSchema(
      Type.Object(
        {
          requestId: Type.Optional(Type.String()),
          id: Type.String(),
          sourcePath: Type.Optional(Type.String()),
          envelope: Type.Unknown(),
          restart: Type.Optional(Type.Boolean()),
          verifyRestart: Type.Optional(Type.Boolean()),
        },
        { additionalProperties: false }
      )
    )
  )
  .output(saveDeployStatusSchema);
