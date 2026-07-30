import { Type } from "typebox";

import { base } from "../../../base";
import { Civ7ControlOrpcComponentIdSchema } from "../../../model/dto/primitives";
import { toStandardSchema as standard } from "../../../schema/typebox-standard-schema";
import { Civ7NotificationDismissalResultSchema } from "../model/dto/dismissal-result";

const Civ7NotificationDismissInputSchema = Type.Object(
  {
    notificationId: Civ7ControlOrpcComponentIdSchema,
  },
  {
    additionalProperties: false,
    description: "Live notification selected for guarded dismissal.",
  }
);

const Civ7NotificationDismissalCheckResultSchema = Type.Object(
  {
    notificationId: Civ7ControlOrpcComponentIdSchema,
    available: Type.Boolean({
      description:
        "Whether fresh native evidence admits generic dismissal for the exact notification.",
    }),
  },
  {
    additionalProperties: false,
    description: "Exact notification identity and generic native dismissal availability.",
  }
);

/** Public native availability and guarded-mutation contracts for notification dismissal. */
export const dismiss = {
  check: base
    .input(standard(Civ7NotificationDismissInputSchema))
    .output(standard(Civ7NotificationDismissalCheckResultSchema))
    .meta({
      family: "notifications",
      procedureKey: "notifications.dismiss.check",
      proofBoundary: "local-package-test",
      risk: "read-only",
    }),
  request: base
    .input(standard(Civ7NotificationDismissInputSchema))
    .output(standard(Civ7NotificationDismissalResultSchema))
    .meta({
      family: "notifications",
      procedureKey: "notifications.dismiss.request",
      proofBoundary: "local-package-test",
      risk: "mutation",
    }),
};
