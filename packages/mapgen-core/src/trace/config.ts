import { type Static, Type } from "typebox";

/** Closed trace verbosity levels understood by the pipeline executor. */
export const TraceLevelSchema = Type.Union(
  [Type.Literal("off"), Type.Literal("basic"), Type.Literal("verbose")],
  {
    description:
      "Per-step trace verbosity: disabled, lifecycle events only, or lifecycle plus authored detail events.",
  }
);

/** Execution-owned selection of whether and how individual recipe steps emit trace events. */
export const TraceConfigSchema = Type.Object(
  {
    steps: Type.Optional(
      Type.Record(Type.String(), TraceLevelSchema, {
        default: {},
        description: "Trace verbosity overrides keyed by complete runtime step id.",
      })
    ),
  },
  {
    additionalProperties: false,
    default: {},
    description:
      "Enabled execution-time trace selection with optional per-step verbosity overrides; absence of the trace capability disables emission.",
  }
);

/** Closed trace verbosity level for one recipe step. */
export type TraceLevel = Static<typeof TraceLevelSchema>;

/** Execution-time trace selection for a recipe run. */
export type TraceConfig = Readonly<
  Omit<Static<typeof TraceConfigSchema>, "steps"> & {
    readonly steps?: Readonly<Record<string, TraceLevel>>;
  }
>;
