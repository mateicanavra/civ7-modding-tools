import { lifecycleSinglePlayerStartProcedure } from "./procedures/single-player-start";

export const lifecycleRouter = {
  singlePlayer: {
    start: lifecycleSinglePlayerStartProcedure,
  },
};
