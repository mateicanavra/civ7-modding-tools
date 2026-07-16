import type { Civ7PlayNotificationViewResult } from "@civ7/direct-control";
import { describe, expect, test, vi } from "vitest";
import GamePlayNotifications from "../../../../../src/commands/game/play/notifications";
import { type FakeTunerServer, startFakeTunerServer } from "../../../fixtures/tuner-socket-server";
import { expectNormalPlayPayloadToOmitDebugInternals } from "../normal-output-boundary";

type NotificationHudMode =
  | "default"
  | "stale-diplomacy"
  | "tech-choice"
  | "culture-choice"
  | "celebration-choice"
  | "government-choice"
  | "narrative-choice"
  | "stale-unit-command"
  | "diplomatic-report"
  | "diplomatic-action-report";

type NotificationHudCommandPayload = Readonly<{
  ok: true;
  view: Civ7PlayNotificationViewResult;
}>;

describe("game play notifications command", () => {
  test("materializes diplomacy response options from the notification HUD", async () => {
    const { payload, server } = await runNotificationHud("stale-diplomacy");
    try {
      const details = payload.view.notifications[0].details;
      expect(details).toMatchObject({
        kind: "diplomacy-response-options",
        actionId: 8,
        options: [{ title: "Support" }, { title: "Accept" }, { title: "Reject" }],
        disabledOptions: [{ responseType: -1907089594 }],
        enabledOptions: [
          { responseType: 926305338, title: "Accept" },
          { responseType: -1200641623, title: "Reject" },
        ],
      });
      expect(details).not.toHaveProperty("disabledOptions.0.cli");
      expect(details).not.toHaveProperty("enabledOptions.0.cli");
      expect(payload.view.hud.nextDecision?.details).toBeDefined();
      expect(server.received.some((message) => message.includes("readPlayNotifications"))).toBe(
        true
      );
    } finally {
      await server.close();
    }
  });

  test("materializes technology choice options from the notification HUD", async () => {
    const { payload, server } = await runNotificationHud("tech-choice");
    try {
      const details = payload.view.notifications[0].details;
      expect(details).toMatchObject({
        kind: "technology-choice-options",
        enabledOptions: expect.arrayContaining([
          expect.objectContaining({
            nodeType: -1255676052,
            name: "Masonry",
            chooseValidation: { ok: true, value: { Success: true } },
          }),
          expect.objectContaining({ nodeType: -1558948215, name: "Sailing" }),
        ]),
        disabledOptions: [expect.objectContaining({ name: "Agriculture" })],
      });
      expect(details).not.toHaveProperty("enabledOptions.0.cli");
      expect(details).not.toHaveProperty("disabledOptions.0.cli");
      expect(details).toHaveProperty("enabledOptions.length", 2);
      expect(payload.view.hud.nextDecision?.details).toBeDefined();
      expect(server.received.some((message) => message.includes("readPlayNotifications"))).toBe(
        true
      );
    } finally {
      await server.close();
    }
  });

  test("materializes culture choice options from the notification HUD", async () => {
    const { payload, server } = await runNotificationHud("culture-choice");
    try {
      const details = payload.view.notifications[0].details;
      expect(details).toMatchObject({
        kind: "culture-choice-options",
        availableNodeTypes: {
          value: expect.arrayContaining([-869902342]),
        },
        enabledOptions: expect.arrayContaining([
          expect.objectContaining({
            nodeType: -869902342,
            name: "Ekklesia",
            chooseValidation: { ok: true, value: { Success: true } },
          }),
          expect.objectContaining({ nodeType: -1404789184, name: "Discipline" }),
        ]),
        disabledOptions: [expect.objectContaining({ name: "Mysticism" })],
      });
      expect(details).not.toHaveProperty("playerCulture");
      expect(details).not.toHaveProperty("enabledOptions.0.cli");
      expect(details).not.toHaveProperty("disabledOptions.0.cli");
      expect(details).toHaveProperty("enabledOptions.length", 2);
      expect(payload.view.hud.nextDecision?.details).toBeDefined();
      expect(server.received.some((message) => message.includes("readPlayNotifications"))).toBe(
        true
      );
    } finally {
      await server.close();
    }
  });

  test("materializes celebration choice options from the notification HUD", async () => {
    const { payload, server } = await runNotificationHud("celebration-choice");
    try {
      const details = payload.view.notifications[0].details;
      expect(details).toMatchObject({
        kind: "celebration-choice-options",
        goldenAgeDuration: { value: 10 },
        choices: { value: expect.arrayContaining(["GOLDEN_AGE_CLASSICAL_REPUBLIC_1"]) },
        enabledOptions: expect.arrayContaining([
          expect.objectContaining({
            goldenAgeType: -340825966,
            name: "Cultural Celebration",
            validation: { ok: true, value: { Success: true } },
          }),
          expect.objectContaining({
            goldenAgeType: 1923496232,
            name: "Wonder Production Celebration",
          }),
        ]),
        disabledOptions: [],
      });
      expect(details).not.toHaveProperty("enabledOptions.0.cli");
      expect(details).toHaveProperty("enabledOptions.length", 2);
      expect(payload.view.hud.nextDecision?.details).toBeDefined();
      expect(server.received.some((message) => message.includes("readPlayNotifications"))).toBe(
        true
      );
    } finally {
      await server.close();
    }
  });

  test("materializes government choice options from the notification HUD", async () => {
    const { payload, server } = await runNotificationHud("government-choice");
    try {
      const details = payload.view.notifications[0].details;
      expect(details).toMatchObject({
        kind: "government-choice-options",
        action: -1326475004,
        startingGovernments: {
          value: [{ GovernmentType: 0 }, { GovernmentType: 1 }, { GovernmentType: 2 }],
        },
        enabledOptions: [
          expect.objectContaining({
            governmentType: 0,
            name: "Classical Republic",
            validation: { ok: true, value: { Success: true } },
          }),
          expect.objectContaining({ governmentType: 1, name: "Despotism" }),
          expect.objectContaining({ governmentType: 2, name: "Oligarchy" }),
        ],
        disabledOptions: [],
      });
      expect(details).not.toHaveProperty("enabledOptions.0.cli");
      expect(payload.view.hud.nextDecision?.details).toBeDefined();
      expect(server.received.some((message) => message.includes("readPlayNotifications"))).toBe(
        true
      );
    } finally {
      await server.close();
    }
  });

  test("materializes narrative choice options from the notification HUD", async () => {
    const { payload, server } = await runNotificationHud("narrative-choice");
    try {
      const notification = payload.view.notifications[0];
      const details = notification.details;
      expect(notification.target).toEqual({ owner: -1, id: -1, type: 0 });
      expect(details).toMatchObject({
        kind: "narrative-choice-options",
        targetStoryId: { value: { owner: 0, id: 45, type: 35 } },
        storyLinks: { value: [] },
        enabledOptions: [
          expect.objectContaining({
            targetType: "CLOSE",
            validation: { ok: true, value: { Success: true } },
          }),
        ],
        disabledOptions: [],
      });
      expect(details).not.toHaveProperty("enabledOptions.0.cli");
      expect(payload.view.hud.nextDecision?.details).toBeDefined();
      expect(server.received.some((message) => message.includes("readPlayNotifications"))).toBe(
        true
      );
    } finally {
      await server.close();
    }
  });

  test("materializes stale command-units reconciliation candidates from the notification HUD", async () => {
    const { payload, server } = await runNotificationHud("stale-unit-command");
    try {
      const details = payload.view.notifications[0].details;
      expect(details).toMatchObject({
        kind: "unit-command-reconciliation",
        staleReadyPointerSuspected: true,
        enabledCloseoutCandidates: [
          {
            unitId: { owner: 0, id: 196609, type: 26 },
            operationType: "SKIP_TURN",
          },
        ],
      });
      expect(details).not.toHaveProperty("enabledCloseoutCandidates.0.cli");
      expect(payload.view.hud.nextDecision?.details).toBeDefined();
    } finally {
      await server.close();
    }
  });

  test("reads materialized notifications without sending operations", async () => {
    const { server } = await runNotificationHud();
    try {
      expect(server.received.some((message) => message.includes("readPlayNotifications"))).toBe(
        true
      );
      expect(server.received.some((message) => message.includes("sendOperation("))).toBe(false);
    } finally {
      await server.close();
    }
  });

  test("renders text action guidance without command recipes", async () => {
    const { writes, server } = await runNotificationHudText("stale-diplomacy");
    try {
      const output = writes.join("\n");
      expect(output).toContain("Decision HUD");
      expect(output).toContain("action: diplomacy-response");
      expect(output).toContain("operation: player-operation RESPOND_DIPLOMATIC_ACTION");
      expect(output).not.toContain("shortcut:");
      expect(output).not.toContain("  cli:");
      expect(output).not.toContain("game play ");
      expect(server.received.some((message) => message.includes("readPlayNotifications"))).toBe(
        true
      );
      expect(server.received.some((message) => message.includes("sendOperation("))).toBe(false);
    } finally {
      await server.close();
    }
  });

  test("classifies invalid-target diplomatic agenda notices as informational closeouts", async () => {
    const { payload, server } = await runNotificationHud("diplomatic-report");
    try {
      expect(payload.view.hud.nextDecision).toMatchObject({
        category: "informational-notification",
        operationFamily: "app-ui-action",
        operationType: "Game.Notifications.dismiss",
        notes: expect.arrayContaining([
          expect.stringContaining("do not send RESPOND_DIPLOMATIC_ACTION"),
        ]),
      });
      expect(payload.view.hud.nextDecision).not.toHaveProperty("cli");
      expect(server.received.some((message) => message.includes("sendOperation("))).toBe(false);
    } finally {
      await server.close();
    }
  });

  test("classifies valid diplomatic action reports without response options as reviewed closeouts", async () => {
    const { payload, server } = await runNotificationHud("diplomatic-action-report");
    try {
      const notification = payload.view.notifications[0];
      expect(notification.target).toEqual({ owner: 2, id: 34, type: 34 });
      expect(notification.details).toMatchObject({
        kind: "diplomatic-action-report",
        classification: "diplomatic-action-report-no-enabled-response-options",
        actionId: 34,
        responseOptionCount: 0,
        enabledResponseOptionCount: 0,
      });
      expect(payload.view.hud.nextDecision).toMatchObject({
        category: "informational-notification",
        operationFamily: "app-ui-action",
        operationType: "Game.Notifications.dismiss",
        notes: expect.arrayContaining([
          expect.stringContaining("real diplomatic event id"),
          expect.stringContaining("reviewed report closeout"),
        ]),
      });
      expect(payload.view.hud.nextDecision).not.toHaveProperty("cli");
      expect(server.received.some((message) => message.includes("sendOperation("))).toBe(false);
    } finally {
      await server.close();
    }
  });
});

async function runNotificationHud(mode: NotificationHudMode = "default") {
  const server = await startNotificationHudTunerServer(mode);
  const writes: string[] = [];
  const log = vi
    .spyOn(GamePlayNotifications.prototype, "log")
    .mockImplementation((message?: string) => {
      if (message) writes.push(message);
    });
  try {
    const { port } = server.address();
    await GamePlayNotifications.run(["--host", "127.0.0.1", "--port", String(port), "--json"]);
  } finally {
    log.mockRestore();
  }

  const payload = JSON.parse(writes.join("")) as NotificationHudCommandPayload;
  expectNormalPlayPayloadToOmitDebugInternals(payload);
  expect(JSON.stringify(payload.view)).not.toContain('"cli"');
  expect(JSON.stringify(payload.view)).not.toContain("game play ");

  return {
    payload,
    server,
  };
}

async function runNotificationHudText(mode: NotificationHudMode = "default") {
  const server = await startNotificationHudTunerServer(mode);
  const writes: string[] = [];
  const log = vi
    .spyOn(GamePlayNotifications.prototype, "log")
    .mockImplementation((message?: string) => {
      if (message) writes.push(message);
    });
  try {
    const { port } = server.address();
    await GamePlayNotifications.run(["--host", "127.0.0.1", "--port", String(port)]);
  } finally {
    log.mockRestore();
  }

  return {
    writes,
    server,
  };
}

async function startNotificationHudTunerServer(
  mode: NotificationHudMode
): Promise<FakeTunerServer> {
  return startFakeTunerServer({
    handle({ message }) {
      if (message.includes("readPlayNotifications")) {
        return [JSON.stringify(notificationHudView(mode))];
      }
      return undefined;
    },
  });
}

function notificationHudView(mode: NotificationHudMode) {
  switch (mode) {
    case "stale-diplomacy":
      return staleDiplomacyHudView();
    case "tech-choice":
      return techChoiceHudView();
    case "culture-choice":
      return cultureChoiceHudView();
    case "celebration-choice":
      return celebrationChoiceHudView();
    case "government-choice":
      return governmentChoiceHudView();
    case "narrative-choice":
      return narrativeChoiceHudView();
    case "stale-unit-command":
      return staleUnitCommandHudView();
    case "diplomatic-report":
      return diplomaticReportHudView();
    case "diplomatic-action-report":
      return diplomaticActionReportHudView();
    default:
      return defaultHudView();
  }
}

function defaultHudView() {
  return {
    localPlayerId: 0,
    turn: { ok: true as const, value: 80 },
    turnDate: { ok: true as const, value: "2025 BCE" },
    hasSentTurnComplete: { ok: true as const, value: false },
    canEndTurn: { ok: true as const, value: false },
    blocker: { ok: true as const, value: -2026570723 },
    blockingNotificationId: { ok: true as const, value: { owner: 0, id: 42, type: 20 } },
    selectedUnitId: { ok: true as const, value: null },
    selectedCityId: { ok: true as const, value: { owner: 0, id: 131073, type: 1 } },
    firstReadyUnitId: { ok: true as const, value: null },
    notifications: [
      {
        id: { owner: 0, id: 42, type: 20 },
        typeName: "NOTIFICATION_CHOOSE_TOWN_PROJECT",
        summary: "Choose Town Project",
        message: "Choose a town focus project",
        target: { owner: 0, id: 131073, type: 1 },
        location: null,
        isEndTurnBlocking: true,
        decision: notificationDecision({
          category: "town-focus",
          operationFamily: "city-command",
          operationType: "CHANGE_GROWTH_MODE",
          cli: "game play set-town-focus",
          notes: ["Town focus is a read-only default fixture for non-HUD extraction coverage."],
        }),
      },
    ],
    decisions: [],
    hud: {
      nextDecision: null,
      decisionQueue: [],
    },
    limits: { maxNotifications: 25, truncated: false },
  };
}

function staleDiplomacyHudView() {
  const notificationId = { owner: 0, id: 19, type: 20 };
  const details = {
    kind: "diplomacy-response-options",
    actionId: 8,
    options: [
      { responseType: -1907089594, title: "Support", enabled: false, disabled: true, cli: null },
      {
        responseType: 926305338,
        title: "Accept",
        enabled: true,
        disabled: false,
        cli: 'game play respond-diplomacy --action-id 8 --response-type 926305338 --notification-id \'{"owner":0,"id":19,"type":20}\' --send',
      },
      {
        responseType: -1200641623,
        title: "Reject",
        enabled: true,
        disabled: false,
        cli: 'game play respond-diplomacy --action-id 8 --response-type -1200641623 --notification-id \'{"owner":0,"id":19,"type":20}\' --send',
      },
    ],
    enabledOptions: [
      {
        responseType: 926305338,
        title: "Accept",
        cli: 'game play respond-diplomacy --action-id 8 --response-type 926305338 --notification-id \'{"owner":0,"id":19,"type":20}\' --send',
      },
      {
        responseType: -1200641623,
        title: "Reject",
        cli: 'game play respond-diplomacy --action-id 8 --response-type -1200641623 --notification-id \'{"owner":0,"id":19,"type":20}\' --send',
      },
    ],
    disabledOptions: [{ responseType: -1907089594, title: "Support", cli: null }],
  };
  return singleNotificationHudView({
    turn: 8,
    turnDate: "3825 BCE",
    blocker: 0,
    notification: {
      id: notificationId,
      typeName: "NOTIFICATION_DIPLOMATIC_RESPONSE_REQUIRED",
      summary: "Trung Trac has started a Diplomatic Action with you.",
      message: "Respond to Diplomatic Action",
      target: { owner: 2, id: 8, type: 34 },
      location: { x: -9999, y: -9999 },
      isEndTurnBlocking: true,
      decision: notificationDecision({
        category: "diplomacy-response",
        operationFamily: "player-operation",
        operationType: "RESPOND_DIPLOMATIC_ACTION",
        cli: "game play respond-diplomacy",
      }),
      details,
    },
  });
}

function techChoiceHudView() {
  const notificationId = { owner: 0, id: 52, type: 20 };
  const details = {
    kind: "technology-choice-options",
    enabledOptions: [
      {
        nodeType: -1255676052,
        name: "Masonry",
        cli: "game play choose-tech --node -1255676052 --send",
        chooseValidation: { ok: true as const, value: { Success: true } },
      },
      {
        nodeType: -1558948215,
        name: "Sailing",
        cli: "game play choose-tech --node -1558948215 --send",
        chooseValidation: { ok: true as const, value: { Success: true } },
      },
    ],
    disabledOptions: [{ nodeType: 510800721, name: "Agriculture", cli: null }],
  };
  return singleNotificationHudView({
    turn: 19,
    turnDate: "3550 BCE",
    blocker: -1255676052,
    notification: {
      id: notificationId,
      typeName: "NOTIFICATION_CHOOSE_TECH",
      summary: "Choose a Technology",
      message: "Choose a new Technology to begin studying.",
      target: { owner: -1, id: -1, type: 0 },
      location: null,
      isEndTurnBlocking: true,
      decision: notificationDecision({
        category: "technology-choice",
        operationFamily: "player-operation",
        operationType: "SET_TECH_TREE_NODE",
        cli: "game play choose-tech",
      }),
      details,
    },
  });
}

function cultureChoiceHudView() {
  const notificationId = { owner: 0, id: 62, type: 20 };
  const details = {
    kind: "culture-choice-options",
    availableNodeTypes: { ok: true as const, value: [-869902342, -1404789184, 1643868894] },
    enabledOptions: [
      {
        nodeType: -869902342,
        name: "Ekklesia",
        cli: "game play choose-culture --node -869902342 --send",
        chooseValidation: { ok: true as const, value: { Success: true } },
      },
      {
        nodeType: -1404789184,
        name: "Discipline",
        cli: "game play choose-culture --node -1404789184 --send",
        chooseValidation: { ok: true as const, value: { Success: true } },
      },
    ],
    disabledOptions: [{ nodeType: 1643868894, name: "Mysticism", cli: null }],
  };
  return singleNotificationHudView({
    turn: 19,
    turnDate: "3550 BCE",
    blocker: -869902342,
    notification: {
      id: notificationId,
      typeName: "NOTIFICATION_CHOOSE_CULTURE_NODE",
      summary: "Choose a Civic",
      message: "Choose a new Civic to begin studying.",
      target: { owner: -1, id: -1, type: 0 },
      location: null,
      isEndTurnBlocking: true,
      decision: notificationDecision({
        category: "culture-choice",
        operationFamily: "player-operation",
        operationType: "SET_CULTURE_TREE_NODE",
        cli: "game play choose-culture",
      }),
      details,
    },
  });
}

function celebrationChoiceHudView() {
  const notificationId = { owner: 0, id: 110, type: 20 };
  const details = {
    kind: "celebration-choice-options",
    goldenAgeDuration: { ok: true as const, value: 10 },
    choices: {
      ok: true as const,
      value: ["GOLDEN_AGE_CLASSICAL_REPUBLIC_1", "GOLDEN_AGE_CLASSICAL_REPUBLIC_2"],
    },
    enabledOptions: [
      {
        goldenAgeType: -340825966,
        name: "Cultural Celebration",
        cli: "game play choose-celebration --golden-age-type -340825966 --send",
        validation: { ok: true as const, value: { Success: true } },
      },
      {
        goldenAgeType: 1923496232,
        name: "Wonder Production Celebration",
        cli: "game play choose-celebration --golden-age-type 1923496232 --send",
        validation: { ok: true as const, value: { Success: true } },
      },
    ],
    disabledOptions: [],
  };
  return singleNotificationHudView({
    turn: 29,
    turnDate: "3300 BCE",
    blocker: 1783715360,
    notification: {
      id: notificationId,
      typeName: "NOTIFICATION_CHOOSE_GOLDEN_AGE",
      summary: "Your people want to Celebrate this glorious time.",
      message: "Choose Celebration",
      target: { owner: -1, id: -1, type: 0 },
      location: null,
      isEndTurnBlocking: true,
      decision: notificationDecision({
        category: "celebration-choice",
        operationFamily: "player-operation",
        operationType: "CHOOSE_GOLDEN_AGE",
        cli: "game play choose-celebration",
      }),
      details,
    },
  });
}

function governmentChoiceHudView() {
  const notificationId = { owner: 0, id: 40, type: 20 };
  const details = {
    kind: "government-choice-options",
    action: -1326475004,
    startingGovernments: {
      ok: true as const,
      value: [{ GovernmentType: 0 }, { GovernmentType: 1 }, { GovernmentType: 2 }],
    },
    enabledOptions: [
      {
        governmentType: 0,
        name: "Classical Republic",
        cli: "game play choose-government --government-type 0 --action -1326475004 --send",
        validation: { ok: true as const, value: { Success: true } },
      },
      {
        governmentType: 1,
        name: "Despotism",
        cli: "game play choose-government --government-type 1 --action -1326475004 --send",
        validation: { ok: true as const, value: { Success: true } },
      },
      {
        governmentType: 2,
        name: "Oligarchy",
        cli: "game play choose-government --government-type 2 --action -1326475004 --send",
        validation: { ok: true as const, value: { Success: true } },
      },
    ],
    disabledOptions: [],
  };
  return singleNotificationHudView({
    turn: 10,
    turnDate: "3775 BCE",
    blocker: 0,
    notification: {
      id: notificationId,
      typeName: "NOTIFICATION_CHOOSE_GOVERNMENT",
      summary: "Choose a Government",
      message: "Choose a government.",
      target: { owner: -1, id: -1, type: 0 },
      location: null,
      isEndTurnBlocking: true,
      decision: notificationDecision({
        category: "government-choice",
        operationFamily: "player-operation",
        operationType: "CHANGE_GOVERNMENT",
        cli: "game play choose-government",
      }),
      details,
    },
  });
}

function narrativeChoiceHudView() {
  const notificationId = { owner: 0, id: 5, type: 20 };
  const details = {
    kind: "narrative-choice-options",
    targetStoryId: { ok: true as const, value: { owner: 0, id: 45, type: 35 } },
    storyLinks: { ok: true as const, value: [] },
    enabledOptions: [
      {
        targetType: "CLOSE",
        cli: 'game play choose-narrative --target-type CLOSE --target \'{"owner":0,"id":45,"type":35}\' --action -1326475004 --send',
        validation: { ok: true as const, value: { Success: true } },
      },
    ],
    disabledOptions: [],
  };
  return singleNotificationHudView({
    turn: 6,
    turnDate: "3875 BCE",
    blocker: -2084516792,
    notification: {
      id: notificationId,
      typeName: "NOTIFICATION_CHOOSE_DISCOVERY_STORY_DIRECTION",
      summary: "Choose a selection from the Discovery.",
      message: "Discovery Choice",
      target: { owner: -1, id: -1, type: 0 },
      location: { x: -9999, y: -9999 },
      isEndTurnBlocking: true,
      decision: notificationDecision({
        category: "narrative-choice",
        operationFamily: "player-operation",
        operationType: "CHOOSE_NARRATIVE_STORY_DIRECTION",
        cli: "game play choose-narrative",
      }),
      details,
    },
  });
}

function staleUnitCommandHudView() {
  const notificationId = { owner: 0, id: 88, type: 20 };
  const details = {
    kind: "unit-command-reconciliation",
    staleReadyPointerSuspected: true,
    enabledCloseoutCandidates: [
      {
        unitId: { owner: 0, id: 196609, type: 26 },
        operationType: "SKIP_TURN",
        cli: 'game play operation --family unit --type SKIP_TURN --unit-id \'{"owner":0,"id":196609,"type":26}\' --send',
      },
    ],
  };
  return singleNotificationHudView({
    turn: 80,
    turnDate: "2025 BCE",
    blocker: 0,
    notification: {
      id: notificationId,
      typeName: "NOTIFICATION_COMMAND_UNITS",
      summary: "Move a Unit or have it perform an operation.",
      message: "Command Units",
      target: { owner: -1, id: -1, type: 0 },
      location: { x: -9999, y: -9999 },
      isEndTurnBlocking: true,
      decision: notificationDecision({
        category: "unit-command",
        operationFamily: "unit-operation",
        operationType: "SKIP_TURN",
        cli: "game play operation --family unit",
      }),
      details,
    },
  });
}

function diplomaticReportHudView() {
  return singleNotificationHudView({
    turn: 133,
    turnDate: "960 BCE",
    blocker: 0,
    firstReadyUnitId: { owner: 0, id: 1572876, type: 26 },
    notification: {
      id: { owner: 0, id: 644, type: 20 },
      typeName: "NOTIFICATION_DIPLOMATIC_ACTION",
      summary: "The Agenda of Genghis Khan has changed your Relationship.",
      message: "The Agenda of Genghis Khan has changed your Relationship.",
      target: { owner: -1, id: -1, type: 0 },
      location: { x: 19, y: 26 },
      isEndTurnBlocking: true,
      decision: notificationDecision({
        category: "informational-notification",
        operationFamily: "app-ui-action",
        operationType: "Game.Notifications.dismiss",
        cli: "game play dismiss-notification",
        notes: [
          "Agenda and relationship reports can arrive as NOTIFICATION_DIPLOMATIC_ACTION with an invalid target; do not send RESPOND_DIPLOMATIC_ACTION without a valid action id.",
        ],
      }),
    },
  });
}

function diplomaticActionReportHudView() {
  const notificationId = { owner: 0, id: 118, type: 20 };
  const details = {
    kind: "diplomatic-action-report",
    classification: "diplomatic-action-report-no-enabled-response-options",
    actionId: 34,
    responseOptionCount: 0,
    enabledResponseOptionCount: 0,
  };
  return singleNotificationHudView({
    turn: 37,
    turnDate: "3100 BCE",
    blocker: 0,
    firstReadyUnitId: { owner: 0, id: 327682, type: 26 },
    notification: {
      id: notificationId,
      typeName: "NOTIFICATION_DIPLOMATIC_ACTION",
      summary: "Another Civilization settled a new Town nearby.",
      message: "New Settlement Nearby",
      target: { owner: 2, id: 34, type: 34 },
      location: { x: 3, y: 46 },
      isEndTurnBlocking: true,
      decision: notificationDecision({
        category: "informational-notification",
        operationFamily: "app-ui-action",
        operationType: "Game.Notifications.dismiss",
        cli: "game play dismiss-notification",
        notes: [
          "NOTIFICATION_DIPLOMATIC_ACTION can point at a real diplomatic event id, but empty/no-enabled getResponseDataForUI options make it a reviewed report closeout rather than RESPOND_DIPLOMATIC_ACTION.",
        ],
      }),
      details,
    },
  });
}

function singleNotificationHudView(input: {
  turn: number;
  turnDate: string;
  blocker: number;
  notification: {
    id: { owner: number; id: number; type: number };
    typeName: string;
    summary: string;
    message: string;
    target: { owner: number; id: number; type: number };
    location: unknown;
    isEndTurnBlocking: boolean;
    decision: ReturnType<typeof notificationDecision>;
    details?: unknown;
  };
  firstReadyUnitId?: { owner: number; id: number; type: number } | null;
}) {
  const queueItem = {
    notificationId: input.notification.id,
    isEndTurnBlocking: input.notification.isEndTurnBlocking,
    typeName: input.notification.typeName,
    summary: input.notification.summary,
    message: input.notification.message,
    target: input.notification.target,
    location: input.notification.location,
    details: input.notification.details,
    ...input.notification.decision,
  };
  return {
    localPlayerId: 0,
    turn: { ok: true as const, value: input.turn },
    turnDate: { ok: true as const, value: input.turnDate },
    hasSentTurnComplete: { ok: true as const, value: false },
    canEndTurn: { ok: true as const, value: false },
    blocker: { ok: true as const, value: input.blocker },
    blockingNotificationId: { ok: true as const, value: input.notification.id },
    selectedUnitId: { ok: true as const, value: null },
    selectedCityId: { ok: true as const, value: null },
    firstReadyUnitId: { ok: true as const, value: input.firstReadyUnitId ?? null },
    notifications: [
      {
        id: input.notification.id,
        typeName: input.notification.typeName,
        summary: input.notification.summary,
        message: input.notification.message,
        target: input.notification.target,
        location: input.notification.location,
        isEndTurnBlocking: input.notification.isEndTurnBlocking,
        decision: input.notification.decision,
        details: input.notification.details,
      },
    ],
    decisions: [input.notification.decision],
    hud: {
      nextDecision: queueItem,
      decisionQueue: [queueItem],
    },
    limits: { maxNotifications: 25, truncated: false },
  };
}

function notificationDecision(input: {
  category: string;
  operationFamily: string;
  operationType: string;
  cli: string;
  notes?: string[];
}) {
  return {
    category: input.category,
    operationFamily: input.operationFamily,
    operationType: input.operationType,
    argsShape: "{}",
    cli: input.cli,
    requiredInputs: [],
    commonActions: [],
    confidence: "test-only",
    notes: input.notes ?? [],
  };
}
