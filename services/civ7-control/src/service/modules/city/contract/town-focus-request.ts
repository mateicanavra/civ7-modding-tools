import { Type } from "typebox";

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
    city: Type.Optional(
      Type.Integer({
        description: "Optional engine city value required by the selected focus.",
      })
    ),
  },
  { additionalProperties: false }
);

const Civ7CityTownFocusReviewInputSchema = Type.Object(
  {
    cityId: Civ7ControlOrpcComponentIdSchema,
  },
  { additionalProperties: false }
);

const Civ7CityTownFocusPostconditionClassificationSchema = Type.Union([
  Type.Literal("not-sent"),
  Type.Literal("pending-runtime-proof"),
  Type.Literal("missing-postcondition"),
]);

const Civ7CityTownFocusProofOutcomeSchema = Type.Union([
  Type.Literal("not-sent"),
  Type.Literal("unknown"),
]);

const Civ7CityTownFocusRequestStatusSchema = Type.Union([
  Type.Literal("not-sent"),
  Type.Literal("sent-unverified"),
]);

const Civ7CityTownFocusValidationSummarySchema = Type.Object(
  {
    beforeValid: Type.Boolean({
      description: "Whether the town-focus action validated before the request.",
    }),
    afterValid: Type.Boolean({
      description: "Whether the town-focus action still validates after the request.",
    }),
  },
  { additionalProperties: false }
);

const Civ7CityTownFocusPostconditionSummarySchema = Type.Object(
  {
    classification: Civ7CityTownFocusPostconditionClassificationSchema,
    reason: Type.String({
      description: "Evidence-based reason for the postcondition classification.",
    }),
    outcome: Civ7CityTownFocusProofOutcomeSchema,
    confidence: Type.Union([Type.Literal("unverified"), Type.Literal("pending-runtime-proof")], {
      description: "Confidence established by postcondition evidence.",
    }),
    confirmed: Type.Boolean({
      description: "Whether postcondition evidence confirms the town-focus outcome.",
    }),
    noRepeatAfterUnverified: Type.Boolean({
      description: "Whether an unverified send must not be repeated without fresh evidence.",
    }),
  },
  { additionalProperties: false }
);

const Civ7CityTownFocusChangeNextStepSchema = Type.Object(
  {
    kind: Type.Union([Type.Literal("do-not-repeat"), Type.Literal("inspect-town-focus")], {
      description: "Recommended follow-up action for the focus-change result.",
    }),
    source: Type.Literal("city.townFocus.change.request", {
      description: "Procedure that supplied the recommendation.",
    }),
    label: Type.String({
      description: "Human-readable follow-up recommendation.",
    }),
  },
  { additionalProperties: false }
);

const Civ7CityTownFocusReviewNextStepSchema = Type.Object(
  {
    kind: Type.Union([Type.Literal("do-not-repeat"), Type.Literal("inspect-town-focus")], {
      description: "Recommended follow-up action for the focus-review result.",
    }),
    source: Type.Literal("city.townFocus.review.request", {
      description: "Procedure that supplied the recommendation.",
    }),
    label: Type.String({
      description: "Human-readable follow-up recommendation.",
    }),
  },
  { additionalProperties: false }
);

const Civ7CityTownFocusResultBaseSchema = Type.Object(
  {
    cityId: Civ7ControlOrpcComponentIdSchema,
    sent: Type.Boolean({
      description: "Whether the town-focus request was sent to the game runtime.",
    }),
    status: Civ7CityTownFocusRequestStatusSchema,
    validation: Civ7CityTownFocusValidationSummarySchema,
    postcondition: Civ7CityTownFocusPostconditionSummarySchema,
  },
  { additionalProperties: false }
);

const Civ7CityTownFocusChangeResultSchema = Type.Object(
  {
    ...Civ7CityTownFocusResultBaseSchema.properties,
    growthType: Type.Integer({
      description: "Engine growth type returned for the town.",
    }),
    projectType: Type.Integer({
      description: "Engine project type returned for the town.",
    }),
    city: Type.Integer({
      description: "Engine city value returned for the town.",
    }),
    nextSteps: Type.Array(Civ7CityTownFocusChangeNextStepSchema, {
      description: "Evidence-based follow-up actions.",
    }),
  },
  { additionalProperties: false }
);

const Civ7CityTownFocusReviewResultSchema = Type.Object(
  {
    ...Civ7CityTownFocusResultBaseSchema.properties,
    nextSteps: Type.Array(Civ7CityTownFocusReviewNextStepSchema, {
      description: "Evidence-based follow-up actions.",
    }),
  },
  { additionalProperties: false }
);

export const townFocusRequest = {
  change: base
    .input(standard(Civ7CityTownFocusChangeInputSchema))
    .output(standard(Civ7CityTownFocusChangeResultSchema))
    .meta({
      family: "city",
      procedureKey: "city.townFocus.change.request",
      proofBoundary: "local-package-test",
      risk: "mutation",
    }),
  review: base
    .input(standard(Civ7CityTownFocusReviewInputSchema))
    .output(standard(Civ7CityTownFocusReviewResultSchema))
    .meta({
      family: "city",
      procedureKey: "city.townFocus.review.request",
      proofBoundary: "local-package-test",
      risk: "mutation",
    }),
};
