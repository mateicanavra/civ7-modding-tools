import { type Static, Type } from "typebox";

export const HabitatSeveritySchema = Type.Union([Type.Literal("error"), Type.Literal("advisory")]);
export type HabitatSeverity = Static<typeof HabitatSeveritySchema>;

export const HabitatDiagnosticSchema = Type.Object(
  {
    ruleId: Type.String({ minLength: 1 }),
    path: Type.String({ minLength: 1 }),
    line: Type.Optional(Type.Number()),
    message: Type.String({ minLength: 1 }),
    severity: HabitatSeveritySchema,
    baselined: Type.Boolean(),
  },
  { additionalProperties: false }
);
export type HabitatDiagnostic = Static<typeof HabitatDiagnosticSchema>;
