import { type Static, Type } from "typebox";

export const PatternLifecycleSchema = Type.Union([
  Type.Literal("candidate"),
  Type.Literal("registered-advisory"),
  Type.Literal("registered-enforced"),
]);

export type PatternLifecycle = Static<typeof PatternLifecycleSchema>;

export const PatternGeneratorOptionsSchema = Type.Object(
  {
    ruleId: Type.String({
      minLength: 1,
      description:
        "Habitat pattern candidate id. Candidate generation does not register a Habitat rule.",
      $default: { $source: "argv", index: 0 },
    }),
    ownerProject: Type.Optional(
      Type.String({
        minLength: 1,
        description: "Owning Nx project for the Habitat rule.",
        default: "habitat",
      })
    ),
    patternName: Type.Optional(
      Type.String({
        minLength: 1,
        description: "Optional Habitat pattern name; defaults to the rule id.",
      })
    ),
    lifecycle: Type.Optional(
      Type.Union(
        [
          Type.Literal("candidate"),
          Type.Literal("registered-advisory"),
          Type.Literal("registered-enforced"),
        ],
        {
          description:
            "Pattern lifecycle to generate. Registered lifecycles are fail-closed until the pattern manifest Manifest is accepted.",
          default: "candidate",
        }
      )
    ),
    openspecChangeId: Type.Optional(
      Type.String({
        minLength: 1,
        description: "OpenSpec change id that owns the candidate draft, when known.",
        default: "habitat-pattern-generator-metadata-repair",
      })
    ),
    manifestPath: Type.Optional(
      Type.String({
        minLength: 1,
        description: "Canonical pattern manifest Manifest path required for registered lifecycles.",
      })
    ),
  },
  {
    $schema: "https://json-schema.org/schema",
    $id: "HabitatPatternGenerator",
    title: "Habitat pattern generator",
    additionalProperties: true,
  }
);

export type PatternGeneratorOptions = Static<typeof PatternGeneratorOptionsSchema>;
