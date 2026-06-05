import type { ContractProcedure } from "@orpc/contract";
import { Type, type Static } from "typebox";

import { civ7ControlOrpcContractBase } from "../../contract-base";
import type { Civ7ControlOrpcErrorMap } from "../../errors";
import type { Civ7ControlOrpcProcedureMeta } from "../../metadata";
import { Civ7ControlOrpcComponentIdSchema } from "../../model/primitives";
import { toStandardSchema } from "../../typebox-standard-schema";

export const Civ7DecisionsNarrativeChoiceInputSchema = Type.Object(
  {
    playerId: Type.Integer({ minimum: 0, maximum: 1024 }),
    targetType: Type.String({ minLength: 1 }),
    target: Civ7ControlOrpcComponentIdSchema,
    action: Type.Integer(),
  },
  { additionalProperties: false },
);
export type Civ7DecisionsNarrativeChoiceInput = Static<
  typeof Civ7DecisionsNarrativeChoiceInputSchema
>;

export const Civ7DecisionsDiplomacyResponseInputSchema = Type.Object(
  {
    playerId: Type.Integer({ minimum: 0, maximum: 1024 }),
    actionId: Type.Integer(),
    responseType: Type.Integer(),
    notificationId: Type.Optional(Civ7ControlOrpcComponentIdSchema),
  },
  { additionalProperties: false },
);
export type Civ7DecisionsDiplomacyResponseInput = Static<
  typeof Civ7DecisionsDiplomacyResponseInputSchema
>;

export const Civ7DecisionsProgressionChoiceKindSchema = Type.Union([
  Type.Literal("technology"),
  Type.Literal("culture"),
]);
export type Civ7DecisionsProgressionChoiceKind = Static<
  typeof Civ7DecisionsProgressionChoiceKindSchema
>;

export const Civ7DecisionsProgressionChoiceInputSchema = Type.Object(
  {
    kind: Civ7DecisionsProgressionChoiceKindSchema,
    playerId: Type.Integer({ minimum: 0, maximum: 1024 }),
    node: Type.Integer(),
    notificationId: Type.Optional(Civ7ControlOrpcComponentIdSchema),
  },
  { additionalProperties: false },
);
export type Civ7DecisionsProgressionChoiceInput = Static<
  typeof Civ7DecisionsProgressionChoiceInputSchema
>;

export const Civ7DecisionsNarrativeChoicePostconditionClassificationSchema =
  Type.Union([
    Type.Literal("not-sent"),
    Type.Literal("turn-unblocked"),
    Type.Literal("narrative-blocker-cleared"),
    Type.Literal("narrative-panel-cleared"),
    Type.Literal("validation-changed"),
    Type.Literal("no-state-change"),
    Type.Literal("missing-postcondition"),
  ]);

export const Civ7DecisionsDiplomacyResponsePostconditionClassificationSchema =
  Type.Union([
    Type.Literal("not-sent"),
    Type.Literal("turn-unblocked"),
    Type.Literal("diplomacy-blocker-cleared"),
    Type.Literal("blocking-notification-changed"),
    Type.Literal("validation-changed"),
    Type.Literal("no-state-change"),
    Type.Literal("missing-postcondition"),
  ]);

export const Civ7DecisionsProgressionChoicePostconditionClassificationSchema =
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

export const Civ7DecisionsNarrativeChoiceProofOutcomeSchema = Type.Union([
  Type.Literal("cleared"),
  Type.Literal("state-changed"),
  Type.Literal("still-blocked"),
  Type.Literal("no-state-change"),
  Type.Literal("not-sent"),
  Type.Literal("stale"),
  Type.Literal("unknown"),
]);
export const Civ7DecisionsDiplomacyResponseProofOutcomeSchema =
  Civ7DecisionsNarrativeChoiceProofOutcomeSchema;
export const Civ7DecisionsProgressionChoiceProofOutcomeSchema =
  Civ7DecisionsNarrativeChoiceProofOutcomeSchema;

export const Civ7DecisionsNarrativeChoiceRequestStatusSchema = Type.Union([
  Type.Literal("not-sent"),
  Type.Literal("sent-confirmed"),
  Type.Literal("sent-unverified"),
]);
export const Civ7DecisionsDiplomacyResponseRequestStatusSchema =
  Civ7DecisionsNarrativeChoiceRequestStatusSchema;
export const Civ7DecisionsProgressionChoiceRequestStatusSchema =
  Civ7DecisionsNarrativeChoiceRequestStatusSchema;

export const Civ7DecisionsNarrativeChoiceValidationSummarySchema = Type.Object(
  {
    beforeValid: Type.Boolean(),
    afterValid: Type.Boolean(),
  },
  { additionalProperties: false },
);
export const Civ7DecisionsDiplomacyResponseValidationSummarySchema =
  Civ7DecisionsNarrativeChoiceValidationSummarySchema;

export const Civ7DecisionsProgressionChoiceEvidenceSummarySchema = Type.Object(
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

export const Civ7DecisionsNarrativeChoicePostconditionSummarySchema =
  Type.Object(
    {
      classification: Civ7DecisionsNarrativeChoicePostconditionClassificationSchema,
      reason: Type.String(),
      outcome: Civ7DecisionsNarrativeChoiceProofOutcomeSchema,
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
export const Civ7DecisionsDiplomacyResponsePostconditionSummarySchema =
  Type.Object(
    {
      classification: Civ7DecisionsDiplomacyResponsePostconditionClassificationSchema,
      reason: Type.String(),
      outcome: Civ7DecisionsDiplomacyResponseProofOutcomeSchema,
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
export const Civ7DecisionsProgressionChoicePostconditionSummarySchema =
  Type.Object(
    {
      classification:
        Civ7DecisionsProgressionChoicePostconditionClassificationSchema,
      reason: Type.String(),
      outcome: Civ7DecisionsProgressionChoiceProofOutcomeSchema,
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

export const Civ7DecisionsNarrativeChoiceNextStepSchema = Type.Object(
  {
    kind: Type.Union([
      Type.Literal("refresh-attention"),
      Type.Literal("do-not-repeat"),
      Type.Literal("inspect-narrative-choice"),
    ]),
    source: Type.Literal("decisions.narrative.choice.request"),
    label: Type.String(),
  },
  { additionalProperties: false },
);
export const Civ7DecisionsDiplomacyResponseNextStepSchema = Type.Object(
  {
    kind: Type.Union([
      Type.Literal("refresh-attention"),
      Type.Literal("do-not-repeat"),
      Type.Literal("inspect-diplomacy-response"),
    ]),
    source: Type.Literal("decisions.diplomacy.response.request"),
    label: Type.String(),
  },
  { additionalProperties: false },
);
export const Civ7DecisionsProgressionChoiceNextStepSchema = Type.Object(
  {
    kind: Type.Union([
      Type.Literal("refresh-attention"),
      Type.Literal("do-not-repeat"),
      Type.Literal("inspect-progression-choice"),
    ]),
    source: Type.Literal("decisions.progression.choice.request"),
    label: Type.String(),
  },
  { additionalProperties: false },
);

export const Civ7DecisionsNarrativeChoiceResultSchema = Type.Object(
  {
    playerId: Type.Integer({ minimum: 0 }),
    targetType: Type.String(),
    target: Civ7ControlOrpcComponentIdSchema,
    action: Type.Integer(),
    sent: Type.Boolean(),
    status: Civ7DecisionsNarrativeChoiceRequestStatusSchema,
    validation: Civ7DecisionsNarrativeChoiceValidationSummarySchema,
    postcondition: Civ7DecisionsNarrativeChoicePostconditionSummarySchema,
    nextSteps: Type.Array(Civ7DecisionsNarrativeChoiceNextStepSchema),
  },
  { additionalProperties: false },
);
export type Civ7DecisionsNarrativeChoiceResult = Static<
  typeof Civ7DecisionsNarrativeChoiceResultSchema
>;

export const Civ7DecisionsDiplomacyResponseResultSchema = Type.Object(
  {
    playerId: Type.Integer({ minimum: 0 }),
    actionId: Type.Integer(),
    responseType: Type.Integer(),
    notificationId: Type.Optional(Civ7ControlOrpcComponentIdSchema),
    sent: Type.Boolean(),
    status: Civ7DecisionsDiplomacyResponseRequestStatusSchema,
    validation: Civ7DecisionsDiplomacyResponseValidationSummarySchema,
    postcondition: Civ7DecisionsDiplomacyResponsePostconditionSummarySchema,
    nextSteps: Type.Array(Civ7DecisionsDiplomacyResponseNextStepSchema),
  },
  { additionalProperties: false },
);
export type Civ7DecisionsDiplomacyResponseResult = Static<
  typeof Civ7DecisionsDiplomacyResponseResultSchema
>;

export const Civ7DecisionsProgressionChoiceResultSchema = Type.Object(
  {
    kind: Civ7DecisionsProgressionChoiceKindSchema,
    playerId: Type.Integer({ minimum: 0 }),
    node: Type.Integer(),
    notificationId: Type.Optional(Civ7ControlOrpcComponentIdSchema),
    sent: Type.Boolean(),
    status: Civ7DecisionsProgressionChoiceRequestStatusSchema,
    evidence: Civ7DecisionsProgressionChoiceEvidenceSummarySchema,
    postcondition: Civ7DecisionsProgressionChoicePostconditionSummarySchema,
    nextSteps: Type.Array(Civ7DecisionsProgressionChoiceNextStepSchema),
  },
  { additionalProperties: false },
);
export type Civ7DecisionsProgressionChoiceResult = Static<
  typeof Civ7DecisionsProgressionChoiceResultSchema
>;

export const Civ7DecisionsNarrativeChoiceInputStandardSchema =
  toStandardSchema(Civ7DecisionsNarrativeChoiceInputSchema);
export const Civ7DecisionsNarrativeChoiceResultStandardSchema =
  toStandardSchema(Civ7DecisionsNarrativeChoiceResultSchema);
export const Civ7DecisionsDiplomacyResponseInputStandardSchema =
  toStandardSchema(Civ7DecisionsDiplomacyResponseInputSchema);
export const Civ7DecisionsDiplomacyResponseResultStandardSchema =
  toStandardSchema(Civ7DecisionsDiplomacyResponseResultSchema);
export const Civ7DecisionsProgressionChoiceInputStandardSchema =
  toStandardSchema(Civ7DecisionsProgressionChoiceInputSchema);
export const Civ7DecisionsProgressionChoiceResultStandardSchema =
  toStandardSchema(Civ7DecisionsProgressionChoiceResultSchema);

export type Civ7DecisionsNarrativeChoiceContract = ContractProcedure<
  typeof Civ7DecisionsNarrativeChoiceInputStandardSchema,
  typeof Civ7DecisionsNarrativeChoiceResultStandardSchema,
  Civ7ControlOrpcErrorMap,
  Civ7ControlOrpcProcedureMeta
>;

export const Civ7DecisionsNarrativeChoiceContract:
  Civ7DecisionsNarrativeChoiceContract = civ7ControlOrpcContractBase
    .input(Civ7DecisionsNarrativeChoiceInputStandardSchema)
    .output(Civ7DecisionsNarrativeChoiceResultStandardSchema)
    .meta({
      family: "decisions",
      procedureKey: "decisions.narrative.choice.request",
      proofBoundary: "local-package-test",
      risk: "mutation",
    });

export type Civ7DecisionsDiplomacyResponseContract = ContractProcedure<
  typeof Civ7DecisionsDiplomacyResponseInputStandardSchema,
  typeof Civ7DecisionsDiplomacyResponseResultStandardSchema,
  Civ7ControlOrpcErrorMap,
  Civ7ControlOrpcProcedureMeta
>;

export const Civ7DecisionsDiplomacyResponseContract:
  Civ7DecisionsDiplomacyResponseContract = civ7ControlOrpcContractBase
    .input(Civ7DecisionsDiplomacyResponseInputStandardSchema)
    .output(Civ7DecisionsDiplomacyResponseResultStandardSchema)
    .meta({
      family: "decisions",
      procedureKey: "decisions.diplomacy.response.request",
      proofBoundary: "local-package-test",
      risk: "mutation",
    });

export type Civ7DecisionsProgressionChoiceContract = ContractProcedure<
  typeof Civ7DecisionsProgressionChoiceInputStandardSchema,
  typeof Civ7DecisionsProgressionChoiceResultStandardSchema,
  Civ7ControlOrpcErrorMap,
  Civ7ControlOrpcProcedureMeta
>;

export const Civ7DecisionsProgressionChoiceContract:
  Civ7DecisionsProgressionChoiceContract = civ7ControlOrpcContractBase
    .input(Civ7DecisionsProgressionChoiceInputStandardSchema)
    .output(Civ7DecisionsProgressionChoiceResultStandardSchema)
    .meta({
      family: "decisions",
      procedureKey: "decisions.progression.choice.request",
      proofBoundary: "local-package-test",
      risk: "mutation",
    });

export type Civ7DecisionsContract = Readonly<{
  diplomacy: Readonly<{
    response: Readonly<{
      request: Civ7DecisionsDiplomacyResponseContract;
    }>;
  }>;
  narrative: Readonly<{
    choice: Readonly<{
      request: Civ7DecisionsNarrativeChoiceContract;
    }>;
  }>;
  progression: Readonly<{
    choice: Readonly<{
      request: Civ7DecisionsProgressionChoiceContract;
    }>;
  }>;
}>;

export const Civ7DecisionsContract: Civ7DecisionsContract = {
  diplomacy: {
    response: {
      request: Civ7DecisionsDiplomacyResponseContract,
    },
  },
  narrative: {
    choice: {
      request: Civ7DecisionsNarrativeChoiceContract,
    },
  },
  progression: {
    choice: {
      request: Civ7DecisionsProgressionChoiceContract,
    },
  },
};
