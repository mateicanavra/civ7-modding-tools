import { clamp01 } from "./util.js";

export function resolveDriverStrength01(params: {
  driverByte: number;
  driverSignalByteMin: number;
  driverExponent: number;
}): number {
  const driverByte = params.driverByte | 0;
  const driverMin = Math.max(0, Math.min(255, Math.round(params.driverSignalByteMin))) | 0;
  if (driverByte <= driverMin) return 0;
  const denom = Math.max(1, 255 - driverMin);
  const normalized = (driverByte - driverMin) / denom;
  const exponent = Math.max(0.01, params.driverExponent);
  return Math.pow(clamp01(normalized), exponent);
}

