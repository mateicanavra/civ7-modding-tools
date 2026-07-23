import connectedBasins from "./connected-basins/contract.js";

/** Connected basins are the sole geometry posture because basin identity and coast vectors must share one topology. */
export default [connectedBasins] as const;
