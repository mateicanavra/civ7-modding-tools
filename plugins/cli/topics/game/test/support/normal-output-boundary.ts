import { expect } from "vitest";

const DEBUG_INTERNAL_MARKERS = [
  "CMD:",
  "LSQ:",
  "GameContext.",
  "sendRequest",
  "selectedState",
  "socket",
  "requestId",
  "correlationId",
  "closeoutTrace",
  "rawProbe",
] as const;

/**
 * Enforces the normal-output boundary by rejecting known transport and probe markers anywhere in a payload.
 * Tests use this broad serialized check to prevent debug internals from leaking into player-facing JSON.
 */
export function expectNormalPlayPayloadToOmitDebugInternals(payload: unknown): void {
  const serialized = JSON.stringify(payload) ?? "";
  expect(DEBUG_INTERNAL_MARKERS.filter((marker) => serialized.includes(marker))).toEqual([]);
}
