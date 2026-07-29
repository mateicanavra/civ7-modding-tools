import { type TSchema, Type } from "typebox";

import { Civ7ControlOrpcComponentIdSchema } from "#civ7-control-service/model/dto/primitives";
import { base } from "../../../base";
import { toStandardSchema as standard } from "../../../schema/typebox-standard-schema";

const Civ7CityTownFocusChangeInputSchema = Type.Object(
  {
    cityId: Civ7ControlOrpcComponentIdSchema,
    growthType: Type.Integer({
      description: "Engine growth type selected for the town.",
    }),
    projectType: Type.Integer({
      description: "Engine project type paired with the selected focus.",
    }),
  },
  { additionalProperties: false }
);

const Civ7CityTownFocusReviewInputSchema = Type.Object(
  {
    cityId: Civ7ControlOrpcComponentIdSchema,
  },
  { additionalProperties: false }
);

const Civ7CityTownFocusChangeCheckResultSchema = Type.Object(
  {
    cityId: Civ7ControlOrpcComponentIdSchema,
    growthType: Type.Integer({
      description: "Engine growth type evaluated for the requested town focus.",
    }),
    projectType: Type.Integer({
      description: "Engine project type evaluated for the requested town focus.",
    }),
    status: Type.Union(
      [Type.Literal("available"), Type.Literal("selected"), Type.Literal("unavailable")],
      {
        description: "Whether the requested focus is admissible, already selected, or unavailable.",
      }
    ),
  },
  { additionalProperties: false }
);

const Civ7CityTownFocusReviewCheckResultSchema = Type.Object(
  {
    cityId: Civ7ControlOrpcComponentIdSchema,
    status: Type.Union(
      [Type.Literal("available"), Type.Literal("complete"), Type.Literal("unavailable")],
      {
        description:
          "Whether a matching town-project review is available, already complete, or unavailable.",
      }
    ),
  },
  { additionalProperties: false }
);

const confirmedPostcondition = <const Classification extends string, const Outcome extends string>(
  classification: Classification,
  outcome: Outcome
) =>
  Type.Object(
    {
      classification: Type.Literal(classification, {
        description: "Semantic postcondition classification.",
      }),
      reason: Type.String({
        description: "Human-readable evidence supporting the classification.",
      }),
      outcome: Type.Literal(outcome, {
        description: "Confirmed semantic outcome.",
      }),
      confidence: Type.Literal("confirmed", {
        description: "Evidence confidence for the observed outcome.",
      }),
      confirmed: Type.Literal(true, {
        description: "Whether native state confirms the requested outcome.",
      }),
      noRepeatAfterUnverified: Type.Literal(false, {
        description: "Whether callers must avoid repeating the mutation before another read.",
      }),
    },
    { additionalProperties: false }
  );

const unverifiedPostcondition = <const Classification extends string, const Outcome extends string>(
  classification: Classification,
  outcome: Outcome
) =>
  Type.Object(
    {
      classification: Type.Literal(classification, {
        description: "Semantic postcondition classification.",
      }),
      reason: Type.String({
        description: "Human-readable evidence supporting the classification.",
      }),
      outcome: Type.Literal(outcome, {
        description: "Unverified semantic outcome.",
      }),
      confidence: Type.Literal("unverified", {
        description: "Evidence confidence for the observed outcome.",
      }),
      confirmed: Type.Literal(false, {
        description: "Whether native state confirms the requested outcome.",
      }),
      noRepeatAfterUnverified: Type.Literal(true, {
        description: "Whether callers must avoid repeating the mutation before another read.",
      }),
    },
    { additionalProperties: false }
  );

const notSentPostcondition = unverifiedPostcondition("not-sent", "not-sent");
const selectedPostcondition = confirmedPostcondition("town-focus-selected", "selected");
const reviewClearedPostcondition = confirmedPostcondition(
  "town-focus-review-cleared",
  "review-cleared"
);
const unchangedPostcondition = unverifiedPostcondition("no-state-change", "no-state-change");
const missingPostcondition = unverifiedPostcondition("missing-postcondition", "unknown");

const nextSteps = <
  const Source extends "city.townFocus.change.request" | "city.townFocus.review.request",
  const Kind extends "inspect-town-focus" | "do-not-repeat" | "refresh-attention",
>(
  source: Source,
  kind: Kind
) =>
  Type.Array(
    Type.Object(
      {
        kind: Type.Literal(kind, {
          description: "Action category recommended to the caller.",
        }),
        source: Type.Literal(source, {
          description: "Procedure whose result produced the recommendation.",
        }),
        label: Type.String({
          description: "Human-readable next action.",
        }),
      },
      { additionalProperties: false }
    ),
    { minItems: 1, maxItems: 1 }
  );

const resultVariant = <
  const Status extends string,
  Properties extends Readonly<Record<string, TSchema>>,
  PostconditionSchema extends TSchema,
  NextStepsSchema extends TSchema,
>(
  status: Status,
  properties: Properties,
  postconditionSchema: PostconditionSchema,
  nextStepsSchema: NextStepsSchema
) => {
  const PropertiesSchema = Type.Object(properties, { additionalProperties: false });
  const StatusSchema = Type.Literal(status, {
    description: "Semantic result status for the requested town-focus action.",
  });

  return Type.Object(
    {
      cityId: Civ7ControlOrpcComponentIdSchema,
      ...PropertiesSchema.properties,
      status: StatusSchema,
      postcondition: postconditionSchema,
      nextSteps: nextStepsSchema,
    },
    { additionalProperties: false }
  );
};

const ChangeResultPropertiesSchema = Type.Object(
  {
    growthType: Type.Integer({
      description: "Engine growth type requested for the town.",
    }),
    projectType: Type.Integer({
      description: "Engine project type requested for the town.",
    }),
  },
  { additionalProperties: false }
);
const EmptyResultPropertiesSchema = Type.Object({}, { additionalProperties: false });
const changeInspect = nextSteps("city.townFocus.change.request", "inspect-town-focus");
const changeNoRepeat = nextSteps("city.townFocus.change.request", "do-not-repeat");
const changeRefresh = nextSteps("city.townFocus.change.request", "refresh-attention");
const reviewInspect = nextSteps("city.townFocus.review.request", "inspect-town-focus");
const reviewNoRepeat = nextSteps("city.townFocus.review.request", "do-not-repeat");
const reviewRefresh = nextSteps("city.townFocus.review.request", "refresh-attention");

const Civ7CityTownFocusChangeResultSchema = Type.Union([
  resultVariant(
    "already-selected",
    ChangeResultPropertiesSchema.properties,
    selectedPostcondition,
    changeRefresh
  ),
  resultVariant(
    "not-sent",
    ChangeResultPropertiesSchema.properties,
    notSentPostcondition,
    changeInspect
  ),
  resultVariant(
    "dispatch-unknown",
    ChangeResultPropertiesSchema.properties,
    missingPostcondition,
    changeNoRepeat
  ),
  resultVariant(
    "sent-confirmed",
    ChangeResultPropertiesSchema.properties,
    selectedPostcondition,
    changeRefresh
  ),
  resultVariant(
    "sent-unverified",
    ChangeResultPropertiesSchema.properties,
    Type.Union([unchangedPostcondition, missingPostcondition]),
    changeNoRepeat
  ),
]);

const Civ7CityTownFocusReviewResultSchema = Type.Union([
  resultVariant(
    "already-complete",
    EmptyResultPropertiesSchema.properties,
    reviewClearedPostcondition,
    reviewRefresh
  ),
  resultVariant(
    "not-sent",
    EmptyResultPropertiesSchema.properties,
    notSentPostcondition,
    reviewInspect
  ),
  resultVariant(
    "dispatch-unknown",
    EmptyResultPropertiesSchema.properties,
    missingPostcondition,
    reviewNoRepeat
  ),
  resultVariant(
    "sent-confirmed",
    EmptyResultPropertiesSchema.properties,
    reviewClearedPostcondition,
    reviewRefresh
  ),
  resultVariant(
    "sent-unverified",
    EmptyResultPropertiesSchema.properties,
    Type.Union([unchangedPostcondition, missingPostcondition]),
    reviewNoRepeat
  ),
]);

export const townFocus = {
  change: {
    check: base
      .input(standard(Civ7CityTownFocusChangeInputSchema))
      .output(standard(Civ7CityTownFocusChangeCheckResultSchema))
      .meta({
        family: "city",
        procedureKey: "city.townFocus.change.check",
        proofBoundary: "local-package-test",
        risk: "read-only",
      }),
    request: base
      .input(standard(Civ7CityTownFocusChangeInputSchema))
      .output(standard(Civ7CityTownFocusChangeResultSchema))
      .meta({
        family: "city",
        procedureKey: "city.townFocus.change.request",
        proofBoundary: "local-package-test",
        risk: "mutation",
      }),
  },
  review: {
    check: base
      .input(standard(Civ7CityTownFocusReviewInputSchema))
      .output(standard(Civ7CityTownFocusReviewCheckResultSchema))
      .meta({
        family: "city",
        procedureKey: "city.townFocus.review.check",
        proofBoundary: "local-package-test",
        risk: "read-only",
      }),
    request: base
      .input(standard(Civ7CityTownFocusReviewInputSchema))
      .output(standard(Civ7CityTownFocusReviewResultSchema))
      .meta({
        family: "city",
        procedureKey: "city.townFocus.review.request",
        proofBoundary: "local-package-test",
        risk: "mutation",
      }),
  },
};
