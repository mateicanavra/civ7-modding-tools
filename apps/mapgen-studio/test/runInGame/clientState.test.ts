import {
  type MapConfigEnvelope,
  type RunInGameOperationStatus,
  serializeMapConfigEnvelope,
} from "@civ7/studio-contract";
import { describe, expect, it } from "vitest";
import { getRecipeDefaultCanonicalConfig } from "../../src/features/configAuthoring/canonicalConfig";
import {
  buildRunInGameClientSnapshot,
  relationForRunInGameOperation,
} from "../../src/features/runInGame/clientState";

const worldSettings = {
  mapSize: "MAPSIZE_STANDARD" as const,
  playerCount: 8,
  resources: "balanced" as const,
};
const setupConfig = { gameOptions: {}, playerOptions: [{ playerId: 0, options: {} }] };
const status: RunInGameOperationStatus = {
  requestId: "studio-run-in-game-test",
  phase: "completed",
  status: "completed",
  createdAt: "2026-06-01T00:00:00.000Z",
  updatedAt: "2026-06-01T00:00:01.000Z",
  terminalAt: "2026-06-01T00:00:01.000Z",
  recoveryActions: ["copy-diagnostics"],
};

describe("Run in Game client state", () => {
  it("correlates only a server request id and local authoring revision", () => {
    const canonicalConfig = serializeMapConfigEnvelope(getRecipeDefaultCanonicalConfig("standard"));
    const snapshot = buildRunInGameClientSnapshot({
      requestId: status.requestId,
      authoringRevision: 4,
      seed: "123",
      worldSettings,
      setupConfig,
      canonicalConfig,
    });

    expect(relationForRunInGameOperation({ status, snapshot, authoringRevision: 4 })).toBe(
      "current"
    );
    expect(relationForRunInGameOperation({ status, snapshot, authoringRevision: 5 })).toBe("stale");
    expect(
      relationForRunInGameOperation({
        status: { ...status, requestId: "different-server-request" },
        snapshot,
        authoringRevision: 4,
      })
    ).toBe("unknown");
    expect(snapshot).not.toHaveProperty("fingerprint");
    expect(snapshot).not.toHaveProperty("canonicalConfigDigest");
    expect(snapshot).not.toHaveProperty("launchEnvelopeDigest");
  });

  it("retains an immutable snapshot of the complete configuration that was admitted", () => {
    const canonicalConfig = serializeMapConfigEnvelope(
      getRecipeDefaultCanonicalConfig("standard")
    ) as unknown as MapConfigEnvelope;
    const launchedName = canonicalConfig.name;
    const snapshot = buildRunInGameClientSnapshot({
      requestId: status.requestId,
      authoringRevision: 1,
      seed: "123",
      worldSettings,
      setupConfig,
      canonicalConfig,
    });

    (canonicalConfig as { name: string }).name = "Edited after submission";

    expect(snapshot.launchEnvelope.canonicalConfig.name).toBe(launchedName);
    expect(snapshot.launchEnvelope.canonicalConfig).not.toBe(canonicalConfig);
    expect(Object.isFrozen(snapshot.launchEnvelope.canonicalConfig)).toBe(true);
    expect(snapshot.launchEnvelope.seed).toBe("123");
    expect(snapshot.launchEnvelope.worldSettings).toEqual(worldSettings);
  });
});
