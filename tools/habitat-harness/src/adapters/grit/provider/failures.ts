import { Data } from "effect";
import { type Static, Type } from "typebox";
import { Value } from "typebox/value";

const GritAdapterFailureTagLiteralSchemas = [
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
  Type.Literal("GritAdapterInternalContractViolation"),
] as const;

export const GritAdapterFailureTagSchema = Type.Union([...GritAdapterFailureTagLiteralSchemas]);

export type GritAdapterFailureTag = Static<typeof GritAdapterFailureTagSchema>;

export const gritAdapterFailureTags: readonly GritAdapterFailureTag[] =
  GritAdapterFailureTagLiteralSchemas.map((schema) => schema.const as GritAdapterFailureTag);

export interface GritAdapterFailureFields {
  readonly detail: string;
  readonly commandId?: string;
  readonly executable?: string;
  readonly argv?: readonly string[];
  readonly cwd?: string;
  readonly cause?: string;
  readonly path?: string;
}

export type GritAdapterFailure =
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
  | GritAdapterInternalContractViolation;

export class GritToolUnavailable extends Data.TaggedError("GritToolUnavailable")<{
  readonly commandId: string;
  readonly executable: string;
  readonly argv: readonly string[];
  readonly cwd: string;
  readonly cause: string;
}> {}

export class GritCommandFailed extends Data.TaggedError(
  "GritCommandFailed"
)<GritAdapterFailureFields> {}
export class GritNoJson extends Data.TaggedError("GritNoJson")<GritAdapterFailureFields> {}
export class GritMalformedJson extends Data.TaggedError(
  "GritMalformedJson"
)<GritAdapterFailureFields> {}
export class GritSchemaDrift extends Data.TaggedError(
  "GritSchemaDrift"
)<GritAdapterFailureFields> {}
export class GritUnexpectedResultShape extends Data.TaggedError(
  "GritUnexpectedResultShape"
)<GritAdapterFailureFields> {}
export class GritEmptyScanRoots extends Data.TaggedError(
  "GritEmptyScanRoots"
)<GritAdapterFailureFields> {}
export class GritPatternMatchMissing extends Data.TaggedError(
  "GritPatternMatchMissing"
)<GritAdapterFailureFields> {}
export class GritUnexpectedDiagnosticIdentity extends Data.TaggedError(
  "GritUnexpectedDiagnosticIdentity"
)<GritAdapterFailureFields> {}
export class GritCacheProvenanceMissing extends Data.TaggedError(
  "GritCacheProvenanceMissing"
)<GritAdapterFailureFields> {}
export class GritAdapterInternalContractViolation extends Data.TaggedError(
  "GritAdapterInternalContractViolation"
)<GritAdapterFailureFields> {}

export function createGritAdapterFailure(
  tag: GritAdapterFailureTag,
  fields: GritAdapterFailureFields
): GritAdapterFailure {
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
    case "GritAdapterInternalContractViolation":
      return new GritAdapterInternalContractViolation(fields);
  }
}

export function isGritAdapterFailureTag(value: string): value is GritAdapterFailureTag {
  return Value.Check(GritAdapterFailureTagSchema, value);
}

export function renderGritAdapterFailure(
  tag: GritAdapterFailureTag,
  detail = "Grit adapter failed before producing rule findings."
): string {
  return `--- grit adapter failure (${tag}) ---\n${detail}`;
}
