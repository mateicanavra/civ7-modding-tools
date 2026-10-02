/** Marks a drainage path whose terminal could not be classified from routing and lake evidence. */
export const HYDROLOGY_MOUTH_UNRESOLVED = 0;
/** Marks a drainage path that terminates at ocean water or an admitted external outlet. */
export const HYDROLOGY_MOUTH_OCEAN = 1;
/** Marks a drainage path that terminates in Hydrology's accepted lake plan. */
export const HYDROLOGY_MOUTH_ACCEPTED_LAKE = 2;
/** Marks a drainage path that terminates in an internally closed land basin. */
export const HYDROLOGY_MOUTH_CLOSED_BASIN = 3;
/** Marks a certified original-land north/south boundary export without an adjacent receiver. */
export const HYDROLOGY_MOUTH_BOUNDARY_EXPORT = 5;
/** Marks a resolved stationary basin without a positive-depth wet tile. */
export const HYDROLOGY_MOUTH_SUBTILE = 6;
/** Marks a resolved basin with no supported surface water. */
export const HYDROLOGY_MOUTH_DRY = 7;

/** Marks cells whose specific discharge does not support modeled surface flow. */
export const HYDROLOGY_FLOW_DRY = 0;
/** Marks low-persistence flow supported only by limited area or specific discharge. */
export const HYDROLOGY_FLOW_EPHEMERAL = 1;
/** Marks seasonally persistent flow, including minor channels and underfed major channels. */
export const HYDROLOGY_FLOW_INTERMITTENT = 2;
/** Marks major channels whose area-normalized discharge supports persistent flow. */
export const HYDROLOGY_FLOW_PERENNIAL = 3;
