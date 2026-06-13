import { oc } from "@orpc/contract";
import { Type, type Static } from "typebox";
import { z } from "zod";

import { toStandardSchema } from "../typeboxStandardSchema.js";
import { isoTimestamp } from "./shared.js";

/**
 * `studio.*` namespace — server identity / API version.
 *
 * Source of truth: audit/05-server-contracts.md endpoint #9.
 */

// ---------------------------------------------------------------------------
// #9 studio.serverInfo — GET /api/studio/server-info
// ---------------------------------------------------------------------------
// Request: none. Success 200: { ok:true, serverInstanceId, startedAt,
// runInGameApiVersion: 2, viteCommand }. No errors (pure).
//
// PARITY NOTE (audit/05 #9, target-arch §1): `serverInstanceId`/`startedAt` are
// process-lifetime singletons; clients reconcile run-in-game state against them
// (restart detection). `runInGameApiVersion` is the fixed literal 2.
export const serverInfo = oc.input(z.object({})).output(
  z.object({
    ok: z.literal(true),
    serverInstanceId: z.string(),
    startedAt: isoTimestamp,
    runInGameApiVersion: z.literal(2),
    viteCommand: z.string(),
  }),
);

const operationsCurrentInputSchema = toStandardSchema(Type.Object({}, { additionalProperties: false }));

const runInGamePhaseSchema = Type.Union([
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

const runInGameStatusSchema = Type.Union([
  Type.Literal("idle"),
  Type.Literal("running"),
  Type.Literal("complete"),
  Type.Literal("blocked"),
  Type.Literal("failed"),
  Type.Literal("uncertain"),
]);

const runInGameOperationSchema = Type.Object(
  {
    ok: Type.Boolean(),
    requestId: Type.String(),
    phase: runInGamePhaseSchema,
    status: runInGameStatusSchema,
    startedAt: Type.String(),
    updatedAt: Type.String(),
    serverInstanceId: Type.Optional(Type.String()),
    serverStartedAt: Type.Optional(Type.String()),
    completedPhases: Type.Array(runInGamePhaseSchema),
    request: Type.Optional(Type.Unknown()),
    materialization: Type.Optional(Type.Unknown()),
    processRestart: Type.Optional(Type.Unknown()),
    exactAuthorshipProof: Type.Optional(Type.Unknown()),
    error: Type.Optional(Type.String()),
    details: Type.Optional(Type.Unknown()),
    result: Type.Optional(Type.Unknown()),
    recoveryActions: Type.Optional(Type.Array(Type.String())),
  },
  { additionalProperties: Type.Unknown() },
);

const saveDeployPhaseSchema = Type.Union([
  Type.Literal("idle"),
  Type.Literal("queued"),
  Type.Literal("saving"),
  Type.Literal("deploying"),
  Type.Literal("complete"),
  Type.Literal("failed"),
]);

const saveDeployStatusSchema = Type.Union([
  Type.Literal("idle"),
  Type.Literal("running"),
  Type.Literal("complete"),
  Type.Literal("failed"),
]);

const saveDeployOperationSchema = Type.Object(
  {
    ok: Type.Boolean(),
    requestId: Type.String(),
    phase: saveDeployPhaseSchema,
    status: saveDeployStatusSchema,
    startedAt: Type.String(),
    updatedAt: Type.String(),
    path: Type.Optional(Type.String()),
    saved: Type.Optional(Type.Boolean()),
    deployed: Type.Optional(Type.Boolean()),
    error: Type.Optional(Type.String()),
    deploy: Type.Optional(Type.Unknown()),
    details: Type.Optional(Type.Unknown()),
    recoveryActions: Type.Optional(Type.Array(Type.String())),
  },
  { additionalProperties: Type.Unknown() },
);

const operationRegistryCurrentSchema = <OperationSchema extends typeof runInGameOperationSchema | typeof saveDeployOperationSchema>(
  operationSchema: OperationSchema,
) =>
  Type.Object(
    {
      active: Type.Union([operationSchema, Type.Null()]),
      recent: Type.Array(operationSchema),
    },
    { additionalProperties: false },
  );

const operationsCurrentOutputSchema = Type.Object(
  {
    ok: Type.Literal(true),
    serverInstanceId: Type.String(),
    serverStartedAt: Type.String(),
    observedAt: Type.String(),
    runInGame: operationRegistryCurrentSchema(runInGameOperationSchema),
    saveDeploy: operationRegistryCurrentSchema(saveDeployOperationSchema),
  },
  { additionalProperties: false },
);

const operationsCurrentOutputStandardSchema = toStandardSchema(operationsCurrentOutputSchema);

export type StudioOperationsCurrent = Static<typeof operationsCurrentOutputSchema>;

// ---------------------------------------------------------------------------
// S2.1 studio.operations.current — daemon-owned operation recovery
// ---------------------------------------------------------------------------
// Request: none. Success 200: daemon identity + active/recent Run in Game and
// Save&Deploy operation snapshots. Fresh daemon truthfully returns empty
// registries; operation durability across restart is out of scope by design.
export const operationsCurrent = oc
  .input(operationsCurrentInputSchema)
  .output(operationsCurrentOutputStandardSchema);
