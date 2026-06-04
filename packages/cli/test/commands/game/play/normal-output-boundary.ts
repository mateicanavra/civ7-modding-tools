import { expect } from 'vitest';

const DEBUG_INTERNAL_MARKERS = [
  'CMD:',
  'LSQ:',
  'GameContext.',
  'sendRequest',
  'selectedState',
  'socket',
  'requestId',
  'correlationId',
  'closeoutTrace',
  'rawProbe',
] as const;

export function expectNormalPlayPayloadToOmitDebugInternals(payload: unknown): void {
  const text = JSON.stringify(payload);
  for (const marker of DEBUG_INTERNAL_MARKERS) {
    expect(text).not.toContain(marker);
  }
}
