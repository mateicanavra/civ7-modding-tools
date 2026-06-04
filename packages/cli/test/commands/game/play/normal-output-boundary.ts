import { expect } from 'vitest';
import { normalPlayDebugInternalLeaks } from '../../../../src/game-play/semantic-envelope';

export function expectNormalPlayPayloadToOmitDebugInternals(payload: unknown): void {
  expect(normalPlayDebugInternalLeaks(payload)).toEqual([]);
}
