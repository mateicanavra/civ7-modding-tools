/**
 * Frozen training-only fit to 196 of 411 low-relief inland NOAA reanalysis cells.
 * These are empirical Celsius-per-q responses, not heat capacities or ocean calibration.
 */
export const EARTH_PERIODIC_RESPONSE = Object.freeze({
  reference: "noaa-low-relief-land-1991-2020",
  monthlyFixtureSha256: "cdc4f1dd74a3ec6f9f92a55307ac273902a3f83ba34f010df372ce50dbf71a1f",
  summarySha256: "3584bbebba9edefeb94707a53d907fb8d1fbe314b2385aa9ebd01b4a5c05b194",
  protocol:
    "Area-weighted training-only annual geographic fit and independent complex annual/semiannual responses to calendar-weighted monthly harmonics; unchanged spatial holdout.",
  interceptC: -37.281717968360105,
  geographicGainCPerQ: 206.8113096845454,
  annual: Object.freeze({ real: 87.41575475075993, imaginary: -43.89492826435499 }),
  semiannual: Object.freeze({ real: 3.65785791897244, imaginary: -68.66297422806831 }),
});
