import { type Static, Type } from "typebox";

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
      Type.Literal("candidate", {
        description:
          "Candidate lifecycle; active rules are authored separately as rule.json authority.",
        default: "candidate",
      })
    ),
    openspecChangeId: Type.Optional(
      Type.String({
        minLength: 1,
        description: "OpenSpec change id that owns the candidate draft, when known.",
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
