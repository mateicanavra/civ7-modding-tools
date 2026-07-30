import { Type } from "typebox";

import { base } from "../../../base";
import { Civ7ControlOrpcComponentIdSchema } from "../../../model/dto/primitives";
import { toStandardSchema as standard } from "../../../schema/typebox-standard-schema";

const Civ7NotificationAdvisorWarningViewedInputSchema = Type.Object(
  {
    target: Civ7ControlOrpcComponentIdSchema,
  },
  {
    additionalProperties: false,
    description: "Advisor-warning target to acknowledge as viewed.",
  }
);

const Civ7NotificationAdvisorWarningViewedStatusSchema = Type.Union([
  Type.Literal("not-sent"),
  Type.Literal("sent-unverified"),
]);

const Civ7NotificationAdvisorWarningViewedValidationSchema = Type.Object(
  {
    beforeValid: Type.Boolean({
      description: "Whether the acknowledgement validated before it was sent.",
    }),
    afterValid: Type.Boolean({
      description: "Whether the acknowledgement still validated after it was sent.",
    }),
  },
  {
    additionalProperties: false,
    description: "Validation evidence sampled around the acknowledgement.",
  }
);

const Civ7NotificationAdvisorWarningViewedPostconditionSchema = Type.Object(
  {
    classification: Type.Union(
      [
        Type.Literal("not-sent"),
        Type.Literal("pending-runtime-proof"),
        Type.Literal("missing-postcondition"),
      ],
      {
        description: "Runtime-proof classification for the acknowledgement.",
      }
    ),
    reason: Type.String({
      description: "Evidence-based explanation for the postcondition classification.",
    }),
    outcome: Type.Union([Type.Literal("not-sent"), Type.Literal("unknown")], {
      description: "Observed outcome of the advisor-warning acknowledgement.",
    }),
    confidence: Type.Union([Type.Literal("unverified"), Type.Literal("pending-runtime-proof")], {
      description: "Strength of the evidence supporting the reported outcome.",
    }),
    confirmed: Type.Boolean({
      description: "Whether runtime evidence confirmed the acknowledgement.",
    }),
    noRepeatAfterUnverified: Type.Boolean({
      description: "Whether callers must avoid retrying until fresh evidence is read.",
    }),
  },
  {
    additionalProperties: false,
    description: "Postcondition evidence for the advisor-warning acknowledgement.",
  }
);

const Civ7NotificationAdvisorWarningViewedNextStepSchema = Type.Object(
  {
    kind: Type.Union([Type.Literal("do-not-repeat"), Type.Literal("inspect-notification")], {
      description: "Recommended follow-up category.",
    }),
    source: Type.Literal("notifications.advisorWarning.viewed.request", {
      description: "Procedure that produced the recommendation.",
    }),
    label: Type.String({
      description: "Human-readable follow-up recommendation.",
    }),
  },
  { additionalProperties: false }
);

const Civ7NotificationAdvisorWarningViewedResultSchema = Type.Object(
  {
    playerId: Type.Integer({
      minimum: 0,
      description: "Runtime player identifier that acknowledged the warning.",
    }),
    target: Civ7ControlOrpcComponentIdSchema,
    sent: Type.Boolean({
      description: "Whether the acknowledgement was sent to the game runtime.",
    }),
    status: Civ7NotificationAdvisorWarningViewedStatusSchema,
    validation: Civ7NotificationAdvisorWarningViewedValidationSchema,
    postcondition: Civ7NotificationAdvisorWarningViewedPostconditionSchema,
    nextSteps: Type.Array(Civ7NotificationAdvisorWarningViewedNextStepSchema, {
      description: "Evidence-based follow-ups after the acknowledgement.",
    }),
  },
  {
    additionalProperties: false,
    description: "Advisor-warning acknowledgement outcome and postcondition proof.",
  }
);

export const advisorWarningRequest = base
  .input(standard(Civ7NotificationAdvisorWarningViewedInputSchema))
  .output(standard(Civ7NotificationAdvisorWarningViewedResultSchema))
  .meta({
    family: "notifications",
    procedureKey: "notifications.advisorWarning.viewed.request",
    proofBoundary: "local-package-test",
    risk: "mutation",
  });
