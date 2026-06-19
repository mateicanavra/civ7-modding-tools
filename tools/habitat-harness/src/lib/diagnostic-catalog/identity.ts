import { type Static, Type } from "typebox";
import { Value } from "typebox/value";

export const GritDiagnosticIdentitySchema = Type.Object(
  {
    kind: Type.Literal("grit-pattern"),
    patternIdentity: Type.String({ minLength: 1 }),
    source: Type.Literal("d2-rule-grit-facts"),
  },
  { additionalProperties: false }
);

export const ObservedGritDiagnosticIdentitySchema = Type.Union([
  Type.Object(
    {
      kind: Type.Literal("observed-grit-pattern"),
      observedPatternIdentity: Type.String({ minLength: 1 }),
      source: Type.Union([
        Type.Literal("local_name"),
        Type.Literal("parsed-check-id"),
        Type.Literal("local-name-and-check-id"),
      ]),
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

export type GritDiagnosticIdentity = Static<typeof GritDiagnosticIdentitySchema>;
export type ObservedGritDiagnosticIdentity = Static<
  typeof ObservedGritDiagnosticIdentitySchema
>;

export function isObservedGritDiagnosticIdentity(
  value: unknown
): value is ObservedGritDiagnosticIdentity {
  return Value.Check(ObservedGritDiagnosticIdentitySchema, value);
}

export function gritDiagnosticIdentity(patternIdentity: string): GritDiagnosticIdentity {
  return {
    kind: "grit-pattern",
    patternIdentity,
    source: "d2-rule-grit-facts",
  };
}

export function observedGritDiagnosticIdentity(input: {
  local_name?: string;
  check_id?: string;
}): ObservedGritDiagnosticIdentity | null {
  const localName = input.local_name;
  const parsedCheckId = parsePatternIdentityFromCheckId(input.check_id);
  if (localName && parsedCheckId && localName !== parsedCheckId) {
    return { kind: "observed-identity-mismatch", localName, parsedCheckId };
  }
  if (localName && parsedCheckId) {
    return {
      kind: "observed-grit-pattern",
      observedPatternIdentity: localName,
      source: "local-name-and-check-id",
    };
  }
  if (localName) {
    return { kind: "observed-grit-pattern", observedPatternIdentity: localName, source: "local_name" };
  }
  if (parsedCheckId) {
    return {
      kind: "observed-grit-pattern",
      observedPatternIdentity: parsedCheckId,
      source: "parsed-check-id",
    };
  }
  return null;
}

export function observedGritIdentityMatches(
  observed: ObservedGritDiagnosticIdentity | null,
  identity: GritDiagnosticIdentity
): boolean {
  return (
    observed?.kind === "observed-grit-pattern" &&
    observed.observedPatternIdentity === identity.patternIdentity
  );
}

export function renderUnexpectedObservedGritIdentity(
  observed: ObservedGritDiagnosticIdentity
): string {
  if (observed.kind === "observed-identity-mismatch") {
    return `Grit output identity mismatch: local_name=${observed.localName}, check_id=${observed.parsedCheckId}.`;
  }
  return `Grit output included unexpected pattern identity: ${observed.observedPatternIdentity}.`;
}

function parsePatternIdentityFromCheckId(checkId: string | undefined): string | null {
  const match = checkId?.match(/#([^/]+)\//);
  return match?.[1] ?? null;
}

