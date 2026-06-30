import { Data } from "effect";
import { Value } from "typebox/value";
import {
  type ScaffoldingRefusalReason,
  type ScaffoldingRequestClass,
  type ScaffoldRefusal,
  ScaffoldRefusalSchema,
} from "./schema.ts";

export class ScaffoldRefusalError extends Data.TaggedError("ScaffoldRefusalError")<{
  readonly message: string;
  readonly refusal: ScaffoldRefusal;
}> {}

export function scaffoldRefusal(input: {
  blockedAction: string;
  requestClass: ScaffoldingRequestClass;
  reason: ScaffoldingRefusalReason;
  recovery: string;
  retryCondition: string;
}): ScaffoldRefusal {
  return Value.Parse(ScaffoldRefusalSchema, {
    kind: "scaffold-refusal",
    ...input,
    writeSet: [],
  });
}

export function throwScaffoldRefusal(input: {
  blockedAction: string;
  requestClass: ScaffoldingRequestClass;
  reason: ScaffoldingRefusalReason;
  recovery: string;
  retryCondition: string;
}): never {
  const refusal = scaffoldRefusal(input);
  throw new ScaffoldRefusalError({ message: renderScaffoldRefusal(refusal), refusal });
}

export function renderScaffoldRefusal(refusal: ScaffoldRefusal): string {
  return [
    `Habitat refused ${refusal.blockedAction}: ${refusal.reason}.`,
    `Recovery: ${refusal.recovery}`,
    `Retry when: ${refusal.retryCondition}`,
  ].join(" ");
}
