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
  getCiv7PlayNotificationView,
  Civ7PlayNotificationViewInputSchema,
  Civ7PlayNotificationViewResultSchema,
  type Civ7PlayNotificationViewInput,
  type Civ7PlayNotificationViewResult,
  type PlayNotificationViewDependencies,
} from "./view.js";

export const Civ7PlayNotificationViewProcedureDescriptor = createCiv7ProcedureCoreDescriptor({
  procedureKey: "notifications.view",
  family: "notifications",
  risk: "read",
  atomOwner: "packages/civ7-direct-control/src/play/notifications/view.ts",
  atomFunction: "getCiv7PlayNotificationView",
  schemaTechnology: "typebox",
  inputSchema: {
    owner: "packages/civ7-direct-control/src/play/notifications/view.ts",
    exportName: "Civ7PlayNotificationViewInputSchema",
  },
  outputSchema: {
    owner: "packages/civ7-direct-control/src/play/notifications/view.ts",
    exportName: "Civ7PlayNotificationViewResultSchema",
  },
  inputFields: ["maxNotifications"],
  outputFields: [
    "localPlayerId",
    "turn",
    "turnDate",
    "hasSentTurnComplete",
    "canEndTurn",
    "blocker",
    "blockingNotificationId",
    "selectedUnitId",
    "selectedCityId",
    "firstReadyUnitId",
    "notifications",
    "decisions",
    "hud",
    "limits",
  ],
  playerScope: "local-player-scoped",
  consumerClasses: ["normal-cli-player-agent-view", "effect-orpc-procedure-core"],
  proofBoundary: "local-package-test",
  projection: {
    normalCli: "semantic-projection",
    debugService: "omitted",
    aiIngestion: "blocked-until-ingestion-contract",
    telemetry: "blocked-until-procedure-middleware",
    procedureCore: "typed-procedure-core",
  },
  correlation: {
    idSource: "generated-per-call",
    normalCli: "omitted-by-default",
    debugService: "included-in-diagnostics",
    telemetry: "omitted",
  },
  context: [
    "direct-control-facade",
    "endpoint-defaults",
    "state-selection",
    "logger",
    "evidence-sink",
  ],
});

export const Civ7PlayNotificationViewProcedureSchemaArtifacts = {
  [civ7ProcedureSchemaReferenceKey(Civ7PlayNotificationViewProcedureDescriptor.inputSchema)]:
    Civ7PlayNotificationViewInputSchema,
  [civ7ProcedureSchemaReferenceKey(Civ7PlayNotificationViewProcedureDescriptor.outputSchema)]:
    Civ7PlayNotificationViewResultSchema,
} satisfies Civ7ProcedureSchemaArtifactMap;

export type Civ7PlayNotificationViewProcedureCallOptions = Readonly<{
  directControl?: Civ7DirectControlOptions;
  procedure?: Civ7ProcedureCoreCallOptions;
  dependencies?: PlayNotificationViewDependencies;
}>;

export function callCiv7PlayNotificationViewProcedure(
  input: Civ7PlayNotificationViewInput = {},
  options: Civ7PlayNotificationViewProcedureCallOptions = {}
): Promise<Civ7ProcedureCoreCallResult<Civ7PlayNotificationViewResult>> {
  return callCiv7ProcedureCore<Civ7PlayNotificationViewInput, Civ7PlayNotificationViewResult>(
    Civ7PlayNotificationViewProcedureDescriptor,
    Civ7PlayNotificationViewProcedureSchemaArtifacts,
    input,
    (validInput) =>
      getCiv7PlayNotificationView(
        {
          ...options.directControl,
          ...validInput,
        },
        options.dependencies
      ),
    options.procedure
  );
}
