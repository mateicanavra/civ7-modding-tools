import { current } from "./current";
import { mapReads } from "./map-reads";
export const router = {
  current: current,
  plot: mapReads.worldPlotReadProcedure,
  grid: mapReads.worldGridReadProcedure,
};
