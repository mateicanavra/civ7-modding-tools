import { type TSchema, Type } from "typebox";

import { base } from "../../../base";
import { toStandardSchema as standard } from "../../../schema/typebox-standard-schema";

const input = Type.Object(
  {
    node: Type.Integer({
      description: "Progression node to select as the active target.",
    }),
  },
  { additionalProperties: false }
);

const checkResult = Type.Object(
  {
    node: Type.Integer({
      description: "Progression node evaluated by the native target admission check.",
    }),
    status: Type.Union(
      [Type.Literal("available"), Type.Literal("already-selected"), Type.Literal("unavailable")],
      {
        description: "Target availability for the requested progression node.",
      }
    ),
  },
  { additionalProperties: false }
);

const postconditionVariant = <Properties extends Readonly<Record<string, TSchema>>>(
  properties: Properties
) => {
  const propertiesSchema = Type.Object(properties);

  return Type.Object(
    {
      reason: Type.String({
        description: "Evidence-based explanation for the progression target outcome.",
      }),
      ...propertiesSchema.properties,
    },
    { additionalProperties: false }
  );
};
const postconditionBy = {
  notSent: postconditionVariant({
    classification: Type.Literal("not-sent", {
      description: "Evidence classification for the progression target outcome.",
    }),
    outcome: Type.Literal("not-sent", {
      description: "Semantic target outcome derived from runtime evidence.",
    }),
    confidence: Type.Literal("unverified", {
      description: "Strength of the evidence supporting the target outcome.",
    }),
    confirmed: Type.Literal(false, {
      description: "Whether runtime evidence confirms the target outcome.",
    }),
    noRepeatAfterUnverified: Type.Literal(true, {
      description: "Whether callers must avoid retrying before reading fresh evidence.",
    }),
  }),
  confirmed: postconditionVariant({
    classification: Type.Literal("target-selected", {
      description: "Evidence classification for the progression target outcome.",
    }),
    outcome: Type.Literal("selected", {
      description: "Semantic target outcome derived from runtime evidence.",
    }),
    confidence: Type.Literal("confirmed", {
      description: "Strength of the evidence supporting the target outcome.",
    }),
    confirmed: Type.Literal(true, {
      description: "Whether runtime evidence confirms the target outcome.",
    }),
    noRepeatAfterUnverified: Type.Literal(false, {
      description: "Whether callers must avoid retrying before reading fresh evidence.",
    }),
  }),
  unknown: postconditionVariant({
    classification: Type.Literal("missing-postcondition", {
      description: "Evidence classification for the progression target outcome.",
    }),
    outcome: Type.Literal("unknown", {
      description: "Semantic target outcome derived from runtime evidence.",
    }),
    confidence: Type.Literal("unverified", {
      description: "Strength of the evidence supporting the target outcome.",
    }),
    confirmed: Type.Literal(false, {
      description: "Whether runtime evidence confirms the target outcome.",
    }),
    noRepeatAfterUnverified: Type.Literal(true, {
      description: "Whether callers must avoid retrying before reading fresh evidence.",
    }),
  }),
  partial: postconditionVariant({
    classification: Type.Literal("choice-selected-target-not-sent", {
      description: "Evidence classification for the progression target outcome.",
    }),
    outcome: Type.Literal("selected-partial", {
      description: "Semantic target outcome derived from runtime evidence.",
    }),
    confidence: Type.Literal("unverified", {
      description: "Strength of the evidence supporting the target outcome.",
    }),
    confirmed: Type.Literal(false, {
      description: "Whether runtime evidence confirms the target outcome.",
    }),
    noRepeatAfterUnverified: Type.Literal(true, {
      description: "Whether callers must avoid retrying before reading fresh evidence.",
    }),
  }),
  unchanged: postconditionVariant({
    classification: Type.Literal("no-state-change", {
      description: "Evidence classification for the progression target outcome.",
    }),
    outcome: Type.Literal("no-state-change", {
      description: "Semantic target outcome derived from runtime evidence.",
    }),
    confidence: Type.Literal("unverified", {
      description: "Strength of the evidence supporting the target outcome.",
    }),
    confirmed: Type.Literal(false, {
      description: "Whether runtime evidence confirms the target outcome.",
    }),
    noRepeatAfterUnverified: Type.Literal(true, {
      description: "Whether callers must avoid retrying before reading fresh evidence.",
    }),
  }),
};

const resultVariant = <
  const Source extends string,
  const Status extends string,
  Postcondition extends TSchema,
  const Kind extends "refresh-attention" | "inspect-progression-target" | "do-not-repeat",
>(
  source: Source,
  status: Status,
  postconditionSchema: Postcondition,
  kind: Kind
) =>
  Type.Object(
    {
      node: Type.Integer({
        description: "Progression node addressed by the target operation.",
      }),
      status: Type.Literal(status, {
        description: "Dispatch and verification state of the target operation.",
      }),
      postcondition: postconditionSchema,
      nextSteps: Type.Array(
        Type.Object(
          {
            kind: Type.Literal(kind, {
              description: "Recommended follow-up category for the target operation.",
            }),
            source: Type.Literal(source, {
              description: "Target procedure that produced the recommendation.",
            }),
            label: Type.String({
              description: "Human-readable target follow-up recommendation.",
            }),
          },
          { additionalProperties: false }
        ),
        {
          minItems: 1,
          maxItems: 1,
          description: "Required follow-up after the target operation.",
        }
      ),
    },
    { additionalProperties: false }
  );

const result = <const Source extends string>(source: Source) =>
  Type.Union([
    resultVariant(source, "not-sent", postconditionBy.notSent, "inspect-progression-target"),
    resultVariant(source, "already-selected", postconditionBy.confirmed, "refresh-attention"),
    resultVariant(source, "dispatch-unknown", postconditionBy.unknown, "do-not-repeat"),
    resultVariant(source, "sent-confirmed", postconditionBy.confirmed, "refresh-attention"),
    resultVariant(
      source,
      "sent-unverified",
      Type.Union([postconditionBy.partial, postconditionBy.unchanged]),
      "do-not-repeat"
    ),
  ]);

const leaf = <
  const Kind extends "technology" | "culture",
  const Source extends
    | "progression.technology.target.request"
    | "progression.culture.target.request",
>(
  kind: Kind,
  source: Source
) => ({
  check: base
    .input(standard(input))
    .output(standard(checkResult))
    .meta({
      family: "progression",
      procedureKey: `progression.${kind}.target.check`,
      proofBoundary: "local-package-test",
      risk: "read-only",
    }),
  request: base
    .input(standard(input))
    .output(standard(result(source)))
    .meta({
      family: "progression",
      procedureKey: source,
      proofBoundary: "local-package-test",
      risk: "mutation",
    }),
});

export const target = {
  technology: leaf("technology", "progression.technology.target.request"),
  culture: leaf("culture", "progression.culture.target.request"),
};
