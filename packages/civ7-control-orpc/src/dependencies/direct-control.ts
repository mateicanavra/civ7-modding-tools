import {
  getCiv7PlayableStatus,
  getCiv7PlayNotificationView,
  getCiv7ReadyUnitView,
  type Civ7DirectControlOptions,
  Civ7PlayNotificationViewResultSchema,
  Civ7PlayableStatusResultSchema,
  Civ7ReadyUnitViewResultSchema,
  type Civ7ReadyUnitViewInput,
  type PlayNotificationViewOptions,
} from "@civ7/direct-control";
import type { Static } from "typebox";

export type Civ7ControlOrpcPlayableStatusResult = Static<
  typeof Civ7PlayableStatusResultSchema
>;
export type Civ7ControlOrpcPlayNotificationViewResult = Static<
  typeof Civ7PlayNotificationViewResultSchema
>;
export type Civ7ControlOrpcReadyUnitViewResult = Static<
  typeof Civ7ReadyUnitViewResultSchema
>;

export type Civ7ControlOrpcDirectControlFacade = Readonly<{
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
}>;

export const liveCiv7ControlOrpcDirectControlFacade = {
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
} satisfies Civ7ControlOrpcDirectControlFacade;
