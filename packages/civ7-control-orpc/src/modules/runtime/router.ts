import { runtimePlayableStatusProcedure } from "./procedures/playable-status";

export const runtimeRouter = {
  playable: {
    status: runtimePlayableStatusProcedure,
  },
};
