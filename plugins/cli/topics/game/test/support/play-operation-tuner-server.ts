import { startFakeTunerServer } from "./tuner-socket-server";

/** Starts the admitted Civ7 control scenario shared by live-play operation command tests. */
export async function startPlayOperationTunerServer() {
  return startFakeTunerServer({
    handle({ message }) {
      if (message.includes("Network.isInSession")) {
        return [JSON.stringify(appUiSnapshot())];
      }
      if (message.includes("evalOk") && message.includes("GameplayMap.getGridWidth")) {
        return [JSON.stringify(tunerHealthSnapshot())];
      }
      if (message.includes("GameContext.localPlayerID") && message.includes("decisionQueue")) {
        return [JSON.stringify(playNotificationView())];
      }
      if (message.includes("return JSON.stringify(validateOperation")) {
        return [JSON.stringify(operationValidation(message))];
      }
      if (message.includes("return JSON.stringify(sendOperation")) {
        return [JSON.stringify(operationSend(message))];
      }
      return undefined;
    },
  });
}

function playNotificationView() {
  return {
    host: "127.0.0.1",
    port: 0,
    state: { id: "65535", name: "App UI" },
    localPlayerId: 0,
    turn: { ok: true, value: 1 },
    turnDate: { ok: true, value: "4000 BCE" },
    loadingStateName: null,
    blocker: { ok: true, value: 0 },
    blockingNotificationId: { ok: true, value: { owner: 0, id: 12345, type: 99 } },
    selectedUnitId: { ok: true, value: null },
    selectedCityId: { ok: true, value: null },
    firstReadyUnitId: { ok: true, value: null },
    nextDecision: null,
    hud: {
      decisionQueue: [],
      currentBlocker: null,
      advisories: [],
      units: [],
      cities: [],
      localPlayer: { ok: true, value: 0 },
      selectedUnit: { ok: true, value: null },
      selectedCity: { ok: true, value: null },
      firstReadyUnit: { ok: true, value: null },
    },
    limits: {
      maxNotifications: 25,
      truncated: false,
    },
    notes: [],
  };
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
      turn: 1,
      age: 0,
      maxTurns: 0,
      turnDate: { ok: true, value: "4000 BCE" },
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
    turn: { ok: true, value: 1 },
    turnDate: { ok: true, value: "4000 BCE" },
    width: { ok: true, value: 84 },
    height: { ok: true, value: 54 },
    aliveIds: { ok: true, value: [0] },
    aliveHumanIds: { ok: true, value: [0] },
    autoplayActive: { ok: true, value: false },
  };
}

function operationSend(message: string) {
  const family = operationFamily(message);
  return family === "unit-operation" || family === "unit-command"
    ? {
        sent: true,
        beforePostcondition: unitOperationPostconditionSnapshot({ owner: 0, id: 65536, type: 26 }),
        afterPostcondition: unitOperationPostconditionSnapshot({ owner: 0, id: 131072, type: 26 }),
      }
    : { sent: true };
}

function operationValidation(message: string) {
  const family = operationFamily(message);
  const operationType = operationTypeFromMessage(message);
  return {
    host: "127.0.0.1",
    port: 0,
    state: { id: "1", name: "Tuner", role: "tuner" },
    family,
    operationType,
    enumValue: operationType,
    target: operationTarget(family),
    args: operationArgs(operationType),
    valid: true,
    result: { Success: true },
  };
}

function operationFamily(message: string) {
  if (
    message.includes('validateOperation("unit-command"') ||
    message.includes('sendOperation("unit-command"')
  ) {
    return "unit-command";
  }
  if (
    message.includes('validateOperation("player-operation"') ||
    message.includes('sendOperation("player-operation"')
  ) {
    return "player-operation";
  }
  return "unit-operation";
}

function operationTypeFromMessage(message: string) {
  const validateIndex = message.lastIndexOf('validateOperation("');
  const sendIndex = message.lastIndexOf('sendOperation("');
  const callIndex = Math.max(validateIndex, sendIndex);
  const callSource = callIndex >= 0 ? message.slice(callIndex) : message;
  return callSource.match(/"operationType":"([^"]+)"/)?.[1] ?? "SKIP_TURN";
}

function operationTarget(family: string) {
  if (family === "player-operation") return { playerId: 0 };
  return { unitId: { owner: 0, id: 65536, type: 26 } };
}

function operationArgs(operationType: string) {
  if (operationType === "VIEWED_ADVISOR_WARNING")
    return { Target: { owner: 0, id: 12345, type: 99 } };
  if (operationType === "UNITCOMMAND_RESETTLE") return { X: 17, Y: 25 };
  if (operationType === "UNITCOMMAND_UPGRADE") return {};
  return undefined;
}

function unitOperationPostconditionSnapshot(firstReadyUnitId: {
  owner: number;
  id: number;
  type: number;
}) {
  return {
    unit: {
      ok: true,
      value: {
        id: { owner: 0, id: 65536, type: 26 },
        location: { x: 22, y: 33 },
        movement: 2,
        activity: "UNIT_ACTIVITY_AWAKE",
        damage: 0,
        attacks: 1,
      },
    },
    selectedUnitId: { ok: true, value: { owner: 0, id: 65536, type: 26 } },
    firstReadyUnitId: { ok: true, value: firstReadyUnitId },
    blocker: { ok: true, value: 0 },
  };
}
