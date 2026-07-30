import { call } from "@orpc/server";
import { describe, expect, test } from "vitest";

import {
  type Civ7ControlOrpcContext,
  Civ7ControlOrpcContract,
  Civ7ControlOrpcRouter,
} from "../../../../src";
import type {
  Civ7ControlOrpcAttributeNodeSnapshot,
  Civ7ControlOrpcCommandDispatchStatus,
  Civ7ControlOrpcPlayNotificationViewResult,
  Civ7ControlOrpcProgressionTreeCheckResult,
  Civ7ControlOrpcProgressionTreeSnapshot,
  Civ7ControlOrpcTraditionAssignmentsSnapshot,
} from "../../../../src/service/model/ports/direct-control";
import { directControlFacadeFixture } from "../../../support/direct-control-facade";
import { playableStatusResult } from "../../../support/playable-status";
import { standardSchemaAccepts } from "../../../support/standard-schema";

const endpointDefaults = { host: "127.0.0.1", port: 4318, timeoutMs: 1_000 };

describe("progression semantic mutation procedures", () => {
  test("publishes semantic check/request metadata and rejects runtime authority inputs", () => {
    const leaves = [
      Civ7ControlOrpcContract.progression.technology.choice.check,
      Civ7ControlOrpcContract.progression.technology.choice.request,
      Civ7ControlOrpcContract.progression.technology.target.check,
      Civ7ControlOrpcContract.progression.attribute.purchase.check,
      Civ7ControlOrpcContract.progression.attribute.purchase.request,
      Civ7ControlOrpcContract.progression.tradition.change.check,
      Civ7ControlOrpcContract.progression.tradition.change.request,
    ];
    expect(leaves.map((leaf) => leaf["~orpc"].meta?.risk)).toEqual([
      "read-only",
      "mutation",
      "read-only",
      "read-only",
      "mutation",
      "read-only",
      "mutation",
    ]);
    const choiceSchema =
      Civ7ControlOrpcContract.progression.technology.choice.request["~orpc"].inputSchema;
    expect(standardSchemaAccepts(choiceSchema, { node: 18_001 })).toBe(true);
    expect(standardSchemaAccepts(choiceSchema, { node: 18_001, playerId: 0 })).toBe(false);
    const attributeCheckSchema =
      Civ7ControlOrpcContract.progression.attribute.purchase.check["~orpc"].inputSchema;
    expect(standardSchemaAccepts(attributeCheckSchema, { node: 20 })).toBe(true);
    expect(standardSchemaAccepts(attributeCheckSchema, { node: 20, closeReview: true })).toBe(
      false
    );
    const traditionRequestSchema =
      Civ7ControlOrpcContract.progression.tradition.change.request["~orpc"].inputSchema;
    expect(
      standardSchemaAccepts(traditionRequestSchema, {
        traditionType: 91,
        action: "activate",
        closeReview: true,
      })
    ).toBe(true);
    expect(standardSchemaAccepts(traditionRequestSchema, { traditionType: 91, action: 12 })).toBe(
      false
    );
    const traditionCheckSchema =
      Civ7ControlOrpcContract.progression.tradition.change.check["~orpc"].inputSchema;
    expect(
      standardSchemaAccepts(traditionCheckSchema, {
        traditionType: 91,
        action: "activate",
        closeReview: true,
      })
    ).toBe(false);
  });

  test("keeps read choice options nonempty in the runtime contract", () => {
    const schema =
      Civ7ControlOrpcContract.progression.technology.choice.options["~orpc"].outputSchema;
    const option = {
      node: 18,
      name: "Pottery",
      treeType: 1,
      treeName: "Antiquity Technologies",
      current: true,
      cost: 25,
      turns: 3,
    };
    const result = {
      status: "read",
      currentNode: 18,
      options: [option],
    };

    expect(standardSchemaAccepts(schema, result)).toBe(true);
    expect(standardSchemaAccepts(schema, { ...result, options: [] })).toBe(false);
    expect(standardSchemaAccepts(schema, { ...result, options: [option, option] })).toBe(true);
    expect(
      standardSchemaAccepts(schema, {
        ...result,
        options: [option, { ...option, node: "invalid" }],
      })
    ).toBe(false);
  });

  test("correlates tradition actions and excludes impossible progression result evidence", () => {
    const traditionCheck =
      Civ7ControlOrpcContract.progression.tradition.change.check["~orpc"].outputSchema;
    expect(
      standardSchemaAccepts(traditionCheck, {
        traditionType: 91,
        action: "activate",
        status: "already-active",
      })
    ).toBe(true);
    expect(
      standardSchemaAccepts(traditionCheck, {
        traditionType: 91,
        action: "deactivate",
        status: "already-active",
      })
    ).toBe(false);

    const traditionRequest =
      Civ7ControlOrpcContract.progression.tradition.change.request["~orpc"].outputSchema;
    const alreadyActive = {
      traditionType: 91,
      action: "activate",
      status: "already-active",
      postcondition: confirmedPostcondition("tradition-changed", "changed"),
      nextSteps: refreshSteps("progression.tradition.change.request"),
    };
    expect(standardSchemaAccepts(traditionRequest, alreadyActive)).toBe(true);
    expect(
      standardSchemaAccepts(traditionRequest, {
        ...alreadyActive,
        action: "deactivate",
      })
    ).toBe(false);
    expect(
      standardSchemaAccepts(traditionRequest, {
        ...alreadyActive,
        postcondition: confirmedPostcondition("tradition-changed-review-closed", "changed"),
      })
    ).toBe(false);
    expect(
      standardSchemaAccepts(traditionRequest, {
        traditionType: 91,
        action: "activate",
        status: "sent-unverified",
        postcondition: missingPostcondition(),
        nextSteps: noRepeatSteps("progression.tradition.change.request"),
      })
    ).toBe(false);

    const attributeRequest =
      Civ7ControlOrpcContract.progression.attribute.purchase.request["~orpc"].outputSchema;
    const alreadyPurchased = {
      node: 20,
      status: "already-purchased",
      postcondition: confirmedPostcondition("attribute-purchased", "purchased"),
      nextSteps: refreshSteps("progression.attribute.purchase.request"),
    };
    expect(standardSchemaAccepts(attributeRequest, alreadyPurchased)).toBe(true);
    expect(
      standardSchemaAccepts(attributeRequest, {
        ...alreadyPurchased,
        postcondition: confirmedPostcondition("attribute-purchased-review-closed", "purchased"),
      })
    ).toBe(false);
    expect(
      standardSchemaAccepts(attributeRequest, {
        node: 20,
        status: "sent-unverified",
        postcondition: missingPostcondition(),
        nextSteps: noRepeatSteps("progression.attribute.purchase.request"),
      })
    ).toBe(false);

    for (const review of [
      {
        schema: Civ7ControlOrpcContract.progression.attribute.review.request["~orpc"].outputSchema,
        source: "progression.attribute.review.request",
      },
      {
        schema: Civ7ControlOrpcContract.progression.tradition.review.request["~orpc"].outputSchema,
        source: "progression.tradition.review.request",
      },
    ] as const) {
      expect(
        standardSchemaAccepts(review.schema, {
          status: "sent-unverified",
          postcondition: missingPostcondition(),
          nextSteps: noRepeatSteps(review.source),
        })
      ).toBe(false);
    }
  });

  test("returns only enabled local-player choice options", async () => {
    const context = fakeContext({
      getCiv7PlayNotificationView: async () =>
        progressionNotificationView("NOTIFICATION_CHOOSE_TECH", {
          currentResearching: { ok: true, value: 18 },
          options: [{ nodeType: 99, name: "Disabled", treeType: 1, treeName: "Tech" }],
          enabledOptions: [
            {
              nodeType: 18,
              name: "Pottery",
              treeType: 1,
              treeName: "Antiquity Technologies",
              cost: { ok: true, value: 25 },
              turns: { ok: true, value: 3 },
            },
          ],
        }),
    });

    const result = await call(
      Civ7ControlOrpcRouter.progression.technology.choice.options,
      {},
      { context }
    );

    expect(result).toEqual({
      status: "read",
      currentNode: 18,
      options: [
        {
          node: 18,
          name: "Pottery",
          treeType: 1,
          treeName: "Antiquity Technologies",
          current: true,
          cost: 25,
          turns: 3,
        },
      ],
    });
  });

  test("requires both the selected node and cleared target for terminal choice state", async () => {
    const snapshots = [
      treeSnapshot("culture", { currentNode: 27, targetNode: 44 }),
      treeSnapshot("culture", { currentNode: 27, targetNode: -1 }),
    ];
    const context = fakeContext({
      checkCiv7ProgressionTreeChoice: async () => {
        const snapshot = snapshots.shift();
        if (!snapshot) throw new Error("missing snapshot");
        return treeCheck(snapshot, false);
      },
    });

    const pending = await call(
      Civ7ControlOrpcRouter.progression.culture.choice.check,
      { node: 27 },
      { context }
    );
    const selected = await call(
      Civ7ControlOrpcRouter.progression.culture.choice.check,
      { node: 27 },
      { context }
    );

    expect(pending.status).toBe("selected-target-pending");
    expect(selected.status).toBe("already-selected");
  });

  test("sends a choice, reads a fresh snapshot, then clears its target", async () => {
    const events: string[] = [];
    const before = treeSnapshot("technology", { currentNode: null, targetNode: 7 });
    const selected = treeSnapshot("technology", { currentNode: 18, targetNode: 7 });
    const cleared = treeSnapshot("technology", { currentNode: 18, targetNode: -1 });
    const checks = [treeCheck(before, true), treeCheck(selected, false)];
    const context = fakeContext({
      checkCiv7ProgressionTreeChoice: async () => {
        events.push("check-choice");
        const next = checks.shift();
        if (!next) throw new Error("missing check");
        return next;
      },
      sendCiv7ProgressionTreeChoice: async (input) => {
        events.push("send-choice");
        expect(input.expected).toBe(before);
        return { sent: true, validation: validation(true), before, after: selected };
      },
      clearCiv7ProgressionTreeTarget: async (input) => {
        events.push("clear-target");
        expect(input.expected).toBe(selected);
        return { sent: true, before: selected, after: cleared };
      },
    });

    const result = await call(
      Civ7ControlOrpcRouter.progression.technology.choice.request,
      { node: 18 },
      { context }
    );

    expect(events).toEqual(["check-choice", "send-choice", "check-choice", "clear-target"]);
    expect(result).toMatchObject({
      status: "sent-confirmed",
      postcondition: { classification: "choice-selected-target-cleared" },
    });
  });

  test("clears a pending target for an already selected choice without repeating choice", async () => {
    const events: string[] = [];
    const pending = treeSnapshot("culture", { currentNode: 27, targetNode: 44 });
    const cleared = treeSnapshot("culture", { currentNode: 27, targetNode: -1 });
    const context = fakeContext({
      checkCiv7ProgressionTreeChoice: async () => {
        events.push("check-choice");
        return treeCheck(pending, false);
      },
      clearCiv7ProgressionTreeTarget: async (input) => {
        events.push("clear-target");
        expect(input.expected).toBe(pending);
        return { sent: true, before: pending, after: cleared };
      },
    });

    const result = await call(
      Civ7ControlOrpcRouter.progression.culture.choice.request,
      { node: 27 },
      { context }
    );

    expect(events).toEqual(["check-choice", "clear-target"]);
    expect(result.status).toBe("sent-confirmed");
  });

  test("does not claim choice dispatch when a pending target clear is not dispatched", async () => {
    const events: string[] = [];
    const pending = treeSnapshot("culture", { currentNode: 27, targetNode: 44 });
    const context = fakeContext({
      checkCiv7ProgressionTreeChoice: async () => {
        events.push("check-choice");
        return treeCheck(pending, false);
      },
      clearCiv7ProgressionTreeTarget: async () => {
        events.push("clear-target");
        throw dispatchError("not-dispatched", "target clear admission failed");
      },
    });

    const result = await call(
      Civ7ControlOrpcRouter.progression.culture.choice.request,
      { node: 27 },
      { context }
    );

    expect(events).toEqual(["check-choice", "clear-target"]);
    expect(result).toMatchObject({
      status: "already-selected-unverified",
      postcondition: {
        classification: "choice-selected-target-clear-unverified",
        outcome: "selected-partial",
        confirmed: false,
        noRepeatAfterUnverified: true,
      },
      nextSteps: [{ kind: "do-not-repeat" }],
    });
    expect(result.postcondition.reason).not.toContain("dispatched");
  });

  test("keeps a dispatched choice sent-unverified when its target clear is not dispatched", async () => {
    const events: string[] = [];
    const before = treeSnapshot("technology", { currentNode: null, targetNode: 7 });
    const selected = treeSnapshot("technology", { currentNode: 18, targetNode: 7 });
    const checks = [treeCheck(before, true), treeCheck(selected, false)];
    const context = fakeContext({
      checkCiv7ProgressionTreeChoice: async () => {
        events.push("check-choice");
        const next = checks.shift();
        if (!next) throw new Error("missing check");
        return next;
      },
      sendCiv7ProgressionTreeChoice: async () => {
        events.push("send-choice");
        return { sent: true, validation: validation(true), before, after: selected };
      },
      clearCiv7ProgressionTreeTarget: async () => {
        events.push("clear-target");
        throw dispatchError("not-dispatched", "target clear admission failed");
      },
    });

    const result = await call(
      Civ7ControlOrpcRouter.progression.technology.choice.request,
      { node: 18 },
      { context }
    );

    expect(events).toEqual(["check-choice", "send-choice", "check-choice", "clear-target"]);
    expect(result).toMatchObject({
      status: "sent-unverified",
      postcondition: {
        classification: "choice-selected-target-clear-unverified",
        outcome: "selected-partial",
      },
    });
  });

  test("does not confirm an already selected choice while its chooser blocker remains live", async () => {
    const selected = treeSnapshot("technology", { currentNode: 18, targetNode: -1 });
    const blocked = {
      ...selected,
      blocker: { ok: true as const, value: 1 },
      blockingNotification: {
        ok: true as const,
        value: {
          id: { owner: 0, id: 7 },
          type: 1,
          typeName: "NOTIFICATION_CHOOSE_TECH",
          target: null,
        },
      },
    };
    const context = fakeContext({
      checkCiv7ProgressionTreeChoice: async () => treeCheck(blocked, false),
    });

    const result = await call(
      Civ7ControlOrpcRouter.progression.technology.choice.request,
      { node: 18 },
      { context }
    );

    expect(result).toMatchObject({
      status: "already-selected-unverified",
      postcondition: {
        classification: "technology-state-changed-blocker-still-live",
        confirmed: false,
        noRepeatAfterUnverified: true,
      },
    });
  });

  test("rechecks target after an optional same-node choice before target dispatch", async () => {
    const events: string[] = [];
    const before = treeSnapshot("technology", { currentNode: null, targetNode: null });
    const chosen = treeSnapshot("technology", { currentNode: 18, targetNode: null });
    const targeted = treeSnapshot("technology", { currentNode: 18, targetNode: 18 });
    const targetChecks = [treeCheck(before, true), treeCheck(chosen, true)];
    const context = fakeContext({
      checkCiv7ProgressionTreeTarget: async () => {
        events.push("check-target");
        const next = targetChecks.shift();
        if (!next) throw new Error("missing target check");
        return next;
      },
      checkCiv7ProgressionTreeChoice: async () => {
        events.push("check-choice");
        return treeCheck(before, true);
      },
      sendCiv7ProgressionTreeChoice: async () => {
        events.push("send-choice");
        return { sent: true, validation: validation(true), before, after: chosen };
      },
      sendCiv7ProgressionTreeTarget: async (input) => {
        events.push("send-target");
        expect(input.expected).toBe(chosen);
        return { sent: true, validation: validation(true), before: chosen, after: targeted };
      },
    });

    const result = await call(
      Civ7ControlOrpcRouter.progression.technology.target.request,
      { node: 18 },
      { context }
    );

    expect(events).toEqual([
      "check-target",
      "check-choice",
      "send-choice",
      "check-target",
      "send-target",
    ]);
    expect(result.status).toBe("sent-confirmed");
  });

  test("stops when native target admission rejects before any prerequisite choice", async () => {
    const events: string[] = [];
    const before = treeSnapshot("culture", { currentNode: null, targetNode: null });
    const context = fakeContext({
      checkCiv7ProgressionTreeTarget: async () => {
        events.push("check-target");
        return treeCheck(before, false);
      },
      checkCiv7ProgressionTreeChoice: async () => {
        events.push("check-choice");
        return treeCheck(before, true);
      },
      sendCiv7ProgressionTreeChoice: async () => {
        events.push("send-choice");
        throw new Error("choice must not run after target rejection");
      },
      sendCiv7ProgressionTreeTarget: async () => {
        events.push("send-target");
        throw new Error("target must not run after target rejection");
      },
    });

    const result = await call(
      Civ7ControlOrpcRouter.progression.culture.target.request,
      { node: 27 },
      { context }
    );

    expect(events).toEqual(["check-target"]);
    expect(result).toMatchObject({
      status: "not-sent",
      postcondition: { classification: "not-sent" },
    });
  });

  test("reports confirmed attribute purchase with uncertain optional review as partial", async () => {
    const before = attributeSnapshot({ depthUnlocked: 1, availablePoints: 2 });
    const after = attributeSnapshot({ depthUnlocked: 2, availablePoints: 1 });
    const context = fakeContext({
      checkCiv7AttributePurchase: async () => ({
        valid: true,
        result: { Success: true },
        snapshot: before,
      }),
      sendCiv7AttributePurchase: async () => ({
        sent: true,
        validation: validation(true),
        before,
        after,
      }),
      checkCiv7AttributeReview: async () => ({
        valid: true,
        result: { Success: true },
        snapshot: reviewSnapshot("NOTIFICATION_ATTRIBUTE"),
      }),
      sendCiv7AttributeReview: async () => {
        throw new Error("transport ended after dispatch");
      },
    });

    const result = await call(
      Civ7ControlOrpcRouter.progression.attribute.purchase.request,
      { node: 20, closeReview: true },
      { context }
    );

    expect(result).toMatchObject({
      status: "dispatch-unknown",
      postcondition: {
        classification: "attribute-purchased-review-unverified",
        outcome: "purchased-partial",
      },
      nextSteps: [{ kind: "do-not-repeat" }],
    });
  });

  test("recognizes paired zero blocker and absent notification as cleared review state", async () => {
    const cleared = clearedReviewSnapshot();
    const context = fakeContext({
      checkCiv7AttributeReview: async () => ({
        valid: false,
        result: { Success: false },
        snapshot: cleared,
      }),
      checkCiv7TraditionReview: async () => ({
        valid: false,
        result: { Success: false },
        snapshot: cleared,
      }),
    });

    const [attributeResult, traditionResult] = await Promise.all([
      call(Civ7ControlOrpcRouter.progression.attribute.review.check, {}, { context }),
      call(Civ7ControlOrpcRouter.progression.tradition.review.check, {}, { context }),
    ]);

    expect(attributeResult.status).toBe("already-reviewed");
    expect(traditionResult.status).toBe("already-reviewed");
  });

  test("keeps unknown or malformed review notification identity unavailable", async () => {
    for (const snapshot of [reviewSnapshot(null), reviewSnapshot("NOTIFICATION_OTHER", 9)]) {
      const context = fakeContext({
        checkCiv7AttributeReview: async () => ({
          valid: false,
          result: { Success: false },
          snapshot,
        }),
        checkCiv7TraditionReview: async () => ({
          valid: false,
          result: { Success: false },
          snapshot,
        }),
      });

      const [attributeResult, traditionResult] = await Promise.all([
        call(Civ7ControlOrpcRouter.progression.attribute.review.check, {}, { context }),
        call(Civ7ControlOrpcRouter.progression.tradition.review.check, {}, { context }),
      ]);

      expect(attributeResult.status).toBe("unavailable");
      expect(traditionResult.status).toBe("unavailable");
    }
  });

  test("polls review closeout until a later post-send check observes clearance", async () => {
    const attributePresent = reviewSnapshot("NOTIFICATION_ATTRIBUTE");
    const traditionPresent = reviewSnapshot("NOTIFICATION_TRADITION");
    const cleared = clearedReviewSnapshot();
    let attributeChecks = 0;
    let traditionChecks = 0;
    const context = fakeContext({
      checkCiv7AttributeReview: async () => {
        attributeChecks += 1;
        return attributeChecks < 3
          ? { valid: true, result: { Success: true }, snapshot: attributePresent }
          : { valid: false, result: { Success: false }, snapshot: cleared };
      },
      sendCiv7AttributeReview: async (input) => ({
        sent: true,
        validation: validation(true),
        before: input.expected,
      }),
      checkCiv7TraditionReview: async () => {
        traditionChecks += 1;
        return traditionChecks < 3
          ? { valid: true, result: { Success: true }, snapshot: traditionPresent }
          : { valid: false, result: { Success: false }, snapshot: cleared };
      },
      sendCiv7TraditionReview: async (input) => ({
        sent: true,
        validation: validation(true),
        before: input.expected,
      }),
    });

    const [attributeResult, traditionResult] = await Promise.all([
      call(Civ7ControlOrpcRouter.progression.attribute.review.request, {}, { context }),
      call(Civ7ControlOrpcRouter.progression.tradition.review.request, {}, { context }),
    ]);

    expect(attributeChecks).toBe(3);
    expect(traditionChecks).toBe(3);
    expect(attributeResult).toMatchObject({
      status: "sent-confirmed",
      postcondition: { classification: "review-closed" },
    });
    expect(traditionResult).toMatchObject({
      status: "sent-confirmed",
      postcondition: { classification: "review-closed" },
    });
  });

  test("uses semantic tradition actions and confirms the desired active set", async () => {
    const before = traditionSnapshot([]);
    const after = traditionSnapshot([91]);
    const context = fakeContext({
      checkCiv7TraditionChange: async (input) => {
        expect(input).toEqual({ traditionType: 91, action: "activate" });
        return { valid: true, result: { Success: true }, snapshot: before };
      },
      sendCiv7TraditionChange: async (input) => {
        expect(input.expected).toBe(before);
        return { sent: true, validation: validation(true), before, after };
      },
    });

    const result = await call(
      Civ7ControlOrpcRouter.progression.tradition.change.request,
      { traditionType: 91, action: "activate" },
      { context }
    );

    expect(result).toMatchObject({
      status: "sent-confirmed",
      action: "activate",
      postcondition: { classification: "tradition-changed" },
    });
  });
});

function fakeContext(
  overrides: Parameters<typeof directControlFacadeFixture>[0]
): Civ7ControlOrpcContext {
  return {
    endpointDefaults,
    directControl: directControlFacadeFixture({
      getCiv7PlayableStatus: async () => playableStatusResult(),
      ...overrides,
    }),
  };
}

function treeSnapshot(
  kind: "technology" | "culture",
  values: Partial<Pick<Civ7ControlOrpcProgressionTreeSnapshot, "currentNode" | "targetNode">>
): Civ7ControlOrpcProgressionTreeSnapshot {
  return {
    localPlayerId: 0,
    kind,
    currentNode: values.currentNode ?? null,
    targetNode: values.targetNode ?? null,
    noNode: -1,
    blocker: { ok: true, value: 0 },
    blockingNotification: { ok: true, value: null },
  };
}

function treeCheck(
  snapshot: Civ7ControlOrpcProgressionTreeSnapshot,
  valid: boolean
): Civ7ControlOrpcProgressionTreeCheckResult {
  return { valid, result: { Success: valid }, snapshot };
}

function attributeSnapshot(
  values: Partial<Civ7ControlOrpcAttributeNodeSnapshot> = {}
): Civ7ControlOrpcAttributeNodeSnapshot {
  return {
    localPlayerId: 0,
    node: 20,
    nodeState: 2,
    depthUnlocked: 1,
    repeatedDepth: 0,
    attributeType: "ATTRIBUTE_CULTURAL",
    availablePoints: 2,
    wildcardPoints: 0,
    ...values,
  };
}

function traditionSnapshot(
  activeTraditions: number[]
): Civ7ControlOrpcTraditionAssignmentsSnapshot {
  return { localPlayerId: 0, activeTraditions };
}

function reviewSnapshot(typeName: string | null, owner = 0) {
  return {
    localPlayerId: 0,
    blocker: { ok: true as const, value: 1 },
    blockingNotification: {
      ok: true as const,
      value: {
        id: { owner, id: 7 },
        type: 1,
        typeName,
        target: null,
      },
    },
  };
}

function clearedReviewSnapshot() {
  return {
    localPlayerId: 0,
    blocker: { ok: true as const, value: 0 },
    blockingNotification: { ok: true as const, value: null },
  };
}

function confirmedPostcondition(classification: string, outcome: string) {
  return {
    classification,
    reason: "Confirmed by focused test evidence.",
    outcome,
    confidence: "confirmed",
    confirmed: true,
    noRepeatAfterUnverified: false,
  };
}

function missingPostcondition() {
  return {
    classification: "missing-postcondition",
    reason: "Focused postcondition evidence is unavailable.",
    outcome: "unknown",
    confidence: "unverified",
    confirmed: false,
    noRepeatAfterUnverified: true,
  };
}

function refreshSteps(source: string) {
  return [{ kind: "refresh-attention", source, label: "Refresh current attention." }];
}

function noRepeatSteps(source: string) {
  return [{ kind: "do-not-repeat", source, label: "Do not repeat." }];
}

function dispatchError(
  dispatchStatus: Civ7ControlOrpcCommandDispatchStatus,
  message: string
): Error & { dispatchStatus: Civ7ControlOrpcCommandDispatchStatus } {
  const error = Object.assign(new Error(message), {
    code: "command-failed" as const,
    dispatchStatus,
  });
  error.name = "Civ7DirectControlError";
  return error;
}

function validation(valid: true): { valid: true; result: { Success: true } };
function validation(valid: false): { valid: false; result: { Success: false } };
function validation(valid: boolean) {
  return { valid, result: { Success: valid } };
}

function progressionNotificationView(
  typeName: string,
  details: unknown
): Civ7ControlOrpcPlayNotificationViewResult {
  return {
    host: "127.0.0.1",
    port: 4318,
    state: { id: "65535", name: "App UI" },
    localPlayerId: 0,
    turn: { ok: true, value: 7 },
    turnDate: { ok: true, value: "3800 BCE" },
    hasSentTurnComplete: { ok: true, value: false },
    canEndTurn: { ok: true, value: false },
    blocker: { ok: true, value: 1 },
    blockingNotificationId: { ok: true, value: null },
    selectedUnitId: { ok: true, value: null },
    selectedCityId: { ok: true, value: null },
    firstReadyUnitId: { ok: true, value: null },
    notifications: [
      {
        id: null,
        type: 1,
        typeName,
        groupType: null,
        player: 0,
        summary: null,
        message: null,
        target: null,
        location: null,
        canUserDismiss: false,
        expired: false,
        dismissed: false,
        isEndTurnBlocking: true,
        decision: {
          category: "technology-choice",
          requiredInputs: [],
          commonActions: [],
          confidence: "live-proof",
          notes: [],
        },
        details,
      },
    ],
    decisions: [],
    hud: { nextDecision: null, decisionQueue: [] },
    limits: { maxNotifications: 25, truncated: false },
  };
}
