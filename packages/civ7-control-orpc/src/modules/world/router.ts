import { worldCurrentProcedure } from "./procedures/current";
import { worldGridReadProcedure, worldPlotReadProcedure } from "./procedures/map-reads";

export const worldRouter = {
  current: worldCurrentProcedure,
  plot: worldPlotReadProcedure,
  grid: worldGridReadProcedure,
};
