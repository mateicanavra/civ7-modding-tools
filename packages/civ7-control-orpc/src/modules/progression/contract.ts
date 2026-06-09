import type { ContractProcedure } from "@orpc/contract";
import { Type, type Static } from "typebox";

import { civ7ControlOrpcContractBase } from "../../contract-base";
import type { Civ7ControlOrpcErrorMap } from "../../errors";
import type { Civ7ControlOrpcProcedureMeta } from "../../metadata";
import { Civ7ControlOrpcComponentIdSchema } from "../../model/primitives";
import { toStandardSchema } from "../../typebox-standard-schema";

const Civ7ProgressionChoiceInputSchema = Type.Object(
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

const Civ7ProgressionTargetInputSchema = Type.Object(
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

const Civ7ProgressionDashboardInputSchema = Type.Object(
  {
    playerId: Type.Optional(Type.Integer({ minimum: 0, maximum: 1024 })),
  },
  { additionalProperties: false },
);
export type Civ7ProgressionDashboardInput = Static<
  typeof Civ7ProgressionDashboardInputSchema
>;

const Civ7ProgressionTraditionsInputSchema = Type.Object(
  {
    playerId: Type.Optional(Type.Integer({ minimum: 0, maximum: 1024 })),
  },
  { additionalProperties: false },
);
export type Civ7ProgressionTraditionsInput = Static<
  typeof Civ7ProgressionTraditionsInputSchema
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

const Civ7ProgressionTechnologyChoiceResultSchema = Type.Object(
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

const Civ7ProgressionCultureChoiceResultSchema = Type.Object(
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

const Civ7ProgressionTechnologyTargetResultSchema = Type.Object(
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

const Civ7ProgressionCultureTargetResultSchema = Type.Object(
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

const Civ7ProgressionDashboardProbeSchema = Type.Union([
  Type.Object(
    {
      ok: Type.Literal(true),
      value: Type.Unknown(),
    },
    { additionalProperties: false },
  ),
  Type.Object(
    {
      ok: Type.Literal(false),
      error: Type.String(),
    },
    { additionalProperties: false },
  ),
]);

const Civ7ProgressionDashboardLegacyPathSchema = Type.Object(
  {
    legacyPathType: Type.Union([Type.String(), Type.Null()]),
    classType: Type.Union([Type.String(), Type.Null()]),
    name: Type.Union([Type.String(), Type.Null()]),
    score: Type.Union([Type.Number(), Type.Null()]),
    finalRequiredPathPoints: Type.Union([Type.Number(), Type.Null()]),
    progressPercent: Type.Union([Type.Number(), Type.Null()]),
    nextMilestone: Type.Union([Type.String(), Type.Null()]),
    enabledForPlayer: Type.Union([Type.Boolean(), Type.Null()]),
  },
  { additionalProperties: false },
);

const Civ7ProgressionDashboardNextStepSchema = Type.Object(
  {
    kind: Type.Union([
      Type.Literal("read-attention-priorities"),
      Type.Literal("inspect-progression-choice"),
      Type.Literal("inspect-victory-progress"),
      Type.Literal("observe"),
    ]),
    source: Type.Literal("progression.dashboard.current"),
    label: Type.String(),
  },
  { additionalProperties: false },
);

const Civ7ProgressionDashboardResultSchema = Type.Object(
  {
    playerId: Type.Integer({ minimum: 0 }),
    localPlayerId: Type.Integer({ minimum: 0 }),
    sourceStatus: Type.Object(
      {
        progressDashboard: Type.Literal("read"),
      },
      { additionalProperties: false },
    ),
    hiddenInfoPolicy: Type.Literal("local-player-runtime-progress"),
    summary: Type.Object(
      {
        headline: Type.String(),
        legacyPathCount: Type.Integer({ minimum: 0 }),
        victoryClassCount: Type.Integer({ minimum: 0 }),
        triumphCount: Type.Integer({ minimum: 0 }),
        nextStepCount: Type.Integer({ minimum: 0 }),
      },
      { additionalProperties: false },
    ),
    turn: Civ7ProgressionDashboardProbeSchema,
    turnDate: Civ7ProgressionDashboardProbeSchema,
    age: Type.Object(
      {
        ageType: Type.Union([Type.String(), Type.Null()]),
        name: Type.Union([Type.String(), Type.Null()]),
        chronologyIndex: Type.Unknown(),
        currentAgeProgressionPoints: Civ7ProgressionDashboardProbeSchema,
        maxAgeProgressionPoints: Civ7ProgressionDashboardProbeSchema,
        ageProgressPercent: Type.Union([Type.Number(), Type.Null()]),
        isFinalAge: Civ7ProgressionDashboardProbeSchema,
        isAgeOver: Civ7ProgressionDashboardProbeSchema,
      },
      { additionalProperties: false },
    ),
    player: Type.Object(
      {
        team: Type.Unknown(),
        historicalLegacyPointCountForTeam: Civ7ProgressionDashboardProbeSchema,
      },
      { additionalProperties: false },
    ),
    legacyPaths: Type.Array(Civ7ProgressionDashboardLegacyPathSchema),
    victories: Type.Object(
      {
        rowCount: Type.Integer({ minimum: 0 }),
        classes: Type.Array(Type.String()),
      },
      { additionalProperties: false },
    ),
    triumphs: Type.Object(
      {
        count: Type.Integer({ minimum: 0 }),
        source: Type.Literal("runtime-gameinfo"),
        rows: Type.Array(Type.Unknown()),
      },
      { additionalProperties: false },
    ),
    proof: Type.Object(
      {
        victoryManagerGlobal: Civ7ProgressionDashboardProbeSchema,
        sources: Type.Array(Type.String()),
      },
      { additionalProperties: false },
    ),
    warnings: Type.Array(Type.String()),
    omitted: Type.Array(Type.Object(
      {
        path: Type.String(),
        reason: Type.String(),
      },
      { additionalProperties: false },
    )),
    notes: Type.Array(Type.String()),
    nextSteps: Type.Array(Civ7ProgressionDashboardNextStepSchema),
  },
  { additionalProperties: false },
);
export type Civ7ProgressionDashboardResult = Static<
  typeof Civ7ProgressionDashboardResultSchema
>;

const Civ7ProgressionTraditionActionDescriptorSchema = Type.Object(
  {
    kind: Type.Union([Type.Literal("activate"), Type.Literal("deactivate")]),
    action: Type.Union([Type.Number(), Type.Null()]),
    validationSuccess: Type.Union([Type.Boolean(), Type.Null()]),
    parameters: Type.Object(
      {
        traditionType: Type.Number(),
        action: Type.Union([Type.Number(), Type.Null()]),
      },
      { additionalProperties: false },
    ),
    nextSteps: Type.Array(Type.Object(
      {
        kind: Type.Union([
          Type.Literal("validate-tradition-change"),
          Type.Literal("request-tradition-change"),
        ]),
        source: Type.Literal("progression.traditions.current"),
        label: Type.String(),
        parameters: Type.Object(
          {
            traditionType: Type.Number(),
            action: Type.Union([Type.Number(), Type.Null()]),
          },
          { additionalProperties: false },
        ),
      },
      { additionalProperties: false },
    )),
  },
  { additionalProperties: false },
);

const Civ7ProgressionTraditionRowSchema = Type.Object(
  {
    id: Type.Number(),
    type: Type.Union([Type.String(), Type.Null()]),
    name: Type.Union([Type.String(), Type.Null()]),
    description: Type.Union([Type.String(), Type.Null()]),
    ageType: Type.Union([Type.String(), Type.Null()]),
    cultureSlotType: Type.Union([Type.String(), Type.Null()]),
    traitType: Type.Union([Type.String(), Type.Null()]),
    isCrisis: Type.Boolean(),
    active: Type.Boolean(),
    unlocked: Type.Boolean(),
    recentUnlock: Type.Boolean(),
    actions: Type.Array(Civ7ProgressionTraditionActionDescriptorSchema),
  },
  { additionalProperties: false },
);

const Civ7ProgressionTraditionsNextStepSchema = Type.Object(
  {
    kind: Type.Union([
      Type.Literal("inspect-tradition-change"),
      Type.Literal("free-policy-slot"),
      Type.Literal("observe"),
    ]),
    source: Type.Literal("progression.traditions.current"),
    label: Type.String(),
  },
  { additionalProperties: false },
);

const Civ7ProgressionTraditionsResultSchema = Type.Object(
  {
    playerId: Type.Integer({ minimum: 0 }),
    sourceStatus: Type.Object(
      {
        traditions: Type.Literal("read"),
      },
      { additionalProperties: false },
    ),
    hiddenInfoPolicy: Type.Literal("player-culture-runtime"),
    summary: Type.Object(
      {
        activeCount: Type.Integer({ minimum: 0 }),
        availableCount: Type.Integer({ minimum: 0 }),
        recentUnlockCount: Type.Integer({ minimum: 0 }),
        openSlotCount: Type.Integer({ minimum: 0 }),
        enabledAvailableCount: Type.Integer({ minimum: 0 }),
        disabledAvailableCount: Type.Integer({ minimum: 0 }),
        nextStepCount: Type.Integer({ minimum: 0 }),
      },
      { additionalProperties: false },
    ),
    turn: Civ7ProgressionDashboardProbeSchema,
    turnDate: Civ7ProgressionDashboardProbeSchema,
    governmentType: Civ7ProgressionDashboardProbeSchema,
    government: Type.Object(
      {
        type: Type.Union([Type.String(), Type.Null()]),
        name: Type.Union([Type.String(), Type.Null()]),
      },
      { additionalProperties: false },
    ),
    slots: Type.Object(
      {
        total: Civ7ProgressionDashboardProbeSchema,
        normal: Civ7ProgressionDashboardProbeSchema,
        crisis: Civ7ProgressionDashboardProbeSchema,
        active: Type.Integer({ minimum: 0 }),
        unlocked: Type.Integer({ minimum: 0 }),
        available: Type.Integer({ minimum: 0 }),
        open: Type.Integer({ minimum: 0 }),
      },
      { additionalProperties: false },
    ),
    actions: Type.Object(
      {
        activate: Type.Union([Type.Number(), Type.Null()]),
        deactivate: Type.Union([Type.Number(), Type.Null()]),
      },
      { additionalProperties: false },
    ),
    active: Type.Array(Civ7ProgressionTraditionRowSchema),
    available: Type.Array(Civ7ProgressionTraditionRowSchema),
    recentUnlocks: Type.Array(Civ7ProgressionTraditionRowSchema),
    traditions: Type.Array(Civ7ProgressionTraditionRowSchema),
    omitted: Type.Array(Type.Object(
      {
        path: Type.String(),
        reason: Type.String(),
      },
      { additionalProperties: false },
    )),
    notes: Type.Array(Type.String()),
    nextSteps: Type.Array(Civ7ProgressionTraditionsNextStepSchema),
  },
  { additionalProperties: false },
);
export type Civ7ProgressionTraditionsResult = Static<
  typeof Civ7ProgressionTraditionsResultSchema
>;

const Civ7ProgressionChoiceInputStandardSchema =
  toStandardSchema(Civ7ProgressionChoiceInputSchema);
const Civ7ProgressionTargetInputStandardSchema =
  toStandardSchema(Civ7ProgressionTargetInputSchema);
const Civ7ProgressionAttributePurchaseInputStandardSchema =
  toStandardSchema(Civ7ProgressionAttributePurchaseInputSchema);
const Civ7ProgressionPlayerReviewInputStandardSchema =
  toStandardSchema(Civ7ProgressionPlayerReviewInputSchema);
const Civ7ProgressionDashboardInputStandardSchema =
  toStandardSchema(Civ7ProgressionDashboardInputSchema);
const Civ7ProgressionTraditionsInputStandardSchema =
  toStandardSchema(Civ7ProgressionTraditionsInputSchema);
const Civ7ProgressionTraditionChangeInputStandardSchema =
  toStandardSchema(Civ7ProgressionTraditionChangeInputSchema);
const Civ7ProgressionTechnologyChoiceResultStandardSchema =
  toStandardSchema(Civ7ProgressionTechnologyChoiceResultSchema);
const Civ7ProgressionCultureChoiceResultStandardSchema =
  toStandardSchema(Civ7ProgressionCultureChoiceResultSchema);
const Civ7ProgressionTechnologyTargetResultStandardSchema =
  toStandardSchema(Civ7ProgressionTechnologyTargetResultSchema);
const Civ7ProgressionCultureTargetResultStandardSchema =
  toStandardSchema(Civ7ProgressionCultureTargetResultSchema);
const Civ7ProgressionAttributePurchaseResultStandardSchema =
  toStandardSchema(Civ7ProgressionAttributePurchaseResultSchema);
const Civ7ProgressionAttributeReviewResultStandardSchema =
  toStandardSchema(Civ7ProgressionAttributeReviewResultSchema);
const Civ7ProgressionTraditionChangeResultStandardSchema =
  toStandardSchema(Civ7ProgressionTraditionChangeResultSchema);
const Civ7ProgressionTraditionReviewResultStandardSchema =
  toStandardSchema(Civ7ProgressionTraditionReviewResultSchema);
const Civ7ProgressionDashboardResultStandardSchema =
  toStandardSchema(Civ7ProgressionDashboardResultSchema);
const Civ7ProgressionTraditionsResultStandardSchema =
  toStandardSchema(Civ7ProgressionTraditionsResultSchema);

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

type Civ7ProgressionDashboardContract = ContractProcedure<
  typeof Civ7ProgressionDashboardInputStandardSchema,
  typeof Civ7ProgressionDashboardResultStandardSchema,
  Civ7ControlOrpcErrorMap,
  Civ7ControlOrpcProcedureMeta
>;

const Civ7ProgressionDashboardContract:
  Civ7ProgressionDashboardContract = civ7ControlOrpcContractBase
    .input(Civ7ProgressionDashboardInputStandardSchema)
    .output(Civ7ProgressionDashboardResultStandardSchema)
    .meta({
      family: "progression",
      procedureKey: "progression.dashboard.current",
      proofBoundary: "local-package-test",
      risk: "read-only",
    });

type Civ7ProgressionTraditionsContract = ContractProcedure<
  typeof Civ7ProgressionTraditionsInputStandardSchema,
  typeof Civ7ProgressionTraditionsResultStandardSchema,
  Civ7ControlOrpcErrorMap,
  Civ7ControlOrpcProcedureMeta
>;

const Civ7ProgressionTraditionsContract:
  Civ7ProgressionTraditionsContract = civ7ControlOrpcContractBase
    .input(Civ7ProgressionTraditionsInputStandardSchema)
    .output(Civ7ProgressionTraditionsResultStandardSchema)
    .meta({
      family: "progression",
      procedureKey: "progression.traditions.current",
      proofBoundary: "local-package-test",
      risk: "read-only",
    });

export type Civ7ProgressionContract = Readonly<{
  dashboard: Readonly<{
    current: Civ7ProgressionDashboardContract;
  }>;
  traditions: Readonly<{
    current: Civ7ProgressionTraditionsContract;
  }>;
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
  dashboard: {
    current: Civ7ProgressionDashboardContract,
  },
  traditions: {
    current: Civ7ProgressionTraditionsContract,
  },
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
