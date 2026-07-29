import type {
  Civ7DirectControlOptions,
  Civ7UnitTargetActionCheckInput,
  Civ7UnitTargetActionId,
  Civ7UnitTargetActionSendInput,
  Civ7UnitTargetObservationInput,
} from "@civ7/direct-control";
import { call } from "@orpc/server";
import { Effect, Fiber, TestClock, TestContext } from "effect";
import { describe, expect, test } from "vitest";

import {
  type Civ7ControlOrpcContext,
  Civ7ControlOrpcContract,
  Civ7ControlOrpcRouter,
  createCiv7ControlOrpcServerClient,
} from "../../../../src/index";
import type {
  Civ7ControlOrpcCommandDispatchStatus,
  Civ7ControlOrpcUnitTargetActionCheckResult,
  Civ7ControlOrpcUnitTargetActionSendResult,
  Civ7ControlOrpcUnitTargetSnapshot,
} from "../../../../src/service/model/ports/direct-control";
import { pollUnitTargetPostcondition } from "../../../../src/service/modules/unit/model/policy/target-action-polling";
import { civ7UnitTargetPostcondition } from "../../../../src/service/modules/unit/model/policy/target-action-result";
import { directControlFacadeFixture } from "../../../support/direct-control-facade";
import { playableStatusResult } from "../../../support/playable-status";
import { standardSchemaAccepts } from "../../../support/standard-schema";

const unitId = { owner: 0, id: 42, type: 1 };
const targetUnitId = { owner: 1, id: 77, type: 2 };
const target = { x: 22, y: 31 };
const origin = { x: 20, y: 31 };
const endpointDefaults = {
  host: "127.0.0.1",
  port: 4318,
  timeoutMs: 1_000,
};

type ActionId = Civ7UnitTargetActionId;
type CheckInput = Civ7UnitTargetActionCheckInput;
type SendInput = Civ7UnitTargetActionSendInput;
type ObservationInput = Civ7UnitTargetObservationInput;
type DirectOptions = Civ7DirectControlOptions | undefined;
type UnitSummary = NonNullable<Civ7ControlOrpcUnitTargetSnapshot["actor"]>;

describe("unit target action control-oRPC procedures", () => {
  test("publishes exact read-only check and guarded request contracts", () => {
    const check = Civ7ControlOrpcContract.unit.target.action.check["~orpc"];
    const request = Civ7ControlOrpcContract.unit.target.action.request["~orpc"];

    expect(check.meta).toMatchObject({
      procedureKey: "unit.target.action.check",
      risk: "read-only",
    });
    expect(request.meta).toMatchObject({
      procedureKey: "unit.target.action.request",
      risk: "mutation",
    });
    expect(standardSchemaAccepts(check.inputSchema, { unitId, ...target })).toBe(true);
    expect(standardSchemaAccepts(request.inputSchema, { unitId, ...target })).toBe(true);
    expect(
      standardSchemaAccepts(check.inputSchema, {
        unitId,
        ...target,
        actionId: "move-to",
      })
    ).toBe(false);
    expect(
      standardSchemaAccepts(request.inputSchema, {
        unitId,
        ...target,
        expected: actionCheck("move-to"),
      })
    ).toBe(false);
  });

  test("selects the first admitted action in native right-click order", async () => {
    const before = unitTargetSnapshot();
    const admitted = admittedAction("move-to", before);
    const fake = fakeContext({ checks: admitted.checks });
    const client = createCiv7ControlOrpcServerClient(fake.context);

    await expect(client.unit.target.action.check({ unitId, ...target })).resolves.toEqual({
      unitId,
      target,
      available: true,
      classification: "action-available",
      selectedAction: "move-to",
    });
    expect(fake.calls.checks.map(({ input }) => input.actionId)).toEqual([
      "naval-attack",
      "air-attack",
      "ranged-attack",
      "army-overrun",
      "swap-units",
      "move-to",
    ]);
    expect(
      admitted.checks.slice(0, 3).map(({ actionId, snapshot }) => ({
        actionId,
        combatType: snapshot.combatType,
      }))
    ).toEqual([
      { actionId: "naval-attack", combatType: null },
      { actionId: "air-attack", combatType: null },
      { actionId: "ranged-attack", combatType: "COMBAT_MELEE" },
    ]);
    expect(fake.calls.sends).toEqual([]);
    expect(fake.calls.observations).toEqual([]);
  });

  test("stops when a provider response does not correlate with the requested candidate", async () => {
    const fake = fakeContext({
      checks: [actionCheck("air-attack")],
    });

    const result = await call(
      Civ7ControlOrpcRouter.unit.target.action.check,
      { unitId, ...target },
      { context: fake.context }
    );

    expect(result).toMatchObject({
      available: false,
      classification: "not-admitted",
      selectedAction: null,
    });
    expect(fake.calls.checks.map(({ input }) => input.actionId)).toEqual(["naval-attack"]);
  });

  test("treats a failed ranged check as terminal for a ranged attack target", async () => {
    const ranged = unitTargetSnapshot({
      combatType: "COMBAT_RANGED",
      rangedCombatType: "COMBAT_RANGED",
    });
    const fake = fakeContext({
      checks: [
        actionCheck("naval-attack", { snapshot: ranged }),
        actionCheck("air-attack", { snapshot: ranged }),
        actionCheck("ranged-attack", { snapshot: ranged }),
      ],
    });

    const result = await call(
      Civ7ControlOrpcRouter.unit.target.action.check,
      { unitId, ...target },
      { context: fake.context }
    );

    expect(result).toEqual({
      unitId,
      target,
      available: false,
      classification: "not-admitted",
      selectedAction: null,
    });
    expect(fake.calls.checks.map(({ input }) => input.actionId)).toEqual([
      "naval-attack",
      "air-attack",
      "ranged-attack",
    ]);
  });

  test("refuses inconsistent ranged prerequisite evidence instead of changing native order", async () => {
    const ranged = unitTargetSnapshot({
      combatType: "COMBAT_RANGED",
      rangedCombatType: "COMBAT_RANGED",
    });
    const fake = fakeContext({
      checks: [
        actionCheck("naval-attack", { snapshot: ranged }),
        actionCheck("air-attack", { snapshot: ranged }),
        actionCheck("ranged-attack", {
          snapshot: ranged,
          prerequisiteSatisfied: false,
        }),
      ],
    });

    const result = await call(
      Civ7ControlOrpcRouter.unit.target.action.check,
      { unitId, ...target },
      { context: fake.context }
    );

    expect(result).toMatchObject({
      available: false,
      classification: "not-admitted",
      selectedAction: null,
    });
    expect(fake.calls.checks.map(({ input }) => input.actionId)).toEqual([
      "naval-attack",
      "air-attack",
      "ranged-attack",
    ]);
  });

  test("stops after overrun when the target is the actor's current tile", async () => {
    const currentTile = unitTargetSnapshot({
      actor: unitSummary(unitId, { location: target }),
    });
    const fake = fakeContext({
      checks: [
        actionCheck("naval-attack", { snapshot: currentTile }),
        actionCheck("air-attack", { snapshot: currentTile }),
        actionCheck("ranged-attack", { snapshot: currentTile }),
        actionCheck("army-overrun", { snapshot: currentTile }),
      ],
    });

    const result = await call(
      Civ7ControlOrpcRouter.unit.target.action.check,
      { unitId, ...target },
      { context: fake.context }
    );

    expect(result).toMatchObject({
      available: false,
      classification: "not-admitted",
      selectedAction: null,
    });
    expect(fake.calls.checks.map(({ input }) => input.actionId)).toEqual([
      "naval-attack",
      "air-attack",
      "ranged-attack",
      "army-overrun",
    ]);
  });

  test("refuses war-starting actions in favor of the dedicated workflow", async () => {
    const before = unitTargetSnapshot({
      war: warObservation({ player2: 1, required: true }),
    });
    const fake = fakeContext({
      checks: [actionCheck("naval-attack", { snapshot: before, valid: true })],
    });

    const result = await call(
      Civ7ControlOrpcRouter.unit.target.action.request,
      { unitId, ...target },
      { context: fake.context }
    );

    expect(result).toEqual({
      unitId,
      target,
      selectedAction: "naval-attack",
      status: "not-sent",
      postcondition: {
        classification: "war-confirmation-required",
        reason:
          "The selected native unit action would start war and must use Civ7's dedicated war-confirmation workflow.",
        outcome: "requires-war-confirmation",
        confidence: "confirmed",
        confirmed: false,
        noRepeatAfterUnverified: false,
      },
      nextSteps: [
        {
          kind: "use-war-confirmation",
          source: "unit.target.action.request",
          label:
            "Use Civ7's dedicated war-confirmation workflow, then obtain a fresh unit-target check.",
        },
      ],
    });
    expect(fake.calls.sends).toEqual([]);
    expect(fake.calls.observations).toEqual([]);
  });

  test("prioritizes before-check war evidence over native validity", async () => {
    const baseline = unitTargetSnapshot({
      combatType: "COMBAT_RANGED",
      rangedCombatType: "COMBAT_RANGED",
    });
    const rangedWar = {
      ...baseline,
      war: warObservation({ player2: 1, required: true }),
    };
    const fake = fakeContext({
      checks: [
        actionCheck("naval-attack", { snapshot: baseline }),
        actionCheck("air-attack", { snapshot: baseline }),
        actionCheck("ranged-attack", { snapshot: rangedWar, valid: false }),
      ],
    });

    const result = await call(
      Civ7ControlOrpcRouter.unit.target.action.request,
      { unitId, ...target },
      { context: fake.context }
    );

    expect(result).toMatchObject({
      selectedAction: "ranged-attack",
      status: "not-sent",
      postcondition: {
        classification: "war-confirmation-required",
        outcome: "requires-war-confirmation",
      },
    });
    expect(fake.calls.checks.map(({ input }) => input.actionId)).toEqual([
      "naval-attack",
      "air-attack",
      "ranged-attack",
    ]);
    expect(fake.calls.sends).toEqual([]);
  });

  test("guards one move send, confirms target arrival, and returns semantic output", async () => {
    const before = unitTargetSnapshot();
    const after = unitTargetSnapshot({
      actor: unitSummary(unitId, { location: target, movementMovesRemaining: 0 }),
    });
    const admitted = admittedAction("move-to", before);
    const fake = fakeContext({
      checks: admitted.checks,
      sends: [actionSend(admitted.selected, admitted.selected.snapshot, after)],
    });

    const result = await call(
      Civ7ControlOrpcRouter.unit.target.action.request,
      { unitId, ...target },
      { context: fake.context }
    );

    expect(result).toEqual({
      unitId,
      target,
      selectedAction: "move-to",
      status: "sent-confirmed",
      postcondition: {
        classification: "target-reached",
        reason: "The acting unit reached the requested target plot.",
        outcome: "target-reached",
        confidence: "confirmed",
        confirmed: true,
        noRepeatAfterUnverified: false,
      },
      nextSteps: [
        {
          kind: "refresh-attention",
          source: "unit.target.action.request",
          label: "Refresh current attention before choosing the next player action.",
        },
      ],
    });
    const serialized = JSON.stringify(result);
    expect(serialized).not.toContain("CMD");
    expect(serialized).not.toContain("Game.UnitOperations");
    expect(serialized).not.toContain("Game.UnitCommands");
    for (const rawKey of [
      '"host"',
      '"port"',
      '"state"',
      '"session"',
      '"command"',
      '"rawCommand"',
      '"validation"',
      '"before"',
      '"after"',
      '"snapshot"',
      '"args"',
      '"result"',
      '"war"',
      '"modifiers"',
    ]) {
      expect(serialized).not.toContain(rawKey);
    }
    expect(fake.calls.sends).toEqual([
      {
        input: {
          unitId,
          ...target,
          actionId: "move-to",
          expected: admitted.selected,
        },
        options: endpointDefaults,
      },
    ]);
    expect(fake.calls.observations).toEqual([]);
  });

  test("refuses to confirm uncorrelated provider send evidence", async () => {
    const before = unitTargetSnapshot();
    const reached = unitTargetSnapshot({
      actor: unitSummary(unitId, { location: target, movementMovesRemaining: 0 }),
    });
    const admitted = admittedAction("move-to", before);
    const correlated = actionSend(admitted.selected, admitted.selected.snapshot, reached);
    const mismatches: Civ7ControlOrpcUnitTargetActionSendResult[] = [
      { ...correlated, actionId: "swap-units" },
      {
        ...correlated,
        validation: { ...admitted.selected, result: "mismatched-validation" },
      },
      {
        ...correlated,
        before: unitTargetSnapshot({
          actor: unitSummary(unitId, { movementMovesRemaining: 0 }),
        }),
      },
    ];

    for (const send of mismatches) {
      const fake = fakeContext({
        checks: admitted.checks,
        sends: [send],
      });
      const result = await call(
        Civ7ControlOrpcRouter.unit.target.action.request,
        { unitId, ...target },
        { context: fake.context }
      );

      expect(result).toMatchObject({
        selectedAction: "move-to",
        status: "sent-unverified",
        postcondition: {
          classification: "missing-postcondition",
          confidence: "unverified",
          confirmed: false,
          noRepeatAfterUnverified: true,
        },
        nextSteps: [{ kind: "do-not-repeat" }],
      });
      expect(fake.calls.observations).toEqual([]);
    }
  });

  test("polls focused evidence after dispatch and confirms later movement", async () => {
    const before = unitTargetSnapshot();
    const reached = unitTargetSnapshot({
      actor: unitSummary(unitId, { location: target, movementMovesRemaining: 0 }),
    });
    const admitted = admittedAction("move-to", before);
    const fake = fakeContext({
      checks: admitted.checks,
      sends: [actionSend(admitted.selected, admitted.selected.snapshot, before)],
      observations: [reached],
    });

    const result = await call(
      Civ7ControlOrpcRouter.unit.target.action.request,
      { unitId, ...target },
      { context: fake.context }
    );

    expect(result).toMatchObject({
      status: "sent-confirmed",
      postcondition: { classification: "target-reached" },
    });
    expect(fake.calls.observations).toHaveLength(1);
    expect(fake.calls.observations[0]?.input).toEqual({
      unitId,
      ...target,
      trackedUnitIds: [],
    });
    expect(fake.calls.observations[0]?.options).toMatchObject({
      host: endpointDefaults.host,
      port: endpointDefaults.port,
    });
    expect(fake.calls.observations[0]?.options?.timeoutMs).toBeGreaterThan(0);
    expect(fake.calls.observations[0]?.options?.timeoutMs).toBeLessThanOrEqual(
      endpointDefaults.timeoutMs
    );
  });

  test("keeps intermediate movement provisional until later target arrival", async () => {
    const before = unitTargetSnapshot();
    const intermediate = unitTargetSnapshot({
      actor: unitSummary(unitId, {
        location: { x: 21, y: 31 },
        movementMovesRemaining: 0,
      }),
    });
    const reached = unitTargetSnapshot({
      actor: unitSummary(unitId, { location: target, movementMovesRemaining: 0 }),
    });
    const admitted = admittedAction("move-to", before);
    const fake = fakeContext({
      checks: admitted.checks,
      sends: [actionSend(admitted.selected, admitted.selected.snapshot, intermediate)],
      observations: [reached],
    });

    const result = await call(
      Civ7ControlOrpcRouter.unit.target.action.request,
      { unitId, ...target },
      { context: fake.context }
    );

    expect(result).toMatchObject({
      selectedAction: "move-to",
      status: "sent-confirmed",
      postcondition: {
        classification: "target-reached",
        outcome: "target-reached",
        confidence: "confirmed",
        confirmed: true,
        noRepeatAfterUnverified: false,
      },
      nextSteps: [{ kind: "refresh-attention" }],
    });
    expect(fake.calls.observations).toHaveLength(1);
  });

  test("confirms a true swap only from reciprocal tracked-unit movement", async () => {
    const targetUnit = unitSummary(targetUnitId, {
      location: target,
      attacksRemaining: 0,
    });
    const before = unitTargetSnapshot({
      targetUnits: [targetUnit],
      trackedTargetUnits: [{ id: targetUnitId, unit: targetUnit }],
    });
    const after = unitTargetSnapshot({
      actor: unitSummary(unitId, { location: target }),
      targetUnits: [],
      trackedTargetUnits: [
        {
          id: targetUnitId,
          unit: unitSummary(targetUnitId, {
            location: origin,
            attacksRemaining: 0,
          }),
        },
      ],
    });
    const admitted = admittedAction("swap-units", before);
    const fake = fakeContext({
      checks: admitted.checks,
      sends: [actionSend(admitted.selected, admitted.selected.snapshot, after)],
    });

    const result = await call(
      Civ7ControlOrpcRouter.unit.target.action.request,
      { unitId, ...target },
      { context: fake.context }
    );

    expect(result).toMatchObject({
      selectedAction: "swap-units",
      status: "sent-confirmed",
      postcondition: {
        classification: "units-swapped",
        outcome: "units-swapped",
        confirmed: true,
      },
    });
    expect(fake.calls.observations).toEqual([]);

    expect(
      civ7UnitTargetPostcondition({
        kind: "observed",
        input: { unitId, ...target },
        action: "swap-units",
        before,
        after: unitTargetSnapshot({
          actor: unitSummary(unitId, { location: target }),
          targetUnits: [],
          trackedTargetUnits: [{ id: targetUnitId, unit: targetUnit }],
        }),
      })
    ).toMatchObject({
      classification: "runtime-state-changed",
      confidence: "unverified",
      confirmed: false,
      noRepeatAfterUnverified: true,
    });
  });

  test("confirms attack outcomes from focused target or actor combat evidence", async () => {
    const targetUnit = unitSummary(targetUnitId, {
      location: target,
      attacksRemaining: 0,
      damage: 0,
      hitPoints: 100,
    });
    const before = unitTargetSnapshot({
      targetUnits: [targetUnit],
      trackedTargetUnits: [{ id: targetUnitId, unit: targetUnit }],
    });
    const afterSnapshots: Civ7ControlOrpcUnitTargetSnapshot[] = [
      unitTargetSnapshot({
        targetUnits: [targetUnit],
        trackedTargetUnits: [
          {
            id: targetUnitId,
            unit: unitSummary(targetUnitId, {
              location: target,
              attacksRemaining: 0,
              damage: 10,
              hitPoints: 90,
            }),
          },
        ],
      }),
      unitTargetSnapshot({
        actor: unitSummary(unitId, { attacksRemaining: 0 }),
        targetUnits: [targetUnit],
        trackedTargetUnits: [{ id: targetUnitId, unit: targetUnit }],
      }),
    ];

    for (const after of afterSnapshots) {
      const admitted = admittedAction("naval-attack", before);
      const fake = fakeContext({
        checks: admitted.checks,
        sends: [actionSend(admitted.selected, admitted.selected.snapshot, after)],
      });

      const result = await call(
        Civ7ControlOrpcRouter.unit.target.action.request,
        { unitId, ...target },
        { context: fake.context }
      );

      expect(result).toMatchObject({
        selectedAction: "naval-attack",
        status: "sent-confirmed",
        postcondition: {
          classification: "attack-state-changed",
          outcome: "state-changed",
          confirmed: true,
        },
      });
    }

    expect(
      civ7UnitTargetPostcondition({
        kind: "observed",
        input: { unitId, ...target },
        action: "naval-attack",
        before,
        after: unitTargetSnapshot({
          targetUnits: [targetUnit],
          trackedTargetUnits: [],
        }),
      })
    ).toMatchObject({
      classification: "runtime-state-changed",
      confidence: "unverified",
      confirmed: false,
    });
  });

  test("confirms stationary melee from MOVE_TO combat evidence", async () => {
    const targetUnit = unitSummary(targetUnitId, {
      location: target,
      attacksRemaining: 0,
      damage: 0,
      hitPoints: 100,
    });
    const before = unitTargetSnapshot({
      targetUnits: [targetUnit],
      trackedTargetUnits: [{ id: targetUnitId, unit: targetUnit }],
    });
    const after = unitTargetSnapshot({
      targetUnits: [targetUnit],
      trackedTargetUnits: [
        {
          id: targetUnitId,
          unit: unitSummary(targetUnitId, {
            location: target,
            attacksRemaining: 0,
            damage: 20,
            hitPoints: 80,
          }),
        },
      ],
    });
    const admitted = admittedAction("move-to", before);
    const fake = fakeContext({
      checks: admitted.checks,
      sends: [actionSend(admitted.selected, admitted.selected.snapshot, after)],
    });

    const result = await call(
      Civ7ControlOrpcRouter.unit.target.action.request,
      { unitId, ...target },
      { context: fake.context }
    );

    expect(result).toMatchObject({
      selectedAction: "move-to",
      status: "sent-confirmed",
      postcondition: {
        classification: "attack-state-changed",
        outcome: "state-changed",
        confirmed: true,
      },
    });
  });

  test("keeps indeterminate dispatch no-repeat guarded even with later attack proof", async () => {
    const targetUnit = unitSummary(targetUnitId, {
      location: target,
      attacksRemaining: 0,
      damage: 0,
      hitPoints: 100,
    });
    const before = unitTargetSnapshot({
      targetUnits: [targetUnit],
      trackedTargetUnits: [{ id: targetUnitId, unit: targetUnit }],
    });
    const damaged = unitTargetSnapshot({
      targetUnits: [targetUnit],
      trackedTargetUnits: [
        {
          id: targetUnitId,
          unit: unitSummary(targetUnitId, {
            location: target,
            attacksRemaining: 0,
            damage: 15,
            hitPoints: 85,
          }),
        },
      ],
    });
    const admitted = admittedAction("naval-attack", before);
    const fake = fakeContext({
      checks: admitted.checks,
      sendError: dispatchError("indeterminate", "transport outcome unavailable"),
      observations: [damaged],
    });

    const result = await call(
      Civ7ControlOrpcRouter.unit.target.action.request,
      { unitId, ...target },
      { context: fake.context }
    );

    expect(result).toMatchObject({
      selectedAction: "naval-attack",
      status: "dispatch-unknown",
      postcondition: {
        classification: "attack-state-changed",
        confidence: "confirmed",
        confirmed: true,
        noRepeatAfterUnverified: false,
      },
      nextSteps: [{ kind: "do-not-repeat" }],
    });
    expect(fake.calls.sends).toHaveLength(1);
    expect(fake.calls.observations).toHaveLength(1);
  });

  test("bounds a never-resolving postcheck by one remaining deadline", async () => {
    const before = unitTargetSnapshot();
    const timeouts: number[] = [];
    const never = new Promise<Civ7ControlOrpcUnitTargetSnapshot>(() => undefined);
    const effect = pollUnitTargetPostcondition({
      input: { unitId, ...target },
      action: "move-to",
      initial: {
        kind: "observed",
        input: { unitId, ...target },
        action: "move-to",
        before,
        after: before,
      },
      observe: (timeoutMs) => {
        timeouts.push(timeoutMs);
        return never;
      },
      waitMs: 1_000,
    });
    const program = Effect.gen(function* () {
      const fiber = yield* Effect.fork(effect);
      yield* Effect.yieldNow();
      yield* TestClock.adjust(1_000);
      return yield* Fiber.join(fiber);
    }).pipe(Effect.provide(TestContext.TestContext));

    await expect(Effect.runPromise(program)).resolves.toEqual({
      kind: "postcheck-unavailable",
    });
    expect(timeouts).toEqual([1_000]);
  });

  test("does not confirm an intermediate move when deadline observation is unavailable", async () => {
    const before = unitTargetSnapshot();
    const intermediate = unitTargetSnapshot({
      actor: unitSummary(unitId, {
        location: { x: 21, y: 31 },
        movementMovesRemaining: 0,
      }),
    });
    const never = new Promise<Civ7ControlOrpcUnitTargetSnapshot>(() => undefined);
    const effect = pollUnitTargetPostcondition({
      input: { unitId, ...target },
      action: "move-to",
      initial: {
        kind: "observed",
        input: { unitId, ...target },
        action: "move-to",
        before,
        after: intermediate,
      },
      observe: () => never,
      waitMs: 1_000,
    });
    const program = Effect.gen(function* () {
      const fiber = yield* Effect.fork(effect);
      yield* Effect.yieldNow();
      yield* TestClock.adjust(1_000);
      return yield* Fiber.join(fiber);
    }).pipe(Effect.provide(TestContext.TestContext));

    const evidence = await Effect.runPromise(program);
    expect(civ7UnitTargetPostcondition(evidence)).toMatchObject({
      classification: "missing-postcondition",
      outcome: "unknown",
      confidence: "unverified",
      confirmed: false,
    });
  });

  test("confirms a stable stopped path shortfall at the observation deadline", async () => {
    const before = unitTargetSnapshot();
    const stopped = unitTargetSnapshot({
      actor: unitSummary(unitId, {
        location: { x: 21, y: 31 },
        movementMovesRemaining: 0,
      }),
    });
    const effect = pollUnitTargetPostcondition({
      input: { unitId, ...target },
      action: "move-to",
      initial: {
        kind: "observed",
        input: { unitId, ...target },
        action: "move-to",
        before,
        after: stopped,
      },
      observe: async () => stopped,
      waitMs: 1_000,
    });
    const program = Effect.gen(function* () {
      const fiber = yield* Effect.fork(effect);
      yield* Effect.yieldNow();
      yield* TestClock.adjust(1_000);
      return yield* Fiber.join(fiber);
    }).pipe(Effect.provide(TestContext.TestContext));

    const evidence = await Effect.runPromise(program);
    expect(civ7UnitTargetPostcondition(evidence)).toMatchObject({
      classification: "path-shortfall",
      outcome: "path-shortfall",
      confidence: "confirmed",
      confirmed: true,
    });
  });

  test("maps check failures to the check procedure without exposing a mutation result", async () => {
    const fake = fakeContext({
      checks: [new Error("unit-target evidence unavailable")],
    });

    await expect(
      call(
        Civ7ControlOrpcRouter.unit.target.action.check,
        { unitId, ...target },
        { context: fake.context }
      )
    ).rejects.toMatchObject({
      code: "UNIT_TARGET_ACTION_UNAVAILABLE",
      status: 503,
      data: {
        procedureKey: "unit.target.action.check",
        source: "direct-control-facade",
      },
    });
  });
});

type FakeOptions = Readonly<{
  checks?: ReadonlyArray<Civ7ControlOrpcUnitTargetActionCheckResult | Error>;
  sends?: ReadonlyArray<Civ7ControlOrpcUnitTargetActionSendResult | Error>;
  observations?: ReadonlyArray<
    Civ7ControlOrpcUnitTargetSnapshot | Error | Promise<Civ7ControlOrpcUnitTargetSnapshot>
  >;
  sendError?: Error;
}>;

function fakeContext(options: FakeOptions = {}) {
  const checks = [...(options.checks ?? [])];
  const sends = [...(options.sends ?? [])];
  const observations = [...(options.observations ?? [])];
  const readiness: Array<{ options: DirectOptions }> = [];
  const checkCalls: Array<{ input: CheckInput; options: DirectOptions }> = [];
  const sendCalls: Array<{ input: SendInput; options: DirectOptions }> = [];
  const observationCalls: Array<{ input: ObservationInput; options: DirectOptions }> = [];
  const calls = {
    readiness,
    checks: checkCalls,
    sends: sendCalls,
    observations: observationCalls,
  };
  const context: Civ7ControlOrpcContext = {
    endpointDefaults,
    directControl: directControlFacadeFixture({
      getCiv7PlayableStatus: async (directOptions) => {
        readiness.push({ options: directOptions });
        return playableStatusResult({ playable: true });
      },
      checkCiv7UnitTargetAction: async (input, directOptions) => {
        checkCalls.push({ input, options: directOptions });
        const result = checks.shift();
        if (result instanceof Error) throw result;
        if (result === undefined) throw new Error("Unexpected unit-target action check.");
        return result;
      },
      sendCiv7UnitTargetAction: async (input, directOptions) => {
        sendCalls.push({ input, options: directOptions });
        if (options.sendError) throw options.sendError;
        const result = sends.shift();
        if (result instanceof Error) throw result;
        if (result === undefined) throw new Error("Unexpected unit-target action send.");
        return result;
      },
      observeCiv7UnitTarget: async (input, directOptions) => {
        observationCalls.push({ input, options: directOptions });
        const result = observations.shift();
        if (result instanceof Error) throw result;
        if (result === undefined) throw new Error("Unexpected unit-target observation.");
        return await result;
      },
    }),
  };
  return { calls, context };
}

function admittedAction(
  actionId: ActionId,
  snapshot: Civ7ControlOrpcUnitTargetSnapshot
): Readonly<{
  checks: Civ7ControlOrpcUnitTargetActionCheckResult[];
  selected: Civ7ControlOrpcUnitTargetActionCheckResult;
}> {
  const order = nativeOrder(snapshot);
  const selectedIndex = order.indexOf(actionId);
  if (selectedIndex < 0) {
    throw new Error(`${actionId} is not reachable for this unit-target snapshot.`);
  }
  const checks = order
    .slice(0, selectedIndex + 1)
    .map((candidate) => actionCheck(candidate, { snapshot, valid: candidate === actionId }));
  const selected = checks[selectedIndex];
  if (selected === undefined) {
    throw new Error(`Missing admitted ${actionId} check fixture.`);
  }
  return { checks, selected };
}

function nativeOrder(snapshot: Civ7ControlOrpcUnitTargetSnapshot): ActionId[] {
  return rangedPrerequisiteSatisfied(snapshot)
    ? ["naval-attack", "air-attack", "ranged-attack"]
    : ["naval-attack", "air-attack", "ranged-attack", "army-overrun", "swap-units", "move-to"];
}

function actionCheck(
  actionId: ActionId,
  options: Readonly<{
    snapshot?: Civ7ControlOrpcUnitTargetSnapshot;
    valid?: boolean;
    prerequisiteSatisfied?: boolean;
  }> = {}
): Civ7ControlOrpcUnitTargetActionCheckResult {
  const observed = options.snapshot ?? unitTargetSnapshot();
  const valid = options.valid ?? false;
  const prerequisiteSatisfied =
    options.prerequisiteSatisfied ??
    (actionId === "ranged-attack"
      ? rangedPrerequisiteSatisfied(observed)
      : actionId === "swap-units" || actionId === "move-to"
        ? offCurrentTile(observed)
        : true);
  const shouldObserveWar =
    actionId === "naval-attack" || actionId === "air-attack"
      ? valid
      : (actionId === "ranged-attack" || actionId === "move-to") && prerequisiteSatisfied;
  const snapshot = {
    ...observed,
    combatType: actionId === "ranged-attack" ? observed.combatType : null,
    war: shouldObserveWar ? observed.war : unobservedWarObservation(),
  };
  return {
    actionId,
    valid,
    prerequisite: {
      kind:
        actionId === "ranged-attack"
          ? "ranged-combat"
          : actionId === "swap-units" || actionId === "move-to"
            ? "off-current-tile"
            : "none",
      satisfied: prerequisiteSatisfied,
    },
    args: {
      X: target.x,
      Y: target.y,
      Modifiers: actionId === "move-to" ? 3 : 0,
    },
    result:
      (actionId === "ranged-attack" || actionId === "move-to") && snapshot.war.required === true
        ? null
        : valid,
    snapshot,
  };
}

function rangedPrerequisiteSatisfied(snapshot: Civ7ControlOrpcUnitTargetSnapshot): boolean {
  return (
    snapshot.combatType !== null &&
    snapshot.rangedCombatType !== null &&
    Object.is(snapshot.combatType, snapshot.rangedCombatType)
  );
}

function offCurrentTile(snapshot: Civ7ControlOrpcUnitTargetSnapshot): boolean {
  const location = snapshot.actor?.location;
  return (
    location !== null &&
    location !== undefined &&
    (location.x !== snapshot.target.x || location.y !== snapshot.target.y)
  );
}

function actionSend(
  validation: Civ7ControlOrpcUnitTargetActionCheckResult,
  before: Civ7ControlOrpcUnitTargetSnapshot,
  after: Civ7ControlOrpcUnitTargetSnapshot,
  sent = true
): Civ7ControlOrpcUnitTargetActionSendResult {
  return {
    sent,
    actionId: validation.actionId,
    validation,
    before,
    after,
  };
}

function unitTargetSnapshot(
  overrides: Partial<Civ7ControlOrpcUnitTargetSnapshot> = {}
): Civ7ControlOrpcUnitTargetSnapshot {
  return {
    localPlayerId: unitId.owner,
    unitId,
    target: { ...target, index: 713_967_338 },
    actor: unitSummary(unitId),
    targetUnits: [],
    trackedTargetUnits: [],
    combatType: "COMBAT_MELEE",
    rangedCombatType: "COMBAT_RANGED",
    war: warObservation(),
    modifiers: {
      none: 0,
      dispatch: 3,
    },
    ...overrides,
  };
}

function unitSummary(id: UnitSummary["id"], overrides: Partial<UnitSummary> = {}): UnitSummary {
  return {
    id,
    location: origin,
    movementMovesRemaining: 1,
    movementTurnsRemaining: 0,
    attacksRemaining: 1,
    damage: 0,
    hitPoints: 100,
    ...overrides,
  };
}

function warObservation(
  overrides: Partial<Civ7ControlOrpcUnitTargetSnapshot["war"]> = {}
): Civ7ControlOrpcUnitTargetSnapshot["war"] {
  return {
    observed: true,
    result: null,
    player2: null,
    noPlayerId: -1,
    required: false,
    ...overrides,
  };
}

function unobservedWarObservation(): Civ7ControlOrpcUnitTargetSnapshot["war"] {
  return {
    observed: false,
    result: null,
    player2: null,
    noPlayerId: -1,
    required: null,
  };
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
