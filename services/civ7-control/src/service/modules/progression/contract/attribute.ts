import { type TSchema, Type } from "typebox";

import { base } from "../../../base";
import { toStandardSchema as standard } from "../../../schema/typebox-standard-schema";

const purchaseCheckInput = Type.Object(
  {
    node: Type.Integer({
      description: "Attribute node to evaluate for purchase.",
    }),
  },
  { additionalProperties: false }
);
const purchaseRequestInput = Type.Object(
  {
    node: Type.Integer({
      description: "Attribute node to purchase.",
    }),
    closeReview: Type.Optional(
      Type.Boolean({
        description: "Whether to close the attribute review after purchasing.",
      })
    ),
  },
  { additionalProperties: false }
);
const reviewInput = Type.Object({}, { additionalProperties: false });

const purchaseCheckResult = Type.Object(
  {
    node: Type.Integer({
      description: "Focused attribute node evaluated by the native admission check.",
    }),
    status: Type.Union(
      [Type.Literal("available"), Type.Literal("already-purchased"), Type.Literal("unavailable")],
      {
        description: "Purchase availability for the requested attribute node.",
      }
    ),
  },
  {
    additionalProperties: false,
    description: "Semantic availability of one local-player attribute purchase.",
  }
);

const reviewCheckResult = Type.Object(
  {
    status: Type.Union(
      [Type.Literal("available"), Type.Literal("already-reviewed"), Type.Literal("unavailable")],
      {
        description: "Availability of the local player's attribute review closeout.",
      }
    ),
  },
  {
    additionalProperties: false,
    description: "Semantic availability of the local-player attribute review closeout.",
  }
);

const resultVariant = <
  const Source extends string,
  const Status extends string,
  Postcondition extends TSchema,
  const Kind extends "refresh-attention" | "inspect-progression-attribute" | "do-not-repeat",
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
        description: "Dispatch and verification state of the attribute operation.",
      }),
      postcondition: postconditionSchema,
      nextSteps: Type.Array(
        Type.Object(
          {
            kind: Type.Literal(kind, {
              description: "Recommended follow-up category for the attribute operation.",
            }),
            source: Type.Literal(source, {
              description: "Attribute procedure that produced the recommendation.",
            }),
            label: Type.String({
              description: "Human-readable attribute follow-up recommendation.",
            }),
          },
          { additionalProperties: false }
        ),
        {
          minItems: 1,
          maxItems: 1,
          description: "Required follow-up after the attribute operation.",
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
        description: "Evidence-based explanation for the attribute outcome.",
      }),
      ...propertiesSchema.properties,
    },
    { additionalProperties: false }
  );
};

const postconditionBy = {
  notSent: postconditionVariant({
    classification: Type.Literal("not-sent", {
      description: "Evidence classification for the attribute outcome.",
    }),
    outcome: Type.Literal("not-sent", {
      description: "Semantic attribute outcome derived from runtime evidence.",
    }),
    confidence: Type.Literal("unverified", {
      description: "Strength of the evidence supporting the attribute outcome.",
    }),
    confirmed: Type.Literal(false, {
      description: "Whether runtime evidence confirms the attribute outcome.",
    }),
    noRepeatAfterUnverified: Type.Literal(true, {
      description: "Whether callers must avoid retrying before reading fresh evidence.",
    }),
  }),
  purchased: postconditionVariant({
    classification: Type.Union(
      [Type.Literal("attribute-purchased"), Type.Literal("attribute-purchased-review-closed")],
      {
        description: "Evidence classification for the attribute outcome.",
      }
    ),
    outcome: Type.Literal("purchased", {
      description: "Semantic attribute outcome derived from runtime evidence.",
    }),
    confidence: Type.Literal("confirmed", {
      description: "Strength of the evidence supporting the attribute outcome.",
    }),
    confirmed: Type.Literal(true, {
      description: "Whether runtime evidence confirms the attribute outcome.",
    }),
    noRepeatAfterUnverified: Type.Literal(false, {
      description: "Whether callers must avoid retrying before reading fresh evidence.",
    }),
  }),
  purchasedOnly: postconditionVariant({
    classification: Type.Literal("attribute-purchased", {
      description: "Evidence classification for the attribute outcome.",
    }),
    outcome: Type.Literal("purchased", {
      description: "Semantic attribute outcome derived from runtime evidence.",
    }),
    confidence: Type.Literal("confirmed", {
      description: "Strength of the evidence supporting the attribute outcome.",
    }),
    confirmed: Type.Literal(true, {
      description: "Whether runtime evidence confirms the attribute outcome.",
    }),
    noRepeatAfterUnverified: Type.Literal(false, {
      description: "Whether callers must avoid retrying before reading fresh evidence.",
    }),
  }),
  reviewClosed: postconditionVariant({
    classification: Type.Literal("review-closed", {
      description: "Evidence classification for the attribute outcome.",
    }),
    outcome: Type.Literal("review-closed", {
      description: "Semantic attribute outcome derived from runtime evidence.",
    }),
    confidence: Type.Literal("confirmed", {
      description: "Strength of the evidence supporting the attribute outcome.",
    }),
    confirmed: Type.Literal(true, {
      description: "Whether runtime evidence confirms the attribute outcome.",
    }),
    noRepeatAfterUnverified: Type.Literal(false, {
      description: "Whether callers must avoid retrying before reading fresh evidence.",
    }),
  }),
  unknown: postconditionVariant({
    classification: Type.Literal("missing-postcondition", {
      description: "Evidence classification for the attribute outcome.",
    }),
    outcome: Type.Literal("unknown", {
      description: "Semantic attribute outcome derived from runtime evidence.",
    }),
    confidence: Type.Literal("unverified", {
      description: "Strength of the evidence supporting the attribute outcome.",
    }),
    confirmed: Type.Literal(false, {
      description: "Whether runtime evidence confirms the attribute outcome.",
    }),
    noRepeatAfterUnverified: Type.Literal(true, {
      description: "Whether callers must avoid retrying before reading fresh evidence.",
    }),
  }),
  purchasePartial: postconditionVariant({
    classification: Type.Literal("attribute-purchased-review-unverified", {
      description: "Evidence classification for the attribute outcome.",
    }),
    outcome: Type.Literal("purchased-partial", {
      description: "Semantic attribute outcome derived from runtime evidence.",
    }),
    confidence: Type.Literal("unverified", {
      description: "Strength of the evidence supporting the attribute outcome.",
    }),
    confirmed: Type.Literal(false, {
      description: "Whether runtime evidence confirms the attribute outcome.",
    }),
    noRepeatAfterUnverified: Type.Literal(true, {
      description: "Whether callers must avoid retrying before reading fresh evidence.",
    }),
  }),
  noState: postconditionVariant({
    classification: Type.Literal("no-state-change", {
      description: "Evidence classification for the attribute outcome.",
    }),
    outcome: Type.Literal("no-state-change", {
      description: "Semantic attribute outcome derived from runtime evidence.",
    }),
    confidence: Type.Literal("unverified", {
      description: "Strength of the evidence supporting the attribute outcome.",
    }),
    confirmed: Type.Literal(false, {
      description: "Whether runtime evidence confirms the attribute outcome.",
    }),
    noRepeatAfterUnverified: Type.Literal(true, {
      description: "Whether callers must avoid retrying before reading fresh evidence.",
    }),
  }),
};
const purchaseUnverified = Type.Union([postconditionBy.purchasePartial, postconditionBy.noState]);

const purchaseResult = Type.Union([
  resultVariant(
    "progression.attribute.purchase.request",
    "not-sent",
    postconditionBy.notSent,
    "inspect-progression-attribute",
    {
      node: Type.Integer({
        description: "Attribute node addressed by the purchase operation.",
      }),
    }
  ),
  resultVariant(
    "progression.attribute.purchase.request",
    "already-purchased",
    postconditionBy.purchasedOnly,
    "refresh-attention",
    {
      node: Type.Integer({
        description: "Attribute node addressed by the purchase operation.",
      }),
    }
  ),
  resultVariant(
    "progression.attribute.purchase.request",
    "dispatch-unknown",
    Type.Union([postconditionBy.unknown, postconditionBy.purchasePartial]),
    "do-not-repeat",
    {
      node: Type.Integer({
        description: "Attribute node addressed by the purchase operation.",
      }),
    }
  ),
  resultVariant(
    "progression.attribute.purchase.request",
    "sent-confirmed",
    postconditionBy.purchased,
    "refresh-attention",
    {
      node: Type.Integer({
        description: "Attribute node addressed by the purchase operation.",
      }),
    }
  ),
  resultVariant(
    "progression.attribute.purchase.request",
    "sent-unverified",
    purchaseUnverified,
    "do-not-repeat",
    {
      node: Type.Integer({
        description: "Attribute node addressed by the purchase operation.",
      }),
    }
  ),
]);

const reviewResult = Type.Union([
  resultVariant(
    "progression.attribute.review.request",
    "not-sent",
    postconditionBy.notSent,
    "inspect-progression-attribute",
    {}
  ),
  resultVariant(
    "progression.attribute.review.request",
    "already-reviewed",
    postconditionBy.reviewClosed,
    "refresh-attention",
    {}
  ),
  resultVariant(
    "progression.attribute.review.request",
    "dispatch-unknown",
    postconditionBy.unknown,
    "do-not-repeat",
    {}
  ),
  resultVariant(
    "progression.attribute.review.request",
    "sent-confirmed",
    postconditionBy.reviewClosed,
    "refresh-attention",
    {}
  ),
  resultVariant(
    "progression.attribute.review.request",
    "sent-unverified",
    postconditionBy.noState,
    "do-not-repeat",
    {}
  ),
]);

export const attribute = {
  purchase: {
    check: base.input(standard(purchaseCheckInput)).output(standard(purchaseCheckResult)).meta({
      family: "progression",
      procedureKey: "progression.attribute.purchase.check",
      proofBoundary: "local-package-test",
      risk: "read-only",
    }),
    request: base.input(standard(purchaseRequestInput)).output(standard(purchaseResult)).meta({
      family: "progression",
      procedureKey: "progression.attribute.purchase.request",
      proofBoundary: "local-package-test",
      risk: "mutation",
    }),
  },
  review: {
    check: base.input(standard(reviewInput)).output(standard(reviewCheckResult)).meta({
      family: "progression",
      procedureKey: "progression.attribute.review.check",
      proofBoundary: "local-package-test",
      risk: "read-only",
    }),
    request: base.input(standard(reviewInput)).output(standard(reviewResult)).meta({
      family: "progression",
      procedureKey: "progression.attribute.review.request",
      proofBoundary: "local-package-test",
      risk: "mutation",
    }),
  },
};
