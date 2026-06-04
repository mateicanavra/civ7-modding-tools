import { describe, expect, test } from "vitest";
import { Value } from "typebox/value";

import {
  Civ7ProcedureCoreDescriptorSchema,
  assertCiv7ProcedureCoreDescriptor,
  createCiv7ProcedureCoreDescriptor,
  isCiv7ProcedureCoreDescriptor,
  summarizeCiv7ProcedureCoreDescriptor,
  type Civ7ProcedureCoreDescriptor,
} from "../src/index";

const readyUnitDescriptor: Civ7ProcedureCoreDescriptor = {
  procedureKey: "unit.ready.view",
  family: "unit",
  risk: "read",
  atomOwner: "packages/civ7-direct-control/src/play/ready/unit.ts",
  atomFunction: "getCiv7ReadyUnitView",
  inputFields: ["requestedUnitId", "playerId"],
  outputFields: ["readyUnit", "operationCandidates", "promotionReadiness"],
  playerScope: "local-player-scoped",
  consumerClasses: [
    "normal-cli-player-agent-view",
    "effect-orpc-procedure-core",
  ],
  proofBoundary: "local-package-test",
  projection: {
    normalCli: "semantic-projection",
    debugService: "omitted",
    aiIngestion: "blocked-until-ingestion-contract",
    telemetry: "blocked-until-procedure-middleware",
    procedureCore: "typed-procedure-core",
  },
};

describe("Civ7 procedure-core descriptor owner", () => {
  test("defines a typed no-network procedure descriptor over a stable direct-control atom", () => {
    const descriptor = createCiv7ProcedureCoreDescriptor(readyUnitDescriptor);
    const summary = summarizeCiv7ProcedureCoreDescriptor(descriptor);

    expect(Value.Check(Civ7ProcedureCoreDescriptorSchema, descriptor)).toBe(true);
    expect(isCiv7ProcedureCoreDescriptor(descriptor)).toBe(true);
    expect(assertCiv7ProcedureCoreDescriptor(descriptor)).toEqual(descriptor);
    expect(summary).toMatchObject({
      procedureKey: "unit.ready.view",
      family: "unit",
      risk: "read",
      atomOwner: "packages/civ7-direct-control/src/play/ready/unit.ts",
      atomFunction: "getCiv7ReadyUnitView",
      normalCliProjection: "semantic-projection",
      debugServiceProjection: "omitted",
      aiIngestionProjection: "blocked-until-ingestion-contract",
      telemetryProjection: "blocked-until-procedure-middleware",
      procedureCoreProjection: "typed-procedure-core",
      mutationGates: {
        approvalGate: false,
        validatorFirst: false,
        postconditionRequired: false,
        noRepeatAfterUnverified: false,
      },
    });
  });

  test("runtime-validates descriptor shape before semantic procedure guards", () => {
    expect(isCiv7ProcedureCoreDescriptor({
      ...readyUnitDescriptor,
      projection: {
        ...readyUnitDescriptor.projection,
        procedureCore: "raw-command-tunnel",
      },
    })).toBe(false);

    expect(() => assertCiv7ProcedureCoreDescriptor({
      ...readyUnitDescriptor,
      consumerClasses: ["effect-orpc-procedure-core", "raw-cli-output"],
    })).toThrow(/does not match the Civ7 procedure-core descriptor schema/);

    expect(() => createCiv7ProcedureCoreDescriptor({
      ...readyUnitDescriptor,
      inputFields: "rawCommand",
    } as unknown as Civ7ProcedureCoreDescriptor)).toThrow(
      /does not match the Civ7 procedure-core descriptor schema/,
    );

    expect(() => createCiv7ProcedureCoreDescriptor({
      ...readyUnitDescriptor,
      debugRawCommand: "Game.GetLocalPlayer()",
    } as unknown as Civ7ProcedureCoreDescriptor)).toThrow(
      /does not match the Civ7 procedure-core descriptor schema/,
    );
  });

  test("rejects raw command tunnel descriptors before they can become oRPC procedures", () => {
    expect(() => createCiv7ProcedureCoreDescriptor({
      ...readyUnitDescriptor,
      inputFields: ["rawCommand", "stateName"],
    })).toThrow(/raw command tunnel fields: rawCommand, stateName/);

    expect(() => createCiv7ProcedureCoreDescriptor({
      ...readyUnitDescriptor,
      procedureKey: "unit.control.call",
    })).toThrow(/raw command tunnel fields: unit\.control\.call/);

    expect(() => createCiv7ProcedureCoreDescriptor({
      ...readyUnitDescriptor,
      atomOwner: "packages/civ7-direct-control/src/runtime/command-serialization.ts",
      atomFunction: "jsLiteral",
    })).toThrow(/raw command tunnel fields: .*command-serialization.*jsLiteral/);

    expect(() => createCiv7ProcedureCoreDescriptor({
      ...readyUnitDescriptor,
      atomOwner: "packages/civ7-direct-control/src/session/execute.ts",
      atomFunction: "executeCiv7Command",
    })).toThrow(/raw command tunnel fields: .*session\/execute.*executeCiv7Command/);
  });

  test("requires mutation procedures to carry approval, validator, postcondition, and no-repeat gates", () => {
    const productionMutation: Civ7ProcedureCoreDescriptor = {
      ...readyUnitDescriptor,
      procedureKey: "choices.production.request",
      family: "choices",
      risk: "mutation",
      atomOwner: "packages/civ7-direct-control/src/play/operations/production-choice.ts",
      atomFunction: "requestCiv7ProductionChoice",
      inputFields: ["cityId", "constructibleType", "approvalReason"],
      outputFields: ["postcondition", "outcomeDelta", "blockerDelta"],
      projection: {
        normalCli: "semantic-projection",
        debugService: "proof-diagnostic-projection",
        aiIngestion: "blocked-until-ingestion-contract",
        telemetry: "effect-orpc-middleware-hook",
        procedureCore: "typed-procedure-core",
      },
    };

    expect(() => createCiv7ProcedureCoreDescriptor(productionMutation)).toThrow(
      /approvalGate, validatorFirst, postconditionRequired, noRepeatAfterUnverified/,
    );

    const descriptor = createCiv7ProcedureCoreDescriptor({
      ...productionMutation,
      approvalGate: true,
      validatorFirst: true,
      postconditionRequired: true,
      noRepeatAfterUnverified: true,
    });

    expect(summarizeCiv7ProcedureCoreDescriptor(descriptor).mutationGates).toEqual({
      approvalGate: true,
      validatorFirst: true,
      postconditionRequired: true,
      noRepeatAfterUnverified: true,
    });
  });

  test("keeps procedure telemetry as a middleware hook instead of a separate transport surface", () => {
    const descriptor = createCiv7ProcedureCoreDescriptor({
      ...readyUnitDescriptor,
      procedureKey: "runtime.playable.status",
      family: "runtime",
      atomOwner: "packages/civ7-direct-control/src/runtime/playable-status.ts",
      atomFunction: "getCiv7PlayableStatus",
      inputFields: ["stateRole"],
      outputFields: ["appUi", "tuner", "playable"],
      playerScope: "debug-observer-only",
      consumerClasses: [
        "debug-internal-service-output",
        "effect-orpc-procedure-core",
        "runtime-proof-support",
      ],
      projection: {
        normalCli: "summarized-state-machine-status",
        debugService: "raw-diagnostic-projection",
        aiIngestion: "omitted",
        telemetry: "effect-orpc-middleware-hook",
        procedureCore: "typed-procedure-core",
      },
    });

    expect(summarizeCiv7ProcedureCoreDescriptor(descriptor)).toMatchObject({
      procedureKey: "runtime.playable.status",
      telemetryProjection: "effect-orpc-middleware-hook",
      procedureCoreProjection: "typed-procedure-core",
    });
  });
});
