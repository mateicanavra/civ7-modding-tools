import latitudeCurrentAdvection from "./latitude-current-advection/contract.js";

/** Latitude-current advection is the sole thermal posture so SST and sea-ice thresholds share one field. */
export default [latitudeCurrentAdvection] as const;
