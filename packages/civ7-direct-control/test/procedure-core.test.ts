import { describe, expect, test } from "vitest";
import { Value } from "typebox/value";

import {
  Civ7ProcedureCoreDescriptorSchema,
  Civ7DirectControlError,
  Civ7ReadyUnitViewInputSchema,
  Civ7ReadyUnitViewProcedureDescriptor,
  Civ7ReadyUnitViewProcedureSchemaArtifacts,
  Civ7ReadyUnitViewResultSchema,
  Civ7UnitMovePreviewProcedureDescriptor,
  Civ7UnitMovePreviewProcedureSchemaArtifacts,
  assertCiv7ProcedureCoreDescriptor,
  civ7ProcedureSchemaReferenceKey,
  createCiv7ProcedureCoreDescriptor,
  isCiv7ProcedureCoreDescriptor,
  resolveCiv7ProcedureCoreSchemas,
  summarizeCiv7ProcedureCoreDescriptor,
  validateCiv7ProcedureCoreInput,
  validateCiv7ProcedureCoreOutput,
  type Civ7ProcedureCoreDescriptor,
} from "../src/index";

const readyUnitDescriptor: Civ7ProcedureCoreDescriptor = {
  procedureKey: "unit.ready.view",
  family: "unit",
  risk: "read",
  atomOwner: "packages/civ7-direct-control/src/play/ready/unit.ts",
  atomFunction: "getCiv7ReadyUnitView",
  inputSchema: {
    owner: "packages/civ7-direct-control/src/play/ready/unit.ts",
    exportName: "Civ7ReadyUnitViewInputSchema",
  },
  outputSchema: {
    owner: "packages/civ7-direct-control/src/play/ready/unit.ts",
    exportName: "Civ7ReadyUnitViewResultSchema",
  },
  inputFields: ["unitId", "radius", "maxOperations"],
  outputFields: ["unitId", "unit", "legalOperations", "promotionReadiness", "nearby"],
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
  correlation: {
    idSource: "generated-per-call",
    normalCli: "omitted-by-default",
    debugService: "included-in-diagnostics",
    telemetry: "omitted",
  },
  context: [
    "direct-control-facade",
    "endpoint-defaults",
    "state-selection",
    "logger",
    "evidence-sink",
  ],
};

function captureDescriptorError(fn: () => unknown): Civ7DirectControlError {
  try {
    fn();
  } catch (err) {
    expect(err).toBeInstanceOf(Civ7DirectControlError);
    return err as Civ7DirectControlError;
  }
  throw new Error("Expected descriptor error");
}

const readyUnitOutput = {
  host: "127.0.0.1",
  port: 4318,
  state: {
    id: "app-ui",
    name: "App UI",
  },
  localPlayerId: 0,
  requestedUnitId: null,
  selectedUnitId: { ok: true, value: null },
  firstReadyUnitId: { ok: true, value: null },
  unitId: null,
  unit: { ok: true, value: null },
  legalOperations: [],
  promotionReadiness: { ok: true, value: null },
  nearby: { ok: true, value: [] },
  notes: [],
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
      inputSchema: {
        owner: "packages/civ7-direct-control/src/play/ready/unit.ts",
        exportName: "Civ7ReadyUnitViewInputSchema",
      },
      outputSchema: {
        owner: "packages/civ7-direct-control/src/play/ready/unit.ts",
        exportName: "Civ7ReadyUnitViewResultSchema",
      },
      normalCliProjection: "semantic-projection",
      debugServiceProjection: "omitted",
      aiIngestionProjection: "blocked-until-ingestion-contract",
      telemetryProjection: "blocked-until-procedure-middleware",
      procedureCoreProjection: "typed-procedure-core",
      correlation: {
        idSource: "generated-per-call",
        normalCli: "omitted-by-default",
        debugService: "included-in-diagnostics",
        telemetry: "omitted",
      },
      context: [
        "direct-control-facade",
        "endpoint-defaults",
        "state-selection",
        "logger",
        "evidence-sink",
      ],
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

    expect(() => assertCiv7ProcedureCoreDescriptor({
      ...readyUnitDescriptor,
      correlation: {
        ...readyUnitDescriptor.correlation,
        normalCli: "visible-in-normal-output",
      },
    })).toThrow(/does not match the Civ7 procedure-core descriptor schema/);

    expect(() => assertCiv7ProcedureCoreDescriptor({
      ...readyUnitDescriptor,
      context: ["direct-control-facade", "raw-socket"],
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

  test("keeps endpoint and session selection in context instead of procedure input", () => {
    expect(createCiv7ProcedureCoreDescriptor(readyUnitDescriptor).context).toEqual([
      "direct-control-facade",
      "endpoint-defaults",
      "state-selection",
      "logger",
      "evidence-sink",
    ]);

    const endpointInputError = captureDescriptorError(() => createCiv7ProcedureCoreDescriptor({
      ...readyUnitDescriptor,
      inputFields: ["unitId", "host", "port"],
    }));
    expect(endpointInputError).toMatchObject({
      code: "procedure-descriptor-invalid",
      details: {
        reason: "context-owned-input-field",
        procedureKey: "unit.ready.view",
        fields: ["host", "port"],
      },
    });

    const stateInputError = captureDescriptorError(() => createCiv7ProcedureCoreDescriptor({
      ...readyUnitDescriptor,
      inputFields: ["unitId", "state"],
    }));
    expect(stateInputError).toMatchObject({
      code: "procedure-descriptor-invalid",
      details: {
        reason: "context-owned-input-field",
        procedureKey: "unit.ready.view",
        fields: ["state"],
      },
    });
  });

  test("reports descriptor failures with typed direct-control error details", () => {
    const schemaError = captureDescriptorError(() => assertCiv7ProcedureCoreDescriptor({
      ...readyUnitDescriptor,
      projection: {
        ...readyUnitDescriptor.projection,
        procedureCore: "raw-command-tunnel",
      },
    }));
    expect(schemaError).toMatchObject({
      name: "Civ7DirectControlError",
      code: "procedure-descriptor-invalid",
      details: {
        reason: "schema-mismatch",
        label: "Civ7 procedure descriptor",
      },
    });

    const rawTunnelError = captureDescriptorError(() => createCiv7ProcedureCoreDescriptor({
      ...readyUnitDescriptor,
      atomOwner: "packages/civ7-direct-control/src/session/execute.ts",
      atomFunction: "executeCiv7Command",
    }));
    expect(rawTunnelError).toMatchObject({
      code: "procedure-descriptor-invalid",
      details: {
        reason: "raw-command-tunnel",
        procedureKey: "unit.ready.view",
        fields: [
          "packages/civ7-direct-control/src/session/execute.ts",
          "executeCiv7Command",
        ],
      },
    });

    const missingGatesError = captureDescriptorError(() => createCiv7ProcedureCoreDescriptor({
      ...readyUnitDescriptor,
      procedureKey: "choices.production.request",
      family: "choices",
      risk: "mutation",
    }));
    expect(missingGatesError).toMatchObject({
      code: "procedure-descriptor-invalid",
      details: {
        reason: "mutation-gates-missing",
        procedureKey: "choices.production.request",
        missingGates: [
          "approvalGate",
          "validatorFirst",
          "postconditionRequired",
          "noRepeatAfterUnverified",
        ],
      },
    });
  });

  test("binds procedure descriptors to direct-control schema owners", () => {
    const descriptor = createCiv7ProcedureCoreDescriptor(readyUnitDescriptor);
    expect(summarizeCiv7ProcedureCoreDescriptor(descriptor)).toMatchObject({
      inputSchema: {
        owner: "packages/civ7-direct-control/src/play/ready/unit.ts",
        exportName: "Civ7ReadyUnitViewInputSchema",
      },
      outputSchema: {
        owner: "packages/civ7-direct-control/src/play/ready/unit.ts",
        exportName: "Civ7ReadyUnitViewResultSchema",
      },
    });

    const outsideOwner = captureDescriptorError(() => createCiv7ProcedureCoreDescriptor({
      ...readyUnitDescriptor,
      inputSchema: {
        owner: "packages/cli/src/commands/game/play/ready-unit.ts",
        exportName: "Civ7ReadyUnitViewInputSchema",
      },
    }));
    expect(outsideOwner).toMatchObject({
      code: "procedure-descriptor-invalid",
      details: {
        reason: "schema-owner-outside-direct-control",
        procedureKey: "unit.ready.view",
        role: "inputSchema",
      },
    });

    const invalidExport = captureDescriptorError(() => createCiv7ProcedureCoreDescriptor({
      ...readyUnitDescriptor,
      inputSchema: {
        owner: "packages/civ7-direct-control/src/play/ready/unit.ts",
        exportName: "Civ7ReadyUnitViewInputSchema()",
      },
    }));
    expect(invalidExport).toMatchObject({
      code: "procedure-descriptor-invalid",
      details: {
        reason: "schema-export-invalid",
        procedureKey: "unit.ready.view",
        role: "inputSchema",
      },
    });

    expect(() => createCiv7ProcedureCoreDescriptor({
      ...readyUnitDescriptor,
      outputSchema: {
        owner: "packages/civ7-direct-control/src/runtime/command-serialization.ts",
        exportName: "jsLiteral",
      },
    })).toThrow(/raw command tunnel fields: .*command-serialization.*jsLiteral/);
  });

  test("resolves descriptor schema references against explicit schema artifacts", () => {
    const resolved = resolveCiv7ProcedureCoreSchemas(readyUnitDescriptor, {
      [civ7ProcedureSchemaReferenceKey(readyUnitDescriptor.inputSchema)]: Civ7ReadyUnitViewInputSchema,
      [civ7ProcedureSchemaReferenceKey(readyUnitDescriptor.outputSchema)]: Civ7ReadyUnitViewResultSchema,
    });

    expect(resolved).toMatchObject({
      procedureKey: "unit.ready.view",
      inputSchema: Civ7ReadyUnitViewInputSchema,
      outputSchema: Civ7ReadyUnitViewResultSchema,
    });

    const staleOutputField = captureDescriptorError(() => resolveCiv7ProcedureCoreSchemas({
      ...readyUnitDescriptor,
      outputFields: ["unitId", "operationCandidates"],
    }, {
      [civ7ProcedureSchemaReferenceKey(readyUnitDescriptor.inputSchema)]: Civ7ReadyUnitViewInputSchema,
      [civ7ProcedureSchemaReferenceKey(readyUnitDescriptor.outputSchema)]: Civ7ReadyUnitViewResultSchema,
    }));
    expect(staleOutputField).toMatchObject({
      code: "procedure-descriptor-invalid",
      details: {
        reason: "schema-field-unresolved",
        procedureKey: "unit.ready.view",
        role: "outputFields",
        missingFields: ["operationCandidates"],
      },
    });

    const unresolvedOutput = captureDescriptorError(() => resolveCiv7ProcedureCoreSchemas(readyUnitDescriptor, {
      [civ7ProcedureSchemaReferenceKey(readyUnitDescriptor.inputSchema)]: Civ7ReadyUnitViewInputSchema,
    }));
    expect(unresolvedOutput).toMatchObject({
      code: "procedure-descriptor-invalid",
      details: {
        reason: "schema-reference-unresolved",
        procedureKey: "unit.ready.view",
        role: "outputSchema",
        owner: "packages/civ7-direct-control/src/play/ready/unit.ts",
        exportName: "Civ7ReadyUnitViewResultSchema",
      },
    });
  });

  test("validates procedure inputs against resolved schema artifacts without executing atoms", () => {
    const readyInput = {
      unitId: { owner: 0, id: 458752, type: 26 },
      radius: 2,
      maxOperations: 96,
    };
    expect(validateCiv7ProcedureCoreInput(
      Civ7ReadyUnitViewProcedureDescriptor,
      Civ7ReadyUnitViewProcedureSchemaArtifacts,
      readyInput,
    )).toBe(readyInput);

    const boundedInputError = captureDescriptorError(() => validateCiv7ProcedureCoreInput(
      Civ7ReadyUnitViewProcedureDescriptor,
      Civ7ReadyUnitViewProcedureSchemaArtifacts,
      { radius: 6 },
    ));
    expect(boundedInputError).toMatchObject({
      code: "procedure-descriptor-invalid",
      details: {
        reason: "input-schema-invalid",
        procedureKey: "unit.ready.view",
        role: "input",
        schemaReference: Civ7ReadyUnitViewProcedureDescriptor.inputSchema,
      },
    });
    expect((boundedInputError.details as { errors: Array<{ message: string }> }).errors).toEqual(
      expect.arrayContaining([expect.objectContaining({ message: "must be <= 5" })]),
    );

    const rawInputError = captureDescriptorError(() => validateCiv7ProcedureCoreInput(
      Civ7ReadyUnitViewProcedureDescriptor,
      Civ7ReadyUnitViewProcedureSchemaArtifacts,
      { rawCommand: "Game.turn" },
    ));
    expect(rawInputError).toMatchObject({
      code: "procedure-descriptor-invalid",
      details: {
        reason: "input-schema-invalid",
        procedureKey: "unit.ready.view",
        role: "input",
      },
    });
  });

  test("inherits bounded direct-control atom validators through procedure input validation", () => {
    expect(validateCiv7ProcedureCoreInput(
      Civ7UnitMovePreviewProcedureDescriptor,
      Civ7UnitMovePreviewProcedureSchemaArtifacts,
      {
        unitId: { owner: 0, id: 65536, type: 26 },
        destination: { x: 25, y: 35 },
        maxPlots: 12,
        maxPathPlots: 8,
      },
    )).toMatchObject({
      destination: { x: 25, y: 35 },
    });

    for (const destination of [
      { x: 1.5, y: 0 },
      { x: -1, y: 0 },
      { x: 0, y: 1_000_001 },
    ]) {
      const error = captureDescriptorError(() => validateCiv7ProcedureCoreInput(
        Civ7UnitMovePreviewProcedureDescriptor,
        Civ7UnitMovePreviewProcedureSchemaArtifacts,
        { destination },
      ));
      expect(error).toMatchObject({
        code: "procedure-descriptor-invalid",
        details: {
          reason: "input-schema-invalid",
          procedureKey: "unit.move.preview",
          role: "input",
          schemaReference: Civ7UnitMovePreviewProcedureDescriptor.inputSchema,
        },
      });
    }
  });

  test("validates procedure outputs against resolved schema artifacts without exposing raw internals", () => {
    expect(validateCiv7ProcedureCoreOutput(
      Civ7ReadyUnitViewProcedureDescriptor,
      Civ7ReadyUnitViewProcedureSchemaArtifacts,
      readyUnitOutput,
    )).toBe(readyUnitOutput);

    const outputError = captureDescriptorError(() => validateCiv7ProcedureCoreOutput(
      Civ7ReadyUnitViewProcedureDescriptor,
      Civ7ReadyUnitViewProcedureSchemaArtifacts,
      {
        ...readyUnitOutput,
        rawCommand: "readReadyUnitView()",
      },
    ));
    expect(outputError).toMatchObject({
      code: "procedure-descriptor-invalid",
      details: {
        reason: "output-schema-invalid",
        procedureKey: "unit.ready.view",
        role: "output",
        schemaReference: Civ7ReadyUnitViewProcedureDescriptor.outputSchema,
      },
    });
  });

  test("keeps live runtime proof claims out of local procedure descriptors", () => {
    expect(createCiv7ProcedureCoreDescriptor({
      ...readyUnitDescriptor,
      proofBoundary: "pending-runtime-proof",
    }).proofBoundary).toBe("pending-runtime-proof");

    const liveProofError = captureDescriptorError(() => createCiv7ProcedureCoreDescriptor({
      ...readyUnitDescriptor,
      proofBoundary: "live-runtime-proof",
      consumerClasses: [
        ...readyUnitDescriptor.consumerClasses,
        "runtime-proof-support",
      ],
    }));

    expect(liveProofError).toMatchObject({
      code: "procedure-descriptor-invalid",
      details: {
        reason: "live-runtime-proof-unsupported",
        procedureKey: "unit.ready.view",
        proofBoundary: "live-runtime-proof",
      },
    });
  });

  test("rejects raw command tunnel descriptors before they can become oRPC procedures", () => {
    expect(() => createCiv7ProcedureCoreDescriptor({
      ...readyUnitDescriptor,
      inputFields: ["rawCommand", "stateName"],
    })).toThrow(/raw command tunnel fields: rawCommand, stateName/);

    const sessionFieldError = captureDescriptorError(() => createCiv7ProcedureCoreDescriptor({
      ...readyUnitDescriptor,
      inputFields: ["session"],
    }));
    expect(sessionFieldError).toMatchObject({
      code: "procedure-descriptor-invalid",
      details: {
        reason: "raw-command-tunnel",
        procedureKey: "unit.ready.view",
        fields: ["session"],
      },
    });

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
      correlation: {
        idSource: "caller-provided-and-validated",
        normalCli: "omitted-by-default",
        debugService: "included-in-diagnostics",
        telemetry: "attached-when-procedure-telemetry-enabled",
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
      correlation: {
        idSource: "generated-per-call",
        normalCli: "omitted-by-default",
        debugService: "included-in-diagnostics",
        telemetry: "attached-when-procedure-telemetry-enabled",
      },
    });

    expect(summarizeCiv7ProcedureCoreDescriptor(descriptor)).toMatchObject({
      procedureKey: "runtime.playable.status",
      telemetryProjection: "effect-orpc-middleware-hook",
      procedureCoreProjection: "typed-procedure-core",
      correlation: {
        normalCli: "omitted-by-default",
        debugService: "included-in-diagnostics",
        telemetry: "attached-when-procedure-telemetry-enabled",
      },
    });
  });
});
