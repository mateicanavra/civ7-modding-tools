import temperatureHumidity from "./temperature-humidity/index.js";

/** Temperature and humidity determine demand under the baseline-owned calibration. */
export default [temperatureHumidity] as const;
