import { type TSchema, Type } from "typebox";

import { base } from "../../../base";
import { toStandardSchema as standard } from "../../../schema/typebox-standard-schema";

const changeCheckInput = Type.Object(
  {
    traditionType: Type.Integer({
      description: "Tradition to evaluate against the local player's active set.",
    }),
    action: Type.Union([Type.Literal("activate"), Type.Literal("deactivate")], {
      description: "Requested semantic change to the active tradition set.",
    }),
  },
  { additionalProperties: false }
);
const changeRequestInput = Type.Object(
  {
    traditionType: Type.Integer({
      description: "Tradition to activate or deactivate for the local player.",
    }),
    action: Type.Union([Type.Literal("activate"), Type.Literal("deactivate")], {
      description: "Requested semantic change to the active tradition set.",
    }),
    closeReview: Type.Optional(
      Type.Boolean({
        description: "Whether to close the tradition review after changing the active set.",
      })
    ),
  },
  { additionalProperties: false }
);
const reviewInput = Type.Object({}, { additionalProperties: false });

const changeCheckVariant = <ActionSchema extends TSchema, StatusSchema extends TSchema>(
  actionSchema: ActionSchema,
  statusSchema: StatusSchema
) =>
  Type.Object(
    {
      traditionType: Type.Integer({
        description: "Tradition evaluated against the ambient local player's active set.",
      }),
      action: actionSchema,
      status: statusSchema,
    },
    {
      additionalProperties: false,
      description: "Semantic availability of the requested tradition active-set change.",
    }
  );
const changeAction = Type.Union([Type.Literal("activate"), Type.Literal("deactivate")], {
  description: "Semantic tradition action evaluated by native admission.",
});
const changeCheckResult = Type.Union([
  changeCheckVariant(
    changeAction,
    Type.Literal("available", {
      description: "Native admission permits the requested tradition change.",
    })
  ),
  changeCheckVariant(
    Type.Literal("activate", {
      description: "Activation action evaluated by native admission.",
    }),
    Type.Literal("already-active", {
      description: "The requested tradition is already active.",
    })
  ),
  changeCheckVariant(
    Type.Literal("deactivate", {
      description: "Deactivation action evaluated by native admission.",
    }),
    Type.Literal("already-inactive", {
      description: "The requested tradition is already inactive.",
    })
  ),
  changeCheckVariant(
    changeAction,
    Type.Literal("unavailable", {
      description: "Native admission refuses the requested tradition change.",
    })
  ),
]);

const reviewCheckResult = Type.Object(
  {
    status: Type.Union(
      [Type.Literal("available"), Type.Literal("already-reviewed"), Type.Literal("unavailable")],
      {
        description: "Availability of the local player's tradition review closeout.",
      }
    ),
  },
  {
    additionalProperties: false,
    description: "Semantic availability of the local-player tradition review closeout.",
  }
);

const resultVariant = <
  const Source extends string,
  const Status extends string,
  Postcondition extends TSchema,
  const Kind extends "refresh-attention" | "inspect-progression-tradition" | "do-not-repeat",
  Properties extends Readonly<Record<string, TSchema>>,
>(
  source: Source,
  status: Status,
  postconditionSchema: Postcondition,
  kind: Kind,
  properties: Properties
) => {
  const propertiesSchema = Type.Object(properties);

  return Type.Object(
    {
      ...propertiesSchema.properties,
      status: Type.Literal(status, {
        description: "Dispatch and verification state of the tradition operation.",
      }),
      postcondition: postconditionSchema,
      nextSteps: Type.Array(
        Type.Object(
          {
            kind: Type.Literal(kind, {
              description: "Recommended follow-up category for the tradition operation.",
            }),
            source: Type.Literal(source, {
              description: "Tradition procedure that produced the recommendation.",
            }),
            label: Type.String({
              description: "Human-readable tradition follow-up recommendation.",
            }),
          },
          { additionalProperties: false }
        ),
        {
          minItems: 1,
          maxItems: 1,
          description: "Required follow-up after the tradition operation.",
        }
      ),
    },
    { additionalProperties: false }
  );
};

const postconditionVariant = <Properties extends Readonly<Record<string, TSchema>>>(
  properties: Properties
) => {
  const propertiesSchema = Type.Object(properties);

  return Type.Object(
    {
      reason: Type.String({
        description: "Evidence-based explanation for the tradition outcome.",
      }),
      ...propertiesSchema.properties,
    },
    { additionalProperties: false }
  );
};

const postconditionBy = {
  notSent: postconditionVariant({
    classification: Type.Literal("not-sent", {
      description: "Evidence classification for the tradition outcome.",
    }),
    outcome: Type.Literal("not-sent", {
      description: "Semantic tradition outcome derived from runtime evidence.",
    }),
    confidence: Type.Literal("unverified", {
      description: "Strength of the evidence supporting the tradition outcome.",
    }),
    confirmed: Type.Literal(false, {
      description: "Whether runtime evidence confirms the tradition outcome.",
    }),
    noRepeatAfterUnverified: Type.Literal(true, {
      description: "Whether callers must avoid retrying before reading fresh evidence.",
    }),
  }),
  changed: postconditionVariant({
    classification: Type.Union(
      [Type.Literal("tradition-changed"), Type.Literal("tradition-changed-review-closed")],
      {
        description: "Evidence classification for the tradition outcome.",
      }
    ),
    outcome: Type.Literal("changed", {
      description: "Semantic tradition outcome derived from runtime evidence.",
    }),
    confidence: Type.Literal("confirmed", {
      description: "Strength of the evidence supporting the tradition outcome.",
    }),
    confirmed: Type.Literal(true, {
      description: "Whether runtime evidence confirms the tradition outcome.",
    }),
    noRepeatAfterUnverified: Type.Literal(false, {
      description: "Whether callers must avoid retrying before reading fresh evidence.",
    }),
  }),
  changedOnly: postconditionVariant({
    classification: Type.Literal("tradition-changed", {
      description: "Evidence classification for the tradition outcome.",
    }),
    outcome: Type.Literal("changed", {
      description: "Semantic tradition outcome derived from runtime evidence.",
    }),
    confidence: Type.Literal("confirmed", {
      description: "Strength of the evidence supporting the tradition outcome.",
    }),
    confirmed: Type.Literal(true, {
      description: "Whether runtime evidence confirms the tradition outcome.",
    }),
    noRepeatAfterUnverified: Type.Literal(false, {
      description: "Whether callers must avoid retrying before reading fresh evidence.",
    }),
  }),
  reviewClosed: postconditionVariant({
    classification: Type.Literal("review-closed", {
      description: "Evidence classification for the tradition outcome.",
    }),
    outcome: Type.Literal("review-closed", {
      description: "Semantic tradition outcome derived from runtime evidence.",
    }),
    confidence: Type.Literal("confirmed", {
      description: "Strength of the evidence supporting the tradition outcome.",
    }),
    confirmed: Type.Literal(true, {
      description: "Whether runtime evidence confirms the tradition outcome.",
    }),
    noRepeatAfterUnverified: Type.Literal(false, {
      description: "Whether callers must avoid retrying before reading fresh evidence.",
    }),
  }),
  unknown: postconditionVariant({
    classification: Type.Literal("missing-postcondition", {
      description: "Evidence classification for the tradition outcome.",
    }),
    outcome: Type.Literal("unknown", {
      description: "Semantic tradition outcome derived from runtime evidence.",
    }),
    confidence: Type.Literal("unverified", {
      description: "Strength of the evidence supporting the tradition outcome.",
    }),
    confirmed: Type.Literal(false, {
      description: "Whether runtime evidence confirms the tradition outcome.",
    }),
    noRepeatAfterUnverified: Type.Literal(true, {
      description: "Whether callers must avoid retrying before reading fresh evidence.",
    }),
  }),
  changePartial: postconditionVariant({
    classification: Type.Literal("tradition-changed-review-unverified", {
      description: "Evidence classification for the tradition outcome.",
    }),
    outcome: Type.Literal("changed-partial", {
      description: "Semantic tradition outcome derived from runtime evidence.",
    }),
    confidence: Type.Literal("unverified", {
      description: "Strength of the evidence supporting the tradition outcome.",
    }),
    confirmed: Type.Literal(false, {
      description: "Whether runtime evidence confirms the tradition outcome.",
    }),
    noRepeatAfterUnverified: Type.Literal(true, {
      description: "Whether callers must avoid retrying before reading fresh evidence.",
    }),
  }),
  noState: postconditionVariant({
    classification: Type.Literal("no-state-change", {
      description: "Evidence classification for the tradition outcome.",
    }),
    outcome: Type.Literal("no-state-change", {
      description: "Semantic tradition outcome derived from runtime evidence.",
    }),
    confidence: Type.Literal("unverified", {
      description: "Strength of the evidence supporting the tradition outcome.",
    }),
    confirmed: Type.Literal(false, {
      description: "Whether runtime evidence confirms the tradition outcome.",
    }),
    noRepeatAfterUnverified: Type.Literal(true, {
      description: "Whether callers must avoid retrying before reading fresh evidence.",
    }),
  }),
};
const changeUnverified = Type.Union([postconditionBy.changePartial, postconditionBy.noState]);
const changeResultProperties = <ActionSchema extends TSchema>(action: ActionSchema) => ({
  traditionType: Type.Integer({
    description: "Tradition addressed by the active-set change.",
  }),
  action,
});

const changeResult = Type.Union([
  resultVariant(
    "progression.tradition.change.request",
    "not-sent",
    postconditionBy.notSent,
    "inspect-progression-tradition",
    changeResultProperties(changeAction)
  ),
  resultVariant(
    "progression.tradition.change.request",
    "already-active",
    postconditionBy.changedOnly,
    "refresh-attention",
    changeResultProperties(
      Type.Literal("activate", {
        description: "Activation action applied to the tradition.",
      })
    )
  ),
  resultVariant(
    "progression.tradition.change.request",
    "already-inactive",
    postconditionBy.changedOnly,
    "refresh-attention",
    changeResultProperties(
      Type.Literal("deactivate", {
        description: "Deactivation action applied to the tradition.",
      })
    )
  ),
  resultVariant(
    "progression.tradition.change.request",
    "dispatch-unknown",
    Type.Union([postconditionBy.unknown, postconditionBy.changePartial]),
    "do-not-repeat",
    changeResultProperties(changeAction)
  ),
  resultVariant(
    "progression.tradition.change.request",
    "sent-confirmed",
    postconditionBy.changed,
    "refresh-attention",
    changeResultProperties(changeAction)
  ),
  resultVariant(
    "progression.tradition.change.request",
    "sent-unverified",
    changeUnverified,
    "do-not-repeat",
    changeResultProperties(changeAction)
  ),
]);

const reviewResult = Type.Union([
  resultVariant(
    "progression.tradition.review.request",
    "not-sent",
    postconditionBy.notSent,
    "inspect-progression-tradition",
    {}
  ),
  resultVariant(
    "progression.tradition.review.request",
    "already-reviewed",
    postconditionBy.reviewClosed,
    "refresh-attention",
    {}
  ),
  resultVariant(
    "progression.tradition.review.request",
    "dispatch-unknown",
    postconditionBy.unknown,
    "do-not-repeat",
    {}
  ),
  resultVariant(
    "progression.tradition.review.request",
    "sent-confirmed",
    postconditionBy.reviewClosed,
    "refresh-attention",
    {}
  ),
  resultVariant(
    "progression.tradition.review.request",
    "sent-unverified",
    postconditionBy.noState,
    "do-not-repeat",
    {}
  ),
]);

export const tradition = {
  change: {
    check: base.input(standard(changeCheckInput)).output(standard(changeCheckResult)).meta({
      family: "progression",
      procedureKey: "progression.tradition.change.check",
      proofBoundary: "local-package-test",
      risk: "read-only",
    }),
    request: base.input(standard(changeRequestInput)).output(standard(changeResult)).meta({
      family: "progression",
      procedureKey: "progression.tradition.change.request",
      proofBoundary: "local-package-test",
      risk: "mutation",
    }),
  },
  review: {
    check: base.input(standard(reviewInput)).output(standard(reviewCheckResult)).meta({
      family: "progression",
      procedureKey: "progression.tradition.review.check",
      proofBoundary: "local-package-test",
      risk: "read-only",
    }),
    request: base.input(standard(reviewInput)).output(standard(reviewResult)).meta({
      family: "progression",
      procedureKey: "progression.tradition.review.request",
      proofBoundary: "local-package-test",
      risk: "mutation",
    }),
  },
};
