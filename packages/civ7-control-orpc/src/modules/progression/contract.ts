import type { ContractProcedure } from "@orpc/contract";
import { Type, type Static } from "typebox";

import { civ7ControlOrpcContractBase } from "../../contract-base";
import type { Civ7ControlOrpcErrorMap } from "../../errors";
import type { Civ7ControlOrpcProcedureMeta } from "../../metadata";
import { Civ7ControlOrpcComponentIdSchema } from "../../model/primitives";
import { toStandardSchema } from "../../typebox-standard-schema";

export const Civ7ProgressionChoiceInputSchema = Type.Object(
  {
    playerId: Type.Integer({ minimum: 0, maximum: 1024 }),
    node: Type.Integer(),
    notificationId: Type.Optional(Civ7ControlOrpcComponentIdSchema),
  },
  { additionalProperties: false },
);
export type Civ7ProgressionChoiceInput = Static<
  typeof Civ7ProgressionChoiceInputSchema
>;

export const Civ7ProgressionTargetInputSchema = Type.Object(
  {
    playerId: Type.Integer({ minimum: 0, maximum: 1024 }),
    node: Type.Integer(),
  },
  { additionalProperties: false },
);
export type Civ7ProgressionTargetInput = Static<
  typeof Civ7ProgressionTargetInputSchema
>;

const Civ7ProgressionAttributePurchaseInputSchema = Type.Object(
  {
    node: Type.Integer(),
  },
  { additionalProperties: false },
);
export type Civ7ProgressionAttributePurchaseInput = Static<
  typeof Civ7ProgressionAttributePurchaseInputSchema
>;

const Civ7ProgressionPlayerReviewInputSchema = Type.Object(
  {},
  { additionalProperties: false },
);
export type Civ7ProgressionPlayerReviewInput = Static<
  typeof Civ7ProgressionPlayerReviewInputSchema
>;

const Civ7ProgressionTraditionChangeInputSchema = Type.Object(
  {
    traditionType: Type.Integer(),
    action: Type.Integer(),
  },
  { additionalProperties: false },
);
export type Civ7ProgressionTraditionChangeInput = Static<
  typeof Civ7ProgressionTraditionChangeInputSchema
>;

export const Civ7ProgressionChoicePostconditionClassificationSchema =
  Type.Union([
    Type.Literal("not-sent"),
    Type.Literal("pending-runtime-proof"),
    Type.Literal("turn-unblocked"),
    Type.Literal("technology-choice-cleared"),
    Type.Literal("technology-choice-transitioned"),
    Type.Literal("technology-state-changed-blocker-still-live"),
    Type.Literal("technology-choice-sticky-blocker"),
    Type.Literal("culture-choice-cleared"),
    Type.Literal("culture-choice-transitioned"),
    Type.Literal("culture-state-changed-blocker-still-live"),
    Type.Literal("culture-choice-sticky-blocker"),
  ]);

export const Civ7ProgressionChoiceProofOutcomeSchema = Type.Union([
  Type.Literal("cleared"),
  Type.Literal("state-changed"),
  Type.Literal("still-blocked"),
  Type.Literal("no-state-change"),
  Type.Literal("not-sent"),
  Type.Literal("stale"),
  Type.Literal("unknown"),
]);

export const Civ7ProgressionChoiceRequestStatusSchema = Type.Union([
  Type.Literal("not-sent"),
  Type.Literal("sent-confirmed"),
  Type.Literal("sent-unverified"),
]);

export const Civ7ProgressionChoiceEvidenceSummarySchema = Type.Object(
  {
    beforeBlockerPresent: Type.Boolean(),
    afterReadStatus: Type.Union([
      Type.Literal("read"),
      Type.Literal("failed"),
      Type.Literal("skipped-not-sent"),
    ]),
    afterBlockerPresent: Type.Union([Type.Boolean(), Type.Null()]),
    canEndTurnAfter: Type.Union([Type.Boolean(), Type.Null()]),
  },
  { additionalProperties: false },
);

export const Civ7ProgressionChoicePostconditionSummarySchema = Type.Object(
  {
    classification: Civ7ProgressionChoicePostconditionClassificationSchema,
    reason: Type.String(),
    outcome: Civ7ProgressionChoiceProofOutcomeSchema,
    confidence: Type.Union([
      Type.Literal("confirmed"),
      Type.Literal("unverified"),
      Type.Literal("pending-runtime-proof"),
    ]),
    confirmed: Type.Boolean(),
    noRepeatAfterUnverified: Type.Boolean(),
  },
  { additionalProperties: false },
);

export const Civ7ProgressionTechnologyChoiceNextStepSchema = Type.Object(
  {
    kind: Type.Union([
      Type.Literal("refresh-attention"),
      Type.Literal("do-not-repeat"),
      Type.Literal("inspect-progression-choice"),
    ]),
    source: Type.Literal("progression.technology.choice.request"),
    label: Type.String(),
  },
  { additionalProperties: false },
);

export const Civ7ProgressionCultureChoiceNextStepSchema = Type.Object(
  {
    kind: Type.Union([
      Type.Literal("refresh-attention"),
      Type.Literal("do-not-repeat"),
      Type.Literal("inspect-progression-choice"),
    ]),
    source: Type.Literal("progression.culture.choice.request"),
    label: Type.String(),
  },
  { additionalProperties: false },
);

export const Civ7ProgressionTechnologyChoiceResultSchema = Type.Object(
  {
    playerId: Type.Integer({ minimum: 0 }),
    node: Type.Integer(),
    notificationId: Type.Optional(Civ7ControlOrpcComponentIdSchema),
    sent: Type.Boolean(),
    status: Civ7ProgressionChoiceRequestStatusSchema,
    evidence: Civ7ProgressionChoiceEvidenceSummarySchema,
    postcondition: Civ7ProgressionChoicePostconditionSummarySchema,
    nextSteps: Type.Array(Civ7ProgressionTechnologyChoiceNextStepSchema),
  },
  { additionalProperties: false },
);
export type Civ7ProgressionTechnologyChoiceResult = Static<
  typeof Civ7ProgressionTechnologyChoiceResultSchema
>;

export const Civ7ProgressionCultureChoiceResultSchema = Type.Object(
  {
    playerId: Type.Integer({ minimum: 0 }),
    node: Type.Integer(),
    notificationId: Type.Optional(Civ7ControlOrpcComponentIdSchema),
    sent: Type.Boolean(),
    status: Civ7ProgressionChoiceRequestStatusSchema,
    evidence: Civ7ProgressionChoiceEvidenceSummarySchema,
    postcondition: Civ7ProgressionChoicePostconditionSummarySchema,
    nextSteps: Type.Array(Civ7ProgressionCultureChoiceNextStepSchema),
  },
  { additionalProperties: false },
);
export type Civ7ProgressionCultureChoiceResult = Static<
  typeof Civ7ProgressionCultureChoiceResultSchema
>;

export const Civ7ProgressionTargetPostconditionClassificationSchema =
  Type.Union([
    Type.Literal("not-sent"),
    Type.Literal("pending-runtime-proof"),
    Type.Literal("missing-postcondition"),
  ]);

export const Civ7ProgressionTargetProofOutcomeSchema = Type.Union([
  Type.Literal("not-sent"),
  Type.Literal("unknown"),
]);

export const Civ7ProgressionTargetRequestStatusSchema = Type.Union([
  Type.Literal("not-sent"),
  Type.Literal("sent-unverified"),
]);

export const Civ7ProgressionTargetValidationSummarySchema = Type.Object(
  {
    beforeValid: Type.Boolean(),
    afterValid: Type.Boolean(),
  },
  { additionalProperties: false },
);

export const Civ7ProgressionTargetPostconditionSummarySchema = Type.Object(
  {
    classification: Civ7ProgressionTargetPostconditionClassificationSchema,
    reason: Type.String(),
    outcome: Civ7ProgressionTargetProofOutcomeSchema,
    confidence: Type.Union([
      Type.Literal("unverified"),
      Type.Literal("pending-runtime-proof"),
    ]),
    confirmed: Type.Boolean(),
    noRepeatAfterUnverified: Type.Boolean(),
  },
  { additionalProperties: false },
);

export const Civ7ProgressionTechnologyTargetNextStepSchema = Type.Object(
  {
    kind: Type.Union([
      Type.Literal("do-not-repeat"),
      Type.Literal("inspect-progression-target"),
    ]),
    source: Type.Literal("progression.technology.target.request"),
    label: Type.String(),
  },
  { additionalProperties: false },
);

export const Civ7ProgressionCultureTargetNextStepSchema = Type.Object(
  {
    kind: Type.Union([
      Type.Literal("do-not-repeat"),
      Type.Literal("inspect-progression-target"),
    ]),
    source: Type.Literal("progression.culture.target.request"),
    label: Type.String(),
  },
  { additionalProperties: false },
);

export const Civ7ProgressionTechnologyTargetResultSchema = Type.Object(
  {
    playerId: Type.Integer({ minimum: 0 }),
    node: Type.Integer(),
    sent: Type.Boolean(),
    status: Civ7ProgressionTargetRequestStatusSchema,
    validation: Civ7ProgressionTargetValidationSummarySchema,
    postcondition: Civ7ProgressionTargetPostconditionSummarySchema,
    nextSteps: Type.Array(Civ7ProgressionTechnologyTargetNextStepSchema),
  },
  { additionalProperties: false },
);
export type Civ7ProgressionTechnologyTargetResult = Static<
  typeof Civ7ProgressionTechnologyTargetResultSchema
>;

export const Civ7ProgressionCultureTargetResultSchema = Type.Object(
  {
    playerId: Type.Integer({ minimum: 0 }),
    node: Type.Integer(),
    sent: Type.Boolean(),
    status: Civ7ProgressionTargetRequestStatusSchema,
    validation: Civ7ProgressionTargetValidationSummarySchema,
    postcondition: Civ7ProgressionTargetPostconditionSummarySchema,
    nextSteps: Type.Array(Civ7ProgressionCultureTargetNextStepSchema),
  },
  { additionalProperties: false },
);
export type Civ7ProgressionCultureTargetResult = Static<
  typeof Civ7ProgressionCultureTargetResultSchema
>;

const Civ7ProgressionPlayerChoicePostconditionClassificationSchema =
  Type.Union([
    Type.Literal("not-sent"),
    Type.Literal("pending-runtime-proof"),
    Type.Literal("missing-postcondition"),
  ]);

const Civ7ProgressionPlayerChoiceProofOutcomeSchema = Type.Union([
  Type.Literal("not-sent"),
  Type.Literal("unknown"),
]);

const Civ7ProgressionPlayerChoiceRequestStatusSchema = Type.Union([
  Type.Literal("not-sent"),
  Type.Literal("sent-unverified"),
]);

const Civ7ProgressionPlayerChoiceValidationSummarySchema = Type.Object(
  {
    beforeValid: Type.Boolean(),
    afterValid: Type.Boolean(),
  },
  { additionalProperties: false },
);

const Civ7ProgressionPlayerChoicePostconditionSummarySchema = Type.Object(
  {
    classification: Civ7ProgressionPlayerChoicePostconditionClassificationSchema,
    reason: Type.String(),
    outcome: Civ7ProgressionPlayerChoiceProofOutcomeSchema,
    confidence: Type.Union([
      Type.Literal("unverified"),
      Type.Literal("pending-runtime-proof"),
    ]),
    confirmed: Type.Boolean(),
    noRepeatAfterUnverified: Type.Boolean(),
  },
  { additionalProperties: false },
);

const Civ7ProgressionAttributePurchaseNextStepSchema = Type.Object(
  {
    kind: Type.Union([
      Type.Literal("do-not-repeat"),
      Type.Literal("inspect-progression-attribute"),
    ]),
    source: Type.Literal("progression.attribute.purchase.request"),
    label: Type.String(),
  },
  { additionalProperties: false },
);

const Civ7ProgressionAttributeReviewNextStepSchema = Type.Object(
  {
    kind: Type.Union([
      Type.Literal("do-not-repeat"),
      Type.Literal("inspect-progression-attribute"),
    ]),
    source: Type.Literal("progression.attribute.review.request"),
    label: Type.String(),
  },
  { additionalProperties: false },
);

const Civ7ProgressionTraditionChangeNextStepSchema = Type.Object(
  {
    kind: Type.Union([
      Type.Literal("do-not-repeat"),
      Type.Literal("inspect-progression-tradition"),
    ]),
    source: Type.Literal("progression.tradition.change.request"),
    label: Type.String(),
  },
  { additionalProperties: false },
);

const Civ7ProgressionTraditionReviewNextStepSchema = Type.Object(
  {
    kind: Type.Union([
      Type.Literal("do-not-repeat"),
      Type.Literal("inspect-progression-tradition"),
    ]),
    source: Type.Literal("progression.tradition.review.request"),
    label: Type.String(),
  },
  { additionalProperties: false },
);

const Civ7ProgressionPlayerChoiceResultBaseSchema = {
  playerId: Type.Integer({ minimum: 0 }),
  sent: Type.Boolean(),
  status: Civ7ProgressionPlayerChoiceRequestStatusSchema,
  validation: Civ7ProgressionPlayerChoiceValidationSummarySchema,
  postcondition: Civ7ProgressionPlayerChoicePostconditionSummarySchema,
} as const;

const Civ7ProgressionAttributePurchaseResultSchema = Type.Object(
  {
    ...Civ7ProgressionPlayerChoiceResultBaseSchema,
    node: Type.Integer(),
    nextSteps: Type.Array(Civ7ProgressionAttributePurchaseNextStepSchema),
  },
  { additionalProperties: false },
);
export type Civ7ProgressionAttributePurchaseResult = Static<
  typeof Civ7ProgressionAttributePurchaseResultSchema
>;

const Civ7ProgressionAttributeReviewResultSchema = Type.Object(
  {
    ...Civ7ProgressionPlayerChoiceResultBaseSchema,
    nextSteps: Type.Array(Civ7ProgressionAttributeReviewNextStepSchema),
  },
  { additionalProperties: false },
);
export type Civ7ProgressionAttributeReviewResult = Static<
  typeof Civ7ProgressionAttributeReviewResultSchema
>;

const Civ7ProgressionTraditionChangeResultSchema = Type.Object(
  {
    ...Civ7ProgressionPlayerChoiceResultBaseSchema,
    traditionType: Type.Integer(),
    action: Type.Integer(),
    nextSteps: Type.Array(Civ7ProgressionTraditionChangeNextStepSchema),
  },
  { additionalProperties: false },
);
export type Civ7ProgressionTraditionChangeResult = Static<
  typeof Civ7ProgressionTraditionChangeResultSchema
>;

const Civ7ProgressionTraditionReviewResultSchema = Type.Object(
  {
    ...Civ7ProgressionPlayerChoiceResultBaseSchema,
    nextSteps: Type.Array(Civ7ProgressionTraditionReviewNextStepSchema),
  },
  { additionalProperties: false },
);
export type Civ7ProgressionTraditionReviewResult = Static<
  typeof Civ7ProgressionTraditionReviewResultSchema
>;

export const Civ7ProgressionChoiceInputStandardSchema =
  toStandardSchema(Civ7ProgressionChoiceInputSchema);
export const Civ7ProgressionTargetInputStandardSchema =
  toStandardSchema(Civ7ProgressionTargetInputSchema);
const Civ7ProgressionAttributePurchaseInputStandardSchema =
  toStandardSchema(Civ7ProgressionAttributePurchaseInputSchema);
const Civ7ProgressionPlayerReviewInputStandardSchema =
  toStandardSchema(Civ7ProgressionPlayerReviewInputSchema);
const Civ7ProgressionTraditionChangeInputStandardSchema =
  toStandardSchema(Civ7ProgressionTraditionChangeInputSchema);
export const Civ7ProgressionTechnologyChoiceResultStandardSchema =
  toStandardSchema(Civ7ProgressionTechnologyChoiceResultSchema);
export const Civ7ProgressionCultureChoiceResultStandardSchema =
  toStandardSchema(Civ7ProgressionCultureChoiceResultSchema);
export const Civ7ProgressionTechnologyTargetResultStandardSchema =
  toStandardSchema(Civ7ProgressionTechnologyTargetResultSchema);
export const Civ7ProgressionCultureTargetResultStandardSchema =
  toStandardSchema(Civ7ProgressionCultureTargetResultSchema);
const Civ7ProgressionAttributePurchaseResultStandardSchema =
  toStandardSchema(Civ7ProgressionAttributePurchaseResultSchema);
const Civ7ProgressionAttributeReviewResultStandardSchema =
  toStandardSchema(Civ7ProgressionAttributeReviewResultSchema);
const Civ7ProgressionTraditionChangeResultStandardSchema =
  toStandardSchema(Civ7ProgressionTraditionChangeResultSchema);
const Civ7ProgressionTraditionReviewResultStandardSchema =
  toStandardSchema(Civ7ProgressionTraditionReviewResultSchema);

export type Civ7ProgressionTechnologyChoiceContract = ContractProcedure<
  typeof Civ7ProgressionChoiceInputStandardSchema,
  typeof Civ7ProgressionTechnologyChoiceResultStandardSchema,
  Civ7ControlOrpcErrorMap,
  Civ7ControlOrpcProcedureMeta
>;

export const Civ7ProgressionTechnologyChoiceContract:
  Civ7ProgressionTechnologyChoiceContract = civ7ControlOrpcContractBase
    .input(Civ7ProgressionChoiceInputStandardSchema)
    .output(Civ7ProgressionTechnologyChoiceResultStandardSchema)
    .meta({
      family: "progression",
      procedureKey: "progression.technology.choice.request",
      proofBoundary: "local-package-test",
      risk: "mutation",
    });

export type Civ7ProgressionCultureChoiceContract = ContractProcedure<
  typeof Civ7ProgressionChoiceInputStandardSchema,
  typeof Civ7ProgressionCultureChoiceResultStandardSchema,
  Civ7ControlOrpcErrorMap,
  Civ7ControlOrpcProcedureMeta
>;

export const Civ7ProgressionCultureChoiceContract:
  Civ7ProgressionCultureChoiceContract = civ7ControlOrpcContractBase
    .input(Civ7ProgressionChoiceInputStandardSchema)
    .output(Civ7ProgressionCultureChoiceResultStandardSchema)
    .meta({
      family: "progression",
      procedureKey: "progression.culture.choice.request",
      proofBoundary: "local-package-test",
      risk: "mutation",
    });

export type Civ7ProgressionTechnologyTargetContract = ContractProcedure<
  typeof Civ7ProgressionTargetInputStandardSchema,
  typeof Civ7ProgressionTechnologyTargetResultStandardSchema,
  Civ7ControlOrpcErrorMap,
  Civ7ControlOrpcProcedureMeta
>;

export const Civ7ProgressionTechnologyTargetContract:
  Civ7ProgressionTechnologyTargetContract = civ7ControlOrpcContractBase
    .input(Civ7ProgressionTargetInputStandardSchema)
    .output(Civ7ProgressionTechnologyTargetResultStandardSchema)
    .meta({
      family: "progression",
      procedureKey: "progression.technology.target.request",
      proofBoundary: "local-package-test",
      risk: "mutation",
    });

export type Civ7ProgressionCultureTargetContract = ContractProcedure<
  typeof Civ7ProgressionTargetInputStandardSchema,
  typeof Civ7ProgressionCultureTargetResultStandardSchema,
  Civ7ControlOrpcErrorMap,
  Civ7ControlOrpcProcedureMeta
>;

export const Civ7ProgressionCultureTargetContract:
  Civ7ProgressionCultureTargetContract = civ7ControlOrpcContractBase
    .input(Civ7ProgressionTargetInputStandardSchema)
    .output(Civ7ProgressionCultureTargetResultStandardSchema)
    .meta({
      family: "progression",
      procedureKey: "progression.culture.target.request",
      proofBoundary: "local-package-test",
      risk: "mutation",
    });

type Civ7ProgressionAttributePurchaseContract = ContractProcedure<
  typeof Civ7ProgressionAttributePurchaseInputStandardSchema,
  typeof Civ7ProgressionAttributePurchaseResultStandardSchema,
  Civ7ControlOrpcErrorMap,
  Civ7ControlOrpcProcedureMeta
>;

const Civ7ProgressionAttributePurchaseContract:
  Civ7ProgressionAttributePurchaseContract = civ7ControlOrpcContractBase
    .input(Civ7ProgressionAttributePurchaseInputStandardSchema)
    .output(Civ7ProgressionAttributePurchaseResultStandardSchema)
    .meta({
      family: "progression",
      procedureKey: "progression.attribute.purchase.request",
      proofBoundary: "local-package-test",
      risk: "mutation",
    });

type Civ7ProgressionAttributeReviewContract = ContractProcedure<
  typeof Civ7ProgressionPlayerReviewInputStandardSchema,
  typeof Civ7ProgressionAttributeReviewResultStandardSchema,
  Civ7ControlOrpcErrorMap,
  Civ7ControlOrpcProcedureMeta
>;

const Civ7ProgressionAttributeReviewContract:
  Civ7ProgressionAttributeReviewContract = civ7ControlOrpcContractBase
    .input(Civ7ProgressionPlayerReviewInputStandardSchema)
    .output(Civ7ProgressionAttributeReviewResultStandardSchema)
    .meta({
      family: "progression",
      procedureKey: "progression.attribute.review.request",
      proofBoundary: "local-package-test",
      risk: "mutation",
    });

type Civ7ProgressionTraditionChangeContract = ContractProcedure<
  typeof Civ7ProgressionTraditionChangeInputStandardSchema,
  typeof Civ7ProgressionTraditionChangeResultStandardSchema,
  Civ7ControlOrpcErrorMap,
  Civ7ControlOrpcProcedureMeta
>;

const Civ7ProgressionTraditionChangeContract:
  Civ7ProgressionTraditionChangeContract = civ7ControlOrpcContractBase
    .input(Civ7ProgressionTraditionChangeInputStandardSchema)
    .output(Civ7ProgressionTraditionChangeResultStandardSchema)
    .meta({
      family: "progression",
      procedureKey: "progression.tradition.change.request",
      proofBoundary: "local-package-test",
      risk: "mutation",
    });

type Civ7ProgressionTraditionReviewContract = ContractProcedure<
  typeof Civ7ProgressionPlayerReviewInputStandardSchema,
  typeof Civ7ProgressionTraditionReviewResultStandardSchema,
  Civ7ControlOrpcErrorMap,
  Civ7ControlOrpcProcedureMeta
>;

const Civ7ProgressionTraditionReviewContract:
  Civ7ProgressionTraditionReviewContract = civ7ControlOrpcContractBase
    .input(Civ7ProgressionPlayerReviewInputStandardSchema)
    .output(Civ7ProgressionTraditionReviewResultStandardSchema)
    .meta({
      family: "progression",
      procedureKey: "progression.tradition.review.request",
      proofBoundary: "local-package-test",
      risk: "mutation",
    });

export type Civ7ProgressionContract = Readonly<{
  technology: Readonly<{
    choice: Readonly<{
      request: Civ7ProgressionTechnologyChoiceContract;
    }>;
    target: Readonly<{
      request: Civ7ProgressionTechnologyTargetContract;
    }>;
  }>;
  culture: Readonly<{
    choice: Readonly<{
      request: Civ7ProgressionCultureChoiceContract;
    }>;
    target: Readonly<{
      request: Civ7ProgressionCultureTargetContract;
    }>;
  }>;
  attribute: Readonly<{
    purchase: Readonly<{
      request: Civ7ProgressionAttributePurchaseContract;
    }>;
    review: Readonly<{
      request: Civ7ProgressionAttributeReviewContract;
    }>;
  }>;
  tradition: Readonly<{
    change: Readonly<{
      request: Civ7ProgressionTraditionChangeContract;
    }>;
    review: Readonly<{
      request: Civ7ProgressionTraditionReviewContract;
    }>;
  }>;
}>;

export const Civ7ProgressionContract: Civ7ProgressionContract = {
  technology: {
    choice: {
      request: Civ7ProgressionTechnologyChoiceContract,
    },
    target: {
      request: Civ7ProgressionTechnologyTargetContract,
    },
  },
  culture: {
    choice: {
      request: Civ7ProgressionCultureChoiceContract,
    },
    target: {
      request: Civ7ProgressionCultureTargetContract,
    },
  },
  attribute: {
    purchase: {
      request: Civ7ProgressionAttributePurchaseContract,
    },
    review: {
      request: Civ7ProgressionAttributeReviewContract,
    },
  },
  tradition: {
    change: {
      request: Civ7ProgressionTraditionChangeContract,
    },
    review: {
      request: Civ7ProgressionTraditionReviewContract,
    },
  },
};
