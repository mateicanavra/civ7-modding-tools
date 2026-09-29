import insolationLapseRate from "./insolation-lapse-rate/index.js";
import periodicResponse from "./periodic-response/index.js";

/** Legacy instantaneous arithmetic remains default; periodic response requires explicit selection. */
export default [insolationLapseRate, periodicResponse] as const;
