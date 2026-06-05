import {
  getCiv7PlayableStatus,
  getCiv7PlayNotificationView,
  getCiv7BattlefieldScan,
  getCiv7ReadyCityView,
  getCiv7ReadyUnitView,
  getCiv7TargetCandidates,
  getCiv7TurnCompletionStatus,
  requestCiv7TurnComplete,
  requestCiv7DiplomacyResponse,
  requestCiv7CultureChoiceCloseout,
  requestCiv7NarrativeChoice,
  requestCiv7NotificationDismissal,
  requestCiv7CityCommand,
  requestCiv7PlayerOperation,
  requestCiv7ProductionChoice,
  requestCiv7TechnologyChoiceCloseout,
  requestCiv7UnitTargetAction,
  type Civ7ActionApproval,
  type Civ7DirectControlOptions,
  Civ7BattlefieldScanResultSchema,
  type Civ7DiplomacyResponseInput,
  type Civ7DiplomacyResponseResult,
  type Civ7CultureChoiceCloseoutInput,
  type Civ7CultureChoiceCloseoutResult,
  type Civ7NarrativeChoiceInput,
  type Civ7NarrativeChoiceResult,
  Civ7PlayNotificationViewResultSchema,
  Civ7PlayableStatusResultSchema,
  Civ7ProductionChoiceResultSchema,
  Civ7ReadyCityViewResultSchema,
  Civ7ReadyUnitViewResultSchema,
  Civ7TargetCandidatesResultSchema,
  Civ7TurnCompletionStatusResultSchema,
  Civ7UnitTargetActionResultSchema,
  type Civ7BattlefieldScanInput,
  type Civ7NotificationDismissInput,
  type Civ7NotificationDismissalResult,
  type Civ7PopulationPlacementProofSource,
  type Civ7ProductionChoiceInput,
  type Civ7ReadyCityViewInput,
  type Civ7ReadyUnitViewInput,
  type Civ7TargetCandidatesInput,
  type Civ7TechnologyChoiceCloseoutInput,
  type Civ7TechnologyChoiceCloseoutResult,
  type Civ7TurnCompletionRequestResult,
  type Civ7UnitTargetActionInput,
  type PlayNotificationViewOptions,
} from "@civ7/direct-control";
import type { Static } from "typebox";

import type {
  Civ7ControlOrpcComponentId,
  Civ7ControlOrpcMapLocation,
} from "../model/primitives";

export type Civ7ControlOrpcNotificationDismissalResult =
  Civ7NotificationDismissalResult;
export type Civ7ControlOrpcDiplomacyResponseResult =
  Civ7DiplomacyResponseResult;
export type Civ7ControlOrpcCultureChoiceCloseoutResult =
  Civ7CultureChoiceCloseoutResult;
export type Civ7ControlOrpcNarrativeChoiceResult = Civ7NarrativeChoiceResult;
export type Civ7ControlOrpcTechnologyChoiceCloseoutResult =
  Civ7TechnologyChoiceCloseoutResult;
export type Civ7ControlOrpcTurnCompletionRequestResult =
  Civ7TurnCompletionRequestResult;
type Civ7ControlOrpcPopulationPlacementRuntimeResult =
  Civ7PopulationPlacementProofSource & Readonly<{
    before: Readonly<{ valid: boolean }>;
    after: Readonly<{ valid: boolean }>;
  }>;
export type Civ7ControlOrpcAssignWorkerPlacementInput = Readonly<{
  playerId: number;
  location: number;
}>;
export type Civ7ControlOrpcExpandCityPlacementInput = Readonly<{
  cityId: Civ7ControlOrpcComponentId;
  destination: Civ7ControlOrpcMapLocation;
}>;
export type Civ7ControlOrpcPlayableStatusResult = Static<
  typeof Civ7PlayableStatusResultSchema
>;
export type Civ7ControlOrpcProductionChoiceResult = Static<
  typeof Civ7ProductionChoiceResultSchema
>;
export type Civ7ControlOrpcPlayNotificationViewResult = Static<
  typeof Civ7PlayNotificationViewResultSchema
>;
export type Civ7ControlOrpcBattlefieldScanResult = Static<
  typeof Civ7BattlefieldScanResultSchema
>;
export type Civ7ControlOrpcReadyUnitViewResult = Static<
  typeof Civ7ReadyUnitViewResultSchema
>;
export type Civ7ControlOrpcReadyCityViewResult = Static<
  typeof Civ7ReadyCityViewResultSchema
>;
export type Civ7ControlOrpcTargetCandidatesResult = Static<
  typeof Civ7TargetCandidatesResultSchema
>;
export type Civ7ControlOrpcTurnCompletionStatusResult = Static<
  typeof Civ7TurnCompletionStatusResultSchema
>;
export type Civ7ControlOrpcUnitTargetActionResult = Static<
  typeof Civ7UnitTargetActionResultSchema
>;

export type Civ7ControlOrpcDirectControlFacade = Readonly<{
  requestCiv7ProductionChoice(
    input: Civ7ProductionChoiceInput,
    options: Civ7DirectControlOptions | undefined,
    approval: Civ7ActionApproval,
  ): Promise<Civ7ControlOrpcProductionChoiceResult>;
  requestCiv7NotificationDismissal(
    input: Civ7NotificationDismissInput,
    options: Civ7DirectControlOptions | undefined,
    approval: Civ7ActionApproval,
  ): Promise<Civ7ControlOrpcNotificationDismissalResult>;
  requestCiv7NarrativeChoice(
    input: Civ7NarrativeChoiceInput,
    options: Civ7DirectControlOptions | undefined,
    approval: Civ7ActionApproval,
  ): Promise<Civ7ControlOrpcNarrativeChoiceResult>;
  requestCiv7DiplomacyResponse(
    input: Civ7DiplomacyResponseInput,
    options: Civ7DirectControlOptions | undefined,
    approval: Civ7ActionApproval,
  ): Promise<Civ7ControlOrpcDiplomacyResponseResult>;
  requestCiv7TechnologyChoiceCloseout(
    input: Civ7TechnologyChoiceCloseoutInput,
    options: Civ7DirectControlOptions | undefined,
    approval: Civ7ActionApproval,
  ): Promise<Civ7ControlOrpcTechnologyChoiceCloseoutResult>;
  requestCiv7CultureChoiceCloseout(
    input: Civ7CultureChoiceCloseoutInput,
    options: Civ7DirectControlOptions | undefined,
    approval: Civ7ActionApproval,
  ): Promise<Civ7ControlOrpcCultureChoiceCloseoutResult>;
  requestCiv7AssignWorkerPlacement(
    input: Civ7ControlOrpcAssignWorkerPlacementInput,
    options: Civ7DirectControlOptions | undefined,
    approval: Civ7ActionApproval,
  ): Promise<Civ7ControlOrpcPopulationPlacementRuntimeResult>;
  requestCiv7ExpandCityPlacement(
    input: Civ7ControlOrpcExpandCityPlacementInput,
    options: Civ7DirectControlOptions | undefined,
    approval: Civ7ActionApproval,
  ): Promise<Civ7ControlOrpcPopulationPlacementRuntimeResult>;
  requestCiv7UnitTargetAction(
    input: Civ7UnitTargetActionInput,
    options: Civ7DirectControlOptions | undefined,
    approval: Civ7ActionApproval,
  ): Promise<Civ7ControlOrpcUnitTargetActionResult>;
  requestCiv7TurnComplete(
    options: Civ7DirectControlOptions | undefined,
    approval: Civ7ActionApproval,
  ): Promise<Civ7ControlOrpcTurnCompletionRequestResult>;
  getCiv7PlayableStatus(
    options?: Civ7DirectControlOptions,
  ): Promise<Civ7ControlOrpcPlayableStatusResult>;
  getCiv7PlayNotificationView(
    options?: PlayNotificationViewOptions,
  ): Promise<Civ7ControlOrpcPlayNotificationViewResult>;
  getCiv7BattlefieldScan(
    input?: Civ7BattlefieldScanInput,
    options?: Civ7DirectControlOptions,
  ): Promise<Civ7ControlOrpcBattlefieldScanResult>;
  getCiv7ReadyUnitView(
    input?: Civ7ReadyUnitViewInput,
    options?: Civ7DirectControlOptions,
  ): Promise<Civ7ControlOrpcReadyUnitViewResult>;
  getCiv7ReadyCityView(
    input?: Civ7ReadyCityViewInput,
    options?: Civ7DirectControlOptions,
  ): Promise<Civ7ControlOrpcReadyCityViewResult>;
  getCiv7TargetCandidates(
    input?: Civ7TargetCandidatesInput,
    options?: Civ7DirectControlOptions,
  ): Promise<Civ7ControlOrpcTargetCandidatesResult>;
  getCiv7TurnCompletionStatus(
    options?: Civ7DirectControlOptions,
  ): Promise<Civ7ControlOrpcTurnCompletionStatusResult>;
}>;

export const liveCiv7ControlOrpcDirectControlFacade:
  Civ7ControlOrpcDirectControlFacade = {
  requestCiv7ProductionChoice: async (input, options, approval) =>
    requestCiv7ProductionChoice(input, options, approval) as Promise<
      Civ7ControlOrpcProductionChoiceResult
    >,
  requestCiv7NotificationDismissal: async (input, options, approval) =>
    requestCiv7NotificationDismissal(input, options, approval) as Promise<
      Civ7ControlOrpcNotificationDismissalResult
    >,
  requestCiv7NarrativeChoice: async (input, options, approval) =>
    requestCiv7NarrativeChoice(input, options, approval),
  requestCiv7DiplomacyResponse: async (input, options, approval) =>
    requestCiv7DiplomacyResponse(input, options, approval),
  requestCiv7TechnologyChoiceCloseout: async (input, options, approval) =>
    requestCiv7TechnologyChoiceCloseout(input, options, approval),
  requestCiv7CultureChoiceCloseout: async (input, options, approval) =>
    requestCiv7CultureChoiceCloseout(input, options, approval),
  requestCiv7AssignWorkerPlacement: async (input, options, approval) =>
    requestCiv7PlayerOperation({
      playerId: input.playerId,
      operationType: "ASSIGN_WORKER",
      args: {
        Location: input.location,
        Amount: 1,
      },
    }, options, approval) as Promise<
      Civ7ControlOrpcPopulationPlacementRuntimeResult
    >,
  requestCiv7ExpandCityPlacement: async (input, options, approval) =>
    requestCiv7CityCommand({
      cityId: input.cityId,
      operationType: "EXPAND",
      args: {
        X: input.destination.x,
        Y: input.destination.y,
      },
    }, options, approval) as Promise<
      Civ7ControlOrpcPopulationPlacementRuntimeResult
    >,
  requestCiv7UnitTargetAction: async (input, options, approval) =>
    requestCiv7UnitTargetAction(input, options, approval) as Promise<
      Civ7ControlOrpcUnitTargetActionResult
    >,
  requestCiv7TurnComplete: async (options, approval) =>
    requestCiv7TurnComplete(options, approval),
  getCiv7PlayableStatus: async (options) =>
    getCiv7PlayableStatus(options) as Promise<
      Civ7ControlOrpcPlayableStatusResult
    >,
  getCiv7PlayNotificationView: async (options) =>
    getCiv7PlayNotificationView(options) as Promise<
      Civ7ControlOrpcPlayNotificationViewResult
    >,
  getCiv7BattlefieldScan: async (input, options) =>
    getCiv7BattlefieldScan(input, options) as Promise<
      Civ7ControlOrpcBattlefieldScanResult
    >,
  getCiv7ReadyUnitView: async (input, options) =>
    getCiv7ReadyUnitView(input, options) as Promise<
      Civ7ControlOrpcReadyUnitViewResult
    >,
  getCiv7ReadyCityView: async (input, options) =>
    getCiv7ReadyCityView(input, options) as Promise<
      Civ7ControlOrpcReadyCityViewResult
    >,
  getCiv7TargetCandidates: async (input, options) =>
    getCiv7TargetCandidates(input, options) as Promise<
      Civ7ControlOrpcTargetCandidatesResult
    >,
  getCiv7TurnCompletionStatus: async (options) =>
    getCiv7TurnCompletionStatus(options) as Promise<
      Civ7ControlOrpcTurnCompletionStatusResult
    >,
};
