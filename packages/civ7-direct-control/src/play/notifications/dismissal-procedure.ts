import {
  callCiv7ProcedureCore,
  civ7ProcedureSchemaReferenceKey,
  createCiv7ProcedureCoreDescriptor,
  type Civ7ProcedureCoreCallOptions,
  type Civ7ProcedureCoreCallResult,
  type Civ7ProcedureSchemaArtifactMap,
} from "../../procedure-core.js";
import type { Civ7DirectControlOptions } from "../../session/types.js";
import {
  Civ7NotificationDismissRequestInputSchema,
  Civ7NotificationDismissalResultSchema,
  requestCiv7NotificationDismissal,
  type Civ7NotificationDismissInput,
  type Civ7NotificationDismissRequestInput,
  type Civ7NotificationDismissalResult,
} from "./dismissal-request.js";

export const Civ7NotificationDismissRequestProcedureDescriptor = createCiv7ProcedureCoreDescriptor({
  procedureKey: "notifications.dismiss.request",
  family: "notifications",
  risk: "mutation",
  atomOwner: "packages/civ7-direct-control/src/play/notifications/dismissal-request.ts",
  atomFunction: "requestCiv7NotificationDismissal",
  schemaTechnology: "typebox",
  inputSchema: {
    owner: "packages/civ7-direct-control/src/play/notifications/dismissal-request.ts",
    exportName: "Civ7NotificationDismissRequestInputSchema",
  },
  outputSchema: {
    owner: "packages/civ7-direct-control/src/play/notifications/dismissal-request.ts",
    exportName: "Civ7NotificationDismissalResultSchema",
  },
  inputFields: ["notificationId"],
  outputFields: [
    "host",
    "port",
    "state",
    "notificationId",
    "before",
    "after",
    "canDismiss",
    "sent",
    "result",
    "closeoutPath",
    "verificationAttempts",
    "verified",
    "postcondition",
    "notes",
  ],
  playerScope: "agent-slot-scoped",
  consumerClasses: [
    "normal-cli-player-agent-view",
    "effect-orpc-procedure-core",
    "runtime-proof-support",
  ],
  proofBoundary: "local-package-test",
  projection: {
    normalCli: "semantic-projection",
    debugService: "proof-diagnostic-projection",
    aiIngestion: "blocked-until-ingestion-contract",
    telemetry: "effect-orpc-middleware-hook",
    procedureCore: "typed-procedure-core",
  },
  correlation: {
    idSource: "caller-provided-and-validated",
    normalCli: "omitted-by-default",
    debugService: "included-in-diagnostics",
    telemetry: "attached-when-procedure-telemetry-enabled",
  },
  context: [
    "direct-control-facade",
    "endpoint-defaults",
    "state-selection",
    "logger",
    "evidence-sink",
    "live-session-policy",
  ],
  validatorFirst: true,
  postconditionRequired: true,
  noRepeatAfterUnverified: true,
});

export const Civ7NotificationDismissRequestProcedureSchemaArtifacts = {
  [civ7ProcedureSchemaReferenceKey(Civ7NotificationDismissRequestProcedureDescriptor.inputSchema)]:
    Civ7NotificationDismissRequestInputSchema,
  [civ7ProcedureSchemaReferenceKey(Civ7NotificationDismissRequestProcedureDescriptor.outputSchema)]:
    Civ7NotificationDismissalResultSchema,
} satisfies Civ7ProcedureSchemaArtifactMap;

export type Civ7NotificationDismissRequestProcedureCallOptions = Readonly<{
  directControl?: Civ7DirectControlOptions;
  procedure?: Civ7ProcedureCoreCallOptions;
  request?: typeof requestCiv7NotificationDismissal;
}>;

export function callCiv7NotificationDismissRequestProcedure(
  input: Civ7NotificationDismissRequestInput,
  options: Civ7NotificationDismissRequestProcedureCallOptions = {}
): Promise<Civ7ProcedureCoreCallResult<Civ7NotificationDismissalResult>> {
  return callCiv7ProcedureCore<
    Civ7NotificationDismissRequestInput,
    Civ7NotificationDismissalResult
  >(
    Civ7NotificationDismissRequestProcedureDescriptor,
    Civ7NotificationDismissRequestProcedureSchemaArtifacts,
    input,
    (validInput) => {
      return (options.request ?? requestCiv7NotificationDismissal)(
        notificationDismissInput(validInput),
        options.directControl
      );
    },
    options.procedure
  );
}

function notificationDismissInput(
  input: Civ7NotificationDismissRequestInput
): Civ7NotificationDismissInput {
  return {
    notificationId: input.notificationId,
  };
}
