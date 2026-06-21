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

export const NativeDiagnosticIdentityValueSchema = Type.Literal("docs-local-checkout-paths");

export const NativeDiagnosticIdentitySchema = Type.Object(
  {
    kind: Type.Literal("native-rule"),
    nativeDiagnosticIdentity: NativeDiagnosticIdentityValueSchema,
    source: Type.Literal("native-habitat-rule"),
  },
  { additionalProperties: false }
);

export const DiagnosticIdentitySchema = Type.Union([
  GritDiagnosticIdentitySchema,
  NativeDiagnosticIdentitySchema,
]);

export const ObservedNativeDiagnosticIdentitySchema = Type.Object(
  {
    kind: Type.Literal("observed-native-rule"),
    observedNativeDiagnosticIdentity: NativeDiagnosticIdentityValueSchema,
    source: Type.Literal("native-habitat-rule"),
  },
  { additionalProperties: false }
);

export const ObservedGritDiagnosticIdentitySchema = Type.Union([
  Type.Object(
    {
      kind: Type.Literal("observed-pattern"),
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

export const ObservedDiagnosticIdentitySchema = Type.Union([
  ObservedGritDiagnosticIdentitySchema,
  ObservedNativeDiagnosticIdentitySchema,
]);

export type GritDiagnosticIdentity = Static<typeof GritDiagnosticIdentitySchema>;
export type NativeDiagnosticIdentityValue = Static<typeof NativeDiagnosticIdentityValueSchema>;
export type NativeDiagnosticIdentity = Static<typeof NativeDiagnosticIdentitySchema>;
export type DiagnosticIdentity = Static<typeof DiagnosticIdentitySchema>;
export type ObservedGritDiagnosticIdentity = Static<typeof ObservedGritDiagnosticIdentitySchema>;
export type ObservedNativeDiagnosticIdentity = Static<
  typeof ObservedNativeDiagnosticIdentitySchema
>;
export type ObservedDiagnosticIdentity = Static<typeof ObservedDiagnosticIdentitySchema>;

export function isObservedGritDiagnosticIdentity(
  value: unknown
): value is ObservedGritDiagnosticIdentity {
  return Value.Check(ObservedGritDiagnosticIdentitySchema, value);
}

export function gritDiagnosticIdentity(patternIdentity: string): GritDiagnosticIdentity {
  return {
    kind: "pattern",
    patternIdentity,
    source: "rule-registry-facts",
  };
}

export function nativeDiagnosticIdentity(
  nativeDiagnostic: NativeDiagnosticIdentityValue
): NativeDiagnosticIdentity {
  return {
    kind: "native-rule",
    nativeDiagnosticIdentity: nativeDiagnostic,
    source: "native-habitat-rule",
  };
}

export function observedNativeDiagnosticIdentity(
  nativeDiagnostic: NativeDiagnosticIdentityValue
): ObservedDiagnosticIdentity {
  return {
    kind: "observed-native-rule",
    observedNativeDiagnosticIdentity: nativeDiagnostic,
    source: "native-habitat-rule",
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
      kind: "observed-pattern",
      observedPatternIdentity: localName,
      source: "local-name-and-check-id",
    };
  }
  if (localName) {
    return {
      kind: "observed-pattern",
      observedPatternIdentity: localName,
      source: "local_name",
    };
  }
  if (parsedCheckId) {
    return {
      kind: "observed-pattern",
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
    observed?.kind === "observed-pattern" &&
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
