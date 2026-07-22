import { describe, expect, it } from "bun:test";

import { snapshotLaunchEnvelope } from "../src/runInGame.js";

function launchInput() {
  return {
    seed: 43,
    gameSeed: 47,
    worldSettings: { mapSize: "MAPSIZE_STANDARD" },
    setupConfig: {
      gameOptions: {},
      playerOptions: [{ playerId: 0, options: {} }],
    },
    canonicalConfig: {
      id: "studio-current",
      name: "Studio Current",
      description: "Current Studio editor configuration.",
      recipe: "standard" as const,
      sortIndex: 9999,
      latitudeBounds: { topLatitude: 80, bottomLatitude: -80 },
      config: {},
    },
  };
}

describe("Run in Game launch envelope seed admission", () => {
  it("accepts and owns the signed 32-bit seed boundaries", () => {
    const snapshot = snapshotLaunchEnvelope({
      ...launchInput(),
      seed: -0x8000_0000,
      gameSeed: 0x7fff_ffff,
    });

    expect(snapshot.seed).toBe(-0x8000_0000);
    expect(snapshot.gameSeed).toBe(0x7fff_ffff);
    expect(Object.isFrozen(snapshot)).toBe(true);
    expect(Object.isFrozen(snapshot.setupConfig)).toBe(true);
    expect(Object.isFrozen(snapshot.canonicalConfig)).toBe(true);
  });

  it.each([
    ["map fractional", "seed", 1.5],
    ["game fractional", "gameSeed", -1.5],
    ["map underflow", "seed", -0x8000_0001],
    ["game overflow", "gameSeed", 0x8000_0000],
  ] as const)("rejects %s before freezing a launch envelope", (_label, field, value) => {
    expect(() => snapshotLaunchEnvelope({ ...launchInput(), [field]: value })).toThrow(
      "signed 32-bit map and game seeds"
    );
  });
});
