import { type Static, Type } from "typebox";

export const TraceLevelSchema = Type.Union([
  Type.Literal("off"),
  Type.Literal("basic"),
  Type.Literal("verbose"),
]);

export const TraceConfigSchema = Type.Object(
  {
    enabled: Type.Optional(
      Type.Boolean({
        description: "Master tracing switch.",
      })
    ),
    steps: Type.Optional(
      Type.Record(Type.String(), TraceLevelSchema, {
        default: {},
        description: "Per-step trace verbosity (off/basic/verbose).",
      })
    ),
  },
  { additionalProperties: false, default: {} }
);

export const EnvSchema = Type.Object(
  {
    seed: Type.Number(),
    dimensions: Type.Object(
      {
        width: Type.Number(),
        height: Type.Number(),
      },
      { additionalProperties: false }
    ),
    latitudeBounds: Type.Object(
      {
        topLatitude: Type.Number(),
        bottomLatitude: Type.Number(),
      },
      { additionalProperties: false }
    ),
    trace: Type.Optional(TraceConfigSchema),
  },
  { additionalProperties: false }
);

export type Env = Static<typeof EnvSchema>;
