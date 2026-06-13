import { worldGridReadProcedure, worldPlotReadProcedure } from "./procedures/map-reads";
import { worldCurrentProcedure } from "./procedures/current";

export const worldRouter = {
  current: worldCurrentProcedure,
  plot: worldPlotReadProcedure,
  grid: worldGridReadProcedure,
};
