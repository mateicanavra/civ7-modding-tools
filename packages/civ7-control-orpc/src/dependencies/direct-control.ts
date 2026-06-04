import {
  getCiv7PlayableStatus,
  type Civ7DirectControlOptions,
  Civ7PlayableStatusResultSchema,
} from "@civ7/direct-control";
import type { Static } from "typebox";

export type Civ7ControlOrpcPlayableStatusResult = Static<
  typeof Civ7PlayableStatusResultSchema
>;

export type Civ7ControlOrpcDirectControlFacade = Readonly<{
  getCiv7PlayableStatus(
    options?: Civ7DirectControlOptions,
  ): Promise<Civ7ControlOrpcPlayableStatusResult>;
}>;

export const liveCiv7ControlOrpcDirectControlFacade = {
  getCiv7PlayableStatus: async (options) =>
    getCiv7PlayableStatus(options) as Promise<
      Civ7ControlOrpcPlayableStatusResult
    >,
} satisfies Civ7ControlOrpcDirectControlFacade;
