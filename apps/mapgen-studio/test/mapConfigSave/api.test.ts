import type { MapConfigEnvelope } from "@civ7/studio-contract";
import { beforeEach, describe, expect, test, vi } from "vitest";

vi.mock("../../src/lib/orpc", () => ({
  orpcClient: {
    mapConfigs: { saveDeploy: vi.fn() },
  },
}));

import { saveRepoBackedConfig } from "../../src/features/mapConfigSave/api";
import { createMapConfigSaveDeployStatus } from "../../src/features/mapConfigSave/status";
import { orpcClient } from "../../src/lib/orpc";

const saveDeployRpc = vi.mocked(orpcClient.mapConfigs.saveDeploy);

const canonicalConfig: MapConfigEnvelope = {
  id: "studio-current",
  name: "Studio Current",
  description: "Safe Save/Deploy request fixture.",
  recipe: "standard",
  sortIndex: 9999,
  latitudeBounds: { topLatitude: 80, bottomLatitude: -80 },
  config: { nested: { enabled: true } },
};

describe("saveRepoBackedConfig", () => {
  beforeEach(() => saveDeployRpc.mockReset());

  test("sends only the canonical envelope and explicit operation options", async () => {
    const status = createMapConfigSaveDeployStatus({ requestId: "save-1", phase: "complete" });
    saveDeployRpc.mockResolvedValue(status);
    const onStatus = vi.fn();

    const result = await saveRepoBackedConfig({
      requestId: "save-1",
      canonicalConfig,
      restart: false,
      verifyRestart: false,
      onStatus,
    });

    expect(saveDeployRpc).toHaveBeenCalledWith({
      requestId: "save-1",
      canonicalConfig,
      restart: false,
      verifyRestart: false,
    });
    expect(saveDeployRpc.mock.calls[0]?.[0]).not.toHaveProperty("sourcePath");
    expect(result).toEqual({ ok: true, status });
    expect(onStatus).toHaveBeenCalledWith(status);
  });
});
