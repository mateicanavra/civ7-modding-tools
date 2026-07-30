import { Type } from "typebox";
import {
  Civ7ControlOrpcComponentIdSchema,
  Civ7ControlOrpcMapLocationSchema,
} from "#civ7-control-service/model/dto/primitives";
import { base } from "../../../base";
import { toStandardSchema as standard } from "../../../schema/typebox-standard-schema";

const Civ7UnitTargetActionInputSchema = Type.Object(
  {
    unitId: Civ7ControlOrpcComponentIdSchema,
    x: Type.Integer({ minimum: 0, maximum: 1000000, description: "X." }),
    y: Type.Integer({ minimum: 0, maximum: 1000000, description: "Y." }),
  },
  { additionalProperties: false }
);
const Civ7UnitTargetActionFamilySchema = Type.Union([
  Type.Literal("unit-operation"),
  Type.Literal("unit-command"),
]);
const Civ7UnitTargetActionVerificationClassificationSchema = Type.Union([
  Type.Literal("target-reached"),
  Type.Literal("path-shortfall"),
  Type.Literal("unit-state-changed"),
  Type.Literal("target-state-changed"),
  Type.Literal("no-state-change"),
  Type.Literal("not-sent"),
  Type.Literal("missing-postcondition"),
]);
const Civ7UnitTargetActionProofOutcomeSchema = Type.Union([
  Type.Literal("cleared"),
  Type.Literal("state-changed"),
  Type.Literal("no-state-change"),
  Type.Literal("not-sent"),
  Type.Literal("unknown"),
]);
const Civ7UnitTargetActionRequestStatusSchema = Type.Union([
  Type.Literal("not-sent"),
  Type.Literal("sent-confirmed"),
  Type.Literal("sent-guarded"),
  Type.Literal("sent-unverified"),
]);
const Civ7UnitTargetActionSelectedSummarySchema = Type.Object(
  {
    family: Civ7UnitTargetActionFamilySchema,
    operationType: Type.String({
      description: "Operation type.",
    }),
    valid: Type.Boolean({
      description: "Whether valid.",
    }),
    targetInReturnedPlots: Type.Union([Type.Boolean(), Type.Null()], {
      description: "Target in returned plots.",
    }),
    rejectedReason: Type.Union([Type.String(), Type.Null()], {
      description: "Rejected reason.",
    }),
  },
  { additionalProperties: false }
);
const Civ7UnitTargetActionValidationSummarySchema = Type.Object(
  {
    candidateCount: Type.Integer({ minimum: 0, description: "Candidate count." }),
    acceptedCandidateCount: Type.Integer({ minimum: 0, description: "Accepted candidate count." }),
    selected: Type.Union([Civ7UnitTargetActionSelectedSummarySchema, Type.Null()], {
      description: "Selected.",
    }),
  },
  { additionalProperties: false }
);
const Civ7UnitTargetActionPostconditionSummarySchema = Type.Object(
  {
    classification: Civ7UnitTargetActionVerificationClassificationSchema,
    reason: Type.String({
      description: "Reason for the reported outcome.",
    }),
    outcome: Civ7UnitTargetActionProofOutcomeSchema,
    confidence: Type.Union([Type.Literal("confirmed"), Type.Literal("unverified")], {
      description: "Confidence.",
    }),
    confirmed: Type.Boolean({
      description: "Whether confirmed.",
    }),
    noRepeatAfterUnverified: Type.Boolean({
      description: "Whether no repeat after unverified.",
    }),
    destinationReached: Type.Union([Type.Boolean(), Type.Null()], {
      description: "Destination reached.",
    }),
    requestedLocation: Civ7ControlOrpcMapLocationSchema,
    landedLocation: Type.Union([Civ7ControlOrpcMapLocationSchema, Type.Null()], {
      description: "Landed location.",
    }),
    source: Type.Union([Type.Literal("immediate"), Type.Literal("bounded-poll"), Type.Null()], {
      description: "Authority that supplied this value.",
    }),
  },
  { additionalProperties: false }
);
const Civ7UnitTargetActionNextStepSchema = Type.Object(
  {
    kind: Type.Union(
      [
        Type.Literal("refresh-attention"),
        Type.Literal("do-not-repeat"),
        Type.Literal("inspect-unit-action"),
      ],
      {
        description: "Semantic kind of this value.",
      }
    ),
    source: Type.Literal("unit.target.action.request", {
      description: "Authority that supplied this value.",
    }),
    label: Type.String({
      description: "Human-readable label.",
    }),
  },
  { additionalProperties: false }
);
const Civ7UnitTargetActionResultSchema = Type.Object(
  {
    unitId: Civ7ControlOrpcComponentIdSchema,
    target: Civ7ControlOrpcMapLocationSchema,
    sent: Type.Boolean({
      description: "Whether sent.",
    }),
    status: Civ7UnitTargetActionRequestStatusSchema,
    validation: Civ7UnitTargetActionValidationSummarySchema,
    postcondition: Civ7UnitTargetActionPostconditionSummarySchema,
    nextSteps: Type.Array(Civ7UnitTargetActionNextStepSchema, {
      description: "Next steps values.",
    }),
  },
  { additionalProperties: false }
);
const Civ7UnitTargetActionContract = base
  .input(standard(Civ7UnitTargetActionInputSchema))
  .output(standard(Civ7UnitTargetActionResultSchema))
  .meta({
    family: "unit",
    procedureKey: "unit.target.action.request",
    proofBoundary: "local-package-test",
    risk: "mutation",
  });
export const targetActionRequest = {
  target: {
    action: {
      request: Civ7UnitTargetActionContract,
    },
  },
};
