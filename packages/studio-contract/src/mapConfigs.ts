import { oc } from "@orpc/contract";
import { type Static, Type } from "typebox";

import {
  saveDeploySafeFailureCategorySchema,
  studioRecoveryActionSchema,
} from "./errors/errorData.js";
import { mapConfigsErrors } from "./errors.js";
import { mapConfigEnvelopeSchema, snapshotMapConfigEnvelope } from "./mapConfigEnvelope.js";
import { contractSchema } from "./shared.js";

/**
 * `mapConfigs.*` namespace - save config to repo + deploy (no Civ restart).
 *
 * Source of truth: audit/05-server-contracts.md endpoints #15 (status) and #16
 * (saveDeploy). The package TypeBox schema is the public wire DTO authority;
 * app modules derive their operation-status types from this contract and keep
 * only UI formatting/presentation helpers locally.
 * Current transport is TypeBox/effect-oRPC under `/rpc`; retired `/api/*`
 * strings below are audit/parity identifiers, not active routes.
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

const saveDeployPublicBaseFields = {
  requestId: Type.String(),
  recoveryActions: Type.Array(studioRecoveryActionSchema),
} as const;

/** `MapConfigSaveDeployStatus` - returned by both saveDeploy (#16, 202) and status (#15, 200). */
export const saveDeployStatusTypeSchema = Type.Union([
  Type.Object(
    {
      ...saveDeployPublicBaseFields,
      ok: Type.Literal(true),
      phase: Type.Union([
        Type.Literal("idle"),
        Type.Literal("queued"),
        Type.Literal("saving"),
        Type.Literal("deploying"),
      ]),
      status: Type.Union([Type.Literal("idle"), Type.Literal("running")]),
      saved: Type.Optional(Type.Boolean()),
      deployed: Type.Optional(Type.Boolean()),
    },
    { additionalProperties: false }
  ),
  Type.Object(
    {
      ...saveDeployPublicBaseFields,
      ok: Type.Literal(true),
      phase: Type.Literal("complete"),
      status: Type.Literal("complete"),
      saved: Type.Literal(true),
      deployed: Type.Literal(true),
    },
    { additionalProperties: false }
  ),
  Type.Object(
    {
      ...saveDeployPublicBaseFields,
      ok: Type.Literal(false),
      phase: Type.Literal("failed"),
      status: Type.Literal("failed"),
      saved: Type.Boolean(),
      deployed: Type.Boolean(),
      safeFailureCategory: saveDeploySafeFailureCategorySchema,
    },
    { additionalProperties: false }
  ),
]);
export type MapConfigSaveDeployStatus = Static<typeof saveDeployStatusTypeSchema>;

export const saveDeployStatusSchema = contractSchema(saveDeployStatusTypeSchema);

/** Rejects unsafe wire values before TypeBox inspects the public save DTO. */
function mapConfigSaveDeployInputIssue(value: unknown): string | undefined {
  const canonicalConfig = ownDataProperty(value, "canonicalConfig");
  return snapshotMapConfigEnvelope(canonicalConfig) !== undefined
    ? undefined
    : "mapConfigs.saveDeploy canonicalConfig must be a complete portable JSON envelope.";
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

// ---------------------------------------------------------------------------
// #15 mapConfigs.status - keyed mutation-state read
// Retired REST parity: GET /api/map-configs/status?requestId=
// ---------------------------------------------------------------------------
// Query: requestId (REQUIRED). Success 200: MapConfigSaveDeployStatus.
// Errors: 400 (missing); 404 with only request identity, a safe failure
// category, and recovery actions.
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
// #16 mapConfigs.saveDeploy - save/deploy mutation
// Retired REST parity: POST /api/map-configs
// ---------------------------------------------------------------------------
// Body: { requestId?, canonicalConfig, restart?, verifyRestart? }.
// `restart`/`verifyRestart` MUST be falsy -> else 400.
// Success 202: MapConfigSaveDeployStatus (async). 202 idempotent (same active
// requestId returns current). Errors: 409 (run-in-game active OR different save/
// deploy active); 400 on validation - declared as the defined
// SAVE_DEPLOY_BLOCKED/INVALID/UNAVAILABLE/FAILED codes (./errors.ts).
//
// PARITY NOTE (audit/05 #16): write-then-deploy with ROLLBACK on deploy-phase
// failure; idempotent requestId reuse; server-derived path jail from the safe
// canonical config id; requestId pattern ^[a-zA-Z0-9._:-]+$. Validation +
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
          canonicalConfig: mapConfigEnvelopeSchema,
          restart: Type.Optional(Type.Boolean()),
          verifyRestart: Type.Optional(Type.Boolean()),
        },
        { additionalProperties: false }
      ),
      {
        cleanUnknownProperties: false,
        precheck: mapConfigSaveDeployInputIssue,
      }
    )
  )
  .output(saveDeployStatusSchema);
