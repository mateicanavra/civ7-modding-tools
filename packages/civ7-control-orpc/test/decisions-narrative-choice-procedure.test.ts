import { call } from "@orpc/server";
import { describe, expect, test } from "vitest";

import {
  Civ7ControlOrpcContract,
  Civ7ControlOrpcRouter,
  Civ7NarrativeChoiceUnavailableError,
  createCiv7ControlOrpcServerClient,
  type Civ7ControlOrpcContext,
  type Civ7ControlOrpcPlayableStatusResult,
} from "../src/index";
import type { Civ7ControlOrpcNarrativeChoiceResult } from "../src/dependencies/direct-control";

const narrativeInput = {
  playerId: 0,
  targetType: "DISCOVERY_STORY",
  target: { owner: 0, id: 7_001, type: 12 },
  action: 1,
} as const;

describe("decisions.narrative.choice.request control-oRPC procedure", () => {
  test("projects confirmed narrative choices without raw command output", async () => {
    const fake = fakeContext(narrativeChoiceResult("narrative-blocker-cleared"));

    const result = await call(
      Civ7ControlOrpcRouter.decisions.narrative.choice.request,
      narrativeInput,
      { context: fake.context },
    );

    expect(fake.calls.readiness).toHaveLength(1);
    expect(fake.calls.request).toEqual([{
      input: narrativeInput,
      options: {
        host: "127.0.0.1",
        port: 4318,
        timeoutMs: 1_000,
      },
      approval: {
        approved: true,
        reason: "local narrative choice proof",
      },
    }]);
    expect(result).toEqual({
      playerId: 0,
      targetType: "DISCOVERY_STORY",
      target: { owner: 0, id: 7_001, type: 12 },
      action: 1,
      sent: true,
      status: "sent-confirmed",
      validation: {
        beforeValid: true,
        afterValid: false,
      },
      postcondition: {
        classification: "narrative-blocker-cleared",
        reason: "narrative-blocker-cleared reason",
        outcome: "cleared",
        confidence: "confirmed",
        confirmed: true,
        noRepeatAfterUnverified: false,
      },
      nextSteps: [{
        kind: "refresh-attention",
        source: "decisions.narrative.choice.request",
        label: "Refresh current attention before choosing the next player action.",
      }],
    });

    const serialized = JSON.stringify(result);
    expect(serialized).not.toContain("\"host\"");
    expect(serialized).not.toContain("\"port\"");
    expect(serialized).not.toContain("\"state\"");
    expect(serialized).not.toContain("\"command\"");
    expect(serialized).not.toContain("\"payload\"");
    expect(serialized).not.toContain("\"verified\"");
    expect(serialized).not.toContain("Game.turn");
  });

  test("projects source-owned acted player evidence instead of caller validation player", async () => {
    const input = {
      ...narrativeInput,
      playerId: 2,
    };
    const fake = fakeContext(narrativeChoiceResult("narrative-blocker-cleared", {
      playerId: 0,
    }));

    const result = await call(
      Civ7ControlOrpcRouter.decisions.narrative.choice.request,
      input,
      { context: fake.context },
    );

    expect(fake.calls.request[0]?.input).toEqual(input);
    expect(result.playerId).toBe(0);
  });

  test("keeps sent no-state-change narrative choices no-repeat guarded", async () => {
    const fake = fakeContext(narrativeChoiceResult("no-state-change", {
      afterValid: true,
      verified: true,
    }));

    const result = await call(
      Civ7ControlOrpcRouter.decisions.narrative.choice.request,
      narrativeInput,
      { context: fake.context },
    );

    expect(result.status).toBe("sent-unverified");
    expect(result.postcondition).toMatchObject({
      classification: "no-state-change",
      outcome: "no-state-change",
      confidence: "unverified",
      confirmed: false,
      noRepeatAfterUnverified: true,
    });
    expect(result.nextSteps).toEqual([{
      kind: "do-not-repeat",
      source: "decisions.narrative.choice.request",
      label: "Do not repeat this narrative choice request until fresh attention and narrative evidence is read.",
    }]);
  });

  test("projects validator-blocked narrative choices as not-sent", async () => {
    const fake = fakeContext(narrativeChoiceResult("not-sent", {
      sent: false,
      beforeValid: false,
      afterValid: false,
      verified: false,
    }));

    const result = await call(
      Civ7ControlOrpcRouter.decisions.narrative.choice.request,
      narrativeInput,
      { context: fake.context },
    );

    expect(result).toMatchObject({
      sent: false,
      status: "not-sent",
      validation: {
        beforeValid: false,
        afterValid: false,
      },
      postcondition: {
        classification: "not-sent",
        outcome: "not-sent",
        confidence: "unverified",
        noRepeatAfterUnverified: true,
      },
    });
    expect(result.nextSteps).toEqual([{
      kind: "inspect-narrative-choice",
      source: "decisions.narrative.choice.request",
      label: "Inspect current attention and narrative choice state before attempting another narrative request.",
    }]);
  });

  test("requires approval before readiness or request execution", async () => {
    const fake = fakeContext(narrativeChoiceResult("narrative-blocker-cleared"), {
      approved: false,
    });

    await expect(
      call(
        Civ7ControlOrpcRouter.decisions.narrative.choice.request,
        narrativeInput,
        { context: fake.context },
      ),
    ).rejects.toMatchObject({
      code: "MUTATION_APPROVAL_REQUIRED",
      data: {
        procedureKey: "decisions.narrative.choice.request",
        source: "context.approval",
        risk: "mutation",
      },
    });
    expect(fake.calls.readiness).toEqual([]);
    expect(fake.calls.request).toEqual([]);
  });

  test("keeps endpoint/session/state/raw command fields out of procedure input", async () => {
    const invalidInputs = [
      { ...narrativeInput, host: "127.0.0.1" },
      { ...narrativeInput, port: 4318 },
      { ...narrativeInput, state: { role: "tuner" } },
      { ...narrativeInput, session: { state: "Tuner" } },
      { ...narrativeInput, command: "Game.turn" },
      { ...narrativeInput, rawCommand: "Game.turn" },
    ];

    for (const input of invalidInputs) {
      const fake = fakeContext(narrativeChoiceResult("narrative-blocker-cleared"));

      await expect(
        call(
          Civ7ControlOrpcRouter.decisions.narrative.choice.request,
          input as never,
          { context: fake.context },
        ),
      ).rejects.toMatchObject({ code: "BAD_REQUEST" });
      expect(fake.calls.readiness).toEqual([]);
      expect(fake.calls.request).toEqual([]);
    }
  });

  test("maps source failures to a tagged Effect/oRPC error without raw details", async () => {
    const context = fakeContext(narrativeChoiceResult("narrative-blocker-cleared")).context;
    const failingContext: Civ7ControlOrpcContext = {
      ...context,
      directControl: {
        ...context.directControl,
        requestCiv7NarrativeChoice: async () => {
          throw new Error(
            "Timed out waiting for Civ7 tuner response to CMD:1:Game.turn",
          );
        },
      },
    };

    await expect(
      call(
        Civ7ControlOrpcRouter.decisions.narrative.choice.request,
        narrativeInput,
        { context: failingContext },
      ),
    ).rejects.toMatchObject({
      code: "NARRATIVE_CHOICE_UNAVAILABLE",
      status: 503,
      data: {
        procedureKey: "decisions.narrative.choice.request",
        source: "direct-control-facade",
      },
    });

    try {
      await call(
        Civ7ControlOrpcRouter.decisions.narrative.choice.request,
        narrativeInput,
        { context: failingContext },
      );
    } catch (err) {
      const serialized = JSON.stringify(err);
      expect(serialized).not.toContain("CMD");
      expect(serialized).not.toContain("Game.turn");
      expect(serialized).not.toContain("rawCommand");
      expect(serialized).not.toContain("command-failed");
    }
  });

  test("supports the in-process server-side router client", async () => {
    const fake = fakeContext(narrativeChoiceResult("narrative-panel-cleared"));
    const client = createCiv7ControlOrpcServerClient(fake.context);

    const result = await client.decisions.narrative.choice.request(narrativeInput);

    expect(result.status).toBe("sent-confirmed");
    expect(result.postcondition.outcome).toBe("state-changed");
  });

  test("publishes a contract-first narrative decision service leaf", () => {
    expect(
      Civ7ControlOrpcContract.decisions.narrative.choice.request["~orpc"],
    ).toMatchObject({
      meta: {
        family: "decisions",
        procedureKey: "decisions.narrative.choice.request",
        proofBoundary: "local-package-test",
        risk: "mutation",
      },
    });
    expect(
      Civ7ControlOrpcContract.decisions.narrative.choice.request["~orpc"].errorMap,
    ).toHaveProperty("NARRATIVE_CHOICE_UNAVAILABLE");
    expect(Civ7NarrativeChoiceUnavailableError.code).toBe(
      "NARRATIVE_CHOICE_UNAVAILABLE",
    );
  });
});

function fakeContext(
  result: Civ7ControlOrpcNarrativeChoiceResult,
  options: Partial<{ approved: boolean; playable: boolean }> = {},
): {
  calls: {
    readiness: Array<Civ7ControlOrpcContext["endpointDefaults"]>;
    request: Array<Readonly<{
      input: unknown;
      options: Civ7ControlOrpcContext["endpointDefaults"];
      approval: Civ7ControlOrpcContext["approval"];
    }>>;
  };
  context: Civ7ControlOrpcContext;
} {
  const calls = {
    readiness: [] as Array<Civ7ControlOrpcContext["endpointDefaults"]>,
    request: [] as Array<Readonly<{
      input: unknown;
      options: Civ7ControlOrpcContext["endpointDefaults"];
      approval: Civ7ControlOrpcContext["approval"];
    }>>,
  };

  return {
    calls,
    context: {
      approval: options.approved === false
        ? undefined
        : { approved: true, reason: "local narrative choice proof" },
      endpointDefaults: {
        host: "127.0.0.1",
        port: 4318,
        timeoutMs: 1_000,
      },
      directControl: {
        getCiv7PlayableStatus: async (endpointDefaults) => {
          calls.readiness.push(endpointDefaults);
          return playableStatusResult(options.playable ?? true);
        },
        requestCiv7NarrativeChoice: async (input, endpointDefaults, approval) => {
          calls.request.push({ input, options: endpointDefaults, approval });
          return result;
        },
      } as Civ7ControlOrpcContext["directControl"],
    },
  };
}

function narrativeChoiceResult(
  classification: Civ7ControlOrpcNarrativeChoiceResult["postcondition"]["classification"],
  options: Partial<{
    playerId: number;
    sent: boolean;
    beforeValid: boolean;
    afterValid: boolean;
    verified: boolean;
  }> = {},
): Civ7ControlOrpcNarrativeChoiceResult {
  const sent = options.sent ?? classification !== "not-sent";
  return {
    playerId: options.playerId ?? narrativeInput.playerId,
    before: {} as Civ7ControlOrpcNarrativeChoiceResult["before"],
    beforeValidation: {
      valid: options.beforeValid ?? classification !== "not-sent",
      result: {},
    } as Civ7ControlOrpcNarrativeChoiceResult["beforeValidation"],
    command: sent
      ? ({
          host: "127.0.0.1",
          port: 4318,
          state: { id: "65535", name: "App UI" },
          output: "Game.turn should remain hidden",
        } as unknown as Civ7ControlOrpcNarrativeChoiceResult["command"])
      : undefined,
    payload: sent
      ? ({
          sent: true,
          rawCommand: "Game.turn",
        } as unknown as Civ7ControlOrpcNarrativeChoiceResult["payload"])
      : undefined,
    after: {} as Civ7ControlOrpcNarrativeChoiceResult["after"],
    afterValidation: {
      valid: options.afterValid ?? false,
      result: {},
    } as Civ7ControlOrpcNarrativeChoiceResult["afterValidation"],
    sent,
    verified: options.verified ?? (
      classification !== "not-sent" && classification !== "no-state-change"
    ),
    postcondition: {
      classification,
      reason: `${classification} reason`,
    },
  };
}

function playableStatusResult(playable: boolean): Civ7ControlOrpcPlayableStatusResult {
  return {
    host: "127.0.0.1",
    port: 4318,
    playable,
    readiness: playable ? "tuner-ready" : "shell",
    appUi: {
      host: "127.0.0.1",
      port: 4318,
      state: { id: "65535", name: "App UI" },
      snapshot: {
        ui: {
          inGame: { ok: true, value: playable },
          inShell: { ok: true, value: !playable },
          inLoading: { ok: true, value: false },
          canBeginGame: { ok: true, value: false },
        },
        errors: [],
      },
    },
    tuner: {
      host: "127.0.0.1",
      port: 4318,
      ready: playable,
      states: [],
      errors: [],
    },
    errors: [],
  };
}
