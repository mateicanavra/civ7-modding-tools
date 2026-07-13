import { type Static, Type } from "typebox";
import { Value } from "typebox/value";

export const GritDiagnosticIdentitySchema = Type.Object(
  {
    kind: Type.Literal("pattern"),
    patternIdentity: Type.String({ minLength: 1 }),
    source: Type.Literal("rule-registry-facts"),
  },
  { additionalProperties: false }
);

export const DiagnosticIdentitySchema = GritDiagnosticIdentitySchema;

export const ObservedGritDiagnosticIdentitySchema = Type.Union([
  Type.Object(
    {
      kind: Type.Literal("observed-pattern"),
      observedPatternIdentity: Type.String({ minLength: 1 }),
      source: Type.Literal("local-name-and-check-id"),
    },
    { additionalProperties: false }
  ),
  Type.Object(
    {
      kind: Type.Literal("observed-identity-mismatch"),
      localName: Type.String({ minLength: 1 }),
      parsedCheckId: Type.String({ minLength: 1 }),
    },
    { additionalProperties: false }
  ),
]);

export const ObservedDiagnosticIdentitySchema = ObservedGritDiagnosticIdentitySchema;

export type GritDiagnosticIdentity = Static<typeof GritDiagnosticIdentitySchema>;
export type DiagnosticIdentity = GritDiagnosticIdentity;
export type ObservedGritDiagnosticIdentity = Static<typeof ObservedGritDiagnosticIdentitySchema>;
export type ObservedDiagnosticIdentity = ObservedGritDiagnosticIdentity;

export function isObservedGritDiagnosticIdentity(
  value: unknown
): value is ObservedGritDiagnosticIdentity {
  return Value.Check(ObservedGritDiagnosticIdentitySchema, value);
}

export function gritDiagnosticIdentity(patternIdentity: string): GritDiagnosticIdentity {
  return { kind: "pattern", patternIdentity, source: "rule-registry-facts" };
}

export function observedGritDiagnosticIdentity(input: {
  readonly local_name: string;
  readonly check_id: string;
}): ObservedGritDiagnosticIdentity {
  const parsedCheckId = parsePatternIdentityFromCheckId(input.check_id);
  if (parsedCheckId !== input.local_name) {
    return Value.Parse(ObservedGritDiagnosticIdentitySchema, {
      kind: "observed-identity-mismatch",
      localName: input.local_name,
      parsedCheckId,
    });
  }
  return Value.Parse(ObservedGritDiagnosticIdentitySchema, {
    kind: "observed-pattern",
    observedPatternIdentity: input.local_name,
    source: "local-name-and-check-id",
  });
}

export function observedGritIdentityMatches(
  observed: ObservedGritDiagnosticIdentity,
  identity: GritDiagnosticIdentity
): boolean {
  return (
    observed.kind === "observed-pattern" &&
    observed.observedPatternIdentity === identity.patternIdentity
  );
}

export function renderUnexpectedObservedGritIdentity(
  observed: ObservedGritDiagnosticIdentity
): string {
  return observed.kind === "observed-identity-mismatch"
    ? `Grit local_name ${observed.localName} conflicts with check_id identity ${observed.parsedCheckId}.`
    : `Unexpected Grit pattern identity: ${observed.observedPatternIdentity}.`;
}

function parsePatternIdentityFromCheckId(checkId: string): string {
  const separator = checkId.lastIndexOf("#");
  const qualifiedIdentity = separator >= 0 ? checkId.slice(separator + 1) : checkId;
  return qualifiedIdentity.split("/", 1)[0] ?? qualifiedIdentity;
}
