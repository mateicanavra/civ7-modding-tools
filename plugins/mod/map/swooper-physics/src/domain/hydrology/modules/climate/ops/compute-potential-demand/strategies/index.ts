import temperatureHumidity from "./temperature-humidity/index.js";

/** Temperature and normalized surface wetness determine demand under baseline-owned calibration. */
export default [temperatureHumidity] as const;
