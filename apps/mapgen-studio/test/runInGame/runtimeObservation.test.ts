import { createServer, type Server } from "node:http";
import type {
  Civ7AppUiSnapshotResult,
  Civ7AutoplayStatusResult,
  Civ7MapGridResult,
  Civ7MapSummaryResult,
  Civ7PlayableStatusResult,
  getCiv7AppUiSnapshot,
  getCiv7AutoplayStatus,
  getCiv7MapGrid,
  getCiv7MapSummary,
  getCiv7PlayableStatus,
} from "@civ7/direct-control";
import {
  createStudioRpcHandler,
  isStudioRuntimeFailure,
  type RunInGameDeployment,
  type RunInGameLogEvidence,
  type RunInGamePreparedRequest,
  type RunInGameSetupPrepared,
  type StudioOperationRuntimePorts,
  type StudioRpcHandle,
  type StudioRuntimeFailure,
  type StudioServerContext,
} from "@civ7/studio-server";
import type { RunCorrelation } from "@civ7/studio-run-workspace";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { observeRunInGameRuntimeThroughStudioRpc } from "../../src/server/runInGame/runtimeObservation";

const directControl = vi.hoisted(() => ({
  getCiv7PlayableStatus: vi.fn<typeof getCiv7PlayableStatus>(),
  getCiv7MapSummary: vi.fn<typeof getCiv7MapSummary>(),
  getCiv7AppUiSnapshot: vi.fn<typeof getCiv7AppUiSnapshot>(),
  getCiv7AutoplayStatus: vi.fn<typeof getCiv7AutoplayStatus>(),
  getCiv7MapGrid: vi.fn<typeof getCiv7MapGrid>(),
}));

vi.mock("@civ7/direct-control", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@civ7/direct-control")>();
  return {
    ...actual,
    getCiv7PlayableStatus: directControl.getCiv7PlayableStatus,
    getCiv7MapSummary: directControl.getCiv7MapSummary,
    getCiv7AppUiSnapshot: directControl.getCiv7AppUiSnapshot,
    getCiv7AutoplayStatus: directControl.getCiv7AutoplayStatus,
    getCiv7MapGrid: directControl.getCiv7MapGrid,
  };
});

const openServers: Server[] = [];
const openHandles: StudioRpcHandle[] = [];
const RUN_ARTIFACT_ID = "run-test" satisfies RunCorrelation["runArtifactId"];

type RunCorrelationMismatchCase<
  Field extends keyof RunCorrelation = keyof RunCorrelation,
> = Field extends keyof RunCorrelation
  ? Readonly<{
      label: Field;
      field: Field;
      value: RunCorrelation[Field];
      mismatches: readonly Field[];
    }>
  : never;

type RunCorrelationMismatchCases = {
  readonly [Field in keyof RunCorrelation]: RunCorrelationMismatchCase<Field>;
};

const runCorrelationMismatchCases = {
  requestId: {
    label: "requestId",
    field: "requestId",
    value: "different-run",
    mismatches: ["requestId"],
  },
  runArtifactId: {
    label: "runArtifactId",
    field: "runArtifactId",
    value: "run-different",
    mismatches: ["runArtifactId"],
  },
  launchEnvelopeDigest: {
    label: "launchEnvelopeDigest",
    field: "launchEnvelopeDigest",
    value: "different-envelope",
    mismatches: ["launchEnvelopeDigest"],
  },
  generationManifestDigest: {
    label: "generationManifestDigest",
    field: "generationManifestDigest",
    value: "different-manifest",
    mismatches: ["generationManifestDigest"],
  },
  launchSourceDigest: {
    label: "launchSourceDigest",
    field: "launchSourceDigest",
    value: {
      configContentDigest: "different-config",
      launchEnvelopeDigest: "test-envelope-hash",
    },
    mismatches: ["launchSourceDigest"],
  },
} satisfies RunCorrelationMismatchCases;

type LogProofFixture =
  | Readonly<{ kind: "valid"; payloadOverrides?: Record<string, unknown> }>
  | Readonly<{ kind: "shape-only" }>;

afterEach(async () => {
  await Promise.all(openServers.splice(0).map((server) => closeServer(server)));
  await Promise.all(openHandles.splice(0).map((handle) => handle.dispose()));
});

beforeEach(() => {
  setLiveReadbacks();
});

describe("Run in Game runtime observation", () => {
  it("records matched setup and loaded-game evidence through the public /rpc live surface", async () => {
    const { origin, requests } = await listenWithStudioServer();
    const fixture = makeObservationFixture();

    const observation = await observeRunInGameRuntimeThroughStudioRpc({
      ...fixture,
      selfRpcUrl: origin,
    });

    expect(observation).toMatchObject({
      requestId: "run-runtime-observation-test",
      correlation: fixture.correlation,
      deploymentEvidence: {
        deployedSnapshot: {
          digest: "test-generated-mod-digest",
          files: [{ path: "maps/run-test.js" }],
        },
      },
      scriptingLog: {
        matchedMarkers: ["[mapgen-proof]", "run-runtime-observation-test", "[mapgen-complete]"],
      },
      setupRow: {
        state: "matched",
        mapScript: "{mod-swooper-studio-run}/maps/run-test.js",
        rowProof: { rows: [{ file: "{mod-swooper-studio-run}/maps/run-test.js" }] },
        rowVisibility: { visible: true },
      },
      loadedGame: {
        marker: {
          runCorrelation: fixture.correlation,
          dimensions: { width: 84, height: 54 },
        },
        dimensions: { width: 84, height: 54 },
        deployedSnapshotDigest: "test-generated-mod-digest",
      },
    });
    expect(requests).toEqual(
      expect.arrayContaining(["POST /rpc/civ7/live/status", "POST /rpc/civ7/live/snapshot"])
    );
    expect(observation.loadedGame.snapshotId).toMatch(/^status:12:/);
    expect(directControl.getCiv7PlayableStatus).toHaveBeenCalledTimes(1);
    expect(directControl.getCiv7AppUiSnapshot).toHaveBeenCalledTimes(1);
    expect(directControl.getCiv7MapSummary).toHaveBeenCalledTimes(1);
    expect(directControl.getCiv7AutoplayStatus).toHaveBeenCalledTimes(1);
    expect(directControl.getCiv7MapGrid).toHaveBeenCalledWith(
      expect.objectContaining({
        bounds: { x: 0, y: 0, width: 84, height: 54 },
        maxPlots: 512,
      }),
      expect.any(Object)
    );
  });

  it("waits for live status to become playable before reading the loaded-game snapshot", async () => {
    directControl.getCiv7PlayableStatus
      .mockResolvedValueOnce(playableStatusResult({ playable: false, readiness: "loading" }))
      .mockResolvedValueOnce(playableStatusResult());
    directControl.getCiv7AppUiSnapshot
      .mockResolvedValueOnce(liveAppUiSnapshot({ inGame: false }))
      .mockResolvedValueOnce(liveAppUiSnapshot());
    const { origin, requests } = await listenWithStudioServer();
    const fixture = makeObservationFixture();

    const observation = await observeRunInGameRuntimeThroughStudioRpc({
      ...fixture,
      selfRpcUrl: origin,
      sleep: async () => {},
    });

    expect(observation.loadedGame.liveStatus.playable).toBe(true);
    expect(requests).toEqual([
      "POST /rpc/civ7/live/status",
      "POST /rpc/civ7/live/status",
      "POST /rpc/civ7/live/snapshot",
    ]);
    expect(directControl.getCiv7PlayableStatus).toHaveBeenCalledTimes(2);
    expect(directControl.getCiv7MapGrid).toHaveBeenCalledTimes(1);
  });

  it("keeps waiting when playable status is true before App UI proves an in-game load", async () => {
    directControl.getCiv7PlayableStatus
      .mockResolvedValueOnce(playableStatusResult({ playable: true, readiness: "app-ui-shell" }))
      .mockResolvedValueOnce(playableStatusResult());
    directControl.getCiv7AppUiSnapshot
      .mockResolvedValueOnce(liveAppUiSnapshot({ inGame: false }))
      .mockResolvedValueOnce(liveAppUiSnapshot());
    const { origin, requests } = await listenWithStudioServer();
    const fixture = makeObservationFixture();

    const observation = await observeRunInGameRuntimeThroughStudioRpc({
      ...fixture,
      selfRpcUrl: origin,
      sleep: async () => {},
    });

    expect(observation.loadedGame.liveStatus.playable).toBe(true);
    expect(requests).toEqual([
      "POST /rpc/civ7/live/status",
      "POST /rpc/civ7/live/status",
      "POST /rpc/civ7/live/snapshot",
    ]);
    expect(directControl.getCiv7PlayableStatus).toHaveBeenCalledTimes(2);
    expect(directControl.getCiv7MapGrid).toHaveBeenCalledTimes(1);
  });

  it("accepts setup row readback whose value field names the generated map script", async () => {
    const { origin } = await listenWithStudioServer();
    const generatedMapScript = "{mod-swooper-studio-run}/maps/run-test.js";
    const fixture = makeObservationFixture({
      setup: {
        rowProof: { rows: [{ file: "{mod-swooper-studio-run}/maps/display-row.js", value: generatedMapScript }] },
        rowVisibility: { visible: true },
      },
    });

    const observation = await observeRunInGameRuntimeThroughStudioRpc({
      ...fixture,
      selfRpcUrl: origin,
    });

    expect(observation.setupRow).toMatchObject({
      state: "matched",
      mapScript: generatedMapScript,
      rowProof: {
        rows: [{ file: "{mod-swooper-studio-run}/maps/display-row.js", value: generatedMapScript }],
      },
    });
    expect(directControl.getCiv7PlayableStatus).toHaveBeenCalledTimes(1);
    expect(directControl.getCiv7MapGrid).toHaveBeenCalledTimes(1);
  });

  it("accepts setup row readback whose legacy mapScript field names the generated map script", async () => {
    const { origin } = await listenWithStudioServer();
    const generatedMapScript = "{mod-swooper-studio-run}/maps/run-test.js";
    const fixture = makeObservationFixture({
      setup: {
        rowProof: { rows: [{ mapScript: generatedMapScript }] },
        rowVisibility: { visible: true },
      },
    });

    const observation = await observeRunInGameRuntimeThroughStudioRpc({
      ...fixture,
      selfRpcUrl: origin,
    });

    expect(observation.setupRow).toMatchObject({
      state: "matched",
      mapScript: generatedMapScript,
      rowProof: { rows: [{ mapScript: generatedMapScript }] },
    });
    expect(directControl.getCiv7PlayableStatus).toHaveBeenCalledTimes(1);
    expect(directControl.getCiv7MapGrid).toHaveBeenCalledTimes(1);
  });

  it.each(Object.values(runCorrelationMismatchCases))(
    "rejects runtime markers with $label correlation mismatch before live endpoint readback",
    async ({ field, value, mismatches }) => {
      const { origin } = await listenWithStudioServer();
      const base = makeObservationFixture();
      const fixture = makeObservationFixture({
        logProof: {
          kind: "valid",
          payloadOverrides: {
            runCorrelation: { ...base.correlation, [field]: value },
            dimensions: { width: 84, height: 54 },
          },
        },
      });

      const failure = await expectRuntimeObservationFailure(
        observeRunInGameRuntimeThroughStudioRpc({ ...fixture, selfRpcUrl: origin })
      );

      expect(failure).toMatchObject({
        tag: "ProofFailed",
        reason: "exact-authorship-mismatch",
        diagnostics: {
          code: "run-in-game-runtime-marker-mismatch",
          mismatches,
        },
      });
      expect(directControl.getCiv7PlayableStatus).not.toHaveBeenCalled();
      expect(directControl.getCiv7MapGrid).not.toHaveBeenCalled();
    }
  );

  it("rejects runtime markers without enough compact identity to reconstruct run correlation before live endpoint readback", async () => {
    const { origin } = await listenWithStudioServer();
    const fixture = makeObservationFixture({
      logProof: {
        kind: "valid",
        payloadOverrides: {
          runCorrelation: undefined,
          runArtifactId: undefined,
          dimensions: { width: 84, height: 54 },
        },
      },
    });

    const failure = await expectRuntimeObservationFailure(
      observeRunInGameRuntimeThroughStudioRpc({ ...fixture, selfRpcUrl: origin })
    );

    expect(failure).toMatchObject({
      tag: "ProofFailed",
      reason: "exact-authorship-mismatch",
      diagnostics: {
        code: "run-in-game-runtime-marker-mismatch",
        mismatches: ["runCorrelation"],
      },
    });
    expect(directControl.getCiv7PlayableStatus).not.toHaveBeenCalled();
    expect(directControl.getCiv7MapGrid).not.toHaveBeenCalled();
  });

  it("rejects shape-only scripting markers without a parsed runtime proof payload", async () => {
    const { origin } = await listenWithStudioServer();
    const fixture = makeObservationFixture({ logProof: { kind: "shape-only" } });

    const failure = await expectRuntimeObservationFailure(
      observeRunInGameRuntimeThroughStudioRpc({ ...fixture, selfRpcUrl: origin })
    );

    expect(failure).toMatchObject({
      tag: "ProofFailed",
      reason: "log-proof-missing",
      diagnostics: {
        code: "run-in-game-runtime-marker-missing",
      },
    });
    expect(directControl.getCiv7PlayableStatus).not.toHaveBeenCalled();
    expect(directControl.getCiv7MapGrid).not.toHaveBeenCalled();
  });

  it("rejects runtime marker dimensions that do not match the requested map size", async () => {
    const { origin } = await listenWithStudioServer();
    const fixture = makeObservationFixture({
      logProof: {
        kind: "valid",
        payloadOverrides: { dimensions: { width: 80, height: 52 } },
      },
    });

    const failure = await expectRuntimeObservationFailure(
      observeRunInGameRuntimeThroughStudioRpc({ ...fixture, selfRpcUrl: origin })
    );

    expect(failure).toMatchObject({
      tag: "ProofFailed",
      reason: "exact-authorship-mismatch",
      diagnostics: {
        code: "run-in-game-runtime-marker-dimensions-mismatch",
        problems: ["runtime-marker-width-mismatch", "runtime-marker-height-mismatch"],
      },
    });
    expect(directControl.getCiv7PlayableStatus).not.toHaveBeenCalled();
    expect(directControl.getCiv7MapGrid).not.toHaveBeenCalled();
  });

  it("rejects missing setup readback before loaded-game observation", async () => {
    const { origin } = await listenWithStudioServer();
    const fixture = makeObservationFixture({ setup: { rowVisibility: { visible: true } } });

    const failure = await expectRuntimeObservationFailure(
      observeRunInGameRuntimeThroughStudioRpc({ ...fixture, selfRpcUrl: origin })
    );

    expect(failure).toMatchObject({
      tag: "ProofFailed",
      reason: "exact-authorship-mismatch",
      diagnostics: {
        code: "setup-map-row-not-visible",
        setupFailureReason: "setup-map-row-not-visible",
        priorCode: "run-in-game-setup-row-readback-missing",
        missing: "rowProof",
      },
    });
    expect(directControl.getCiv7PlayableStatus).not.toHaveBeenCalled();
    expect(directControl.getCiv7MapGrid).not.toHaveBeenCalled();
  });

  it("rejects missing setup visibility readback before loaded-game observation", async () => {
    const { origin } = await listenWithStudioServer();
    const fixture = makeObservationFixture({
      setup: { rowProof: { rows: [{ file: "{mod-swooper-studio-run}/maps/run-test.js" }] } },
    });

    const failure = await expectRuntimeObservationFailure(
      observeRunInGameRuntimeThroughStudioRpc({ ...fixture, selfRpcUrl: origin })
    );

    expect(failure).toMatchObject({
      tag: "ProofFailed",
      reason: "exact-authorship-mismatch",
      diagnostics: {
        code: "setup-map-row-not-visible",
        setupFailureReason: "setup-map-row-not-visible",
        priorCode: "run-in-game-setup-row-readback-missing",
        missing: "rowVisibility",
      },
    });
    expect(directControl.getCiv7PlayableStatus).not.toHaveBeenCalled();
    expect(directControl.getCiv7MapGrid).not.toHaveBeenCalled();
  });

  it("rejects setup row readback that does not match the generated map script", async () => {
    const { origin } = await listenWithStudioServer();
    const fixture = makeObservationFixture({
      setup: {
        rowProof: { rows: [{ file: "{mod-swooper-studio-run}/maps/other-run.js" }] },
        rowVisibility: { visible: true },
      },
    });

    const failure = await expectRuntimeObservationFailure(
      observeRunInGameRuntimeThroughStudioRpc({ ...fixture, selfRpcUrl: origin })
    );

    expect(failure).toMatchObject({
      tag: "ProofFailed",
      reason: "exact-authorship-mismatch",
      diagnostics: {
        code: "setup-map-row-mismatched",
        setupFailureReason: "setup-map-row-mismatched",
        priorCode: "run-in-game-setup-row-readback-mismatch",
        expectedMapScript: "{mod-swooper-studio-run}/maps/run-test.js",
        observedMapScripts: ["{mod-swooper-studio-run}/maps/other-run.js"],
      },
    });
    expect(directControl.getCiv7PlayableStatus).not.toHaveBeenCalled();
    expect(directControl.getCiv7MapGrid).not.toHaveBeenCalled();
  });

  it("fails safely when the public live endpoint is unavailable", async () => {
    const fixture = makeObservationFixture();

    const failure = await expectRuntimeObservationFailure(
      observeRunInGameRuntimeThroughStudioRpc(fixture)
    );

    expect(failure).toMatchObject({
      tag: "ProofFailed",
      reason: "timeout-uncertain",
      diagnostics: {
        code: "run-in-game-live-endpoint-unavailable",
      },
    });
    expect(directControl.getCiv7PlayableStatus).not.toHaveBeenCalled();
    expect(directControl.getCiv7MapGrid).not.toHaveBeenCalled();
  });

  it("fails safely when live status transport fails", async () => {
    const requests: string[] = [];
    const origin = await listen((req, res) => {
      requests.push(`${req.method ?? "GET"} ${req.url ?? "/"}`);
      if (req.url?.includes("/rpc/civ7/live/status")) {
        res.statusCode = 503;
        res.end("status down");
        return;
      }
      res.statusCode = 404;
      res.end("not found");
    });
    const fixture = makeObservationFixture();

    const failure = await expectRuntimeObservationFailure(
      observeRunInGameRuntimeThroughStudioRpc({ ...fixture, selfRpcUrl: origin })
    );

    expect(failure).toMatchObject({
      tag: "ProofFailed",
      reason: "timeout-uncertain",
      diagnostics: {
        code: "run-in-game-live-status-unavailable",
      },
    });
    expect(requests).toEqual(["POST /rpc/civ7/live/status"]);
    expect(directControl.getCiv7MapGrid).not.toHaveBeenCalled();
  });

  it("treats embedded live status field errors as private readback mismatch evidence", async () => {
    setLiveReadbacks({
      appUiSnapshotError: new Error("app-ui down"),
    });
    const { origin } = await listenWithStudioServer();
    const fixture = makeObservationFixture();

    const failure = await expectRuntimeObservationFailure(
      observeRunInGameRuntimeThroughStudioRpc({ ...fixture, selfRpcUrl: origin })
    );

    expect(failure).toMatchObject({
      tag: "ProofFailed",
      reason: "exact-authorship-mismatch",
      diagnostics: {
        code: "run-in-game-loaded-readback-mismatch",
        problems: ["live-app-ui-field-error", "live-app-ui-not-in-game"],
      },
    });
  });

  it("treats embedded playable-status field errors as private readback mismatch evidence", async () => {
    directControl.getCiv7PlayableStatus.mockRejectedValue(new Error("status down"));
    const { origin } = await listenWithStudioServer();
    const fixture = makeObservationFixture();

    const failure = await expectRuntimeObservationFailure(
      observeRunInGameRuntimeThroughStudioRpc({ ...fixture, selfRpcUrl: origin })
    );

    expect(failure).toMatchObject({
      tag: "ProofFailed",
      reason: "exact-authorship-mismatch",
      diagnostics: {
        code: "run-in-game-loaded-readback-mismatch",
        problems: expect.arrayContaining(["live-status-not-loaded", "live-status-field-error"]),
      },
    });
  });

  it("treats embedded map-summary field errors as private readback mismatch evidence", async () => {
    directControl.getCiv7MapSummary.mockRejectedValue(new Error("map-summary down"));
    const { origin } = await listenWithStudioServer();
    const fixture = makeObservationFixture();

    const failure = await expectRuntimeObservationFailure(
      observeRunInGameRuntimeThroughStudioRpc({ ...fixture, selfRpcUrl: origin })
    );

    expect(failure).toMatchObject({
      tag: "ProofFailed",
      reason: "exact-authorship-mismatch",
      diagnostics: {
        code: "run-in-game-loaded-readback-mismatch",
        problems: ["live-map-summary-field-error"],
      },
    });
  });

  it("waits instead of snapshotting when App UI has not reached in-game", async () => {
    setLiveReadbacks({
      appUiSnapshot: liveAppUiSnapshot({ inGame: false }),
    });
    const { origin } = await listenWithStudioServer();
    const fixture = makeObservationFixture();
    const controller = new AbortController();

    const failure = await expectRuntimeObservationFailure(
      observeRunInGameRuntimeThroughStudioRpc({
        ...fixture,
        selfRpcUrl: origin,
        sleep: async () => {
          controller.abort();
        },
        signal: controller.signal,
      })
    );

    expect(failure).toMatchObject({
      tag: "ProofFailed",
      reason: "timeout-uncertain",
      diagnostics: {
        code: "run-in-game-live-status-aborted",
      },
    });
    expect(directControl.getCiv7MapGrid).not.toHaveBeenCalled();
  });

  it("requires the loaded-game snapshot dimensions to match the generated request", async () => {
    setLiveReadbacks({
      mapGrid: liveMapGrid({ width: 80, height: 52 }),
    });
    const { origin } = await listenWithStudioServer();
    const fixture = makeObservationFixture();

    const failure = await expectRuntimeObservationFailure(
      observeRunInGameRuntimeThroughStudioRpc({ ...fixture, selfRpcUrl: origin })
    );

    expect(failure).toMatchObject({
      tag: "ProofFailed",
      reason: "exact-authorship-mismatch",
      diagnostics: {
        code: "run-in-game-loaded-readback-mismatch",
        problems: ["live-snapshot-dimensions-mismatch"],
      },
    });
  });

  it("fails safely when the live snapshot procedure reports a readback failure", async () => {
    directControl.getCiv7MapGrid.mockRejectedValue(new Error("snapshot down"));
    const { origin } = await listenWithStudioServer();
    const fixture = makeObservationFixture();

    const failure = await expectRuntimeObservationFailure(
      observeRunInGameRuntimeThroughStudioRpc({ ...fixture, selfRpcUrl: origin })
    );

    expect(failure).toMatchObject({
      tag: "ProofFailed",
      reason: "timeout-uncertain",
      diagnostics: {
        code: "run-in-game-live-snapshot-unavailable",
        cause: "snapshot down",
      },
    });
  });

  it("fails safely when live snapshot transport fails after status readback", async () => {
    const handler = createStudioRpcHandler(makeContext({}));
    openHandles.push(handler);
    const requests: string[] = [];
    const origin = await listen(async (req, res) => {
      requests.push(`${req.method ?? "GET"} ${req.url ?? "/"}`);
      if (req.url?.includes("/rpc/civ7/live/snapshot")) {
        res.statusCode = 503;
        res.end("snapshot down");
        return;
      }
      const request = await nodeRequestToWebRequest(req);
      const { matched, response } = await handler.handle(request, { prefix: "/rpc" });
      if (!matched || !response) {
        res.statusCode = 404;
        res.end("not found");
        return;
      }
      res.statusCode = response.status;
      response.headers.forEach((value, key) => res.setHeader(key, value));
      res.end(response.body ? Buffer.from(await response.arrayBuffer()) : undefined);
    });
    const fixture = makeObservationFixture();

    const failure = await expectRuntimeObservationFailure(
      observeRunInGameRuntimeThroughStudioRpc({ ...fixture, selfRpcUrl: origin })
    );

    expect(failure).toMatchObject({
      tag: "ProofFailed",
      reason: "timeout-uncertain",
      diagnostics: {
        code: "run-in-game-live-snapshot-unavailable",
      },
    });
    expect(requests).toEqual(["POST /rpc/civ7/live/status", "POST /rpc/civ7/live/snapshot"]);
    expect(directControl.getCiv7PlayableStatus).toHaveBeenCalledTimes(1);
    expect(directControl.getCiv7MapGrid).not.toHaveBeenCalled();
  });

  it("rejects empty loaded-game snapshots as shape-only endpoint evidence", async () => {
    setLiveReadbacks({
      mapGrid: { ...liveMapGrid(), plotCount: 0, plots: [] },
    });
    const { origin } = await listenWithStudioServer();
    const fixture = makeObservationFixture();

    const failure = await expectRuntimeObservationFailure(
      observeRunInGameRuntimeThroughStudioRpc({ ...fixture, selfRpcUrl: origin })
    );

    expect(failure).toMatchObject({
      tag: "ProofFailed",
      reason: "exact-authorship-mismatch",
      diagnostics: {
        code: "run-in-game-loaded-readback-mismatch",
        problems: ["live-snapshot-empty-grid"],
      },
    });
  });

  it("rejects loaded-game snapshots without map dimensions as shape-only endpoint evidence", async () => {
    const { map: _map, ...gridWithoutMapDimensions } = liveMapGrid();
    setLiveReadbacks({
      mapGrid: gridWithoutMapDimensions,
    });
    const { origin } = await listenWithStudioServer();
    const fixture = makeObservationFixture();

    const failure = await expectRuntimeObservationFailure(
      observeRunInGameRuntimeThroughStudioRpc({ ...fixture, selfRpcUrl: origin })
    );

    expect(failure).toMatchObject({
      tag: "ProofFailed",
      reason: "exact-authorship-mismatch",
      diagnostics: {
        code: "run-in-game-loaded-readback-mismatch",
        problems: ["live-snapshot-dimensions-missing"],
      },
    });
  });
});

async function listenWithStudioServer(
  overrides: Partial<StudioServerContext> = {}
): Promise<{ origin: string; requests: string[] }> {
  const handler = createStudioRpcHandler(makeContext(overrides));
  openHandles.push(handler);
  const requests: string[] = [];
  const origin = await listen(async (req, res) => {
    requests.push(`${req.method ?? "GET"} ${req.url ?? "/"}`);
    const request = await nodeRequestToWebRequest(req);
    const { matched, response } = await handler.handle(request, { prefix: "/rpc" });
    if (!matched || !response) {
      res.statusCode = 404;
      res.end("not found");
      return;
    }
    res.statusCode = response.status;
    response.headers.forEach((value, key) => res.setHeader(key, value));
    res.end(response.body ? Buffer.from(await response.arrayBuffer()) : undefined);
  });
  return { origin, requests };
}

function makeContext(overrides: Partial<StudioServerContext>): StudioServerContext {
  return {
    viteCommand: "serve",
    loadSetupCatalog: async () => {
      throw new Error("Unexpected setup-catalog call");
    },
    recipeDagService: {
      getRecipeDag: async () => {
        throw new Error("Unexpected recipe-DAG call");
      },
    },
    civ7Control: {
      directControl: {} as StudioServerContext["civ7Control"]["directControl"],
      timeoutMs: 1234,
    },
    operationRuntime: makeOperationRuntimePorts(),
    ...overrides,
  };
}

function makeOperationRuntimePorts(): StudioOperationRuntimePorts {
  return {
    clock: {
      now: () => new Date("2026-06-12T00:00:00.000Z"),
    },
    generateRunInGameMod: async () => ({ materialization: materialization() }),
    readRunInGameCatalogSource: async ({ catalogSourceId }) => ({
      catalogSourceId,
      configPath: `mods/mod-swooper-maps/src/maps/configs/${catalogSourceId}.config.json`,
      name: catalogSourceId,
      description: catalogSourceId,
      sortIndex: 900,
      config: {},
    }),
    deployRunInGame: async ({ requestId }) =>
      deployment({ requestId, materialization: materialization() }),
    waitForRunInGameLogProof: async () => ({ result: { ok: true } }),
    observeRunInGameRuntime: async () => {
      throw new Error("Unexpected operation runtime observation call");
    },
    buildRunInGameProof: async () => ({ result: { ok: true } }),
    prepareSaveDeployStart: async () => ({}),
    saveMapConfig: async () => ({ saved: true }),
    deploySavedMapConfig: async () => ({ deployed: true }),
    rollbackSaveDeploy: async () => ({ restored: true }),
  };
}

async function listen(handler: Parameters<typeof createServer>[0]): Promise<string> {
  const server = createServer(handler);
  openServers.push(server);
  await new Promise<void>((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => {
      server.off("error", reject);
      resolve();
    });
  });
  const address = server.address();
  if (!address || typeof address === "string") {
    throw new Error("Expected TCP server address");
  }
  return `http://127.0.0.1:${address.port}`;
}

async function closeServer(server: Server): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    server.close((err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}

async function nodeRequestToWebRequest(req: import("node:http").IncomingMessage): Promise<Request> {
  const method = req.method ?? "GET";
  const host = (req.headers.host as string | undefined) ?? "localhost";
  const url = `http://${host}${req.url ?? "/"}`;
  const headers = new Headers();
  for (const [key, value] of Object.entries(req.headers)) {
    if (value === undefined) continue;
    if (Array.isArray(value)) {
      for (const item of value) headers.append(key, item);
    } else {
      headers.set(key, value);
    }
  }
  let body: Buffer | undefined;
  if (method !== "GET" && method !== "HEAD") {
    const chunks: Buffer[] = [];
    for await (const chunk of req) chunks.push(Buffer.from(chunk));
    body = Buffer.concat(chunks);
  }
  return new Request(url, {
    method,
    headers,
    ...(body && body.length > 0 ? { body, duplex: "half" } : {}),
  } as RequestInit & { duplex?: "half" });
}

function makeObservationFixture(
  overrides: Partial<{
    requestId: string;
    setup: RunInGameSetupPrepared;
    logProof: LogProofFixture;
  }> = {}
): {
  requestId: string;
  prepared: RunInGamePreparedRequest;
  deployment: RunInGameDeployment;
  setup: RunInGameSetupPrepared;
  log: RunInGameLogEvidence;
  correlation: RunCorrelation;
} {
  const requestId = overrides.requestId ?? "run-runtime-observation-test";
  const generated = materialization();
  const prepared = preparedRequest();
  const runDeployment = deployment({ requestId, materialization: generated });
  const correlation = {
    requestId,
    runArtifactId: generated.runArtifactId,
    launchSourceDigest: prepared.launchSourceDigest,
    launchEnvelopeDigest: prepared.launchEnvelopeDigest,
    generationManifestDigest: generated.generationManifestDigest,
  };
  const setup = overrides.setup ?? {
    rowProof: { rows: [{ file: generated.mapScript }] },
    rowVisibility: { visible: true },
  };
  return {
    requestId,
    prepared,
    deployment: runDeployment,
    setup,
    log: {
      result: { ok: true },
      materialization: generated,
      logMarkerProof: {
        logPath: "/tmp/CivilizationVII/Logs/Scripting.log",
        observedAt: "2026-06-12T00:00:03.000Z",
        startOffset: 128,
        matched: ["[mapgen-proof]", requestId, "[mapgen-complete]"],
      },
      ...(overrides.logProof?.kind === "shape-only"
        ? { logProof: { staleMarkersOnly: true } }
        : {
            logProof: {
              proofPayload: {
                requestId,
                runArtifactId: generated.runArtifactId,
                configHash: prepared.launchSourceDigest.configContentDigest,
                envelopeHash: prepared.launchEnvelopeDigest,
                generationManifestDigest: generated.generationManifestDigest,
                dimensions: { width: 84, height: 54 },
                ...overrides.logProof?.payloadOverrides,
              },
            },
          }),
    },
    correlation,
  };
}

function preparedRequest(): RunInGamePreparedRequest {
  const resolvedLaunchSource = {
    kind: "editor" as const,
    editorSessionId: "test-editor-session",
    configId: "studio-current",
    label: "Studio Current",
    mapScript: "{swooper-maps}/maps/studio-current.js",
    sortIndex: 9999,
    config: {},
  };
  const launchEnvelope = {
    recipeSettings: {
      recipe: "mod-swooper-maps/standard",
      seed: 43,
    },
    worldSettings: {
      mapSize: "MAPSIZE_STANDARD",
    },
    setupConfig: {
      gameOptions: {},
      playerOptions: [{ playerId: 0, options: {} }],
    },
    source: {
      kind: "editor" as const,
      id: "studio-current",
      label: "Studio Current",
      mapScript: "{swooper-maps}/maps/studio-current.js",
      sortIndex: 9999,
    },
    config: {},
  };
  const launchSourceDigest = {
    configContentDigest: "test-config-hash",
    launchEnvelopeDigest: "test-envelope-hash",
  };
  return {
    correlationDigest: "test-correlation-digest",
    request: {
      recipeId: "mod-swooper-maps/standard",
      seed: 43,
      mapSize: "MAPSIZE_STANDARD",
      selectedConfigId: "studio-current",
      setupConfig: launchEnvelope.setupConfig,
      materializationMode: "disposable",
      resolvedLaunchSource,
      launchEnvelope,
      launchSourceDigest,
      launchEnvelopeDigest: launchSourceDigest.launchEnvelopeDigest,
    },
    resolvedLaunchSource,
    launchEnvelope,
    launchSourceDigest,
    launchEnvelopeDigest: launchSourceDigest.launchEnvelopeDigest,
  };
}

function materialization() {
  return {
    mode: "disposable",
    mapScript: "{mod-swooper-studio-run}/maps/run-test.js",
    configHash: "test-config-hash",
    envelopeHash: "test-envelope-hash",
    generationManifestDigest: "test-generation-manifest-digest",
    runArtifactId: RUN_ARTIFACT_ID,
    generatedModRoot: "/tmp/studio-run-runtime-observation-generated",
    generatedModFileCount: 1,
    generatedModDigest: "test-generated-mod-digest",
    mapRowId: "MAP_RUN_TEST",
  } satisfies NonNullable<RunInGameDeployment["materialization"]>;
}

function deployment(args: Readonly<{
  requestId: string;
  materialization: NonNullable<RunInGameDeployment["materialization"]>;
}>): RunInGameDeployment {
  const files = [{ path: "maps/run-test.js", sha256: "sha256-map-script", sizeBytes: 512 }];
  return {
    materialization: args.materialization,
    deploy: { targetDir: "/tmp/Civ7/Mods/mod-swooper-studio-run", filesCopied: 1 },
    runDeployment: {
      requestId: args.requestId,
      deployedModId: "mod-swooper-studio-run",
      generatedModRoot: args.materialization.generatedModRoot ?? "",
      generatedModDigest: args.materialization.generatedModDigest ?? "",
      targetRoot: "/tmp/Civ7/Mods/mod-swooper-studio-run",
      startedAt: "2026-06-12T00:00:00.000Z",
      completedAt: "2026-06-12T00:00:01.000Z",
      filesCopied: 1,
    },
    deployedSnapshot: {
      requestId: args.requestId,
      deployedModId: "mod-swooper-studio-run",
      targetRoot: "/tmp/Civ7/Mods/mod-swooper-studio-run",
      observedAt: "2026-06-12T00:00:01.000Z",
      fileCount: files.length,
      digest: args.materialization.generatedModDigest ?? "",
      files,
    },
  };
}

function setLiveReadbacks(
  overrides: Partial<{
    playableStatus: Civ7PlayableStatusResult;
    appUiSnapshot: Civ7AppUiSnapshotResult;
    appUiSnapshotError: unknown;
    mapSummary: Civ7MapSummaryResult;
    autoplayStatus: Civ7AutoplayStatusResult;
    mapGrid: Civ7MapGridResult;
  }> = {}
): void {
  directControl.getCiv7PlayableStatus.mockReset();
  directControl.getCiv7MapSummary.mockReset();
  directControl.getCiv7AppUiSnapshot.mockReset();
  directControl.getCiv7AutoplayStatus.mockReset();
  directControl.getCiv7MapGrid.mockReset();
  directControl.getCiv7PlayableStatus.mockResolvedValue(
    overrides.playableStatus ?? playableStatusResult()
  );
  if (overrides.appUiSnapshotError !== undefined) {
    directControl.getCiv7AppUiSnapshot.mockRejectedValue(overrides.appUiSnapshotError);
  } else {
    directControl.getCiv7AppUiSnapshot.mockResolvedValue(
      overrides.appUiSnapshot ?? liveAppUiSnapshot()
    );
  }
  directControl.getCiv7MapSummary.mockResolvedValue(overrides.mapSummary ?? liveMapSummary());
  directControl.getCiv7AutoplayStatus.mockResolvedValue(
    overrides.autoplayStatus ?? liveAutoplayStatus()
  );
  directControl.getCiv7MapGrid.mockResolvedValue(overrides.mapGrid ?? liveMapGrid());
}

function playableStatusResult(
  args: Partial<Pick<Civ7PlayableStatusResult, "playable" | "readiness">> = {}
): Civ7PlayableStatusResult {
  return {
    host: "127.0.0.1",
    port: 4318,
    playable: args.playable ?? true,
    readiness: args.readiness ?? "app-ui-game",
    appUi: liveAppUiSnapshot(),
    tuner: {
      host: "127.0.0.1",
      port: 4318,
      state: { id: "1", name: "Tuner" },
      ready: true,
      snapshot: { evalOk: 2, ready: true },
    },
    errors: [],
  };
}

function liveAppUiSnapshot(args: { inGame?: boolean } = {}): Civ7AppUiSnapshotResult {
  return {
    host: "127.0.0.1",
    port: 4318,
    state: { id: "65535", name: "App UI" },
    snapshot: {
      ui: {
        inGame: probe(args.inGame ?? true),
        inShell: probe(false),
        inLoading: probe(false),
        loadingState: probe(0),
        loadingStateName: null,
        canBeginGame: probe(false),
        canNotifyUIReady: "false",
        skipStartButton: probe(false),
        automationActive: probe(false),
        activeInputContext: probe(0),
        activeInputContextName: null,
      },
      network: {
        isInSession: probe(true),
        numPlayers: probe(1),
        hostPlayerId: probe(0),
        isConnectedToNetwork: probe(false),
        isAuthenticated: probe(false),
        isLoggedIn: probe(false),
      },
      autoplay: {
        isActive: false,
        turns: 0,
        isPaused: false,
        isPausedOrPending: false,
        observeAsPlayer: -1,
        returnAsPlayer: -1,
      },
      game: {
        turn: 12,
        age: 0,
        maxTurns: 500,
        turnDate: probe("4000 BCE"),
        hash: probe(987654321),
      },
      gameContext: {
        localPlayerID: 0,
        localObserverID: -1,
        hasRequestedPause: probe(false),
      },
      players: {
        maxPlayers: 8,
        aliveIds: probe([0]),
        aliveHumanIds: probe([0]),
        numAliveHumans: probe(1),
      },
      map: {
        width: probe(84),
        height: probe(54),
        plotCount: probe(4536),
        mapSize: probe(3),
        randomSeed: probe(43),
      },
    },
  };
}

function liveMapSummary(): Civ7MapSummaryResult {
  return {
    host: "127.0.0.1",
    port: 4318,
    state: { id: "1", name: "Tuner" },
    map: {
      randomSeed: probe(43),
      width: probe(84),
      height: probe(54),
      plotCount: probe(4536),
      mapSize: probe("MAPSIZE_STANDARD"),
    },
    game: {
      turn: probe(12),
      hash: probe(987654321),
      age: probe(0),
      maxTurns: probe(500),
      turnDate: probe("4000 BCE"),
    },
  };
}

function liveAutoplayStatus(): Civ7AutoplayStatusResult {
  const appUi = liveAppUiSnapshot();
  return {
    host: appUi.host,
    port: appUi.port,
    state: appUi.state,
    autoplay: appUi.snapshot.autoplay,
    game: appUi.snapshot.game,
    gameContext: appUi.snapshot.gameContext,
  };
}

function liveMapGrid(args: { width?: number; height?: number } = {}): Civ7MapGridResult {
  return {
    host: "127.0.0.1",
    port: 4318,
    state: { id: "1", name: "Tuner" },
    bounds: { x: 0, y: 0, width: args.width ?? 84, height: args.height ?? 54 },
    fields: ["terrain"],
    plotCount: (args.width ?? 84) * (args.height ?? 54),
    omitted: 0,
    hiddenInfoPolicy: "visible",
    map: {
      width: probe(args.width ?? 84),
      height: probe(args.height ?? 54),
    },
    plots: [
      {
        location: { x: 0, y: 0, index: probe(0) },
        hiddenInfoPolicy: "visible",
        facts: { terrain: probe("Grassland") },
      },
    ],
  };
}

function probe<T>(value: T): { ok: true; value: T } {
  return { ok: true, value };
}

async function expectRuntimeObservationFailure(
  promise: Promise<unknown>
): Promise<StudioRuntimeFailure> {
  try {
    await promise;
  } catch (error) {
    expect(isStudioRuntimeFailure(error)).toBe(true);
    if (!isStudioRuntimeFailure(error)) throw error;
    return error;
  }
  throw new Error("Expected runtime observation failure");
}
