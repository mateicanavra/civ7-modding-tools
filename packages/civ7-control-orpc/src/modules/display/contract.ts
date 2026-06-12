import type { ContractProcedure } from "@orpc/contract";
import { Type, type Static } from "typebox";

import { civ7ControlOrpcContractBase } from "../../contract-base";
import type { Civ7ControlOrpcErrorMap } from "../../errors";
import type { Civ7ControlOrpcProcedureMeta } from "../../metadata";
import { toStandardSchema } from "../../typebox-standard-schema";

const NullableNumberSchema = Type.Union([Type.Number(), Type.Null()]);

const Civ7DisplayRequestSchema = Type.Object(
  {
    category: Type.String(),
    id: Type.Union([Type.Number(), Type.Null()]),
  },
  { additionalProperties: false },
);

const Civ7DisplayClosedRowSchema = Type.Object(
  {
    category: Type.String(),
    closed: Type.Integer({ minimum: 1 }),
  },
  { additionalProperties: false },
);

const Civ7DisplayQueueCurrentInputSchema = Type.Object(
  {},
  { additionalProperties: false },
);
export type Civ7DisplayQueueCurrentInput = Static<
  typeof Civ7DisplayQueueCurrentInputSchema
>;

const Civ7DisplayQueueCurrentResultSchema = Type.Object(
  {
    active: Type.Array(Civ7DisplayRequestSchema),
    suspended: Type.Array(Civ7DisplayRequestSchema),
    isSuspended: Type.Boolean(),
    handlerCategories: Type.Array(Type.String()),
  },
  { additionalProperties: false },
);
export type Civ7DisplayQueueCurrentResult = Static<
  typeof Civ7DisplayQueueCurrentResultSchema
>;

const Civ7DisplayQueueCloseInputSchema = Type.Object(
  {
    categories: Type.Optional(Type.Array(Type.String())),
  },
  { additionalProperties: false },
);
export type Civ7DisplayQueueCloseInput = Static<
  typeof Civ7DisplayQueueCloseInputSchema
>;

const Civ7DisplayQueueCloseResultSchema = Type.Object(
  {
    closed: Type.Array(Civ7DisplayClosedRowSchema),
    closedTotal: Type.Integer({ minimum: 0 }),
    remainingActive: Type.Array(Civ7DisplayRequestSchema),
    remainingSuspended: Type.Array(Civ7DisplayRequestSchema),
  },
  { additionalProperties: false },
);
export type Civ7DisplayQueueCloseResult = Static<
  typeof Civ7DisplayQueueCloseResultSchema
>;

const Civ7DisplayExploreRequestInputSchema = Type.Object(
  {
    playerId: Type.Integer({ minimum: 0, maximum: 1024 }),
    settleMs: Type.Optional(Type.Integer({ minimum: 0, maximum: 600_000 })),
    pollMs: Type.Optional(Type.Integer({ minimum: 250, maximum: 60_000 })),
    quiescePolls: Type.Optional(Type.Integer({ minimum: 1, maximum: 20 })),
    maxExtraWaitMs: Type.Optional(Type.Integer({ minimum: 0, maximum: 600_000 })),
    /**
     * Release the tracked grant after the drain so fog of war re-covers the
     * explored terrain (plots revert VISIBLE -> REVEALED). Default false: the
     * grant stays held and the whole map remains visible — the FOW
     * renderer's re-cover pass never runs. The held grant lives until the
     * session ends or the grant is released; this is a disposable-session
     * verb either way.
     */
    restoreFog: Type.Optional(Type.Boolean()),
  },
  { additionalProperties: false },
);
export type Civ7DisplayExploreRequestInput = Static<
  typeof Civ7DisplayExploreRequestInputSchema
>;

const Civ7DisplayExploreVisibilityProbeSchema = Type.Object(
  {
    revealed: NullableNumberSchema,
    visible: NullableNumberSchema,
  },
  { additionalProperties: false },
);

const Civ7DisplayExploreRequestResultSchema = Type.Object(
  {
    playerId: Type.Integer({ minimum: 0, maximum: 1024 }),
    before: Civ7DisplayExploreVisibilityProbeSchema,
    after: Civ7DisplayExploreVisibilityProbeSchema,
    grantId: Type.Number(),
    grantedPlots: Type.Integer({ minimum: 0 }),
    grantReleased: Type.Boolean(),
    settleMs: Type.Integer({ minimum: 0, maximum: 600_000 }),
    drainPolls: Type.Integer({ minimum: 0 }),
    quiesced: Type.Boolean(),
    suspendVerified: Type.Boolean(),
    resumeVerified: Type.Boolean(),
    suppressedDisplays: Type.Array(Civ7DisplayClosedRowSchema),
    mutation: Type.Literal("Visibility.setTrackedVisibilityGrant"),
    discoveryPosture: Type.Literal("ui-suppressed-gameplay-discovers"),
    classification: Type.Union([
      Type.Literal("explored"),
      Type.Literal("already-explored"),
      Type.Literal("unverified"),
    ]),
  },
  { additionalProperties: false },
);
export type Civ7DisplayExploreRequestResult = Static<
  typeof Civ7DisplayExploreRequestResultSchema
>;

const Civ7DisplayQueueCurrentInputStandardSchema = toStandardSchema(
  Civ7DisplayQueueCurrentInputSchema,
);
const Civ7DisplayQueueCurrentResultStandardSchema = toStandardSchema(
  Civ7DisplayQueueCurrentResultSchema,
);
const Civ7DisplayQueueCloseInputStandardSchema = toStandardSchema(
  Civ7DisplayQueueCloseInputSchema,
);
const Civ7DisplayQueueCloseResultStandardSchema = toStandardSchema(
  Civ7DisplayQueueCloseResultSchema,
);
const Civ7DisplayExploreRequestInputStandardSchema = toStandardSchema(
  Civ7DisplayExploreRequestInputSchema,
);
const Civ7DisplayExploreRequestResultStandardSchema = toStandardSchema(
  Civ7DisplayExploreRequestResultSchema,
);

type Civ7DisplayQueueCurrentContract = ContractProcedure<
  typeof Civ7DisplayQueueCurrentInputStandardSchema,
  typeof Civ7DisplayQueueCurrentResultStandardSchema,
  Civ7ControlOrpcErrorMap,
  Civ7ControlOrpcProcedureMeta
>;

const Civ7DisplayQueueCurrentContract: Civ7DisplayQueueCurrentContract =
  civ7ControlOrpcContractBase
    .input(Civ7DisplayQueueCurrentInputStandardSchema)
    .output(Civ7DisplayQueueCurrentResultStandardSchema)
    .meta({
      family: "display",
      procedureKey: "display.queue.current",
      proofBoundary: "local-package-test",
      risk: "read-only",
    });

type Civ7DisplayQueueCloseContract = ContractProcedure<
  typeof Civ7DisplayQueueCloseInputStandardSchema,
  typeof Civ7DisplayQueueCloseResultStandardSchema,
  Civ7ControlOrpcErrorMap,
  Civ7ControlOrpcProcedureMeta
>;

const Civ7DisplayQueueCloseContract: Civ7DisplayQueueCloseContract =
  civ7ControlOrpcContractBase
    .input(Civ7DisplayQueueCloseInputStandardSchema)
    .output(Civ7DisplayQueueCloseResultStandardSchema)
    .meta({
      family: "display",
      procedureKey: "display.queue.close",
      proofBoundary: "local-package-test",
      risk: "runtime-support",
    });

type Civ7DisplayExploreRequestContract = ContractProcedure<
  typeof Civ7DisplayExploreRequestInputStandardSchema,
  typeof Civ7DisplayExploreRequestResultStandardSchema,
  Civ7ControlOrpcErrorMap,
  Civ7ControlOrpcProcedureMeta
>;

const Civ7DisplayExploreRequestContract: Civ7DisplayExploreRequestContract =
  civ7ControlOrpcContractBase
    .input(Civ7DisplayExploreRequestInputStandardSchema)
    .output(Civ7DisplayExploreRequestResultStandardSchema)
    .meta({
      family: "display",
      procedureKey: "display.explore.request",
      proofBoundary: "local-package-test",
      risk: "mutation",
    });

export type Civ7DisplayContract = Readonly<{
  queue: Readonly<{
    current: Civ7DisplayQueueCurrentContract;
    close: Civ7DisplayQueueCloseContract;
  }>;
  explore: Readonly<{
    request: Civ7DisplayExploreRequestContract;
  }>;
}>;

export const Civ7DisplayContract: Civ7DisplayContract = {
  queue: {
    current: Civ7DisplayQueueCurrentContract,
    close: Civ7DisplayQueueCloseContract,
  },
  explore: {
    request: Civ7DisplayExploreRequestContract,
  },
};
