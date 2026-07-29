import { vi } from "vitest";
import { type FakeTunerServer, startFakeTunerServer } from "./tuner-socket-server";

const progressionAtoms = [
  "checkTreeChoice",
  "sendTreeChoiceEnvelope",
  "checkTreeTarget",
  "sendTreeTargetEnvelope",
  "clearTreeTargetEnvelope",
  "observeAttributeNode",
  "checkAttributeNodePurchase",
  "sendAttributeNodePurchaseEnvelope",
  "checkAttributeReview",
  "sendAttributeReviewEnvelope",
  "observeTraditionAssignment",
  "checkTraditionAssignmentChange",
  "sendTraditionAssignmentChangeEnvelope",
  "checkTraditionAssignmentReview",
  "sendTraditionAssignmentReviewEnvelope",
] as const;

type ProgressionAtom = (typeof progressionAtoms)[number];

export type ProgressionAtomInvocation = Readonly<{
  atom: ProgressionAtom;
  input: Readonly<Record<string, unknown>>;
  message: string;
}>;

type ProgressionCommand = {
  run(args: string[]): Promise<unknown>;
  prototype: { log(message?: string): void };
};

/** Runs one progression command against the fake tuner and returns its JSON result payload. */
export async function runProgressionCommand<Result>(
  command: ProgressionCommand,
  server: FakeTunerServer,
  args: string[]
): Promise<Result> {
  const writes: string[] = [];
  const log = vi.spyOn(command.prototype, "log").mockImplementation((message?: string) => {
    if (message) writes.push(message);
  });
  try {
    await command.run([
      "--host",
      "127.0.0.1",
      "--port",
      String(server.address().port),
      ...args,
      "--json",
    ]);
    const payload = JSON.parse(writes.join("")) as { ok: true; result: Result };
    return payload.result;
  } finally {
    log.mockRestore();
  }
}

/**
 * Starts a stateful fake App UI/Tuner pair for progression command integration tests.
 * Responses model only the direct-control atom boundary; the control service still owns
 * admission, sequencing, postconditions, and review closeout.
 */
export async function startProgressionTunerServer(): Promise<FakeTunerServer> {
  const state = {
    technology: { currentNode: null as number | null, targetNode: 31 },
    culture: { currentNode: null as number | null, targetNode: 32 },
    attributeDepth: 1,
    attributePoints: 2,
    attributeReviewOpen: true,
    activeTraditions: [61],
    traditionReviewOpen: true,
  };

  return startFakeTunerServer({
    handle({ message }) {
      if (message.includes("Network.isInSession")) {
        return [JSON.stringify(appUiSnapshot())];
      }
      if (message.includes("evalOk") && message.includes("GameplayMap.getGridWidth")) {
        return [JSON.stringify(tunerHealthSnapshot())];
      }

      const invocation = progressionInvocationFromMessage(message);
      if (!invocation) return undefined;
      const { atom, input } = invocation;

      switch (atom) {
        case "checkTreeChoice":
        case "checkTreeTarget":
          return [JSON.stringify(validCheck(treeSnapshot(input, state)))];
        case "sendTreeChoiceEnvelope": {
          const before = treeSnapshot(input, state);
          treeState(input, state).currentNode = integerInput(input, "node");
          return [JSON.stringify(sentEnvelope(before, treeSnapshot(input, state)))];
        }
        case "sendTreeTargetEnvelope": {
          const before = treeSnapshot(input, state);
          treeState(input, state).targetNode = integerInput(input, "node");
          return [JSON.stringify(sentEnvelope(before, treeSnapshot(input, state)))];
        }
        case "clearTreeTargetEnvelope": {
          const before = treeSnapshot(input, state);
          treeState(input, state).targetNode = 777;
          return [
            JSON.stringify({
              ok: true,
              value: { sent: true, before, after: treeSnapshot(input, state) },
            }),
          ];
        }
        case "observeAttributeNode":
          return [JSON.stringify(attributeSnapshot(input, state))];
        case "checkAttributeNodePurchase":
          return [JSON.stringify(validCheck(attributeSnapshot(input, state)))];
        case "sendAttributeNodePurchaseEnvelope": {
          const before = attributeSnapshot(input, state);
          state.attributeDepth += 1;
          state.attributePoints -= 1;
          return [JSON.stringify(sentEnvelope(before, attributeSnapshot(input, state)))];
        }
        case "checkAttributeReview":
          return [
            JSON.stringify(
              reviewCheck(
                state.attributeReviewOpen,
                attributeReviewSnapshot(state.attributeReviewOpen)
              )
            ),
          ];
        case "sendAttributeReviewEnvelope": {
          const before = attributeReviewSnapshot(state.attributeReviewOpen);
          state.attributeReviewOpen = false;
          return [JSON.stringify(reviewSentEnvelope(before))];
        }
        case "observeTraditionAssignment":
          return [JSON.stringify(traditionSnapshot(state))];
        case "checkTraditionAssignmentChange":
          return [JSON.stringify(validCheck(traditionSnapshot(state)))];
        case "sendTraditionAssignmentChangeEnvelope": {
          const before = traditionSnapshot(state);
          const traditionType = integerInput(input, "traditionType");
          if (input.action === "activate" && !state.activeTraditions.includes(traditionType)) {
            state.activeTraditions.push(traditionType);
          }
          if (input.action === "deactivate") {
            state.activeTraditions = state.activeTraditions.filter(
              (active) => active !== traditionType
            );
          }
          state.activeTraditions.sort((left, right) => left - right);
          return [JSON.stringify(sentEnvelope(before, traditionSnapshot(state)))];
        }
        case "checkTraditionAssignmentReview":
          return [
            JSON.stringify(
              reviewCheck(
                state.traditionReviewOpen,
                traditionReviewSnapshot(state.traditionReviewOpen)
              )
            ),
          ];
        case "sendTraditionAssignmentReviewEnvelope": {
          const before = traditionReviewSnapshot(state.traditionReviewOpen);
          state.traditionReviewOpen = false;
          return [JSON.stringify(reviewSentEnvelope(before))];
        }
      }
    },
  });
}

export function progressionInvocations(server: FakeTunerServer): ProgressionAtomInvocation[] {
  return server.received.flatMap((message) => {
    const invocation = progressionInvocationFromMessage(message);
    return invocation ? [{ ...invocation, message }] : [];
  });
}

function progressionInvocationFromMessage(
  message: string
): Omit<ProgressionAtomInvocation, "message"> | null {
  for (const atom of progressionAtoms) {
    const marker = `return JSON.stringify(${atom}(`;
    const start = message.lastIndexOf(marker);
    if (start < 0) continue;
    const inputStart = start + marker.length;
    const inputEnd = message.indexOf("));", inputStart);
    if (inputEnd < 0) throw new Error(`Unable to parse ${atom} input from fake tuner request.`);
    const input = JSON.parse(message.slice(inputStart, inputEnd)) as unknown;
    if (!isRecord(input)) throw new Error(`${atom} input must be an object.`);
    return { atom, input };
  }
  return null;
}

type ProgressionState = {
  technology: { currentNode: number | null; targetNode: number };
  culture: { currentNode: number | null; targetNode: number };
  attributeDepth: number;
  attributePoints: number;
  attributeReviewOpen: boolean;
  activeTraditions: number[];
  traditionReviewOpen: boolean;
};

function treeSnapshot(input: Readonly<Record<string, unknown>>, state: ProgressionState) {
  const kind = input.kind;
  if (kind !== "technology" && kind !== "culture") throw new Error("tree kind is required");
  const tree = state[kind];
  return {
    localPlayerId: 0,
    kind,
    currentNode: tree.currentNode,
    targetNode: tree.targetNode,
    noNode: 777,
    blocker: { ok: true, value: null },
    blockingNotification: { ok: true, value: null },
  };
}

function treeState(input: Readonly<Record<string, unknown>>, state: ProgressionState) {
  const kind = input.kind;
  if (kind !== "technology" && kind !== "culture") throw new Error("tree kind is required");
  return state[kind];
}

function attributeSnapshot(input: Readonly<Record<string, unknown>>, state: ProgressionState) {
  return {
    localPlayerId: 0,
    node: integerInput(input, "node"),
    nodeState: 2,
    depthUnlocked: state.attributeDepth,
    repeatedDepth: 0,
    attributeType: "ATTRIBUTE_CULTURAL",
    availablePoints: state.attributePoints,
    wildcardPoints: 1,
  };
}

function attributeReviewSnapshot(open: boolean) {
  return reviewSnapshot(open ? "NOTIFICATION_ASSIGN_ATTRIBUTE" : "NOTIFICATION_UNIT_NEEDS_ORDERS");
}

function traditionSnapshot(state: ProgressionState) {
  return { localPlayerId: 0, activeTraditions: [...state.activeTraditions] };
}

function traditionReviewSnapshot(open: boolean) {
  return reviewSnapshot(open ? "NOTIFICATION_ASSIGN_TRADITION" : "NOTIFICATION_UNIT_NEEDS_ORDERS");
}

function reviewSnapshot(typeName: string) {
  return {
    localPlayerId: 0,
    blocker: { ok: true, value: 900 },
    blockingNotification: {
      ok: true,
      value: {
        id: { owner: 0, id: 90, type: 20 },
        type: 900,
        typeName,
        target: null,
      },
    },
  };
}

function validCheck(snapshot: object) {
  return { valid: true, result: { Success: true }, snapshot };
}

function reviewCheck(valid: boolean, snapshot: object) {
  return { valid, result: { Success: valid }, snapshot };
}

function sentEnvelope(before: object, after: object) {
  return {
    ok: true,
    value: {
      sent: true,
      validation: { valid: true, result: { Success: true } },
      before,
      after,
    },
  };
}

function reviewSentEnvelope(before: object) {
  return {
    ok: true,
    value: {
      sent: true,
      validation: { valid: true, result: { Success: true } },
      before,
    },
  };
}

function integerInput(input: Readonly<Record<string, unknown>>, key: string): number {
  const value = input[key];
  if (!Number.isInteger(value)) throw new Error(`${key} must be an integer`);
  return value as number;
}

function isRecord(value: unknown): value is Readonly<Record<string, unknown>> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
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
      turn: 42,
      age: 0,
      maxTurns: 0,
      turnDate: { ok: true, value: "3550 BCE" },
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
      activeInputContext: { ok: true, value: 1 },
      activeInputContextName: "World",
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
    turn: { ok: true, value: 42 },
    turnDate: { ok: true, value: "3550 BCE" },
    width: { ok: true, value: 84 },
    height: { ok: true, value: 54 },
    aliveIds: { ok: true, value: [0] },
    aliveHumanIds: { ok: true, value: [0] },
    autoplayActive: { ok: true, value: false },
  };
}
