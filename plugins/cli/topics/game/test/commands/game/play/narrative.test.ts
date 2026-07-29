import { describe, expect, test, vi } from "vitest";
import GamePlayChooseNarrative from "../../../../src/commands/game/play/choose-narrative";
import { type FakeTunerServer, startFakeTunerServer } from "../../../support/tuner-socket-server";

describe("game play narrative commands", () => {
  test("checks exact native narrative availability through narrative.choice.check", async () => {
    const server = await startNarrativeTunerServer();
    try {
      const payload = await runJsonCommand(GamePlayChooseNarrative, [
        ...endpointArgs(server),
        "--target-type",
        "TOT_30001B",
        "--target",
        '{"owner":0,"id":45,"type":35}',
        "--json",
      ]);

      expect(payload.result).toEqual({
        targetType: "TOT_30001B",
        target: { owner: 0, id: 45, type: 35 },
        available: true,
      });
      expect(
        server.received.some((message) =>
          message.includes("return JSON.stringify(checkNarrativeChoice(")
        )
      ).toBe(true);
      expect(
        server.received.some((message) =>
          message.includes("return JSON.stringify(sendNarrativeChoiceEnvelope(")
        )
      ).toBe(false);
      expect(server.received.some((message) => message.includes("validateOperation("))).toBe(false);
    } finally {
      await server.close();
    }
  });

  test("requests narrative choice through narrative.choice.request without UI choreography", async () => {
    const server = await startNarrativeTunerServer();
    try {
      const payload = await runJsonCommand(GamePlayChooseNarrative, [
        ...endpointArgs(server),
        "--target-type",
        "DISCOVERY_14001B",
        "--target",
        '{"owner":0,"id":25,"type":35}',
        "--send",
        "--json",
      ]);

      expect(payload.result).toMatchObject({
        targetType: "DISCOVERY_14001B",
        target: { owner: 0, id: 25, type: 35 },
        status: "sent-confirmed",
        postcondition: {
          classification: "narrative-blocker-cleared",
          outcome: "cleared",
          confidence: "confirmed",
          confirmed: true,
          noRepeatAfterUnverified: false,
        },
        nextSteps: [
          {
            kind: "refresh-attention",
            source: "narrative.choice.request",
          },
        ],
      });
      expectSemanticNarrativeChoiceOmitsRawRuntimeDetails(payload.result);
      expect(
        server.received.some((message) =>
          message.includes("return JSON.stringify(sendNarrativeChoiceEnvelope(")
        )
      ).toBe(true);
      const sendMessage = server.received.find((message) =>
        message.includes("return JSON.stringify(sendNarrativeChoiceEnvelope(")
      );
      expect(sendMessage).toContain('"expected":');
      expect(server.received.some((message) => message.includes('"playerId":'))).toBe(false);
      expect(server.received.some((message) => message.includes('"action":'))).toBe(false);
      expect(
        server.received.some(
          (message) =>
            message.includes("NarrativePopupManager") ||
            message.includes("querySelector") ||
            message.includes("Notifications.activate")
        )
      ).toBe(false);
    } finally {
      await server.close();
    }
  });

  test("does not expose caller-owned player or action flags", () => {
    expect(GamePlayChooseNarrative.flags).not.toHaveProperty("player-id");
    expect(GamePlayChooseNarrative.flags).not.toHaveProperty("action");
    expect(GamePlayChooseNarrative.flags).toHaveProperty("options");
  });

  test("reads narrative choice options without requiring target inputs", async () => {
    const server = await startNarrativeTunerServer({ playNotificationMode: "narrative-choice" });
    const writes: string[] = [];
    const log = vi
      .spyOn(GamePlayChooseNarrative.prototype, "log")
      .mockImplementation((message?: string) => {
        if (message) writes.push(message);
      });
    try {
      const { port } = server.address();
      await GamePlayChooseNarrative.run([
        "--host",
        "127.0.0.1",
        "--port",
        String(port),
        "--options",
        "--json",
      ]);

      const payload = JSON.parse(writes.join("")) as {
        ok: true;
        result: {
          surface: string;
          enabledOptionCount: number;
          disabledOptionCount: number;
          omitted: Array<{ path: string; reason: string }>;
          surfaces: Array<{
            kind: string;
            targetStoryId: { owner: number; id: number; type: number } | null;
            enabledOptions: Array<{
              targetType: string;
              name: string;
              nextAction: {
                kind: string;
                label: string;
                parameters: {
                  targetType: string;
                  target: { owner: number; id: number; type: number };
                };
                sendsMutation: boolean;
              };
              validationAction: {
                kind: string;
                label: string;
                parameters: {
                  targetType: string;
                  target: { owner: number; id: number; type: number };
                };
                readOnly: boolean;
              };
            }>;
            options?: unknown;
            disabledOptions?: unknown;
          }>;
          details?: unknown;
        };
      };
      expect(payload.result.surface).toBe("narrative-choice-options");
      expect(payload.result.enabledOptionCount).toBe(1);
      expect(payload.result.disabledOptionCount).toBe(0);
      expect(payload.result.details).toBeUndefined();
      expect(payload.result.surfaces[0].kind).toBe("narrative-choice-options");
      expect(payload.result.surfaces[0].options).toBeUndefined();
      expect(payload.result.surfaces[0].disabledOptions).toBeUndefined();
      expect(payload.result.surfaces[0].targetStoryId).toEqual({ owner: 0, id: 45, type: 35 });
      expect(payload.result.surfaces[0].enabledOptions[0].targetType).toBe("CLOSE");
      expect(payload.result.surfaces[0].enabledOptions[0].nextAction).toMatchObject({
        kind: "choose-narrative",
        label: "Choose narrative option.",
        parameters: {
          targetType: "CLOSE",
          target: { owner: 0, id: 45, type: 35 },
        },
        sendsMutation: true,
      });
      expect(payload.result.surfaces[0].enabledOptions[0]).toMatchObject({
        action: -1326475004,
      });
      expect(payload.result.surfaces[0].enabledOptions[0].validationAction).toMatchObject({
        kind: "validate-narrative-choice",
        label: "Validate narrative choice.",
        parameters: {
          targetType: "CLOSE",
          target: { owner: 0, id: 45, type: 35 },
        },
        readOnly: true,
      });
      expect(JSON.stringify(payload)).not.toContain("game play ");
      expect(JSON.stringify(payload)).not.toMatch(
        /before sending|after reviewing validation evidence|use full notification JSON|notifications --json/i
      );
      expect(payload.result.omitted.map((item) => item.path)).toContain("details[].storyLinks");
      expect(server.received.some((message) => message.includes("readPlayNotifications"))).toBe(
        true
      );
      expect(server.received.some((message) => message.includes("sendOperation("))).toBe(false);
    } finally {
      log.mockRestore();
      await server.close();
    }
  });

  test("reports empty narrative choices as unproven dismissal diagnostics", async () => {
    const server = await startNarrativeTunerServer({
      playNotificationMode: "narrative-choice-empty",
    });
    const writes: string[] = [];
    const log = vi
      .spyOn(GamePlayChooseNarrative.prototype, "log")
      .mockImplementation((message?: string) => {
        if (message) writes.push(message);
      });
    try {
      const { port } = server.address();
      await GamePlayChooseNarrative.run([
        "--host",
        "127.0.0.1",
        "--port",
        String(port),
        "--options",
        "--json",
      ]);

      const payload = JSON.parse(writes.join("")) as {
        ok: true;
        result: {
          enabledOptionCount: number;
          surfaces: Array<{
            classification: string;
            targetStoryId: unknown;
            enabledOptions: unknown[];
            dismissalDiagnosticAction: {
              kind: string;
              parameters: { target: { owner: number; id: number; type: number } };
              readOnly: boolean;
            } | null;
            unprovenDismissalAction: {
              kind: string;
              parameters: { target: { owner: number; id: number; type: number } };
              sendsMutation: boolean;
              proofBoundary?: string;
            } | null;
          }>;
        };
      };
      expect(payload.result.enabledOptionCount).toBe(0);
      expect(payload.result.surfaces[0].classification).toBe("narrative-choice-no-pending-story");
      expect(payload.result.surfaces[0].targetStoryId).toBeNull();
      expect(payload.result.surfaces[0].enabledOptions).toEqual([]);
      expect(payload.result.surfaces[0].dismissalDiagnosticAction).toMatchObject({
        kind: "inspect-notification-dismissal",
        parameters: { target: { owner: 0, id: 5, type: 20 } },
        readOnly: true,
      });
      expect(payload.result.surfaces[0].unprovenDismissalAction).toMatchObject({
        kind: "dismiss-notification",
        parameters: { target: { owner: 0, id: 5, type: 20 } },
        sendsMutation: true,
        proofBoundary: "unproven-dismissal",
      });
      expect(JSON.stringify(payload)).not.toContain("game play ");
      expect(server.received.some((message) => message.includes("sendOperation("))).toBe(false);
    } finally {
      log.mockRestore();
      await server.close();
    }
  });

  test("reads visible narrative panel options when story model pending ids are empty", async () => {
    const server = await startNarrativeTunerServer({
      playNotificationMode: "narrative-choice-visible-panel",
    });
    const writes: string[] = [];
    const log = vi
      .spyOn(GamePlayChooseNarrative.prototype, "log")
      .mockImplementation((message?: string) => {
        if (message) writes.push(message);
      });
    try {
      const { port } = server.address();
      await GamePlayChooseNarrative.run([
        "--host",
        "127.0.0.1",
        "--port",
        String(port),
        "--options",
        "--json",
      ]);

      const payload = JSON.parse(writes.join("")) as {
        ok: true;
        result: {
          enabledOptionCount: number;
          surfaces: Array<{
            classification: string;
            targetStoryId: unknown;
            visiblePanelTargetStoryId: { owner: number; id: number; type: number } | null;
            enabledOptions: Array<{
              targetType: string;
              target: { owner: number; id: number; type: number };
              nextAction: {
                kind: string;
                label: string;
                parameters: { target: { owner: number; id: number; type: number } };
                sendsMutation: boolean;
              };
            }>;
            dismissalDiagnosticAction: unknown;
          }>;
        };
      };
      expect(payload.result.enabledOptionCount).toBe(2);
      expect(payload.result.surfaces[0].classification).toBe("narrative-choice-options");
      expect(payload.result.surfaces[0].targetStoryId).toBeNull();
      expect(payload.result.surfaces[0].visiblePanelTargetStoryId).toEqual({
        owner: 0,
        id: 25,
        type: 35,
      });
      expect(payload.result.surfaces[0].enabledOptions.map((option) => option.targetType)).toEqual([
        "DISCOVERY_14001B",
        "DISCOVERY_14001C",
      ]);
      expect(payload.result.surfaces[0].enabledOptions[0].nextAction).toMatchObject({
        kind: "choose-narrative",
        label: "Choose narrative option.",
        parameters: { target: { owner: 0, id: 25, type: 35 } },
        sendsMutation: true,
      });
      expect(payload.result.surfaces[0].dismissalDiagnosticAction).toBeNull();
      expect(JSON.stringify(payload)).not.toContain("game play ");
      expect(server.received.some((message) => message.includes("sendOperation("))).toBe(false);
    } finally {
      log.mockRestore();
      await server.close();
    }
  });
});

type NarrativeTunerServer = FakeTunerServer;

type CommandClass = {
  run(args: string[]): Promise<unknown>;
  prototype: { log(message?: string): void };
};

function expectSemanticNarrativeChoiceOmitsRawRuntimeDetails(result: unknown) {
  const serialized = JSON.stringify(result);
  expect(serialized).not.toContain('"host"');
  expect(serialized).not.toContain('"port"');
  expect(serialized).not.toContain('"state"');
  expect(serialized).not.toContain('"session"');
  expect(serialized).not.toContain('"rawCommand"');
  expect(serialized).not.toContain('"command"');
  expect(serialized).not.toContain('"payload"');
  expect(serialized).not.toContain('"verified"');
  expect(serialized).not.toContain('"ui"');
  expect(serialized).not.toContain('"sendResult"');
  expect(serialized).not.toContain('"panelClose"');
  expect(serialized).not.toContain('"popupClose"');
  expect(serialized).not.toContain("Game.PlayerOperations");
  expect(serialized).not.toContain("sendNarrativeChoice");
}

type PlayNotificationMode =
  | "narrative-choice"
  | "narrative-choice-empty"
  | "narrative-choice-visible-panel";

async function runJsonCommand(
  command: CommandClass,
  args: string[]
): Promise<{ ok: true; result: Record<string, unknown> }> {
  const writes: string[] = [];
  const log = vi.spyOn(command.prototype, "log").mockImplementation((message?: string) => {
    if (message) writes.push(message);
  });
  try {
    await command.run(args);
    return JSON.parse(writes.join("")) as { ok: true; result: Record<string, unknown> };
  } finally {
    log.mockRestore();
  }
}

function endpointArgs(server: FakeTunerServer): string[] {
  return ["--host", "127.0.0.1", "--port", String(server.address().port)];
}

async function startNarrativeTunerServer(
  options: { playNotificationMode?: PlayNotificationMode } = {}
): Promise<NarrativeTunerServer> {
  let blockerLive = true;
  return startFakeTunerServer({
    handle({ message }) {
      if (message.includes("Network.isInSession")) {
        return [JSON.stringify(appUiSnapshot())];
      }
      if (message.includes("evalOk") && message.includes("GameplayMap.getGridWidth")) {
        return [JSON.stringify(tunerHealthSnapshot())];
      }
      if (message.includes("readPlayNotifications")) {
        return [
          JSON.stringify(playNotificationView(options.playNotificationMode ?? "narrative-choice")),
        ];
      }
      if (message.includes("return JSON.stringify(sendNarrativeChoiceEnvelope(")) {
        const before = narrativeAtomSnapshot(true);
        blockerLive = false;
        return [
          JSON.stringify({
            ok: true,
            value: {
              sent: true,
              validation: { valid: true, result: { Success: true } },
              before,
              after: narrativeAtomSnapshot(false),
            },
          }),
        ];
      }
      if (message.includes("return JSON.stringify(checkNarrativeChoice(")) {
        return [
          JSON.stringify({
            valid: true,
            result: { Success: true },
            snapshot: narrativeAtomSnapshot(blockerLive),
          }),
        ];
      }
      return undefined;
    },
  });
}

function appUiSnapshot() {
  return {
    network: {
      isInSession: { ok: true, value: true },
      numPlayers: { ok: true, value: 1 },
      hostPlayerId: { ok: true, value: 0 },
      isConnectedToNetwork: { ok: true, value: true },
      isAuthenticated: { ok: true, value: false },
      isLoggedIn: { ok: true, value: true },
    },
    autoplay: {
      isActive: false,
      turns: -1,
      isPaused: false,
      isPausedOrPending: false,
      observeAsPlayer: -1,
      returnAsPlayer: -1,
    },
    game: {
      turn: 8,
      age: 0,
      maxTurns: 0,
      turnDate: { ok: true, value: "3825 BCE" },
      hash: { ok: true, value: 0 },
    },
    ui: {
      inGame: { ok: true, value: true },
      inShell: { ok: true, value: false },
      inLoading: { ok: true, value: false },
      loadingState: { ok: true, value: 6 },
      loadingStateName: "WaitingForUIReady",
      canBeginGame: { ok: true, value: true },
      canNotifyUIReady: "function",
      skipStartButton: { ok: true, value: false },
      automationActive: { ok: true, value: false },
    },
    gameContext: {
      localPlayerID: 0,
      localObserverID: 0,
      hasRequestedPause: { ok: true, value: false },
    },
    players: {
      maxPlayers: 64,
      aliveIds: { ok: true, value: [0] },
      aliveHumanIds: { ok: true, value: [0] },
      numAliveHumans: { ok: true, value: 1 },
    },
    map: {
      width: { ok: true, value: 84 },
      height: { ok: true, value: 54 },
      plotCount: { ok: true, value: 4536 },
      mapSize: { ok: true, value: 0 },
      randomSeed: { ok: true, value: 1 },
    },
  };
}

function tunerHealthSnapshot() {
  return {
    evalOk: 2,
    ready: true,
    globals: {
      Game: "object",
      Autoplay: "object",
      GameplayMap: "object",
      Players: "object",
      Network: "undefined",
    },
    turn: { ok: true, value: 8 },
    turnDate: { ok: true, value: "3825 BCE" },
    width: { ok: true, value: 84 },
    height: { ok: true, value: 54 },
    aliveIds: { ok: true, value: [0] },
    aliveHumanIds: { ok: true, value: [0] },
    autoplayActive: { ok: true, value: false },
  };
}

function playNotificationView(mode: PlayNotificationMode = "narrative-choice") {
  const narrativeDecision = {
    category: "narrative-choice",
    operationFamily: "player-operation",
    operationType: "CHOOSE_NARRATIVE_STORY_DIRECTION",
    argsShape: "{ TargetType, Target, Action }",
    cli: "game play choose-narrative",
    requiredInputs: [
      {
        name: "TargetType",
        source: "live narrative option target type",
        required: true,
        note: "Official narrative UI sends PlayerOperationParameters.TargetType.",
      },
      {
        name: "Target",
        source: "live narrative target story id",
        required: true,
        note: "Use the story id surfaced by game play choose-narrative --options when available.",
      },
      {
        name: "Action",
        source: "live narrative option action",
        required: true,
        note: "Official narrative UI sends PlayerOperationParameters.Activate.",
      },
    ],
    confidence: "official-ui",
    followUps: [
      {
        label: "read narrative options",
        cli: "game play choose-narrative --options --json",
        argsShape: "enabled narrative buttons with validation and ready send templates",
        when: "before choosing a narrative branch or closeout",
      },
    ],
    guardrails: [
      "Do not synthesize TargetType/Target/Action from stale notification ids.",
      "If options are empty, inspect dismissal diagnostics instead of sending a narrative operation.",
    ],
    notes: [
      "Read live narrative options; the notification target can be invalid because official narrative UI derives the target story from Players.Stories. If no pending story id is present, do not synthesize a narrative operation; inspect dismissal postcondition evidence separately.",
    ],
  };
  const notificationId = { owner: 0, id: 5, type: 20 };
  const targetStoryId = { owner: 0, id: 45, type: 35 };
  const options = [
    {
      targetType: "CLOSE",
      targetTypeName: "CLOSE",
      target: targetStoryId,
      action: -1326475004,
      activation: "CLOSE",
      name: "Close",
      reward: "+10 Gold",
      imperative: null,
      cost: 0,
      canAfford: { ok: true, value: true },
      args: { TargetType: "CLOSE", Target: targetStoryId, Action: -1326475004 },
      enabled: true,
      disabled: false,
      validation: { ok: true, value: { Success: true } },
      cli: 'game play choose-narrative --target-type CLOSE --target \'{"owner":0,"id":45,"type":35}\' --send',
      validateCli:
        'game play choose-narrative --target-type CLOSE --target \'{"owner":0,"id":45,"type":35}\' --json',
    },
  ];
  const hasPendingStory = mode === "narrative-choice";
  const hasVisiblePanel = mode === "narrative-choice-visible-panel";
  const visibleTargetStoryId = { owner: 0, id: 25, type: 35 };
  const visibleOptions = [
    {
      source: "visible-small-narrative-event",
      targetType: "DISCOVERY_14001B",
      target: visibleTargetStoryId,
      action: -1326475004,
      activation: "VISIBLE_PANEL",
      name: "Find work for the soldiers.",
      reward: "+15 Production to Washington, D.C..",
      imperative: "",
      cost: null,
      canAfford: { ok: true, value: true },
      args: { TargetType: "DISCOVERY_14001B", Target: visibleTargetStoryId, Action: -1326475004 },
      enabled: true,
      disabled: false,
      validation: { ok: true, value: { Success: true } },
      cli: 'game play choose-narrative --target-type DISCOVERY_14001B --target \'{"owner":0,"id":25,"type":35}\' --send',
      validateCli:
        'game play choose-narrative --target-type DISCOVERY_14001B --target \'{"owner":0,"id":25,"type":35}\' --json',
    },
    {
      source: "visible-small-narrative-event",
      targetType: "DISCOVERY_14001C",
      target: visibleTargetStoryId,
      action: -1326475004,
      activation: "VISIBLE_PANEL",
      name: "Make plans to return home.",
      reward: "+75 Happiness toward the next Celebration.",
      imperative: "",
      cost: null,
      canAfford: { ok: true, value: true },
      args: { TargetType: "DISCOVERY_14001C", Target: visibleTargetStoryId, Action: -1326475004 },
      enabled: true,
      disabled: false,
      validation: { ok: true, value: { Success: true } },
      cli: 'game play choose-narrative --target-type DISCOVERY_14001C --target \'{"owner":0,"id":25,"type":35}\' --send',
      validateCli:
        'game play choose-narrative --target-type DISCOVERY_14001C --target \'{"owner":0,"id":25,"type":35}\' --json',
    },
  ];
  const surfacedOptions = hasPendingStory ? options : hasVisiblePanel ? visibleOptions : [];
  const hasMaterializedOptions = surfacedOptions.length > 0;
  const details = {
    kind: "narrative-choice-options",
    classification:
      surfacedOptions.length > 0 ? "narrative-choice-options" : "narrative-choice-no-pending-story",
    notificationId,
    localPlayerId: 0,
    notificationOwner: 0,
    source:
      "Players.Stories pending story id + GameInfo.NarrativeStory_Links + PlayerOperations.canStart",
    activateAction: -1326475004,
    targetStoryIdSource: "Players.Stories.getFirstPendingDiscoveryLastMetID",
    pendingStoryId: { ok: true, value: null },
    pendingDiscoveryStoryId: { ok: true, value: hasPendingStory ? targetStoryId : null },
    targetStoryId: { ok: true, value: hasPendingStory ? targetStoryId : null },
    visiblePanel: {
      ok: true,
      value: hasVisiblePanel
        ? {
            panelType: "SMALL-NARRATIVE-EVENT",
            componentType: "SmallNarrativeEvent",
            targetStoryId: visibleTargetStoryId,
            storyType: "DISCOVERY",
            options: visibleOptions.map((option) => ({
              targetType: option.targetType,
              name: option.name,
              reward: option.reward,
              actionText: option.imperative,
              icons: "[]",
              storyType: "LIGHT",
            })),
          }
        : {
            panelType: null,
            componentType: null,
            targetStoryId: null,
            storyType: null,
            options: [],
          },
    },
    targetStory: {
      ok: true,
      value: hasPendingStory ? { id: 45, type: "NARRATIVE_DISCOVERY_GOODY_HUT" } : null,
    },
    storyDef: {
      ok: true,
      value: hasPendingStory
        ? { NarrativeStoryType: "NARRATIVE_DISCOVERY_GOODY_HUT", UIActivation: "DISCOVERY" }
        : null,
    },
    storyLinks: { ok: true, value: [] },
    notificationTarget: { owner: -1, id: -1, type: 0 },
    options: surfacedOptions,
    enabledOptions: surfacedOptions,
    disabledOptions: [],
    omitted: [
      {
        path: "details[].storyLinks",
        reason:
          "omitted from compact CLI output; use raw notification-queue/notifications diagnostics if required",
      },
      {
        path: "details[].options",
        reason: "flattened into enabledOptions/disabledOptions",
      },
      {
        path: "details[].disabledOptions",
        reason: "flattened into enabledOptions/disabledOptions",
      },
    ],
    dismissalDiagnosticCli: hasMaterializedOptions
      ? null
      : 'game play dismiss-notification --target \'{"owner":0,"id":5,"type":20}\' --json',
    unprovenDismissalCli: hasMaterializedOptions
      ? null
      : 'game play dismiss-notification --target \'{"owner":0,"id":5,"type":20}\' --send',
    notes: [
      "Static fixture mirrors the CLI/HUD contract emitted by the official story-model narrative choice materializer.",
    ],
  };
  const notification = {
    id: notificationId,
    type: -504330292,
    typeName: "NOTIFICATION_CHOOSE_DISCOVERY_STORY_DIRECTION",
    groupType: null,
    summary: "Choose a selection from the Discovery.",
    message: "Discovery Choice",
    target: { owner: -1, id: -1, type: 0 },
    location: { x: -9999, y: -9999 },
    canUserDismiss: true,
    expired: false,
    dismissed: false,
    isEndTurnBlocking: true,
    decision: narrativeDecision,
    details,
  };
  return {
    localPlayerId: 0,
    turn: { ok: true, value: 8 },
    turnDate: { ok: true, value: "3825 BCE" },
    hasSentTurnComplete: { ok: true, value: false },
    canEndTurn: { ok: true, value: false },
    blocker: { ok: true, value: -504330292 },
    blockingNotificationId: { ok: true, value: notificationId },
    selectedUnitId: { ok: true, value: null },
    selectedCityId: { ok: true, value: null },
    firstReadyUnitId: { ok: true, value: null },
    notifications: [notification],
    decisions: [narrativeDecision],
    hud: {
      nextDecision: {
        notificationId,
        isEndTurnBlocking: true,
        typeName: notification.typeName,
        summary: notification.summary,
        message: notification.message,
        target: notification.target,
        location: notification.location,
        player: null,
        details,
        ...narrativeDecision,
      },
      decisionQueue: [
        {
          notificationId,
          isEndTurnBlocking: true,
          typeName: notification.typeName,
          summary: notification.summary,
          message: notification.message,
          target: notification.target,
          location: notification.location,
          player: null,
          details,
          ...narrativeDecision,
        },
      ],
    },
    limits: { maxNotifications: 25, truncated: false },
  };
}

function narrativeAtomSnapshot(blockerLive: boolean) {
  const target = { owner: 0, id: 25, type: 35 };
  const blocker = blockerLive ? -504_330_292 : 0;
  return {
    localPlayerId: 0,
    activateAction: -1_326_475_004,
    canEndTurn: { ok: true, value: !blockerLive },
    blocker: { ok: true, value: blocker },
    blockingNotification: {
      ok: true,
      value: blockerLive
        ? {
            id: { owner: 0, id: 5, type: 20 },
            type: blocker,
            typeName: "NOTIFICATION_CHOOSE_DISCOVERY_STORY_DIRECTION",
            target,
          }
        : null,
    },
  };
}
