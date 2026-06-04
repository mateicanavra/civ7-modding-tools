import {
  getCiv7CitySummary,
  getCiv7MapSummary,
  getCiv7PlayerSummary,
  getCiv7PlayableStatus,
  getCiv7PlayNotificationView,
  getCiv7ReadyUnitView,
  getCiv7UnitSummary,
  type Civ7DirectControlOptions,
  Civ7CitySummaryResultSchema,
  Civ7MapSummaryResultSchema,
  Civ7PlayerSummaryResultSchema,
  Civ7PlayNotificationViewResultSchema,
  Civ7PlayableStatusResultSchema,
  Civ7ReadyUnitViewResultSchema,
  Civ7UnitSummaryResultSchema,
  type Civ7CitySummaryInput,
  type Civ7MapSummaryOptions,
  type Civ7PlayerSummaryInput,
  type Civ7ReadyUnitViewInput,
  type Civ7UnitSummaryInput,
  type PlayNotificationViewOptions,
} from "@civ7/direct-control";
import type { Static } from "typebox";

export type Civ7ControlOrpcCitySummaryResult = Static<
  typeof Civ7CitySummaryResultSchema
>;
export type Civ7ControlOrpcMapSummaryResult = Static<
  typeof Civ7MapSummaryResultSchema
>;
export type Civ7ControlOrpcPlayerSummaryResult = Static<
  typeof Civ7PlayerSummaryResultSchema
>;
export type Civ7ControlOrpcPlayableStatusResult = Static<
  typeof Civ7PlayableStatusResultSchema
>;
export type Civ7ControlOrpcPlayNotificationViewResult = Static<
  typeof Civ7PlayNotificationViewResultSchema
>;
export type Civ7ControlOrpcReadyUnitViewResult = Static<
  typeof Civ7ReadyUnitViewResultSchema
>;
export type Civ7ControlOrpcUnitSummaryResult = Static<
  typeof Civ7UnitSummaryResultSchema
>;

export type Civ7ControlOrpcDirectControlFacade = Readonly<{
  getCiv7CitySummary(
    input?: Civ7CitySummaryInput,
    options?: Civ7DirectControlOptions,
  ): Promise<Civ7ControlOrpcCitySummaryResult>;
  getCiv7MapSummary(
    options?: Civ7MapSummaryOptions,
  ): Promise<Civ7ControlOrpcMapSummaryResult>;
  getCiv7PlayerSummary(
    input?: Civ7PlayerSummaryInput,
    options?: Civ7DirectControlOptions,
  ): Promise<Civ7ControlOrpcPlayerSummaryResult>;
  getCiv7PlayableStatus(
    options?: Civ7DirectControlOptions,
  ): Promise<Civ7ControlOrpcPlayableStatusResult>;
  getCiv7PlayNotificationView(
    options?: PlayNotificationViewOptions,
  ): Promise<Civ7ControlOrpcPlayNotificationViewResult>;
  getCiv7ReadyUnitView(
    input?: Civ7ReadyUnitViewInput,
    options?: Civ7DirectControlOptions,
  ): Promise<Civ7ControlOrpcReadyUnitViewResult>;
  getCiv7UnitSummary(
    input?: Civ7UnitSummaryInput,
    options?: Civ7DirectControlOptions,
  ): Promise<Civ7ControlOrpcUnitSummaryResult>;
}>;

export const liveCiv7ControlOrpcDirectControlFacade = {
  getCiv7CitySummary: async (input, options) =>
    getCiv7CitySummary(input, options) as Promise<
      Civ7ControlOrpcCitySummaryResult
    >,
  getCiv7MapSummary: async (options) =>
    getCiv7MapSummary(options) as Promise<Civ7ControlOrpcMapSummaryResult>,
  getCiv7PlayerSummary: async (input, options) =>
    getCiv7PlayerSummary(input, options) as Promise<
      Civ7ControlOrpcPlayerSummaryResult
    >,
  getCiv7PlayableStatus: async (options) =>
    getCiv7PlayableStatus(options) as Promise<
      Civ7ControlOrpcPlayableStatusResult
    >,
  getCiv7PlayNotificationView: async (options) =>
    getCiv7PlayNotificationView(options) as Promise<
      Civ7ControlOrpcPlayNotificationViewResult
    >,
  getCiv7ReadyUnitView: async (input, options) =>
    getCiv7ReadyUnitView(input, options) as Promise<
      Civ7ControlOrpcReadyUnitViewResult
    >,
  getCiv7UnitSummary: async (input, options) =>
    getCiv7UnitSummary(input, options) as Promise<
      Civ7ControlOrpcUnitSummaryResult
    >,
} satisfies Civ7ControlOrpcDirectControlFacade;
