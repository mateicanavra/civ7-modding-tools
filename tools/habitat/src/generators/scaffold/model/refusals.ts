import { Data, Match } from "effect";
import { Value } from "typebox/value";
import {
  type ScaffoldingRefusalReason,
  type ScaffoldingRequestClass,
  type ScaffoldRefusal,
  ScaffoldRefusalSchema,
} from "./schema.ts";

const PRODUCT_AUTHORING_KEYS = ["recipe", "stage", "op", "step"] as const;

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

export function productAuthoringRefusal(input: {
  surface: "project" | "pattern";
  fields: readonly string[];
}): ScaffoldRefusal {
  const fields = Match.value(input.fields.length).pipe(
    Match.when(0, () => "unknown"),
    Match.orElse(() => input.fields.join(", "))
  );
  return scaffoldRefusal({
    blockedAction: `${input.surface} scaffold product authoring fields '${fields}'`,
    requestClass: "unsupported-product-authoring",
    reason: "unsupported-product-authoring",
    recovery:
      "Use a future accepted product authoring domain; generic Habitat scaffolding only creates supported project and pattern authority files.",
    retryCondition:
      "Retry after a product authoring packet defines the domain, schema, ownership, and generator surface.",
  });
}

export function productAuthoringFields(input: unknown): readonly string[] {
  if (!input || typeof input !== "object") return [];
  return PRODUCT_AUTHORING_KEYS.filter((key) => Object.prototype.hasOwnProperty.call(input, key));
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
