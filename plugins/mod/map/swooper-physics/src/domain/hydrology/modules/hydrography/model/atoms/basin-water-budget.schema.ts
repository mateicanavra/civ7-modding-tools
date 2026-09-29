import { type Static, Type } from "@swooper/mapgen-core/authoring/schema";

export const BasinFluxSchema = Type.Object(
  {
    incomingOverflow: Type.Number({ minimum: 0 }),
    dryRunoff: Type.Number({ minimum: 0 }),
    wetPrecipitation: Type.Number({ minimum: 0 }),
    wetDemand: Type.Number({ minimum: 0 }),
    balance: Type.Number({
      description: "Incoming overflow + dry runoff + wet precipitation - wet demand.",
    }),
  },
  { additionalProperties: false }
);

export const BasinLevelIntervalSchema = Type.Object(
  {
    lower: Type.Number(),
    lowerInclusive: Type.Boolean(),
    upper: Type.Union([Type.Number(), Type.Null()], {
      description: "Null denotes an unbounded interval, never an artificial maximum level.",
    }),
    upperInclusive: Type.Boolean(),
  },
  { additionalProperties: false }
);

export type BasinFlux = Static<typeof BasinFluxSchema>;
export type BasinLevelInterval = Static<typeof BasinLevelIntervalSchema>;

export const BasinShorelineBracketSchema = Type.Object({
  cohortCells: Type.Array(Type.Integer({ minimum: 0 })), before: BasinFluxSchema, after: BasinFluxSchema,
  jumpMagnitude: Type.Number({ exclusiveMinimum: 0 }),
}, { additionalProperties: false });

export const BasinNonstationaryResponseSchema = Type.Object({
  wetCells: Type.Array(Type.Integer({ minimum: 0 })), flux: BasinFluxSchema,
  state: Type.Literal("no-stationary-solution"), evaluatedLevels: BasinLevelIntervalSchema,
  unresolvedSurplus: Type.Number({ exclusiveMinimum: 0 }),
}, { additionalProperties: false });

export type BasinShorelineBracket = Static<typeof BasinShorelineBracketSchema>;
export type BasinNonstationaryResponse = Static<typeof BasinNonstationaryResponseSchema>;
