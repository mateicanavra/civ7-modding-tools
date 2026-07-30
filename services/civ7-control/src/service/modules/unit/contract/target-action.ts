import { Type } from "typebox";

import { Civ7ControlOrpcComponentIdSchema } from "#civ7-control-service/model/dto/primitives";
import { base } from "../../../base";
import { toStandardSchema as standard } from "../../../schema/typebox-standard-schema";

const Civ7UnitTargetActionSchema = Type.Union([
  Type.Literal("naval-attack"),
  Type.Literal("air-attack"),
  Type.Literal("ranged-attack"),
  Type.Literal("army-overrun"),
  Type.Literal("swap-units"),
  Type.Literal("move-to"),
]);

const Civ7UnitTargetActionInputSchema = Type.Object(
  {
    unitId: Civ7ControlOrpcComponentIdSchema,
    x: Type.Integer({
      minimum: 0,
      maximum: 1_000_000,
      description: "Target plot X coordinate.",
    }),
    y: Type.Integer({
      minimum: 0,
      maximum: 1_000_000,
      description: "Target plot Y coordinate.",
    }),
  },
  {
    additionalProperties: false,
    description:
      "One unit and target plot resolved through Civ7's native right-click action decision.",
  }
);

const Civ7UnitTargetActionCheckResultSchema = Type.Object(
  {
    unitId: Civ7ControlOrpcComponentIdSchema,
    target: Type.Object(
      {
        x: Type.Integer({ description: "Target plot X coordinate." }),
        y: Type.Integer({ description: "Target plot Y coordinate." }),
      },
      {
        additionalProperties: false,
        description: "Plot inspected by the unit-target availability check.",
      }
    ),
    available: Type.Boolean({
      description: "Whether fresh native evidence admits the selected unit action.",
    }),
    classification: Type.Union(
      [
        Type.Literal("action-available"),
        Type.Literal("dedicated-war-workflow-required"),
        Type.Literal("not-admitted"),
      ],
      {
        description: "Why the native unit-target path is available or refused.",
      }
    ),
    selectedAction: Type.Union([Civ7UnitTargetActionSchema, Type.Null()], {
      description: "First native-order action selected for the target, when one exists.",
    }),
  },
  {
    additionalProperties: false,
    description: "Fresh native availability result for one unit and target plot.",
  }
);

const Civ7UnitTargetNextStepsSchema = Type.Array(
  Type.Object(
    {
      kind: Type.Union(
        [
          Type.Literal("refresh-attention"),
          Type.Literal("do-not-repeat"),
          Type.Literal("inspect-unit-action"),
          Type.Literal("use-war-confirmation"),
        ],
        {
          description: "Recommended follow-up action for the unit-target result.",
        }
      ),
      source: Type.Literal("unit.target.action.request", {
        description: "Procedure that supplied the recommendation.",
      }),
      label: Type.String({
        description: "Human-readable follow-up recommendation.",
      }),
    },
    { additionalProperties: false }
  ),
  {
    minItems: 1,
    maxItems: 1,
    description: "The single evidence-based follow-up action for this status.",
  }
);

const postconditionVariant = <
  const Classification extends string,
  const Outcome extends string,
  const Confidence extends "confirmed" | "unverified",
  const Confirmed extends boolean,
  const NoRepeat extends boolean,
>(
  classification: Classification,
  outcome: Outcome,
  confidence: Confidence,
  confirmed: Confirmed,
  noRepeatAfterUnverified: NoRepeat
) =>
  Type.Object(
    {
      classification: Type.Literal(classification, {
        description: "Semantic classification of the observed unit-target transition.",
      }),
      reason: Type.String({
        description: "Evidence-based reason for the unit-target outcome.",
      }),
      outcome: Type.Literal(outcome, {
        description: "Semantic outcome supported by the available unit-target evidence.",
      }),
      confidence: Type.Literal(confidence, {
        description: "Evidence confidence for the unit-target outcome.",
      }),
      confirmed: Type.Literal(confirmed, {
        description: "Whether native state confirms the reported unit-target outcome.",
      }),
      noRepeatAfterUnverified: Type.Literal(noRepeatAfterUnverified, {
        description: "Whether callers must await fresh evidence before another request.",
      }),
    },
    { additionalProperties: false }
  );

const notSentPostcondition = postconditionVariant(
  "not-sent",
  "not-sent",
  "unverified",
  false,
  true
);
const warConfirmationPostcondition = postconditionVariant(
  "war-confirmation-required",
  "requires-war-confirmation",
  "confirmed",
  false,
  false
);
const targetReachedPostcondition = postconditionVariant(
  "target-reached",
  "target-reached",
  "confirmed",
  true,
  false
);
const unitsSwappedPostcondition = postconditionVariant(
  "units-swapped",
  "units-swapped",
  "confirmed",
  true,
  false
);
const attackChangedPostcondition = postconditionVariant(
  "attack-state-changed",
  "state-changed",
  "confirmed",
  true,
  false
);
const pathShortfallPostcondition = postconditionVariant(
  "path-shortfall",
  "path-shortfall",
  "confirmed",
  true,
  true
);
const runtimeChangedPostcondition = postconditionVariant(
  "runtime-state-changed",
  "state-changed",
  "unverified",
  false,
  true
);
const unchangedPostcondition = postconditionVariant(
  "no-state-change",
  "no-state-change",
  "unverified",
  false,
  true
);
const missingPostcondition = postconditionVariant(
  "missing-postcondition",
  "unknown",
  "unverified",
  false,
  true
);
const confirmedPostcondition = Type.Union([
  targetReachedPostcondition,
  unitsSwappedPostcondition,
  attackChangedPostcondition,
]);
const unverifiedPostcondition = Type.Union([
  runtimeChangedPostcondition,
  unchangedPostcondition,
  missingPostcondition,
]);

const Civ7UnitTargetActionResultSchema = Type.Object(
  {
    unitId: Civ7ControlOrpcComponentIdSchema,
    target: Type.Object(
      {
        x: Type.Integer({ description: "Target plot X coordinate." }),
        y: Type.Integer({ description: "Target plot Y coordinate." }),
      },
      {
        additionalProperties: false,
        description: "Plot addressed by the guarded unit-target request.",
      }
    ),
    selectedAction: Type.Union([Civ7UnitTargetActionSchema, Type.Null()], {
      description: "Native action selected for this request, when one was admitted.",
    }),
    status: Type.Union(
      [
        Type.Literal("not-sent"),
        Type.Literal("dispatch-unknown"),
        Type.Literal("sent-confirmed"),
        Type.Literal("sent-guarded"),
        Type.Literal("sent-unverified"),
      ],
      {
        description: "Service-level dispatch and verification status for the unit action.",
      }
    ),
    postcondition: Type.Union(
      [
        notSentPostcondition,
        warConfirmationPostcondition,
        confirmedPostcondition,
        pathShortfallPostcondition,
        unverifiedPostcondition,
      ],
      {
        description: "Native-state evidence supporting the reported unit-target status.",
      }
    ),
    nextSteps: Civ7UnitTargetNextStepsSchema,
  },
  {
    additionalProperties: false,
    description: "Guarded dispatch result and postcondition evidence for one unit plot action.",
  }
);

/** Public native availability and guarded-mutation contracts for unit plot targeting. */
export const targetAction = {
  check: base
    .input(standard(Civ7UnitTargetActionInputSchema))
    .output(standard(Civ7UnitTargetActionCheckResultSchema))
    .meta({
      family: "unit",
      procedureKey: "unit.target.action.check",
      proofBoundary: "local-package-test",
      risk: "read-only",
    }),
  request: base
    .input(standard(Civ7UnitTargetActionInputSchema))
    .output(standard(Civ7UnitTargetActionResultSchema))
    .meta({
      family: "unit",
      procedureKey: "unit.target.action.request",
      proofBoundary: "local-package-test",
      risk: "mutation",
    }),
};
