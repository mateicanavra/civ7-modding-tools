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
export type Civ7ControlOrpcAdvisorWarningViewedCheckResult = Awaited<
  ReturnType<DirectControl["checkCiv7AdvisorWarningViewed"]>
>;
export type Civ7ControlOrpcAdvisorWarningViewedSendResult = Awaited<
  ReturnType<DirectControl["sendCiv7AdvisorWarningViewed"]>
>;
export type Civ7ControlOrpcBattlefieldScanResult = Awaited<
  ReturnType<DirectControl["getCiv7BattlefieldScan"]>
>;
export type Civ7ControlOrpcDestinationAnalysisResult = Awaited<
  ReturnType<DirectControl["getCiv7DestinationAnalysis"]>
>;
export type Civ7ControlOrpcMapGridResult = Awaited<ReturnType<DirectControl["getCiv7MapGrid"]>>;
export type Civ7ControlOrpcNotificationDismissalCheckResult = Awaited<
  ReturnType<DirectControl["checkCiv7NotificationDismissal"]>
>;
export type Civ7ControlOrpcNotificationDismissalSendResult = Awaited<
  ReturnType<DirectControl["sendCiv7NotificationDismissal"]>
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
export type Civ7ControlOrpcReadyCityViewResult = Awaited<
  ReturnType<DirectControl["getCiv7ReadyCityView"]>
>;
export type Civ7ControlOrpcReadyUnitViewResult = Awaited<
  ReturnType<DirectControl["getCiv7ReadyUnitView"]>
>;
export type Civ7ControlOrpcTargetCandidatesResult = Awaited<
  ReturnType<DirectControl["getCiv7TargetCandidates"]>
>;
