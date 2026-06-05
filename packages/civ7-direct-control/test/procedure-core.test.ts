import { describe, expect, test } from "vitest";
import { Value } from "typebox/value";

import {
  Civ7ProcedureCoreDescriptorSchema,
  Civ7ProcedureCoreCallDiagnosticsSchema,
  Civ7ProcedureCoreCallContextSchema,
  Civ7ProcedureCoreCallEnvelopeSchema,
  Civ7ProcedureCoreCallResultSchema,
  Civ7DirectControlError,
  Civ7ProcedureCoreErrorSummarySchema,
  Civ7ProcedureSchemaTechnologySchema,
  Civ7ReadyUnitViewInputSchema,
  Civ7ReadyUnitViewProcedureDescriptor,
  Civ7ReadyUnitViewProcedureSchemaArtifacts,
  Civ7ReadyUnitViewResultSchema,
  Civ7UnitMovePreviewProcedureDescriptor,
  Civ7UnitMovePreviewProcedureSchemaArtifacts,
  assertCiv7ProcedureCoreDescriptor,
  callCiv7ProcedureCore,
  civ7ProcedureSchemaReferenceKey,
  createCiv7ProcedureCoreDescriptor,
  isCiv7ProcedureCoreDescriptor,
  resolveCiv7ProcedureCoreSchemas,
  settleCiv7ProcedureCoreCall,
  summarizeCiv7ProcedureCoreDescriptor,
  summarizeCiv7ProcedureCoreError,
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
  schemaTechnology: "typebox",
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

async function captureProcedureError(fn: () => Promise<unknown>): Promise<Civ7DirectControlError> {
  try {
    await fn();
  } catch (err) {
    expect(err).toBeInstanceOf(Civ7DirectControlError);
    return err as Civ7DirectControlError;
  }
  throw new Error("Expected procedure error");
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
      schemaTechnology: "typebox",
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
        validatorFirst: false,
        postconditionRequired: false,
        noRepeatAfterUnverified: false,
      },
    });
  });

  test("accepts player as an operational procedure family without weakening family-key matching", () => {
    const playerDescriptor = createCiv7ProcedureCoreDescriptor({
      ...readyUnitDescriptor,
      procedureKey: "player.summary.read",
      family: "player",
      atomOwner: "packages/civ7-direct-control/src/play/summaries.ts",
      atomFunction: "getCiv7PlayerSummary",
      inputSchema: {
        owner: "packages/civ7-direct-control/src/play/summaries.ts",
        exportName: "Civ7PlayerSummaryInputSchema",
      },
      outputSchema: {
        owner: "packages/civ7-direct-control/src/play/summaries.ts",
        exportName: "Civ7PlayerSummaryResultSchema",
      },
      inputFields: ["playerIds", "includeUnits", "includeCities", "maxItems"],
      outputFields: ["host", "port", "state", "players", "omitted"],
    });

    expect(summarizeCiv7ProcedureCoreDescriptor(playerDescriptor)).toMatchObject({
      procedureKey: "player.summary.read",
      family: "player",
      atomFunction: "getCiv7PlayerSummary",
    });

    const mismatchError = captureDescriptorError(() => createCiv7ProcedureCoreDescriptor({
      ...playerDescriptor,
      procedureKey: "unit.summary.read",
    }));
    expect(mismatchError).toMatchObject({
      code: "procedure-descriptor-invalid",
      details: {
        reason: "family-mismatch",
        procedureKey: "unit.summary.read",
        family: "player",
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
      schemaTechnology: "json-schema",
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

  test("records TypeBox as the current procedure schema technology and rejects unaccepted alternatives", () => {
    expect(Value.Check(Civ7ProcedureSchemaTechnologySchema, "typebox")).toBe(true);
    expect(Value.Check(Civ7ProcedureSchemaTechnologySchema, "effect-schema")).toBe(true);
    expect(Value.Check(Civ7ProcedureSchemaTechnologySchema, "zod-adapter")).toBe(true);
    expect(Value.Check(Civ7ProcedureSchemaTechnologySchema, "json-schema")).toBe(false);

    expect(summarizeCiv7ProcedureCoreDescriptor(readyUnitDescriptor)).toMatchObject({
      procedureKey: "unit.ready.view",
      schemaTechnology: "typebox",
    });

    const effectSchemaError = captureDescriptorError(() => createCiv7ProcedureCoreDescriptor({
      ...readyUnitDescriptor,
      schemaTechnology: "effect-schema",
    }));
    expect(effectSchemaError).toMatchObject({
      code: "procedure-descriptor-invalid",
      details: {
        reason: "schema-technology-unaccepted",
        procedureKey: "unit.ready.view",
        schemaTechnology: "effect-schema",
        acceptedTechnology: "typebox",
      },
    });

    const zodAdapterError = captureDescriptorError(() => createCiv7ProcedureCoreDescriptor({
      ...readyUnitDescriptor,
      schemaTechnology: "zod-adapter",
    }));
    expect(zodAdapterError).toMatchObject({
      code: "procedure-descriptor-invalid",
      details: {
        reason: "schema-technology-unaccepted",
        procedureKey: "unit.ready.view",
        schemaTechnology: "zod-adapter",
        acceptedTechnology: "typebox",
      },
    });
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
          "validatorFirst",
          "postconditionRequired",
          "noRepeatAfterUnverified",
        ],
      },
    });
  });

  test("summarizes procedure-core errors without exposing raw cause details", async () => {
    const inputError = captureDescriptorError(() => validateCiv7ProcedureCoreInput(
      Civ7ReadyUnitViewProcedureDescriptor,
      Civ7ReadyUnitViewProcedureSchemaArtifacts,
      { radius: 6 },
    ));
    const inputSummary = summarizeCiv7ProcedureCoreError(inputError);
    expect(inputSummary).toEqual({
      code: "procedure-descriptor-invalid",
      message: "Civ7 procedure unit.ready.view input payload does not match the resolved schema",
      reason: "input-schema-invalid",
      procedureKey: "unit.ready.view",
      role: "input",
      schemaReference: Civ7ReadyUnitViewProcedureDescriptor.inputSchema,
    });
    expect(Value.Check(Civ7ProcedureCoreErrorSummarySchema, inputSummary)).toBe(true);

    const handlerError = await captureProcedureError(() => callCiv7ProcedureCore(
      Civ7ReadyUnitViewProcedureDescriptor,
      Civ7ReadyUnitViewProcedureSchemaArtifacts,
      { radius: 2 },
      () => {
        throw new Civ7DirectControlError(
          "command-failed",
          "Timed out waiting for Civ7 tuner response to CMD:1:Game.turn",
          {
            details: { rawCommand: "Game.turn" },
          },
        );
      },
      { correlationId: "corr-handler-failed" },
    ));
    const handlerSummary = summarizeCiv7ProcedureCoreError(handlerError);
    expect(handlerSummary).toEqual({
      code: "procedure-call-failed",
      message: "Civ7 procedure unit.ready.view handler failed",
      reason: "handler-failed",
      procedureKey: "unit.ready.view",
      correlationId: "corr-handler-failed",
      errorCode: "command-failed",
    });
    expect(Value.Check(Civ7ProcedureCoreErrorSummarySchema, handlerSummary)).toBe(true);
    expect(Value.Check(Civ7ProcedureCoreErrorSummarySchema, {
      ...handlerSummary,
      causeMessage: "Timed out waiting for Civ7 tuner response to CMD:1:Game.turn",
    })).toBe(false);
    const serializedHandlerSummary = JSON.stringify(handlerSummary);
    expect(handlerSummary).not.toHaveProperty("cause");
    expect(handlerSummary).not.toHaveProperty("causeMessage");
    expect(handlerSummary).not.toHaveProperty("rawCommand");
    expect(serializedHandlerSummary).not.toContain("CMD");
    expect(serializedHandlerSummary).not.toContain("Game.turn");
    expect(serializedHandlerSummary).not.toContain("rawCommand");
    expect(summarizeCiv7ProcedureCoreError(new Error("plain error"))).toBe(null);
  });

  test("settles procedure-core calls into JSON-safe success and error envelopes", async () => {
    const successEnvelope = await settleCiv7ProcedureCoreCall(callCiv7ProcedureCore(
      Civ7ReadyUnitViewProcedureDescriptor,
      Civ7ReadyUnitViewProcedureSchemaArtifacts,
      { radius: 2 },
      () => readyUnitOutput,
      { correlationId: "corr-envelope-success" },
    ));

    expect(successEnvelope).toMatchObject({
      ok: true,
      output: readyUnitOutput,
      diagnostics: {
        procedureKey: "unit.ready.view",
        correlationId: "corr-envelope-success",
        proofBoundary: "local-package-test",
        playerScope: "local-player-scoped",
      },
    });
    expect(Value.Check(Civ7ProcedureCoreCallEnvelopeSchema, successEnvelope)).toBe(true);
    expect(Value.Check(
      Civ7ProcedureCoreCallEnvelopeSchema,
      JSON.parse(JSON.stringify(successEnvelope)),
    )).toBe(true);

    const errorEnvelope = await settleCiv7ProcedureCoreCall(callCiv7ProcedureCore(
      Civ7ReadyUnitViewProcedureDescriptor,
      Civ7ReadyUnitViewProcedureSchemaArtifacts,
      { radius: 2 },
      () => {
        throw new Civ7DirectControlError(
          "command-failed",
          "Timed out waiting for Civ7 tuner response to CMD:1:Game.turn",
          { details: { rawCommand: "Game.turn" } },
        );
      },
      { correlationId: "corr-envelope-error" },
    ));

    expect(errorEnvelope).toEqual({
      ok: false,
      error: {
        code: "procedure-call-failed",
        message: "Civ7 procedure unit.ready.view handler failed",
        reason: "handler-failed",
        procedureKey: "unit.ready.view",
        correlationId: "corr-envelope-error",
        errorCode: "command-failed",
      },
    });
    expect(Value.Check(Civ7ProcedureCoreCallEnvelopeSchema, errorEnvelope)).toBe(true);
    const serializedErrorEnvelope = JSON.stringify(errorEnvelope);
    expect(Value.Check(
      Civ7ProcedureCoreCallEnvelopeSchema,
      JSON.parse(serializedErrorEnvelope),
    )).toBe(true);
    expect(serializedErrorEnvelope).not.toContain("CMD");
    expect(serializedErrorEnvelope).not.toContain("Game.turn");
    expect(serializedErrorEnvelope).not.toContain("rawCommand");

    await expect(settleCiv7ProcedureCoreCall(Promise.reject(new Error("plain failure"))))
      .rejects.toThrow(/plain failure/);
  });

  test("schemas the local procedure handler context without endpoint or raw command fields", async () => {
    let capturedContext: unknown;
    const result = await callCiv7ProcedureCore(
      Civ7ReadyUnitViewProcedureDescriptor,
      Civ7ReadyUnitViewProcedureSchemaArtifacts,
      { radius: 2 },
      (_input, context) => {
        capturedContext = context;
        return readyUnitOutput;
      },
      { correlationId: "corr-context-schema" },
    );

    expect(result.output).toEqual(readyUnitOutput);
    expect(capturedContext).toMatchObject({
      descriptor: Civ7ReadyUnitViewProcedureDescriptor,
      procedureKey: "unit.ready.view",
      correlationId: "corr-context-schema",
      proofBoundary: "local-package-test",
      playerScope: "local-player-scoped",
      context: [
        "direct-control-facade",
        "endpoint-defaults",
        "state-selection",
        "logger",
        "evidence-sink",
      ],
    });
    expect(Value.Check(Civ7ProcedureCoreCallContextSchema, capturedContext)).toBe(true);
    expect(Value.Check(
      Civ7ProcedureCoreCallContextSchema,
      JSON.parse(JSON.stringify(capturedContext)),
    )).toBe(true);
    expect(Value.Check(Civ7ProcedureCoreCallContextSchema, {
      ...(capturedContext as object),
      host: "127.0.0.1",
    })).toBe(false);
    expect(Value.Check(Civ7ProcedureCoreCallContextSchema, {
      ...(capturedContext as object),
      rawCommand: "Game.turn",
    })).toBe(false);
    expect(JSON.stringify(capturedContext)).not.toContain("Game.turn");
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

  test("calls a no-network procedure handler with validated input and debug diagnostics", async () => {
    const observed: Array<{ input: unknown; correlationId: string; context: readonly string[] }> = [];
    const result = await callCiv7ProcedureCore(
      Civ7ReadyUnitViewProcedureDescriptor,
      Civ7ReadyUnitViewProcedureSchemaArtifacts,
      { radius: 2 },
      (input, context) => {
        observed.push({
          input,
          correlationId: context.correlationId,
          context: context.context,
        });
        return readyUnitOutput;
      },
      { createCorrelationId: (procedureKey) => `corr-${procedureKey.replace(/\./g, "-")}` },
    );

    expect(result.output).toBe(readyUnitOutput);
    expect(result.diagnostics).toMatchObject({
      procedureKey: "unit.ready.view",
      correlationId: "corr-unit-ready-view",
      proofBoundary: "local-package-test",
      playerScope: "local-player-scoped",
      schemaTechnology: "typebox",
      projection: {
        normalCli: "semantic-projection",
        debugService: "omitted",
        aiIngestion: "blocked-until-ingestion-contract",
        telemetry: "blocked-until-procedure-middleware",
        procedureCore: "typed-procedure-core",
      },
      debugServiceCorrelation: true,
      telemetryCorrelation: false,
    });
    expect(result.output).not.toHaveProperty("projection");
    expect(result.output).not.toHaveProperty("schemaTechnology");
    expect(result.diagnostics.context).toEqual([
      "direct-control-facade",
      "endpoint-defaults",
      "state-selection",
      "logger",
      "evidence-sink",
    ]);
    expect(observed).toEqual([{
      input: { radius: 2 },
      correlationId: "corr-unit-ready-view",
      context: [
        "direct-control-facade",
        "endpoint-defaults",
        "state-selection",
        "logger",
        "evidence-sink",
      ],
    }]);
    expect(Value.Check(Civ7ProcedureCoreCallDiagnosticsSchema, result.diagnostics)).toBe(true);
    expect(Value.Check(Civ7ProcedureCoreCallResultSchema, result)).toBe(true);
  });

  test("validates input before handler execution and output after handler execution", async () => {
    let inputHandlerCalls = 0;
    const inputError = await captureProcedureError(() => callCiv7ProcedureCore(
      Civ7ReadyUnitViewProcedureDescriptor,
      Civ7ReadyUnitViewProcedureSchemaArtifacts,
      { radius: 6 },
      () => {
        inputHandlerCalls += 1;
        return readyUnitOutput;
      },
      { correlationId: "corr-input-invalid" },
    ));
    expect(inputHandlerCalls).toBe(0);
    expect(inputError).toMatchObject({
      code: "procedure-descriptor-invalid",
      details: {
        reason: "input-schema-invalid",
        procedureKey: "unit.ready.view",
        role: "input",
      },
    });

    let outputHandlerCalls = 0;
    const outputError = await captureProcedureError(() => callCiv7ProcedureCore(
      Civ7ReadyUnitViewProcedureDescriptor,
      Civ7ReadyUnitViewProcedureSchemaArtifacts,
      {},
      () => {
        outputHandlerCalls += 1;
        return { ...readyUnitOutput, rawCommand: "readReadyUnitView()" };
      },
      { correlationId: "corr-output-invalid" },
    ));
    expect(outputHandlerCalls).toBe(1);
    expect(outputError).toMatchObject({
      code: "procedure-descriptor-invalid",
      details: {
        reason: "output-schema-invalid",
        procedureKey: "unit.ready.view",
        role: "output",
      },
    });
  });

  test("requires and validates caller-provided correlation ids when descriptor policy says so", async () => {
    const callerCorrelationDescriptor: Civ7ProcedureCoreDescriptor = {
      ...Civ7ReadyUnitViewProcedureDescriptor,
      correlation: {
        ...Civ7ReadyUnitViewProcedureDescriptor.correlation,
        idSource: "caller-provided-and-validated",
      },
    };

    const missing = await captureProcedureError(() => callCiv7ProcedureCore(
      callerCorrelationDescriptor,
      Civ7ReadyUnitViewProcedureSchemaArtifacts,
      {},
      () => readyUnitOutput,
    ));
    expect(missing).toMatchObject({
      code: "procedure-descriptor-invalid",
      details: {
        reason: "correlation-id-missing",
        procedureKey: "unit.ready.view",
      },
    });

    const invalid = await captureProcedureError(() => callCiv7ProcedureCore(
      callerCorrelationDescriptor,
      Civ7ReadyUnitViewProcedureSchemaArtifacts,
      {},
      () => readyUnitOutput,
      { correlationId: "raw command: Game.turn" },
    ));
    expect(invalid).toMatchObject({
      code: "procedure-descriptor-invalid",
      details: {
        reason: "correlation-id-invalid",
        procedureKey: "unit.ready.view",
      },
    });

    const result = await callCiv7ProcedureCore(
      callerCorrelationDescriptor,
      Civ7ReadyUnitViewProcedureSchemaArtifacts,
      {},
      () => readyUnitOutput,
      { correlationId: "caller:corr-1" },
    );
    expect(result.diagnostics.correlationId).toBe("caller:corr-1");
  });

  test("normalizes handler failures with procedure correlation details", async () => {
    const error = await captureProcedureError(() => callCiv7ProcedureCore(
      Civ7ReadyUnitViewProcedureDescriptor,
      Civ7ReadyUnitViewProcedureSchemaArtifacts,
      {},
      () => {
        throw new Civ7DirectControlError("command-failed", "fake atom failed");
      },
      { correlationId: "corr-handler-failed" },
    ));

    expect(error).toMatchObject({
      code: "procedure-call-failed",
      details: {
        reason: "handler-failed",
        procedureKey: "unit.ready.view",
        correlationId: "corr-handler-failed",
        errorCode: "command-failed",
        message: "fake atom failed",
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

  test("requires mutation procedures to carry validator, postcondition, and no-repeat gates", () => {
    const productionMutation: Civ7ProcedureCoreDescriptor = {
      ...readyUnitDescriptor,
      procedureKey: "choices.production.request",
      family: "choices",
      risk: "mutation",
      atomOwner: "packages/civ7-direct-control/src/play/operations/production-choice.ts",
      atomFunction: "requestCiv7ProductionChoice",
      inputFields: ["cityId", "constructibleType"],
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
      /validatorFirst, postconditionRequired, noRepeatAfterUnverified/,
    );

    const descriptor = createCiv7ProcedureCoreDescriptor({
      ...productionMutation,
      validatorFirst: true,
      postconditionRequired: true,
      noRepeatAfterUnverified: true,
    });

    expect(summarizeCiv7ProcedureCoreDescriptor(descriptor).mutationGates).toEqual({
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
