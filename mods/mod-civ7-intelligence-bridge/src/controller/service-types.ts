import type { Civ7ControlOrpcContext } from "@civ7/control-orpc";

export type Civ7ControlOrpcDirectControlFacade = Civ7ControlOrpcContext["directControl"];
export type Civ7ControllerMutationProof = NonNullable<Civ7ControlOrpcContext["controllerProof"]>;

type DirectControl = Civ7ControlOrpcDirectControlFacade;

export type Civ7ControlOrpcComponentId = Parameters<
  DirectControl["checkCiv7UnitUpgrade"]
>[0]["unitId"];
export type Civ7ControlOrpcMapLocation = Parameters<
  DirectControl["checkCiv7CityExpansion"]
>[0]["destination"];
export type Civ7ControlOrpcAdvisorWarningViewedResult = Awaited<
  ReturnType<DirectControl["requestCiv7AdvisorWarningViewed"]>
>;
export type Civ7ControlOrpcBattlefieldScanResult = Awaited<
  ReturnType<DirectControl["getCiv7BattlefieldScan"]>
>;
export type Civ7ControlOrpcCultureChoiceCloseoutResult = Awaited<
  ReturnType<DirectControl["requestCiv7CultureChoiceCloseout"]>
>;
export type Civ7ControlOrpcDestinationAnalysisResult = Awaited<
  ReturnType<DirectControl["getCiv7DestinationAnalysis"]>
>;
export type Civ7ControlOrpcDiplomacyResponseResult = Awaited<
  ReturnType<DirectControl["requestCiv7DiplomacyResponse"]>
>;
export type Civ7ControlOrpcFirstMeetResponseResult = Awaited<
  ReturnType<DirectControl["requestCiv7FirstMeetResponse"]>
>;
export type Civ7ControlOrpcGovernmentChoiceResult = Awaited<
  ReturnType<DirectControl["requestCiv7GovernmentChoice"]>
>;
export type Civ7ControlOrpcMapGridResult = Awaited<ReturnType<DirectControl["getCiv7MapGrid"]>>;
export type Civ7ControlOrpcNarrativeChoiceResult = Awaited<
  ReturnType<DirectControl["requestCiv7NarrativeChoice"]>
>;
export type Civ7ControlOrpcNotificationDismissalResult = Awaited<
  ReturnType<DirectControl["requestCiv7NotificationDismissal"]>
>;
export type Civ7ControlOrpcPlayableStatusResult = Awaited<
  ReturnType<DirectControl["getCiv7PlayableStatus"]>
>;
export type Civ7ControlOrpcPlayNotificationViewResult = Awaited<
  ReturnType<DirectControl["getCiv7PlayNotificationView"]>
>;
export type Civ7ControlOrpcPlotSnapshotResult = Awaited<
  ReturnType<DirectControl["getCiv7PlotSnapshot"]>
>;
export type Civ7ControlOrpcProductionChoiceCheckResult = Awaited<
  ReturnType<DirectControl["checkCiv7ProductionChoice"]>
>;
export type Civ7ControlOrpcProductionChoiceSendResult = Awaited<
  ReturnType<DirectControl["sendCiv7ProductionChoice"]>
>;
export type Civ7ControlOrpcProgressDashboardResult = Awaited<
  ReturnType<DirectControl["getCiv7ProgressDashboard"]>
>;
export type Civ7ControlOrpcProgressionPlayerChoiceResult = Awaited<
  ReturnType<DirectControl["requestCiv7AttributePurchase"]>
>;
export type Civ7ControlOrpcProgressionTargetResult = Awaited<
  ReturnType<DirectControl["requestCiv7TechnologyTarget"]>
>;
export type Civ7ControlOrpcReadyCityViewResult = Awaited<
  ReturnType<DirectControl["getCiv7ReadyCityView"]>
>;
export type Civ7ControlOrpcReadyUnitViewResult = Awaited<
  ReturnType<DirectControl["getCiv7ReadyUnitView"]>
>;
export type Civ7ControlOrpcTargetCandidatesResult = Awaited<
  ReturnType<DirectControl["getCiv7TargetCandidates"]>
>;
export type Civ7ControlOrpcTechnologyChoiceCloseoutResult = Awaited<
  ReturnType<DirectControl["requestCiv7TechnologyChoiceCloseout"]>
>;
export type Civ7ControlOrpcTraditionsViewResult = Awaited<
  ReturnType<DirectControl["getCiv7TraditionsView"]>
>;
export type Civ7ControlOrpcTurnCompletionRequestResult = Awaited<
  ReturnType<DirectControl["requestCiv7TurnComplete"]>
>;
export type Civ7ControlOrpcTurnCompletionStatusResult = Awaited<
  ReturnType<DirectControl["getCiv7TurnCompletionStatus"]>
>;
export type Civ7ControlOrpcUnitTargetActionResult = Awaited<
  ReturnType<DirectControl["requestCiv7UnitTargetAction"]>
>;
