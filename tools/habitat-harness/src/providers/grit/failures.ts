import { Data } from "effect";
import { type Static, Type } from "typebox";
import { Value } from "typebox/value";

const GritProviderFailureTagLiteralSchemas = [
  Type.Literal("GritToolUnavailable"),
  Type.Literal("GritCommandFailed"),
  Type.Literal("GritNoJson"),
  Type.Literal("GritMalformedJson"),
  Type.Literal("GritSchemaDrift"),
  Type.Literal("GritUnexpectedResultShape"),
  Type.Literal("GritEmptyScanRoots"),
  Type.Literal("GritPatternMatchMissing"),
  Type.Literal("GritUnexpectedDiagnosticIdentity"),
  Type.Literal("GritCacheProvenanceMissing"),
  Type.Literal("GritProviderInternalContractViolation"),
] as const;

export const GritProviderFailureTagSchema = Type.Union([...GritProviderFailureTagLiteralSchemas]);

export type GritProviderFailureTag = Static<typeof GritProviderFailureTagSchema>;

export const gritProviderFailureTags: readonly GritProviderFailureTag[] =
  GritProviderFailureTagLiteralSchemas.map((schema) => schema.const as GritProviderFailureTag);

export interface GritProviderFailureFields {
  readonly detail: string;
  readonly commandId?: string;
  readonly executable?: string;
  readonly argv?: readonly string[];
  readonly cwd?: string;
  readonly cause?: string;
  readonly path?: string;
}

export type GritProviderFailure =
  | GritToolUnavailable
  | GritCommandFailed
  | GritNoJson
  | GritMalformedJson
  | GritSchemaDrift
  | GritUnexpectedResultShape
  | GritEmptyScanRoots
  | GritPatternMatchMissing
  | GritUnexpectedDiagnosticIdentity
  | GritCacheProvenanceMissing
  | GritProviderInternalContractViolation;

export class GritToolUnavailable extends Data.TaggedError("GritToolUnavailable")<{
  readonly commandId: string;
  readonly executable: string;
  readonly argv: readonly string[];
  readonly cwd: string;
  readonly cause: string;
}> {}

export class GritCommandFailed extends Data.TaggedError(
  "GritCommandFailed"
)<GritProviderFailureFields> {}
export class GritNoJson extends Data.TaggedError("GritNoJson")<GritProviderFailureFields> {}
export class GritMalformedJson extends Data.TaggedError(
  "GritMalformedJson"
)<GritProviderFailureFields> {}
export class GritSchemaDrift extends Data.TaggedError(
  "GritSchemaDrift"
)<GritProviderFailureFields> {}
export class GritUnexpectedResultShape extends Data.TaggedError(
  "GritUnexpectedResultShape"
)<GritProviderFailureFields> {}
export class GritEmptyScanRoots extends Data.TaggedError(
  "GritEmptyScanRoots"
)<GritProviderFailureFields> {}
export class GritPatternMatchMissing extends Data.TaggedError(
  "GritPatternMatchMissing"
)<GritProviderFailureFields> {}
export class GritUnexpectedDiagnosticIdentity extends Data.TaggedError(
  "GritUnexpectedDiagnosticIdentity"
)<GritProviderFailureFields> {}
export class GritCacheProvenanceMissing extends Data.TaggedError(
  "GritCacheProvenanceMissing"
)<GritProviderFailureFields> {}
export class GritProviderInternalContractViolation extends Data.TaggedError(
  "GritProviderInternalContractViolation"
)<GritProviderFailureFields> {}

export function createGritProviderFailure(
  tag: GritProviderFailureTag,
  fields: GritProviderFailureFields
): GritProviderFailure {
  switch (tag) {
    case "GritToolUnavailable":
      return new GritToolUnavailable({
        commandId: fields.commandId ?? "unknown",
        executable: fields.executable ?? "grit",
        argv: fields.argv ?? [],
        cwd: fields.cwd ?? process.cwd(),
        cause: fields.cause ?? fields.detail,
      });
    case "GritCommandFailed":
      return new GritCommandFailed(fields);
    case "GritNoJson":
      return new GritNoJson(fields);
    case "GritMalformedJson":
      return new GritMalformedJson(fields);
    case "GritSchemaDrift":
      return new GritSchemaDrift(fields);
    case "GritUnexpectedResultShape":
      return new GritUnexpectedResultShape(fields);
    case "GritEmptyScanRoots":
      return new GritEmptyScanRoots(fields);
    case "GritPatternMatchMissing":
      return new GritPatternMatchMissing(fields);
    case "GritUnexpectedDiagnosticIdentity":
      return new GritUnexpectedDiagnosticIdentity(fields);
    case "GritCacheProvenanceMissing":
      return new GritCacheProvenanceMissing(fields);
    case "GritProviderInternalContractViolation":
      return new GritProviderInternalContractViolation(fields);
  }
}

export function isGritProviderFailureTag(value: string): value is GritProviderFailureTag {
  return Value.Check(GritProviderFailureTagSchema, value);
}

export function renderGritProviderFailure(
  tag: GritProviderFailureTag,
  detail = "Grit provider failed before producing rule findings."
): string {
  return `--- grit provider failure (${tag}) ---\n${detail}`;
}
