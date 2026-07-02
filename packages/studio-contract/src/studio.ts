import { eventIterator, oc } from "@orpc/contract";
import { type Static, type TSchema, Type } from "typebox";
import { toStandardSchema } from "./lib/typeboxStandardSchema.js";
import { liveGameStateSchema } from "./liveGame/model.js";
import { saveDeployStatusTypeSchema } from "./mapConfigs.js";
import { operationStatusTypeSchema } from "./runInGame.js";
import { contractSchema, emptyInputSchema, isoTimestampSchema } from "./shared.js";

/**
 * `studio.*` namespace - server identity / API version.
 *
 * Source of truth: audit/05-server-contracts.md endpoint #9.
 * Current transport is TypeBox/effect-oRPC under `/rpc`; retired `/api/*`
 * strings below are audit/parity identifiers, not active routes.
 */

// ---------------------------------------------------------------------------
// #9 studio.serverInfo - daemon identity read
// Retired REST parity: GET /api/studio/server-info
// ---------------------------------------------------------------------------
// Request: none. Success 200: { ok:true, serverInstanceId, startedAt,
// runInGameApiVersion: 2, viteCommand }. No errors (pure).
//
// PARITY NOTE (audit/05 #9, target-arch section 1): `serverInstanceId`/`startedAt` are
// process-lifetime singletons; clients reconcile run-in-game state against them
// (restart detection). `runInGameApiVersion` is the fixed literal 2.
export const serverInfo = oc.input(emptyInputSchema).output(
  contractSchema(
    Type.Object(
      {
        ok: Type.Literal(true),
        serverInstanceId: Type.String(),
        startedAt: isoTimestampSchema,
        runInGameApiVersion: Type.Literal(2),
        viteCommand: Type.String(),
      },
      { additionalProperties: false }
    )
  )
);

const runInGameOperationSchema = operationStatusTypeSchema;
const saveDeployOperationSchema = saveDeployStatusTypeSchema;

const operationRegistryCurrentSchema = <OperationSchema extends TSchema>(
  operationSchema: OperationSchema
) =>
  Type.Object(
    {
      active: Type.Union([operationSchema, Type.Null()]),
      recent: Type.Array(operationSchema),
    },
    { additionalProperties: false }
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
  { additionalProperties: false }
);

const operationsCurrentOutputStandardSchema = toStandardSchema(operationsCurrentOutputSchema);

export type StudioOperationsCurrent = Static<typeof operationsCurrentOutputSchema>;

const studioHelloEventSchema = Type.Object(
  {
    type: Type.Literal("hello"),
    serverInstanceId: Type.String(),
    serverStartedAt: Type.String(),
    observedAt: Type.String(),
  },
  { additionalProperties: false }
);

export const studioOperationEventSchema = Type.Union([
  Type.Object(
    {
      type: Type.Literal("operation"),
      kind: Type.Literal("run-in-game"),
      status: runInGameOperationSchema,
      observedAt: Type.String(),
    },
    { additionalProperties: false }
  ),
  Type.Object(
    {
      type: Type.Literal("operation"),
      kind: Type.Literal("save-deploy"),
      status: saveDeployOperationSchema,
      observedAt: Type.String(),
    },
    { additionalProperties: false }
  ),
]);

const studioLiveGameEventSchema = Type.Object(
  {
    type: Type.Literal("live-game"),
    state: liveGameStateSchema,
    observedAt: Type.String(),
  },
  { additionalProperties: false }
);

export const studioEventSchema = Type.Union([
  studioHelloEventSchema,
  studioOperationEventSchema,
  studioLiveGameEventSchema,
]);
const studioEventIteratorSchema = eventIterator(toStandardSchema(studioEventSchema));

export type StudioHelloEvent = Static<typeof studioHelloEventSchema>;
export type StudioOperationEvent = Static<typeof studioOperationEventSchema>;
export type StudioLiveGameEvent = Static<typeof studioLiveGameEventSchema>;
export type StudioEvent = Static<typeof studioEventSchema>;

// ---------------------------------------------------------------------------
// S2.1 studio.operations.current - daemon-owned operation recovery
// ---------------------------------------------------------------------------
// Request: none. Success 200: daemon identity + active/recent Run in Game and
// Save&Deploy operation snapshots. Fresh daemon truthfully returns empty
// registries; operation durability across restart is out of scope by design.
export const operationsCurrent = oc
  .input(emptyInputSchema)
  .output(operationsCurrentOutputStandardSchema);

// ---------------------------------------------------------------------------
// S3.1 studio.events.watch - daemon-owned runtime event stream
// ---------------------------------------------------------------------------
// Request: none. Output: event iterator over the sealed TypeBox event category.
// The router emits an immediate `hello`, then yields the daemon-owned EventHub.
export const eventsWatch = oc.input(emptyInputSchema).output(studioEventIteratorSchema);
