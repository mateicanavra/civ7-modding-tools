import {
  type Civ7AppUiSnapshotResult,
  type Civ7CommandResult,
  type Civ7MapSummaryResult,
  type Civ7RuntimeProbe,
  type Civ7SetupMapRowsResult,
  type Civ7SetupSnapshotResult,
  type Civ7TunerHealthResult,
} from "@civ7/direct-control";
import { call } from "@orpc/server";
import { describe, expect, test, vi } from "vitest";

import {
  type Civ7ControlOrpcContext,
  Civ7ControlOrpcContract,
  type Civ7ControlOrpcDirectLifecycleFacade,
  Civ7ControlOrpcRouter,
  createCiv7ControlOrpcServerClient,
} from "../src/index";
import { liveCiv7ControlOrpcDirectControlFacade } from "../src/runtime";

const input = {
  mapScript: "{swooper-maps}/maps/studio-current.js",
  mapSize: "MAPSIZE_SMALL",
  seed: 222,
  targetModId: "mod-swooper-studio-run",
  gameOptions: {},
  playerOptions: {},
  activeGamePolicy: "exit-active-game" as const,
};

const savedConfig = {
  id: "studio-profile",
  displayName: "Studio Profile",
  fileName: "Studio_Profile.Civ7Cfg",
  path: "/tmp/Studio_Profile.Civ7Cfg",
};

type LifecycleOperation = keyof Civ7ControlOrpcDirectLifecycleFacade;
type RecordedCall = Readonly<{ operation: LifecycleOperation; args: readonly unknown[] }>;

describe("lifecycle.singlePlayer.start control-oRPC procedure", () => {
  test("owns the shell lifecycle in one exact atomic sequence", async () => {
    const appSnapshots = sequence(appUiSnapshot("begin-ready"), appUiSnapshot("started"));
    const harness = makeHarness({ getAppUiSnapshot: appSnapshots });

    const result = await createCiv7ControlOrpcServerClient(
      harness.context
    ).lifecycle.singlePlayer.start(input);

    expect(result).toEqual({
      correlationId: "run-42",
      status: "started",
      evidence: expectedEvidence(),
      transition: { initialPhase: "shell", activeGameExit: "not-needed" },
    });
    expect(harness.operations()).toEqual([
      "getSetupSnapshot",
      "admitSetupShell",
      "reconcileRequiredTargetMod",
      "getSetupMapRows",
      "applySinglePlayerSetup",
      "hostPreparedSinglePlayerGame",
      "getAppUiSnapshot",
      "beginGame",
      "getAppUiSnapshot",
      "checkTunerHealth",
      "getMapSummary",
    ]);
    expect(harness.count("beginGame")).toBe(1);
    expect(
      harness.calls.find((entry) => entry.operation === "hostPreparedSinglePlayerGame")?.args[0]
    ).toEqual({
      mapScript: input.mapScript,
      mapSize: input.mapSize,
      seed: input.seed,
      gameSeed: input.seed,
      options: input.gameOptions,
      playerOptions: [],
    });
  });

  test("owns exit, saved-load readback, and map-row reload without repeating mutation", async () => {
    const running = setupSnapshot("running-game", 4);
    const shell = setupSnapshot("shell", 4);
    const loaded = setupSnapshot("shell", 5);
    const setupSnapshots = sequence(running, shell, loaded);
    const rowSnapshots = sequence(mapRows(false), mapRows(true));
    const harness = makeHarness({
      getSetupSnapshot: setupSnapshots,
      admitSetupShell: async () => ({
        initial: running,
        transition: "exit-sent",
        shellExit: commandResult(),
      }),
      getSetupMapRows: rowSnapshots,
      getAppUiSnapshot: async () => appUiSnapshot("started"),
    });

    const result = await createCiv7ControlOrpcServerClient(
      harness.context
    ).lifecycle.singlePlayer.start({ ...input, savedConfig });

    expect(result).toEqual({
      correlationId: "run-42",
      status: "started",
      evidence: expectedEvidence(),
      transition: { initialPhase: "running-game", activeGameExit: "exited" },
    });
    expect(harness.operations()).toEqual([
      "getSetupSnapshot",
      "admitSetupShell",
      "getSetupSnapshot",
      "requestSavedConfigLoad",
      "getSetupSnapshot",
      "reconcileRequiredTargetMod",
      "getSetupMapRows",
      "reloadSetupUiInShell",
      "getSetupMapRows",
      "applySinglePlayerSetup",
      "hostPreparedSinglePlayerGame",
      "getAppUiSnapshot",
      "checkTunerHealth",
      "getMapSummary",
    ]);
    for (const operation of [
      "admitSetupShell",
      "requestSavedConfigLoad",
      "reconcileRequiredTargetMod",
      "reloadSetupUiInShell",
      "applySinglePlayerSetup",
      "hostPreparedSinglePlayerGame",
    ] as const) {
      expect(harness.count(operation)).toBe(1);
    }
  });

  test("converts player records once in numeric order at the apply boundary", async () => {
    const harness = makeHarness({
      getAppUiSnapshot: sequence(appUiSnapshot("begin-ready"), appUiSnapshot("started")),
    });

    await createCiv7ControlOrpcServerClient(harness.context).lifecycle.singlePlayer.start({
      ...input,
      playerOptions: {
        "10": { PlayerLeader: "LEADER_TEN" },
        "2": { PlayerLeader: "LEADER_TWO" },
      },
    });

    const apply = harness.calls.find((entry) => entry.operation === "applySinglePlayerSetup");
    expect(apply?.args[0]).toEqual(
      expect.objectContaining({
        playerOptions: [
          { playerId: 2, options: { PlayerLeader: "LEADER_TWO" } },
          { playerId: 10, options: { PlayerLeader: "LEADER_TEN" } },
        ],
      })
    );
  });

  test("projects deterministic unique map-row evidence from observed provider rows", async () => {
    const otherMapScript = "{another-mod}/maps/other.js";
    const harness = makeHarness({
      getSetupMapRows: async () => ({
        ...mapRows(true),
        rows: [
          { source: "setup-domain", file: input.mapScript },
          { source: "setup-domain", file: otherMapScript },
          { source: "setup-domain", file: input.mapScript },
        ],
      }),
    });

    const result = await createCiv7ControlOrpcServerClient(
      harness.context
    ).lifecycle.singlePlayer.start(input);

    expect(result.evidence.setup.mapRowFiles).toEqual([otherMapScript, input.mapScript]);
  });

  test("fails closed when required setup readback evidence is unavailable", async () => {
    const application = setupApplication();
    const harness = makeHarness({
      applySinglePlayerSetup: async () => ({
        ...application,
        after: {
          ...application.after,
          snapshot: {
            ...application.after.snapshot,
            config: {
              ...application.after.snapshot.config,
              mapScript: { ok: false, error: "unavailable" },
            },
          },
        },
      }),
    });

    await expect(
      call(Civ7ControlOrpcRouter.lifecycle.singlePlayer.start, input, {
        context: harness.context,
      })
    ).rejects.toMatchObject({
      code: "LIFECYCLE_VERIFICATION_FAILED",
      data: { step: "verify-setup-evidence", noRepeat: true },
    });
    expect(harness.count("applySinglePlayerSetup")).toBe(1);
    expect(harness.count("hostPreparedSinglePlayerGame")).toBe(0);
  });

  test("omits unavailable optional runtime evidence", async () => {
    const summary = mapSummary();
    const unavailable = { ok: false, error: "unavailable" } as const;
    const harness = makeHarness({
      getMapSummary: async () => ({
        ...summary,
        map: {
          ...summary.map,
          width: unavailable,
          height: unavailable,
          plotCount: unavailable,
        },
        game: { ...summary.game, turn: unavailable, hash: unavailable },
      }),
    });

    const result = await createCiv7ControlOrpcServerClient(
      harness.context
    ).lifecycle.singlePlayer.start(input);

    expect(result.evidence.runtime).toEqual({ seed: input.seed, mapSize: input.mapSize });
  });

  test.each([
    [
      "non-finite width",
      (summary: Civ7MapSummaryResult) => ({
        ...summary,
        map: { ...summary.map, width: { ok: true, value: Number.POSITIVE_INFINITY } },
      }),
    ],
    [
      "fractional width",
      (summary: Civ7MapSummaryResult) => ({
        ...summary,
        map: { ...summary.map, width: { ok: true, value: 1.5 } },
      }),
    ],
    [
      "negative height",
      (summary: Civ7MapSummaryResult) => ({
        ...summary,
        map: { ...summary.map, height: { ok: true, value: -1 } },
      }),
    ],
    [
      "zero plot count",
      (summary: Civ7MapSummaryResult) => ({
        ...summary,
        map: { ...summary.map, plotCount: { ok: true, value: 0 } },
      }),
    ],
    [
      "negative turn",
      (summary: Civ7MapSummaryResult) => ({
        ...summary,
        game: { ...summary.game, turn: { ok: true, value: -1 } },
      }),
    ],
  ] as const)("fails closed on malformed optional runtime evidence: %s", async (_label, alter) => {
    const summary = mapSummary();
    const harness = makeHarness({
      getMapSummary: async () => alter(summary),
    });

    await expect(
      call(Civ7ControlOrpcRouter.lifecycle.singlePlayer.start, input, {
        context: harness.context,
      })
    ).rejects.toMatchObject({
      code: "LIFECYCLE_VERIFICATION_FAILED",
      data: { step: "verify-runtime-evidence", noRepeat: true },
    });
  });

  test("uses the saved-load command's revision as the polling baseline", async () => {
    vi.useFakeTimers();
    const harness = makeHarness({
      getSetupSnapshot: sequence(
        setupSnapshot("shell", 4),
        setupSnapshot("shell", 5),
        setupSnapshot("shell", 6)
      ),
      requestSavedConfigLoad: async () => savedLoadRequest(5),
    });
    try {
      const pending = createCiv7ControlOrpcServerClient(
        harness.context
      ).lifecycle.singlePlayer.start({ ...input, savedConfig });
      await vi.advanceTimersByTimeAsync(1_000);

      await expect(pending).resolves.toMatchObject({ status: "started" });
      expect(harness.count("getSetupSnapshot")).toBe(3);
      expect(harness.count("requestSavedConfigLoad")).toBe(1);
    } finally {
      vi.useRealTimers();
    }
  });

  test("fails before provider access when the lifecycle facade is absent", async () => {
    const context: Civ7ControlOrpcContext = {
      directControl: liveCiv7ControlOrpcDirectControlFacade,
      correlation: { correlationId: "run-42" },
    };

    await expect(
      call(Civ7ControlOrpcRouter.lifecycle.singlePlayer.start, input, { context })
    ).rejects.toMatchObject({
      code: "LIFECYCLE_DEPENDENCY_UNAVAILABLE",
      data: {
        step: "inspect-setup-phase",
        detail: "direct-lifecycle-facade-unavailable",
        correlationId: "run-42",
      },
    });
  });

  test("classifies the pre-admission read boundary as dependency availability", async () => {
    const harness = makeHarness({
      getSetupSnapshot: async () => Promise.reject(directControlFailure("socket-closed")),
    });

    await expect(
      call(Civ7ControlOrpcRouter.lifecycle.singlePlayer.start, input, {
        context: harness.context,
      })
    ).rejects.toMatchObject({
      code: "LIFECYCLE_DEPENDENCY_UNAVAILABLE",
      data: { step: "inspect-setup-phase", detail: "direct-control/socket-closed" },
    });
    expect(harness.operations()).toEqual(["getSetupSnapshot"]);
  });

  test("rejects a malformed pre-admission observation before admission", async () => {
    const harness = makeHarness({
      getSetupSnapshot: async () => ({ snapshot: { phase: "invented" } }) as never,
    });

    await expect(
      call(Civ7ControlOrpcRouter.lifecycle.singlePlayer.start, input, {
        context: harness.context,
      })
    ).rejects.toMatchObject({
      code: "LIFECYCLE_DEPENDENCY_UNAVAILABLE",
      data: { step: "inspect-setup-phase" },
    });
    expect(harness.count("getSetupSnapshot")).toBe(1);
    expect(harness.count("admitSetupShell")).toBe(0);
  });

  test.each([
    "loading",
    "begin-ready",
    "unavailable",
  ] as const)("surfaces an explicit pre-mutation %s refusal", async (phase) => {
    const harness = makeHarness({
      admitSetupShell: async () =>
        Promise.reject(
          directControlFailure("setup-phase-refused", {
            snapshot: { phase },
          })
        ),
    });

    await expect(
      call(Civ7ControlOrpcRouter.lifecycle.singlePlayer.start, input, {
        context: harness.context,
      })
    ).rejects.toMatchObject({
      code: "LIFECYCLE_STATE_REFUSED",
      data: { initialPhase: phase, step: "admit-setup-phase" },
    });
    expect(harness.operations()).toEqual(["getSetupSnapshot", "admitSetupShell"]);
  });

  test.each([
    "admitSetupShell",
    "requestSavedConfigLoad",
    "reconcileRequiredTargetMod",
    "reloadSetupUiInShell",
    "applySinglePlayerSetup",
    "hostPreparedSinglePlayerGame",
    "beginGame",
  ] as const)("never retries an ambiguous %s mutation", async (operation) => {
    const rowVisible = operation !== "reloadSetupUiInShell";
    const harness = makeHarness(
      {
        getSetupMapRows: async () => mapRows(rowVisible),
        getAppUiSnapshot: sequence(appUiSnapshot("begin-ready"), appUiSnapshot("started")),
      },
      operation
    );
    const demand = operation === "requestSavedConfigLoad" ? { ...input, savedConfig } : input;

    await expect(
      call(Civ7ControlOrpcRouter.lifecycle.singlePlayer.start, demand, {
        context: harness.context,
      })
    ).rejects.toMatchObject({
      code: "LIFECYCLE_MUTATION_UNCERTAIN",
      data: {
        detail: "direct-control/response-timeout",
        noRepeat: true,
      },
    });
    expect(harness.count(operation)).toBe(1);
  });

  test.each([
    [
      "admission",
      { admitSetupShell: async () => undefined as never },
      input,
      "admitSetupShell",
      "reconcileRequiredTargetMod",
    ],
    [
      "saved load",
      { requestSavedConfigLoad: async () => ({ accepted: true }) as never },
      { ...input, savedConfig },
      "requestSavedConfigLoad",
      "reconcileRequiredTargetMod",
    ],
    [
      "apply",
      { applySinglePlayerSetup: async () => undefined as never },
      input,
      "applySinglePlayerSetup",
      "hostPreparedSinglePlayerGame",
    ],
    [
      "host",
      { hostPreparedSinglePlayerGame: async () => ({ accepted: false }) as never },
      input,
      "hostPreparedSinglePlayerGame",
      "getAppUiSnapshot",
    ],
    [
      "begin",
      {
        getAppUiSnapshot: async () => appUiSnapshot("begin-ready"),
        beginGame: async () => ({ accepted: true }) as never,
      },
      input,
      "beginGame",
      "checkTunerHealth",
    ],
  ] as const)("classifies malformed resolved %s evidence as uncertain without continuing", async (_label, overrides, demand, operation, nextOperation) => {
    const harness = makeHarness(overrides);

    await expect(
      call(Civ7ControlOrpcRouter.lifecycle.singlePlayer.start, demand, {
        context: harness.context,
      })
    ).rejects.toMatchObject({
      code: "LIFECYCLE_MUTATION_UNCERTAIN",
      data: { noRepeat: true },
    });
    expect(harness.count(operation)).toBe(1);
    expect(harness.count(nextOperation)).toBe(0);
  });

  test.each([
    [
      "saved configuration rejected",
      { requestSavedConfigLoad: async () => ({ ...savedLoadRequest(), accepted: false }) },
      { ...input, savedConfig },
      "requestSavedConfigLoad",
    ],
    [
      "target mod unverified",
      { reconcileRequiredTargetMod: async () => targetMod(false) },
      input,
      "reconcileRequiredTargetMod",
    ],
    [
      "setup reload rejected",
      {
        getSetupMapRows: async () => mapRows(false),
        reloadSetupUiInShell: async () => ({
          command: commandResult(),
          snapshot: setupSnapshot("shell").snapshot,
          reloaded: false,
        }),
      },
      input,
      "reloadSetupUiInShell",
    ],
    [
      "setup readback unverified",
      {
        applySinglePlayerSetup: async () =>
          Promise.reject(directControlFailure("setup-readback-mismatch")),
      },
      input,
      "applySinglePlayerSetup",
    ],
    [
      "host rejected",
      {
        hostPreparedSinglePlayerGame: async () =>
          Promise.reject(directControlFailure("setup-host-rejected")),
      },
      input,
      "hostPreparedSinglePlayerGame",
    ],
  ] as const)("fails closed on explicit provider evidence: %s", async (_label, overrides, demand, operation) => {
    const harness = makeHarness(overrides);

    await expect(
      call(Civ7ControlOrpcRouter.lifecycle.singlePlayer.start, demand, {
        context: harness.context,
      })
    ).rejects.toMatchObject({
      code: "LIFECYCLE_VERIFICATION_FAILED",
      data: { noRepeat: true },
    });
    expect(harness.count(operation)).toBe(1);
  });

  test("does not accept a map row whose provider value merely echoes the script", async () => {
    const harness = makeHarness({
      getSetupMapRows: async () => ({
        ...mapRows(false),
        rows: [
          {
            source: "setup-domain",
            file: "{another-mod}/maps/not-studio-current.js",
            value: input.mapScript,
          },
        ],
      }),
      reloadSetupUiInShell: async () => ({
        command: commandResult(),
        snapshot: setupSnapshot("shell").snapshot,
        reloaded: false,
      }),
    });

    await expect(
      call(Civ7ControlOrpcRouter.lifecycle.singlePlayer.start, input, {
        context: harness.context,
      })
    ).rejects.toMatchObject({ code: "LIFECYCLE_VERIFICATION_FAILED" });
    expect(harness.operations()).toContain("reloadSetupUiInShell");
  });

  test("fails a malformed initial map-row observation without continuing mutation", async () => {
    const harness = makeHarness({
      getSetupMapRows: async () => ({ ...mapRows(true), rows: undefined as never }),
    });

    await expect(
      call(Civ7ControlOrpcRouter.lifecycle.singlePlayer.start, input, {
        context: harness.context,
      })
    ).rejects.toMatchObject({
      code: "LIFECYCLE_VERIFICATION_FAILED",
      data: { step: "read-map-rows", noRepeat: true },
    });
    expect(harness.count("reconcileRequiredTargetMod")).toBe(1);
    expect(harness.count("getSetupMapRows")).toBe(1);
    expect(harness.count("reloadSetupUiInShell")).toBe(0);
    expect(harness.count("applySinglePlayerSetup")).toBe(0);
  });

  test("maps an explicit begin guard refusal to verification without replay", async () => {
    const harness = makeHarness({
      getAppUiSnapshot: async () => appUiSnapshot("begin-ready"),
      beginGame: async () => ({
        command: commandResult(),
        accepted: false,
        loadingState: 8,
        reason: "loading-state",
      }),
    });

    await expect(
      call(Civ7ControlOrpcRouter.lifecycle.singlePlayer.start, input, {
        context: harness.context,
      })
    ).rejects.toMatchObject({
      code: "LIFECYCLE_VERIFICATION_FAILED",
      data: { step: "begin-game", detail: "begin-game-refused:loading-state", noRepeat: true },
    });
    expect(harness.count("beginGame")).toBe(1);
  });

  test("retries observation without replaying host or begin", async () => {
    vi.useFakeTimers();
    let appReads = 0;
    const harness = makeHarness({
      getAppUiSnapshot: async () => {
        appReads += 1;
        if (appReads === 1) throw directControlFailure("response-timeout");
        return appReads === 2 ? appUiSnapshot("begin-ready") : appUiSnapshot("started");
      },
    });
    try {
      const pending = createCiv7ControlOrpcServerClient(
        harness.context
      ).lifecycle.singlePlayer.start(input);
      await vi.advanceTimersByTimeAsync(1_000);

      await expect(pending).resolves.toMatchObject({ status: "started" });
      expect(harness.count("getAppUiSnapshot")).toBe(3);
      expect(harness.count("hostPreparedSinglePlayerGame")).toBe(1);
      expect(harness.count("beginGame")).toBe(1);
    } finally {
      vi.useRealTimers();
    }
  });

  test("fails a malformed successful observation immediately without replaying mutation", async () => {
    const harness = makeHarness({
      getAppUiSnapshot: async () => undefined as never,
    });

    await expect(
      call(Civ7ControlOrpcRouter.lifecycle.singlePlayer.start, input, {
        context: harness.context,
      })
    ).rejects.toMatchObject({
      code: "LIFECYCLE_VERIFICATION_FAILED",
      data: {
        step: "wait-for-begin-ready",
        detail: "begin-ready-state-not-observed",
        noRepeat: true,
      },
    });
    expect(harness.count("hostPreparedSinglePlayerGame")).toBe(1);
    expect(harness.count("getAppUiSnapshot")).toBe(1);
  });

  test("exhausts the hard observation deadline when a provider promise never settles", async () => {
    vi.useFakeTimers();
    const harness = makeHarness({
      getAppUiSnapshot: async () => await new Promise<Civ7AppUiSnapshotResult>(() => {}),
    });
    try {
      const pending = call(Civ7ControlOrpcRouter.lifecycle.singlePlayer.start, input, {
        context: harness.context,
      });
      const rejected = expect(pending).rejects.toMatchObject({
        code: "LIFECYCLE_VERIFICATION_FAILED",
        data: { step: "wait-for-begin-ready", noRepeat: true },
      });
      await vi.advanceTimersByTimeAsync(121_000);

      await rejected;
      expect(harness.count("hostPreparedSinglePlayerGame")).toBe(1);
      expect(harness.count("getAppUiSnapshot")).toBe(1);
    } finally {
      vi.useRealTimers();
    }
  });

  test("rejects an observation that resolves with a match after the deadline", async () => {
    vi.useFakeTimers();
    const harness = makeHarness({
      getAppUiSnapshot: async () =>
        await new Promise<Civ7AppUiSnapshotResult>((resolve) => {
          setTimeout(() => resolve(appUiSnapshot("started")), 120_001);
        }),
    });
    try {
      const pending = call(Civ7ControlOrpcRouter.lifecycle.singlePlayer.start, input, {
        context: harness.context,
      });
      const rejected = expect(pending).rejects.toMatchObject({
        code: "LIFECYCLE_VERIFICATION_FAILED",
        data: { step: "wait-for-begin-ready", noRepeat: true },
      });
      await vi.advanceTimersByTimeAsync(121_000);

      await rejected;
      expect(harness.count("hostPreparedSinglePlayerGame")).toBe(1);
      expect(harness.count("getAppUiSnapshot")).toBe(1);
    } finally {
      vi.useRealTimers();
    }
  });

  test.each([
    [
      "game state",
      { getAppUiSnapshot: async () => appUiSnapshot("begin-ready") },
      "wait-for-game-started",
    ],
    ["tuner readiness", { checkTunerHealth: async () => tunerHealth(false) }, "wait-for-tuner"],
    [
      "runtime map identity",
      { getMapSummary: async () => mapSummary({ seed: 999 }) },
      "verify-map",
    ],
  ] as const)("requires final %s proof", async (_label, overrides, step) => {
    vi.useFakeTimers();
    const harness = makeHarness(overrides);
    try {
      const pending = call(Civ7ControlOrpcRouter.lifecycle.singlePlayer.start, input, {
        context: harness.context,
      });
      const rejected = expect(pending).rejects.toMatchObject({
        code: "LIFECYCLE_VERIFICATION_FAILED",
        data: { step, noRepeat: true },
      });
      await vi.advanceTimersByTimeAsync(121_000);

      await rejected;
      expect(harness.count("hostPreparedSinglePlayerGame")).toBe(1);
      expect(harness.count("beginGame")).toBeLessThanOrEqual(1);
    } finally {
      vi.useRealTimers();
    }
  });

  test("does not admit malformed truthy tuner readiness", async () => {
    vi.useFakeTimers();
    const harness = makeHarness({
      checkTunerHealth: async () => ({ ...tunerHealth(true), ready: "true" as never }),
    });
    try {
      const pending = call(Civ7ControlOrpcRouter.lifecycle.singlePlayer.start, input, {
        context: harness.context,
      });
      const rejected = expect(pending).rejects.toMatchObject({
        code: "LIFECYCLE_VERIFICATION_FAILED",
        data: { step: "wait-for-tuner", noRepeat: true },
      });
      await vi.advanceTimersByTimeAsync(121_000);
      await rejected;
    } finally {
      vi.useRealTimers();
    }
  });

  test.each([
    ["truthy probe tag", { ok: "true", value: true }],
    ["wrong probe value type", { ok: true, value: "true" }],
  ] as const)("does not admit %s as started game evidence", async (_label, inGame) => {
    vi.useFakeTimers();
    const started = appUiSnapshot("started");
    const harness = makeHarness({
      getAppUiSnapshot: async () => ({
        ...started,
        snapshot: {
          ...started.snapshot,
          ui: { ...started.snapshot.ui, inGame: inGame as never },
        },
      }),
    });
    try {
      const pending = call(Civ7ControlOrpcRouter.lifecycle.singlePlayer.start, input, {
        context: harness.context,
      });
      const rejected = expect(pending).rejects.toMatchObject({
        code: "LIFECYCLE_VERIFICATION_FAILED",
        data: { step: "wait-for-begin-ready", noRepeat: true },
      });
      await vi.advanceTimersByTimeAsync(121_000);
      await rejected;
    } finally {
      vi.useRealTimers();
    }
  });

  test.each([
    { ...input, targetModId: "{mod-swooper-studio-run}" },
    { ...input, gameOptions: { "bad-key": true } },
    { ...input, playerOptions: { "65": {} } },
  ])("rejects noncanonical demand before the lifecycle facade runs", async (invalidInput) => {
    const harness = makeHarness();

    await expect(
      call(Civ7ControlOrpcRouter.lifecycle.singlePlayer.start, invalidInput as never, {
        context: harness.context,
      })
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
    expect(harness.calls).toEqual([]);
  });

  test("rejects invalid correlation before the lifecycle facade runs", async () => {
    const harness = makeHarness();
    const context: Civ7ControlOrpcContext = {
      ...harness.context,
      correlation: { correlationId: " invalid" as never },
    };

    await expect(
      call(Civ7ControlOrpcRouter.lifecycle.singlePlayer.start, input, { context })
    ).rejects.toMatchObject({ code: "CORRELATION_ID_INVALID" });
    expect(harness.calls).toEqual([]);
  });

  test("publishes one minimal lifecycle leaf and its closed failure map", () => {
    const contract = Civ7ControlOrpcContract.lifecycle.singlePlayer.start["~orpc"];
    expect(contract).toMatchObject({
      meta: {
        family: "lifecycle",
        procedureKey: "lifecycle.singlePlayer.start",
        proofBoundary: "pending-runtime-proof",
        risk: "mutation",
      },
    });
    expect(Object.keys(contract.errorMap).sort()).toEqual([
      "CONTROLLER_CAPABILITY_UNAVAILABLE",
      "CORRELATION_ID_INVALID",
      "LIFECYCLE_DEPENDENCY_UNAVAILABLE",
      "LIFECYCLE_MUTATION_UNCERTAIN",
      "LIFECYCLE_STATE_REFUSED",
      "LIFECYCLE_VERIFICATION_FAILED",
    ]);
    expect(
      Object.keys(Civ7ControlOrpcContract.world.current["~orpc"].errorMap).filter((code) =>
        code.startsWith("LIFECYCLE_")
      )
    ).toEqual([]);
    expect("runCiv7SinglePlayerFromSetup" in liveCiv7ControlOrpcDirectControlFacade).toBe(false);
  });
});

function makeHarness(
  overrides: Partial<Civ7ControlOrpcDirectLifecycleFacade> = {},
  failAt?: LifecycleOperation
): Readonly<{
  calls: RecordedCall[];
  context: Civ7ControlOrpcContext;
  count: (operation: LifecycleOperation) => number;
  operations: () => LifecycleOperation[];
}> {
  const calls: RecordedCall[] = [];
  const record =
    <Args extends unknown[], Result>(
      operation: LifecycleOperation,
      run: (...args: Args) => Promise<Result>
    ) =>
    async (...args: Args): Promise<Result> => {
      calls.push({ operation, args });
      if (failAt === operation) throw directControlFailure("response-timeout");
      return run(...args);
    };

  const directLifecycle: Civ7ControlOrpcDirectLifecycleFacade = {
    getSetupSnapshot: record(
      "getSetupSnapshot",
      overrides.getSetupSnapshot ?? (async () => setupSnapshot("shell"))
    ),
    admitSetupShell: record(
      "admitSetupShell",
      overrides.admitSetupShell ??
        (async () => ({ initial: setupSnapshot("shell"), transition: "shell" }))
    ),
    requestSavedConfigLoad: record(
      "requestSavedConfigLoad",
      overrides.requestSavedConfigLoad ?? (async () => savedLoadRequest())
    ),
    reconcileRequiredTargetMod: record(
      "reconcileRequiredTargetMod",
      overrides.reconcileRequiredTargetMod ?? (async () => targetMod(true))
    ),
    getSetupMapRows: record(
      "getSetupMapRows",
      overrides.getSetupMapRows ?? (async () => mapRows(true))
    ),
    reloadSetupUiInShell: record(
      "reloadSetupUiInShell",
      overrides.reloadSetupUiInShell ??
        (async () => ({
          command: commandResult(),
          snapshot: setupSnapshot("shell").snapshot,
          reloaded: true,
        }))
    ),
    applySinglePlayerSetup: record(
      "applySinglePlayerSetup",
      overrides.applySinglePlayerSetup ?? (async () => setupApplication())
    ),
    hostPreparedSinglePlayerGame: record(
      "hostPreparedSinglePlayerGame",
      overrides.hostPreparedSinglePlayerGame ??
        (async () => ({
          command: commandResult(),
          before: setupSnapshot("shell"),
          accepted: true,
        }))
    ),
    getAppUiSnapshot: record(
      "getAppUiSnapshot",
      overrides.getAppUiSnapshot ?? (async () => appUiSnapshot("started"))
    ),
    beginGame: record(
      "beginGame",
      overrides.beginGame ??
        (async () => ({ command: commandResult(), accepted: true, loadingState: 6 }))
    ),
    checkTunerHealth: record(
      "checkTunerHealth",
      overrides.checkTunerHealth ?? (async () => tunerHealth(true))
    ),
    getMapSummary: record("getMapSummary", overrides.getMapSummary ?? (async () => mapSummary())),
  };
  return {
    calls,
    context: {
      directControl: liveCiv7ControlOrpcDirectControlFacade,
      directLifecycle,
      endpointDefaults: { host: "127.0.0.1", port: 4318 },
      correlation: { correlationId: "run-42" },
    },
    count: (operation) => calls.filter((entry) => entry.operation === operation).length,
    operations: () => calls.map((entry) => entry.operation),
  };
}

function sequence<A>(first: A, ...rest: readonly A[]): () => Promise<A> {
  const values = [first, ...rest];
  let index = 0;
  return async () => values[Math.min(index++, values.length - 1)]!;
}

function directControlFailure(code: string, details?: unknown) {
  return {
    name: "Civ7DirectControlError",
    code,
    ...(details === undefined ? {} : { details }),
  };
}

const state = { id: "app-ui", name: "AppUI" } as const;

function commandResult(): Civ7CommandResult {
  return { host: "127.0.0.1", port: 4318, state, output: ["null"] };
}

function probe<T>(value: T): Civ7RuntimeProbe<T> {
  return { ok: true, value };
}

function setupSnapshot(phase: "shell" | "running-game", revision = 1): Civ7SetupSnapshotResult {
  const row = { source: "setup-domain" as const, file: input.mapScript };
  return {
    host: "127.0.0.1",
    port: 4318,
    state,
    snapshot: {
      phase,
      ui: {
        inGame: probe(phase === "running-game"),
        inShell: probe(phase === "shell"),
        inLoading: probe(false),
        loadingState: probe(phase === "running-game" ? 8 : 0),
        loadingStateName: phase === "running-game" ? "GameStarted" : "NotStarted",
        canBeginGame: probe(false),
      },
      setup: {
        revision: probe(revision),
        parameters: [],
        playerParameters: [],
        localPlayerId: probe(0),
      },
      selectedMapRow: row,
      mapRows: [row],
      config: {
        mapScript: probe(input.mapScript),
        mapSize: probe(input.mapSize),
        mapSizeType: probe(input.mapSize),
        mapSeed: probe(input.seed),
        gameSeed: probe(input.seed),
        playerCount: probe(8),
      },
    },
  };
}

function mapRows(visible: boolean): Civ7SetupMapRowsResult {
  return {
    host: "127.0.0.1",
    port: 4318,
    state,
    rows: [
      {
        source: "setup-domain",
        file: visible ? input.mapScript : "{another-mod}/maps/not-studio-current.js",
      },
    ],
    limit: 20,
    ...(visible ? { matchedFile: input.mapScript } : {}),
  };
}

function savedLoadRequest(revision = 1) {
  return {
    command: commandResult(),
    savedConfig,
    before: setupSnapshot("shell", revision),
    accepted: true,
  } as const;
}

function targetMod(verified: boolean) {
  return {
    targetModId: input.targetModId,
    before: setupSnapshot("shell"),
    refreshed: true,
    verified,
  } as const;
}

function setupApplication() {
  const before = setupSnapshot("shell");
  const after = {
    ...setupSnapshot("shell"),
    snapshot: {
      ...setupSnapshot("shell").snapshot,
      config: {
        ...setupSnapshot("shell").snapshot.config,
        mapSeed: probe(input.seed),
      },
    },
  };
  return {
    host: "127.0.0.1",
    port: 4318,
    state,
    before,
    after,
    command: commandResult(),
    applied: {},
    verified: true,
  } as const;
}

function appUiSnapshot(kind: "begin-ready" | "started"): Civ7AppUiSnapshotResult {
  const started = kind === "started";
  return {
    host: "127.0.0.1",
    port: 4318,
    state,
    snapshot: {
      network: {
        isInSession: probe(started),
        numPlayers: probe(started ? 1 : 0),
        hostPlayerId: probe(0),
        isConnectedToNetwork: probe(started),
        isAuthenticated: probe(true),
        isLoggedIn: probe(true),
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
        turn: 1,
        age: 0,
        maxTurns: 500,
        turnDate: probe("4000 BCE"),
        hash: probe(1),
      },
      ui: {
        inGame: probe(started),
        inShell: probe(false),
        inLoading: probe(!started),
        loadingState: probe(started ? 8 : 6),
        loadingStateName: started ? "GameStarted" : "WaitingForUIReady",
        canBeginGame: probe(!started),
        canNotifyUIReady: "function",
        skipStartButton: probe(false),
        automationActive: probe(false),
        activeInputContext: probe(0),
        activeInputContextName: null,
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
        width: probe(64),
        height: probe(40),
        plotCount: probe(2_560),
        mapSize: probe(1),
        randomSeed: probe(input.seed),
      },
    },
  };
}

function tunerHealth(ready: boolean): Civ7TunerHealthResult {
  return {
    host: "127.0.0.1",
    port: 4318,
    state: { id: "tuner", name: "Tuner" },
    ready,
    snapshot: {
      evalOk: 2,
      ready,
      globals: {
        Game: "object",
        Autoplay: "object",
        GameplayMap: "object",
        Players: "object",
        Network: "object",
      },
      turn: probe(1),
      turnDate: probe("4000 BCE"),
      width: probe(64),
      height: probe(40),
      aliveIds: probe([0]),
      aliveHumanIds: probe([0]),
      autoplayActive: probe(false),
    },
  };
}

function mapSummary(
  options: Readonly<{ seed?: number; mapSize?: string }> = {}
): Civ7MapSummaryResult {
  return {
    host: "127.0.0.1",
    port: 4318,
    state: { id: "tuner", name: "Tuner" },
    map: {
      width: probe(64),
      height: probe(40),
      plotCount: probe(2_560),
      mapSize: probe(1),
      mapSizeType: probe(options.mapSize ?? input.mapSize),
      randomSeed: probe(options.seed ?? input.seed),
    },
    game: {
      turn: probe(1),
      age: probe(0),
      maxTurns: probe(500),
      turnDate: probe("4000 BCE"),
      hash: probe(1),
    },
  };
}

function expectedEvidence() {
  return {
    setup: {
      mapScript: input.mapScript,
      mapSize: input.mapSize,
      mapSeed: input.seed,
      gameSeed: input.seed,
      playerCount: 8,
      targetModId: input.targetModId,
      mapRowFiles: [input.mapScript],
    },
    runtime: {
      seed: input.seed,
      mapSize: input.mapSize,
      width: 64,
      height: 40,
      plotCount: 2_560,
      turn: 1,
      gameHash: 1,
    },
  };
}
