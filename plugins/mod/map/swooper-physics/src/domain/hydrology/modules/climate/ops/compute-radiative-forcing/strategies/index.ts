import latitudeInsolation from "./latitude-insolation/index.js";
import dailySolarFourier from "./daily-solar-fourier/index.js";

/** Legacy latitude forcing remains default; daily solar geometry is an explicit alternative. */
export default [latitudeInsolation, dailySolarFourier] as const;
