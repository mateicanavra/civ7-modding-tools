import type { ContractProcedure } from "@orpc/contract";
import { type Static, Type } from "typebox";

import { civ7ControlOrpcRouterContractBase } from "../../contract-base";
import {
  type Civ7LifecycleSinglePlayerStartErrorMap,
  civ7LifecycleSinglePlayerStartErrorMap,
} from "../../errors";
import type { Civ7ControlOrpcProcedureMeta } from "../../metadata";
import { Civ7ControlOrpcCorrelationIdSchema } from "../../model/correlation";
import { toStandardSchema } from "../../typebox-standard-schema";

const Civ7SetupOptionValueSchema = Type.Union([Type.String(), Type.Number(), Type.Boolean()]);
const Civ7SetupOptionIdSchema = Type.String({ pattern: "^[A-Za-z_][A-Za-z0-9_]*$" });
const Civ7SetupOptionsSchema = Type.Record(Civ7SetupOptionIdSchema, Civ7SetupOptionValueSchema, {
  additionalProperties: false,
});
const Civ7PlayerIdSchema = Type.String({ pattern: "^(?:[0-9]|[1-5][0-9]|6[0-4])$" });
const Civ7SingleLineSchema = Type.String({
  minLength: 1,
  maxLength: 512,
  pattern: "^(?=.*\\S)[^\\r\\n\\0]+$",
});
const Civ7MapScriptSchema = Civ7SingleLineSchema;
const Civ7MapSizeTypeSchema = Type.String({ pattern: "^MAPSIZE_[A-Z0-9_]+$" });
const Civ7SeedSchema = Type.Integer({ minimum: -2_147_483_648, maximum: 2_147_483_647 });
const Civ7PlayerCountSchema = Type.Integer({ minimum: 1, maximum: 64 });
const Civ7MapDimensionSchema = Type.Integer({ minimum: 1, maximum: 10_000 });
const Civ7PlotCountSchema = Type.Integer({ minimum: 1, maximum: 100_000_000 });
const Civ7TurnSchema = Type.Integer({ minimum: 0 });
const Civ7TargetModIdSchema = Type.String({
  minLength: 1,
  maxLength: 512,
  pattern: "^(?=.*[A-Za-z0-9])(?!.*[\\r\\n\\0{}])\\S(?:.*\\S)?$",
});

const Civ7LifecycleSetupEvidenceSchema = Type.Object(
  {
    mapScript: Civ7MapScriptSchema,
    mapSize: Civ7MapSizeTypeSchema,
    mapSeed: Civ7SeedSchema,
    gameSeed: Civ7SeedSchema,
    playerCount: Type.Optional(Civ7PlayerCountSchema),
    targetModId: Civ7TargetModIdSchema,
    mapRowFiles: Type.Array(Civ7MapScriptSchema, { minItems: 1, uniqueItems: true }),
  },
  { additionalProperties: false }
);

const Civ7LifecycleRuntimeEvidenceSchema = Type.Object(
  {
    seed: Civ7SeedSchema,
    mapSize: Civ7MapSizeTypeSchema,
    width: Type.Optional(Civ7MapDimensionSchema),
    height: Type.Optional(Civ7MapDimensionSchema),
    plotCount: Type.Optional(Civ7PlotCountSchema),
    turn: Type.Optional(Civ7TurnSchema),
    gameHash: Type.Optional(Type.Number()),
  },
  { additionalProperties: false }
);

const Civ7SavedConfigIdentitySchema = Type.Object(
  {
    id: Civ7SingleLineSchema,
    displayName: Civ7SingleLineSchema,
    fileName: Type.String({
      minLength: 9,
      maxLength: 512,
      pattern: "^[^/\\\\\\r\\n\\0]+\\.[Cc][Ii][Vv]7[Cc][Ff][Gg]$",
    }),
    path: Civ7SingleLineSchema,
  },
  { additionalProperties: false }
);

const Civ7LifecycleSinglePlayerStartInputSchema = Type.Object(
  {
    mapScript: Civ7MapScriptSchema,
    mapSize: Civ7MapSizeTypeSchema,
    seed: Civ7SeedSchema,
    playerCount: Type.Optional(Civ7PlayerCountSchema),
    targetModId: Civ7TargetModIdSchema,
    savedConfig: Type.Optional(Civ7SavedConfigIdentitySchema),
    gameOptions: Civ7SetupOptionsSchema,
    playerOptions: Type.Record(Civ7PlayerIdSchema, Civ7SetupOptionsSchema, {
      additionalProperties: false,
    }),
    activeGamePolicy: Type.Literal("exit-active-game"),
  },
  { additionalProperties: false }
);
export type Civ7LifecycleSinglePlayerStartInput = Static<
  typeof Civ7LifecycleSinglePlayerStartInputSchema
>;

const Civ7LifecycleSinglePlayerStartResultSchema = Type.Object(
  {
    correlationId: Type.Optional(Civ7ControlOrpcCorrelationIdSchema),
    status: Type.Literal("started"),
    evidence: Type.Object(
      {
        setup: Civ7LifecycleSetupEvidenceSchema,
        runtime: Civ7LifecycleRuntimeEvidenceSchema,
      },
      { additionalProperties: false }
    ),
    transition: Type.Union([
      Type.Object(
        { initialPhase: Type.Literal("shell"), activeGameExit: Type.Literal("not-needed") },
        { additionalProperties: false }
      ),
      Type.Object(
        { initialPhase: Type.Literal("running-game"), activeGameExit: Type.Literal("exited") },
        { additionalProperties: false }
      ),
    ]),
  },
  { additionalProperties: false }
);
export type Civ7LifecycleSinglePlayerStartResult = Static<
  typeof Civ7LifecycleSinglePlayerStartResultSchema
>;

const input = toStandardSchema(Civ7LifecycleSinglePlayerStartInputSchema);
const output = toStandardSchema(Civ7LifecycleSinglePlayerStartResultSchema);

type Civ7LifecycleSinglePlayerStartContract = ContractProcedure<
  typeof input,
  typeof output,
  Civ7LifecycleSinglePlayerStartErrorMap,
  Civ7ControlOrpcProcedureMeta
>;

const Civ7LifecycleSinglePlayerStartContract: Civ7LifecycleSinglePlayerStartContract =
  civ7ControlOrpcRouterContractBase
    .errors(civ7LifecycleSinglePlayerStartErrorMap)
    .input(input)
    .output(output)
    .meta({
      family: "lifecycle",
      procedureKey: "lifecycle.singlePlayer.start",
      proofBoundary: "pending-runtime-proof",
      risk: "mutation",
    });

export type Civ7LifecycleContract = Readonly<{
  singlePlayer: Readonly<{
    start: Civ7LifecycleSinglePlayerStartContract;
  }>;
}>;

export const Civ7LifecycleContract: Civ7LifecycleContract =
  civ7ControlOrpcRouterContractBase.router({
    singlePlayer: civ7ControlOrpcRouterContractBase.router({
      start: Civ7LifecycleSinglePlayerStartContract,
    }),
  });
