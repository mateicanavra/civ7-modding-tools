import { Type } from "typebox";
import {
  Civ7ControlOrpcComponentIdSchema,
  Civ7ControlOrpcMapLocationSchema,
} from "#civ7-control-service/model/dto/primitives";
import { base } from "../../../base";
import { toStandardSchema as standard } from "../../../schema/typebox-standard-schema";

const Civ7UnitUpgradeInputSchema = Type.Object(
  {
    unitId: Civ7ControlOrpcComponentIdSchema,
  },
  { additionalProperties: false }
);
const Civ7UnitResettleInputSchema = Type.Object(
  {
    unitId: Civ7ControlOrpcComponentIdSchema,
    destination: Civ7ControlOrpcMapLocationSchema,
  },
  { additionalProperties: false }
);
const Civ7UnitCommandPostconditionClassificationSchema = Type.Union([
  Type.Literal("not-sent"),
  Type.Literal("queue-advanced"),
  Type.Literal("selected-unit-changed"),
  Type.Literal("activity-changed"),
  Type.Literal("unit-state-changed"),
  Type.Literal("blocker-changed"),
  Type.Literal("validation-changed"),
  Type.Literal("no-state-change"),
  Type.Literal("missing-postcondition"),
]);
const Civ7UnitCommandProofOutcomeSchema = Type.Union([
  Type.Literal("cleared"),
  Type.Literal("state-changed"),
  Type.Literal("no-state-change"),
  Type.Literal("not-sent"),
  Type.Literal("unknown"),
]);
const Civ7UnitCommandRequestStatusSchema = Type.Union([
  Type.Literal("not-sent"),
  Type.Literal("sent-confirmed"),
  Type.Literal("sent-guarded"),
  Type.Literal("sent-unverified"),
]);
const Civ7UnitCommandSummarySchema = Type.Union([
  Type.Object(
    {
      kind: Type.Literal("upgrade", {
        description: "Semantic kind of this value.",
      }),
      unitId: Civ7ControlOrpcComponentIdSchema,
    },
    { additionalProperties: false }
  ),
  Type.Object(
    {
      kind: Type.Literal("resettle", {
        description: "Semantic kind of this value.",
      }),
      unitId: Civ7ControlOrpcComponentIdSchema,
      destination: Civ7ControlOrpcMapLocationSchema,
    },
    { additionalProperties: false }
  ),
]);
const Civ7UnitCommandValidationSummarySchema = Type.Object(
  {
    beforeValid: Type.Boolean({
      description: "Whether before valid.",
    }),
    afterValid: Type.Boolean({
      description: "Whether after valid.",
    }),
  },
  { additionalProperties: false }
);
const Civ7UnitCommandPostconditionSummarySchema = Type.Object(
  {
    classification: Civ7UnitCommandPostconditionClassificationSchema,
    reason: Type.String({
      description: "Reason for the reported outcome.",
    }),
    outcome: Civ7UnitCommandProofOutcomeSchema,
    confidence: Type.Union([Type.Literal("confirmed"), Type.Literal("unverified")], {
      description: "Confidence.",
    }),
    confirmed: Type.Boolean({
      description: "Whether confirmed.",
    }),
    noRepeatAfterUnverified: Type.Boolean({
      description: "Whether no repeat after unverified.",
    }),
  },
  { additionalProperties: false }
);
const Civ7UnitCommandNextStepSchema = Type.Object(
  {
    kind: Type.Union(
      [
        Type.Literal("refresh-attention"),
        Type.Literal("do-not-repeat"),
        Type.Literal("inspect-unit-command"),
      ],
      {
        description: "Semantic kind of this value.",
      }
    ),
    source: Type.Union(
      [Type.Literal("unit.upgrade.request"), Type.Literal("unit.resettle.request")],
      {
        description: "Authority that supplied this value.",
      }
    ),
    label: Type.String({
      description: "Human-readable label.",
    }),
  },
  { additionalProperties: false }
);
const Civ7UnitCommandResultSchema = Type.Object(
  {
    action: Civ7UnitCommandSummarySchema,
    sent: Type.Boolean({
      description: "Whether sent.",
    }),
    status: Civ7UnitCommandRequestStatusSchema,
    validation: Civ7UnitCommandValidationSummarySchema,
    postcondition: Civ7UnitCommandPostconditionSummarySchema,
    nextSteps: Type.Array(Civ7UnitCommandNextStepSchema, {
      description: "Next steps values.",
    }),
  },
  { additionalProperties: false }
);
const Civ7UnitUpgradeContract = base
  .input(standard(Civ7UnitUpgradeInputSchema))
  .output(standard(Civ7UnitCommandResultSchema))
  .meta({
    family: "unit",
    procedureKey: "unit.upgrade.request",
    proofBoundary: "local-package-test",
    risk: "mutation",
  });
const Civ7UnitResettleContract = base
  .input(standard(Civ7UnitResettleInputSchema))
  .output(standard(Civ7UnitCommandResultSchema))
  .meta({
    family: "unit",
    procedureKey: "unit.resettle.request",
    proofBoundary: "local-package-test",
    risk: "mutation",
  });
export const commandRequest = {
  resettle: {
    request: Civ7UnitResettleContract,
  },
  upgrade: {
    request: Civ7UnitUpgradeContract,
  },
};
