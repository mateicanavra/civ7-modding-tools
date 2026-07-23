import dischargePercentiles from "./discharge-percentiles/contract.js";

/** Discharge percentiles are the sole projection posture so river classes remain scale-relative. */
export default [dischargePercentiles] as const;
