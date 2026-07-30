import { describe, expect, test } from "vitest";

import {
  type Civ7GameUiRuntimeTarget,
  createCiv7GameUiControllerContextFactory,
} from "../../src/controller/game-ui";
import {
  checkCiv7GameUiAttributePurchase,
  checkCiv7GameUiAttributeReview,
  observeCiv7GameUiAttributeNode,
  sendCiv7GameUiAttributePurchase,
  sendCiv7GameUiAttributeReview,
} from "../../src/controller/game-ui/progression/attribute";
import type { Civ7GameUiProgressionTarget } from "../../src/controller/game-ui/progression/shared";
import {
  checkCiv7GameUiTraditionChange,
  checkCiv7GameUiTraditionReview,
  observeCiv7GameUiTraditionAssignments,
  sendCiv7GameUiTraditionChange,
  sendCiv7GameUiTraditionReview,
} from "../../src/controller/game-ui/progression/tradition";
import {
  checkCiv7GameUiProgressionTreeChoice,
  checkCiv7GameUiProgressionTreeTarget,
  clearCiv7GameUiProgressionTreeTarget,
  sendCiv7GameUiProgressionTreeChoice,
} from "../../src/controller/game-ui/progression/tree";

const techNode = 18_001;
const cultureNode = 27_001;
const attributeNode = 20;
const traditionType = -331_546_976;

describe("game UI progression atoms", () => {
  test("advertises exact checks and sends and projects them through the facade", async () => {
    const runtime = progressionRuntime();
    const target = {
      ...runtime.target,
      UI: { isInGame: () => true },
      Players: {
        ...runtime.target.Players,
        getAliveHumanIds: () => [0],
      },
    } as Civ7GameUiRuntimeTarget;
    const context = await createCiv7GameUiControllerContextFactory({ target })();

    expect(context.controller.supportedReadProcedures).toEqual(
      expect.arrayContaining([
        "progression.technology.choice.check",
        "progression.culture.choice.check",
        "progression.technology.target.check",
        "progression.culture.target.check",
        "progression.attribute.purchase.check",
        "progression.attribute.review.check",
        "progression.tradition.change.check",
        "progression.tradition.review.check",
      ])
    );
    expect(context.controller.supportedMutationProcedures).toEqual(
      expect.arrayContaining([
        "progression.technology.choice.request",
        "progression.culture.choice.request",
        "progression.technology.target.request",
        "progression.culture.target.request",
        "progression.attribute.purchase.request",
        "progression.attribute.review.request",
        "progression.tradition.change.request",
        "progression.tradition.review.request",
      ])
    );
    await expect(
      context.directControl.checkCiv7ProgressionTreeChoice(
        { kind: "technology", node: techNode },
        {}
      )
    ).resolves.toMatchObject({
      valid: true,
      snapshot: { localPlayerId: 0, kind: "technology" },
    });
    await expect(
      context.directControl.observeCiv7AttributeNode({ node: attributeNode }, {})
    ).resolves.toMatchObject({
      localPlayerId: 0,
      node: attributeNode,
    });
    await expect(context.directControl.observeCiv7TraditionAssignments({})).resolves.toEqual({
      localPlayerId: 0,
      activeTraditions: [3, 11, 51, 71],
    });
  });

  test("checks and sends one tree operation without notification activation or sequencing", async () => {
    const runtime = progressionRuntime();
    const checked = await checkCiv7GameUiProgressionTreeChoice(
      { kind: "technology", node: techNode },
      runtime.target
    );

    const result = await sendCiv7GameUiProgressionTreeChoice(
      { kind: "technology", node: techNode, expected: checked.snapshot },
      runtime.target
    );

    expect(result).toMatchObject({
      sent: true,
      validation: { valid: true, result: { Success: true } },
      before: {
        localPlayerId: 0,
        kind: "technology",
        currentNode: 17_000,
        targetNode: 18_000,
        noNode: -1,
      },
      after: {
        currentNode: techNode,
        targetNode: 18_000,
      },
    });
    expect(runtime.calls).toEqual([
      {
        kind: "check",
        operationType: "SET_TECH_TREE_NODE",
        args: { ProgressionTreeNodeType: techNode },
      },
      {
        kind: "check",
        operationType: "SET_TECH_TREE_NODE",
        args: { ProgressionTreeNodeType: techNode },
      },
      {
        kind: "send",
        operationType: "SET_TECH_TREE_NODE",
        args: { ProgressionTreeNodeType: techNode },
      },
    ]);
  });

  test("preserves Civ7 receivers while reading and validating progression state", async () => {
    const runtime = progressionRuntime();
    const basePlayers = runtime.target.Players!;
    const baseNotifications = runtime.target.Game!.Notifications!;
    const baseTrees = runtime.target.Game!.ProgressionTrees!;
    const baseOperations = runtime.target.Game!.PlayerOperations!;
    const players = {
      receiver: "players",
      get(this: { receiver: string }, playerId: number) {
        expect(this.receiver).toBe("players");
        return basePlayers.get!(playerId);
      },
    };
    const notifications = {
      receiver: "notifications",
      getEndTurnBlockingType(this: { receiver: string }, playerId: number) {
        expect(this.receiver).toBe("notifications");
        return baseNotifications.getEndTurnBlockingType!(playerId);
      },
      findEndTurnBlocking: baseNotifications.findEndTurnBlocking,
    };
    const trees = {
      receiver: "progression-trees",
      getTree(this: { receiver: string }, playerId: number, treeId: unknown) {
        expect(this.receiver).toBe("progression-trees");
        return baseTrees.getTree!(playerId, treeId);
      },
      getNode: baseTrees.getNode,
      getNodeState: baseTrees.getNodeState,
    };
    const operations = {
      receiver: "player-operations",
      canStart(
        this: { receiver: string },
        playerId: number,
        operationType: unknown,
        args: Readonly<Record<string, number>>,
        queue?: boolean
      ) {
        expect(this.receiver).toBe("player-operations");
        return baseOperations.canStart!(playerId, operationType, args, queue);
      },
      sendRequest: baseOperations.sendRequest,
    };
    const target: Civ7GameUiProgressionTarget = {
      ...runtime.target,
      Players: players,
      Game: {
        ...runtime.target.Game,
        Notifications: notifications,
        ProgressionTrees: trees,
        PlayerOperations: operations,
      },
    };

    await expect(
      checkCiv7GameUiProgressionTreeChoice({ kind: "culture", node: cultureNode }, target)
    ).resolves.toMatchObject({
      valid: true,
      snapshot: { kind: "culture", currentNode: 26_000 },
    });
  });

  test("clears a target with runtime NO_NODE and no validator call", async () => {
    const runtime = progressionRuntime();
    const checked = await checkCiv7GameUiProgressionTreeTarget(
      { kind: "culture", node: cultureNode },
      runtime.target
    );
    runtime.calls.length = 0;

    const result = await clearCiv7GameUiProgressionTreeTarget(
      { kind: "culture", expected: checked.snapshot },
      runtime.target
    );

    expect(result).toMatchObject({
      sent: true,
      before: { kind: "culture", targetNode: cultureNode, noNode: -1 },
      after: { kind: "culture", targetNode: -1, noNode: -1 },
    });
    expect(runtime.calls).toEqual([
      {
        kind: "send",
        operationType: "SET_CULTURE_TREE_TARGET_NODE",
        args: { ProgressionTreeNodeType: -1 },
      },
    ]);
  });

  test("projects attribute purchase and review as independent exact atoms", async () => {
    const runtime = progressionRuntime();
    const observed = await observeCiv7GameUiAttributeNode({ node: attributeNode }, runtime.target);
    expect(observed).toEqual({
      localPlayerId: 0,
      node: attributeNode,
      nodeState: 1,
      depthUnlocked: 2,
      repeatedDepth: 0,
      attributeType: "ATTRIBUTE_CULTURAL",
      availablePoints: 3,
      wildcardPoints: 1,
    });

    const checked = await checkCiv7GameUiAttributePurchase({ node: attributeNode }, runtime.target);
    await expect(
      sendCiv7GameUiAttributePurchase(
        { node: attributeNode, expected: checked.snapshot },
        runtime.target
      )
    ).resolves.toMatchObject({
      sent: true,
      before: { nodeState: 1 },
      after: { nodeState: 2 },
    });

    const review = await checkCiv7GameUiAttributeReview({}, runtime.target);
    await expect(
      sendCiv7GameUiAttributeReview({ expected: review.snapshot }, runtime.target)
    ).resolves.toMatchObject({
      sent: true,
      before: { localPlayerId: 0 },
    });
    expect(runtime.calls.filter((call) => call.kind === "send")).toEqual([
      {
        kind: "send",
        operationType: "BUY_ATTRIBUTE_TREE_NODE",
        args: { ProgressionTreeNodeType: attributeNode },
      },
      {
        kind: "send",
        operationType: "CONSIDER_ASSIGN_ATTRIBUTE",
        args: {},
      },
    ]);
  });

  test("adapts tradition action names only at the native operation boundary", async () => {
    const runtime = progressionRuntime();
    await expect(observeCiv7GameUiTraditionAssignments(runtime.target)).resolves.toEqual({
      localPlayerId: 0,
      activeTraditions: [3, 11, 51, 71],
    });
    const checked = await checkCiv7GameUiTraditionChange(
      { traditionType, action: "activate" },
      runtime.target
    );
    await expect(
      sendCiv7GameUiTraditionChange(
        {
          traditionType,
          action: "activate",
          expected: checked.snapshot,
        },
        runtime.target
      )
    ).resolves.toMatchObject({
      sent: true,
      before: { activeTraditions: [3, 11, 51, 71] },
      after: { activeTraditions: [traditionType, 3, 11, 51, 71] },
    });

    const review = await checkCiv7GameUiTraditionReview({}, runtime.target);
    await expect(
      sendCiv7GameUiTraditionReview({ expected: review.snapshot }, runtime.target)
    ).resolves.toMatchObject({ sent: true });
    expect(runtime.calls.filter((call) => call.kind === "send")).toEqual([
      {
        kind: "send",
        operationType: "CHANGE_TRADITION",
        args: { TraditionType: traditionType, Action: 7 },
      },
      {
        kind: "send",
        operationType: "CONSIDER_ASSIGN_TRADITIONS",
        args: {},
      },
    ]);
  });

  test("fails closed when a required culture slot has no runtime identity", async () => {
    const runtime = progressionRuntime();
    const target = {
      ...runtime.target,
      CultureSlotTypes: {
        POLICY_CULTURE_SLOT: null,
        TRADITION_CULTURE_SLOT: null,
        CRISIS_CULTURE_SLOT: null,
      },
    };

    await expect(observeCiv7GameUiTraditionAssignments(target)).rejects.toThrow(
      "The Civ7 policy, tradition, and crisis culture-slot types are unavailable."
    );
  });

  test("preserves ambiguous dispatch certainty and refuses stale admission evidence", async () => {
    const runtime = progressionRuntime({ throwAfterSend: true });
    const checked = await checkCiv7GameUiProgressionTreeChoice(
      { kind: "technology", node: techNode },
      runtime.target
    );
    await expect(
      sendCiv7GameUiProgressionTreeChoice(
        { kind: "technology", node: techNode, expected: checked.snapshot },
        runtime.target
      )
    ).rejects.toMatchObject({
      name: "Civ7DirectControlError",
      dispatchStatus: "dispatched",
    });

    const stale = progressionRuntime();
    const attribute = await checkCiv7GameUiAttributePurchase({ node: attributeNode }, stale.target);
    stale.setAttributeState(9);
    await expect(
      sendCiv7GameUiAttributePurchase(
        { node: attributeNode, expected: attribute.snapshot },
        stale.target
      )
    ).rejects.toMatchObject({
      name: "Civ7DirectControlError",
      dispatchStatus: "not-dispatched",
    });
    expect(stale.calls.filter((call) => call.kind === "send")).toEqual([]);
  });
});

type NativeCall = Readonly<{
  kind: "check" | "send";
  operationType: string;
  args: Readonly<Record<string, number>>;
}>;

function progressionRuntime(options: Readonly<{ throwAfterSend?: boolean }> = {}): Readonly<{
  target: Civ7GameUiProgressionTarget;
  calls: NativeCall[];
  setAttributeState: (value: number) => void;
}> {
  const calls: NativeCall[] = [];
  let techCurrent = 17_000;
  let techTarget = 18_000;
  let cultureTarget = cultureNode;
  let attributeState = 1;
  let activeTraditions = [11, 3];
  const operationTypes = {
    SET_TECH_TREE_NODE: "SET_TECH_TREE_NODE",
    SET_TECH_TREE_TARGET_NODE: "SET_TECH_TREE_TARGET_NODE",
    SET_CULTURE_TREE_NODE: "SET_CULTURE_TREE_NODE",
    SET_CULTURE_TREE_TARGET_NODE: "SET_CULTURE_TREE_TARGET_NODE",
    BUY_ATTRIBUTE_TREE_NODE: "BUY_ATTRIBUTE_TREE_NODE",
    CONSIDER_ASSIGN_ATTRIBUTE: "CONSIDER_ASSIGN_ATTRIBUTE",
    CHANGE_TRADITION: "CHANGE_TRADITION",
    CONSIDER_ASSIGN_TRADITIONS: "CONSIDER_ASSIGN_TRADITIONS",
  } as const;

  const target: Civ7GameUiProgressionTarget = {
    GameContext: { localPlayerID: 0 },
    CultureSlotTypes: {
      POLICY_CULTURE_SLOT: 801,
      TRADITION_CULTURE_SLOT: 802,
      CRISIS_CULTURE_SLOT: 803,
    },
    ProgressionTreeNodeTypes: { NO_NODE: -1 },
    PlayerOperationParameters: { Activate: 7, Deactivate: 8 },
    PlayerOperationTypes: operationTypes,
    GameInfo: {
      ProgressionTreeNodes: {
        lookup: () => ({ ProgressionTree: "TREE_ATTRIBUTE_CULTURAL" }),
      },
      Attributes: [
        {
          ProgressionTreeType: "TREE_ATTRIBUTE_CULTURAL",
          AttributeType: "ATTRIBUTE_CULTURAL",
        },
      ],
    },
    Players: {
      get: (playerId) =>
        playerId === 0
          ? {
              Techs: {
                getResearching: () => techCurrent,
                getTargetNode: () => techTarget,
              },
              Culture: {
                getActiveTree: () => 1,
                getTargetNode: () => cultureTarget,
                getActiveTraditions: (slotType: unknown) =>
                  slotType === 801
                    ? [51]
                    : slotType === 802
                      ? activeTraditions
                      : slotType === 803
                        ? [71]
                        : [],
              },
              Identity: {
                getAvailableAttributePoints: () => 3,
                getWildcardPoints: () => 1,
              },
            }
          : null,
    },
    Game: {
      Notifications: {
        getEndTurnBlockingType: () => 0,
        findEndTurnBlocking: () => null,
      },
      ProgressionTrees: {
        getTree: () => ({
          activeNodeIndex: 0,
          nodes: [{ nodeType: 26_000 }],
        }),
        getNodeState: () => attributeState,
        getNode: () => ({
          nodeType: attributeNode,
          depthUnlocked: 2,
          repeatedDepth: 0,
        }),
      },
      PlayerOperations: {
        canStart: (_playerId, operationType, args) => {
          calls.push({
            kind: "check",
            operationType: String(operationType),
            args,
          });
          return { Success: true };
        },
        sendRequest: (_playerId, operationType, args) => {
          const name = String(operationType);
          calls.push({ kind: "send", operationType: name, args });
          if (name === operationTypes.SET_TECH_TREE_NODE) {
            techCurrent = args.ProgressionTreeNodeType!;
          } else if (name === operationTypes.SET_TECH_TREE_TARGET_NODE) {
            techTarget = args.ProgressionTreeNodeType!;
          } else if (name === operationTypes.SET_CULTURE_TREE_TARGET_NODE) {
            cultureTarget = args.ProgressionTreeNodeType!;
          } else if (name === operationTypes.BUY_ATTRIBUTE_TREE_NODE) {
            attributeState += 1;
          } else if (
            name === operationTypes.CHANGE_TRADITION &&
            args.Action === 7 &&
            !activeTraditions.includes(args.TraditionType!)
          ) {
            activeTraditions = [...activeTraditions, args.TraditionType!];
          }
          if (options.throwAfterSend === true) {
            throw new Error("Native send outcome is unknown.");
          }
          return true;
        },
      },
    },
  };

  return {
    target,
    calls,
    setAttributeState: (value) => {
      attributeState = value;
    },
  };
}
