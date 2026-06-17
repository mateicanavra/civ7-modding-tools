import { Data } from "effect";

export const gritAdapterFailureTags = [
  "GritToolUnavailable",
  "GritCommandFailed",
  "GritNoJson",
  "GritMalformedJson",
  "GritSchemaDrift",
  "GritUnexpectedResultShape",
  "GritEmptyScanRoots",
  "GritPatternProjectionMiss",
  "GritUnexpectedPatternIdentity",
  "GritCacheProvenanceMissing",
  "GritApplyDirtyWorktree",
  "GritApplyDryRunMismatch",
  "GritApplyUnexpectedFile",
  "GritApplyMissingTargetExport",
  "GritApplyRollbackFailed",
  "GritAdapterInternalContractViolation",
] as const;

export type GritAdapterFailureTag = (typeof gritAdapterFailureTags)[number];

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
  | GritPatternProjectionMiss
  | GritUnexpectedPatternIdentity
  | GritCacheProvenanceMissing
  | GritApplyDirtyWorktree
  | GritApplyDryRunMismatch
  | GritApplyUnexpectedFile
  | GritApplyMissingTargetExport
  | GritApplyRollbackFailed
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
export class GritPatternProjectionMiss extends Data.TaggedError(
  "GritPatternProjectionMiss"
)<GritAdapterFailureFields> {}
export class GritUnexpectedPatternIdentity extends Data.TaggedError(
  "GritUnexpectedPatternIdentity"
)<GritAdapterFailureFields> {}
export class GritCacheProvenanceMissing extends Data.TaggedError(
  "GritCacheProvenanceMissing"
)<GritAdapterFailureFields> {}
export class GritApplyDirtyWorktree extends Data.TaggedError(
  "GritApplyDirtyWorktree"
)<GritAdapterFailureFields> {}
export class GritApplyDryRunMismatch extends Data.TaggedError(
  "GritApplyDryRunMismatch"
)<GritAdapterFailureFields> {}
export class GritApplyUnexpectedFile extends Data.TaggedError(
  "GritApplyUnexpectedFile"
)<GritAdapterFailureFields> {}
export class GritApplyMissingTargetExport extends Data.TaggedError(
  "GritApplyMissingTargetExport"
)<GritAdapterFailureFields> {}
export class GritApplyRollbackFailed extends Data.TaggedError(
  "GritApplyRollbackFailed"
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
    case "GritPatternProjectionMiss":
      return new GritPatternProjectionMiss(fields);
    case "GritUnexpectedPatternIdentity":
      return new GritUnexpectedPatternIdentity(fields);
    case "GritCacheProvenanceMissing":
      return new GritCacheProvenanceMissing(fields);
    case "GritApplyDirtyWorktree":
      return new GritApplyDirtyWorktree(fields);
    case "GritApplyDryRunMismatch":
      return new GritApplyDryRunMismatch(fields);
    case "GritApplyUnexpectedFile":
      return new GritApplyUnexpectedFile(fields);
    case "GritApplyMissingTargetExport":
      return new GritApplyMissingTargetExport(fields);
    case "GritApplyRollbackFailed":
      return new GritApplyRollbackFailed(fields);
    case "GritAdapterInternalContractViolation":
      return new GritAdapterInternalContractViolation(fields);
  }
}

export function isGritAdapterFailureTag(value: string): value is GritAdapterFailureTag {
  return gritAdapterFailureTags.includes(value as GritAdapterFailureTag);
}

export function renderGritAdapterFailure(
  tag: GritAdapterFailureTag,
  detail = "Grit adapter failed before producing rule findings."
): string {
  return `--- grit adapter failure (${tag}) ---\n${detail}`;
}
