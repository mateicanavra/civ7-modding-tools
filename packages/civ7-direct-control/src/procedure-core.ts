import { Type, type Static, type TSchema } from "typebox";
import { Value } from "typebox/value";

import { Civ7DirectControlError } from "./direct-control-error";
import { createCiv7ControlRequestId } from "./session/request-id";

export const Civ7ProcedureFamilySchema = Type.Union([
  Type.Literal("health"),
  Type.Literal("runtime"),
  Type.Literal("controller"),
  Type.Literal("notifications"),
  Type.Literal("choices"),
  Type.Literal("player"),
  Type.Literal("city"),
  Type.Literal("unit"),
  Type.Literal("map"),
  Type.Literal("strategy"),
  Type.Literal("intelligence"),
  Type.Literal("session"),
]);
export type Civ7ProcedureFamily = Static<typeof Civ7ProcedureFamilySchema>;

export const Civ7ProcedureRiskSchema = Type.Union([
  Type.Literal("read"),
  Type.Literal("mutation"),
  Type.Literal("debug"),
  Type.Literal("runtime-support"),
]);
export type Civ7ProcedureRisk = Static<typeof Civ7ProcedureRiskSchema>;

export const Civ7ProcedurePlayerScopeSchema = Type.Union([
  Type.Literal("global"),
  Type.Literal("local-player-scoped"),
  Type.Literal("agent-slot-scoped"),
  Type.Literal("human-turn-visible"),
  Type.Literal("debug-observer-only"),
]);
export type Civ7ProcedurePlayerScope = Static<typeof Civ7ProcedurePlayerScopeSchema>;

export const Civ7ProcedureConsumerClassSchema = Type.Union([
  Type.Literal("normal-cli-player-agent-view"),
  Type.Literal("ai-intelligence-ingestion"),
  Type.Literal("debug-internal-service-output"),
  Type.Literal("effect-orpc-procedure-core"),
  Type.Literal("static-profile-shaping"),
  Type.Literal("runtime-proof-support"),
]);
export type Civ7ProcedureConsumerClass = Static<typeof Civ7ProcedureConsumerClassSchema>;

export const Civ7ProcedureProofBoundarySchema = Type.Union([
  Type.Literal("planning-evidence-only"),
  Type.Literal("local-package-test"),
  Type.Literal("cli-local-proof"),
  Type.Literal("pending-runtime-proof"),
  Type.Literal("live-runtime-proof"),
]);
export type Civ7ProcedureProofBoundary = Static<typeof Civ7ProcedureProofBoundarySchema>;

export const Civ7ProcedureProjectionSchema = Type.Object({
  normalCli: Type.Union([
    Type.Literal("semantic-projection"),
    Type.Literal("summarized-state-machine-status"),
    Type.Literal("omitted"),
  ]),
  debugService: Type.Union([
    Type.Literal("raw-diagnostic-projection"),
    Type.Literal("proof-diagnostic-projection"),
    Type.Literal("omitted"),
  ]),
  aiIngestion: Type.Union([
    Type.Literal("source-labeled-machine-contract"),
    Type.Literal("blocked-until-ingestion-contract"),
    Type.Literal("omitted"),
  ]),
  telemetry: Type.Union([
    Type.Literal("effect-orpc-middleware-hook"),
    Type.Literal("blocked-until-procedure-middleware"),
    Type.Literal("omitted"),
  ]),
  procedureCore: Type.Literal("typed-procedure-core"),
}, { additionalProperties: false });
export type Civ7ProcedureProjection = Static<typeof Civ7ProcedureProjectionSchema>;

export const Civ7ProcedureCorrelationPolicySchema = Type.Object({
  idSource: Type.Union([
    Type.Literal("generated-per-call"),
    Type.Literal("caller-provided-and-validated"),
  ]),
  normalCli: Type.Literal("omitted-by-default"),
  debugService: Type.Literal("included-in-diagnostics"),
  telemetry: Type.Union([
    Type.Literal("attached-when-procedure-telemetry-enabled"),
    Type.Literal("omitted"),
  ]),
}, { additionalProperties: false });
export type Civ7ProcedureCorrelationPolicy = Static<typeof Civ7ProcedureCorrelationPolicySchema>;

export const Civ7ProcedureContextRequirementSchema = Type.Union([
  Type.Literal("direct-control-facade"),
  Type.Literal("endpoint-defaults"),
  Type.Literal("state-selection"),
  Type.Literal("logger"),
  Type.Literal("clock"),
  Type.Literal("evidence-sink"),
  Type.Literal("live-session-policy"),
]);
export type Civ7ProcedureContextRequirement = Static<typeof Civ7ProcedureContextRequirementSchema>;

export const Civ7ProcedureSchemaReferenceSchema = Type.Object({
  owner: Type.String(),
  exportName: Type.String(),
}, { additionalProperties: false });
export type Civ7ProcedureSchemaReference = Static<typeof Civ7ProcedureSchemaReferenceSchema>;
export const Civ7ProcedureSchemaTechnologySchema = Type.Union([
  Type.Literal("typebox"),
  Type.Literal("effect-schema"),
  Type.Literal("zod-adapter"),
]);
export type Civ7ProcedureSchemaTechnology = Static<typeof Civ7ProcedureSchemaTechnologySchema>;
export type Civ7ProcedureSchemaArtifactMap = Readonly<Record<string, TSchema | undefined>>;
export type Civ7ProcedureSchemaResolution = Readonly<{
  procedureKey: string;
  inputSchema: TSchema;
  outputSchema: TSchema;
}>;

export const Civ7ProcedureCoreCallDiagnosticsSchema = Type.Object({
  procedureKey: Type.String(),
  correlationId: Type.String(),
  proofBoundary: Civ7ProcedureProofBoundarySchema,
  playerScope: Civ7ProcedurePlayerScopeSchema,
  schemaTechnology: Civ7ProcedureSchemaTechnologySchema,
  projection: Civ7ProcedureProjectionSchema,
  context: Type.Array(Civ7ProcedureContextRequirementSchema),
  debugServiceCorrelation: Type.Boolean(),
  telemetryCorrelation: Type.Boolean(),
}, { additionalProperties: false });
export type Civ7ProcedureCoreCallDiagnostics = Static<typeof Civ7ProcedureCoreCallDiagnosticsSchema>;

export const Civ7ProcedureCoreCallResultSchema = Type.Object({
  output: Type.Unknown(),
  diagnostics: Civ7ProcedureCoreCallDiagnosticsSchema,
}, { additionalProperties: false });
export type Civ7ProcedureCoreCallResult<TOutput = unknown> = Readonly<{
  output: TOutput;
  diagnostics: Civ7ProcedureCoreCallDiagnostics;
}>;

export type Civ7ProcedureCoreCallContext = Readonly<{
  descriptor: Civ7ProcedureCoreDescriptor;
  procedureKey: string;
  correlationId: string;
  proofBoundary: Civ7ProcedureProofBoundary;
  playerScope: Civ7ProcedurePlayerScope;
  context: ReadonlyArray<Civ7ProcedureContextRequirement>;
}>;

export type Civ7ProcedureCoreHandler<TInput = unknown, TOutput = unknown> = (
  input: TInput,
  context: Civ7ProcedureCoreCallContext,
) => TOutput | Promise<TOutput>;

export type Civ7ProcedureCoreCallOptions = Readonly<{
  correlationId?: string;
  createCorrelationId?: (procedureKey: string) => string;
}>;

export const Civ7ProcedureCoreErrorReasonSchema = Type.Union([
  Type.Literal("schema-mismatch"),
  Type.Literal("invalid-procedure-key"),
  Type.Literal("family-mismatch"),
  Type.Literal("atom-owner-outside-direct-control"),
  Type.Literal("schema-owner-outside-direct-control"),
  Type.Literal("schema-export-invalid"),
  Type.Literal("schema-reference-unresolved"),
  Type.Literal("schema-field-unresolved"),
  Type.Literal("schema-technology-unaccepted"),
  Type.Literal("context-owned-input-field"),
  Type.Literal("missing-procedure-core-consumer"),
  Type.Literal("live-runtime-proof-unsupported"),
  Type.Literal("raw-command-tunnel"),
  Type.Literal("mutation-gates-missing"),
  Type.Literal("input-schema-invalid"),
  Type.Literal("output-schema-invalid"),
  Type.Literal("correlation-id-missing"),
  Type.Literal("correlation-id-invalid"),
  Type.Literal("handler-failed"),
]);

export const Civ7ProcedureCoreErrorCodeSchema = Type.Union([
  Type.Literal("procedure-descriptor-invalid"),
  Type.Literal("procedure-call-failed"),
]);

export const Civ7ProcedureCoreErrorSummarySchema = Type.Object({
  code: Civ7ProcedureCoreErrorCodeSchema,
  message: Type.String(),
  reason: Civ7ProcedureCoreErrorReasonSchema,
  procedureKey: Type.Optional(Type.String()),
  correlationId: Type.Optional(Type.String()),
  role: Type.Optional(Type.Union([
    Type.Literal("input"),
    Type.Literal("output"),
    Type.Literal("inputSchema"),
    Type.Literal("outputSchema"),
    Type.Literal("inputFields"),
    Type.Literal("outputFields"),
  ])),
  schemaReference: Type.Optional(Civ7ProcedureSchemaReferenceSchema),
  errorCode: Type.Optional(Type.String()),
}, { additionalProperties: false });
export type Civ7ProcedureCoreErrorSummary = Static<typeof Civ7ProcedureCoreErrorSummarySchema>;

export const Civ7ProcedureCoreCallSuccessEnvelopeSchema = Type.Object({
  ok: Type.Literal(true),
  output: Type.Unknown(),
  diagnostics: Civ7ProcedureCoreCallDiagnosticsSchema,
}, { additionalProperties: false });

export const Civ7ProcedureCoreCallErrorEnvelopeSchema = Type.Object({
  ok: Type.Literal(false),
  error: Civ7ProcedureCoreErrorSummarySchema,
}, { additionalProperties: false });

export const Civ7ProcedureCoreCallEnvelopeSchema = Type.Union([
  Civ7ProcedureCoreCallSuccessEnvelopeSchema,
  Civ7ProcedureCoreCallErrorEnvelopeSchema,
]);
export type Civ7ProcedureCoreCallEnvelope<TOutput = unknown> =
  | Readonly<{
    ok: true;
    output: TOutput;
    diagnostics: Civ7ProcedureCoreCallDiagnostics;
  }>
  | Readonly<{
    ok: false;
    error: Civ7ProcedureCoreErrorSummary;
  }>;

export const Civ7ProcedureCoreDescriptorSchema = Type.Object({
  procedureKey: Type.String(),
  family: Civ7ProcedureFamilySchema,
  risk: Civ7ProcedureRiskSchema,
  atomOwner: Type.String(),
  atomFunction: Type.String(),
  schemaTechnology: Civ7ProcedureSchemaTechnologySchema,
  inputSchema: Civ7ProcedureSchemaReferenceSchema,
  outputSchema: Civ7ProcedureSchemaReferenceSchema,
  inputFields: Type.Array(Type.String()),
  outputFields: Type.Array(Type.String()),
  playerScope: Civ7ProcedurePlayerScopeSchema,
  consumerClasses: Type.Array(Civ7ProcedureConsumerClassSchema),
  proofBoundary: Civ7ProcedureProofBoundarySchema,
  projection: Civ7ProcedureProjectionSchema,
  correlation: Civ7ProcedureCorrelationPolicySchema,
  context: Type.Array(Civ7ProcedureContextRequirementSchema),
  validatorFirst: Type.Optional(Type.Boolean()),
  postconditionRequired: Type.Optional(Type.Boolean()),
  noRepeatAfterUnverified: Type.Optional(Type.Boolean()),
}, { additionalProperties: false });
export type Civ7ProcedureCoreDescriptor = Static<typeof Civ7ProcedureCoreDescriptorSchema>;

export const Civ7ProcedureCoreCallContextSchema = Type.Object({
  descriptor: Civ7ProcedureCoreDescriptorSchema,
  procedureKey: Type.String(),
  correlationId: Type.String(),
  proofBoundary: Civ7ProcedureProofBoundarySchema,
  playerScope: Civ7ProcedurePlayerScopeSchema,
  context: Type.Array(Civ7ProcedureContextRequirementSchema),
}, { additionalProperties: false });

export type Civ7ProcedureCoreSummary = Readonly<{
  procedureKey: string;
  family: Civ7ProcedureFamily;
  risk: Civ7ProcedureRisk;
  atomOwner: string;
  atomFunction: string;
  schemaTechnology: Civ7ProcedureSchemaTechnology;
  inputSchema: Civ7ProcedureSchemaReference;
  outputSchema: Civ7ProcedureSchemaReference;
  playerScope: Civ7ProcedurePlayerScope;
  proofBoundary: Civ7ProcedureProofBoundary;
  normalCliProjection: Civ7ProcedureProjection["normalCli"];
  debugServiceProjection: Civ7ProcedureProjection["debugService"];
  aiIngestionProjection: Civ7ProcedureProjection["aiIngestion"];
  telemetryProjection: Civ7ProcedureProjection["telemetry"];
  procedureCoreProjection: Civ7ProcedureProjection["procedureCore"];
  correlation: Civ7ProcedureCorrelationPolicy;
  context: ReadonlyArray<Civ7ProcedureContextRequirement>;
  mutationGates: Readonly<{
    validatorFirst: boolean;
    postconditionRequired: boolean;
    noRepeatAfterUnverified: boolean;
  }>;
}>;

export type Civ7ProcedureCoreDescriptorErrorReason =
  Static<typeof Civ7ProcedureCoreErrorReasonSchema>;

export function isCiv7ProcedureCoreDescriptor(value: unknown): value is Civ7ProcedureCoreDescriptor {
  return Value.Check(Civ7ProcedureCoreDescriptorSchema, value);
}

export function assertCiv7ProcedureCoreDescriptor(
  value: unknown,
  label = "Civ7 procedure descriptor",
): Civ7ProcedureCoreDescriptor {
  if (isCiv7ProcedureCoreDescriptor(value)) return value;
  throw procedureDescriptorError(
    `${label} does not match the Civ7 procedure-core descriptor schema`,
    "schema-mismatch",
    { label },
  );
}

const FORBIDDEN_RAW_TUNNEL_KEYS = new Set([
  "command",
  "commandserialization",
  "commandsource",
  "commandtext",
  "controlcall",
  "executeciv7appuicommand",
  "executeciv7command",
  "executeciv7tunercommand",
  "javascript",
  "js",
  "jsliteral",
  "queryciv7tunerstates",
  "rawcommand",
  "rawjavascript",
  "rawsql",
  "session",
  "socket",
  "sql",
  "stateid",
  "statename",
  "stateselection",
  "tunerstate",
]);

const FORBIDDEN_RAW_TUNNEL_OWNER_PARTS = [
  "runtime/command-serialization",
  "session/execute",
] as const;

export function createCiv7ProcedureCoreDescriptor(
  descriptor: Civ7ProcedureCoreDescriptor,
): Civ7ProcedureCoreDescriptor {
  const valid = assertCiv7ProcedureCoreDescriptor(descriptor);
  validateProcedureIdentity(valid);
  validateSchemaTechnology(valid);
  validateProofBoundary(valid);
  validateContextOwnership(valid);
  validateNoRawCommandTunnel(valid);
  validateMutationGates(valid);
  return valid;
}

export function summarizeCiv7ProcedureCoreDescriptor(
  descriptor: Civ7ProcedureCoreDescriptor,
): Civ7ProcedureCoreSummary {
  const valid = createCiv7ProcedureCoreDescriptor(descriptor);
  return {
    procedureKey: valid.procedureKey,
    family: valid.family,
    risk: valid.risk,
    atomOwner: valid.atomOwner,
    atomFunction: valid.atomFunction,
    schemaTechnology: valid.schemaTechnology,
    inputSchema: valid.inputSchema,
    outputSchema: valid.outputSchema,
    playerScope: valid.playerScope,
    proofBoundary: valid.proofBoundary,
    normalCliProjection: valid.projection.normalCli,
    debugServiceProjection: valid.projection.debugService,
    aiIngestionProjection: valid.projection.aiIngestion,
    telemetryProjection: valid.projection.telemetry,
    procedureCoreProjection: valid.projection.procedureCore,
    correlation: valid.correlation,
    context: valid.context,
    mutationGates: {
      validatorFirst: valid.validatorFirst === true,
      postconditionRequired: valid.postconditionRequired === true,
      noRepeatAfterUnverified: valid.noRepeatAfterUnverified === true,
    },
  };
}

export function civ7ProcedureSchemaReferenceKey(reference: Civ7ProcedureSchemaReference): string {
  return `${reference.owner}#${reference.exportName}`;
}

export function resolveCiv7ProcedureCoreSchemas(
  descriptor: Civ7ProcedureCoreDescriptor,
  schemas: Civ7ProcedureSchemaArtifactMap,
): Civ7ProcedureSchemaResolution {
  const valid = createCiv7ProcedureCoreDescriptor(descriptor);
  const inputSchema = resolveProcedureSchemaReference(valid, "inputSchema", schemas);
  const outputSchema = resolveProcedureSchemaReference(valid, "outputSchema", schemas);
  validateSchemaFieldList(valid, "inputFields", inputSchema);
  validateSchemaFieldList(valid, "outputFields", outputSchema);
  return {
    procedureKey: valid.procedureKey,
    inputSchema,
    outputSchema,
  };
}

export function validateCiv7ProcedureCoreInput(
  descriptor: Civ7ProcedureCoreDescriptor,
  schemas: Civ7ProcedureSchemaArtifactMap,
  value: unknown,
): unknown {
  return validateProcedureCorePayload(descriptor, schemas, "input", value);
}

export function validateCiv7ProcedureCoreOutput(
  descriptor: Civ7ProcedureCoreDescriptor,
  schemas: Civ7ProcedureSchemaArtifactMap,
  value: unknown,
): unknown {
  return validateProcedureCorePayload(descriptor, schemas, "output", value);
}

export function summarizeCiv7ProcedureCoreError(
  err: unknown,
): Civ7ProcedureCoreErrorSummary | null {
  if (!(err instanceof Civ7DirectControlError)) return null;
  if (err.code !== "procedure-descriptor-invalid" && err.code !== "procedure-call-failed") return null;
  const details = isProcedureDetailsObject(err.details) ? err.details : {};
  const reason = details.reason;
  if (!Value.Check(Civ7ProcedureCoreErrorReasonSchema, reason)) return null;

  const summary: Civ7ProcedureCoreErrorSummary = {
    code: err.code,
    message: err.message,
    reason,
  };
  assignString(summary, "procedureKey", details.procedureKey);
  assignString(summary, "correlationId", details.correlationId);
  if (Value.Check(Civ7ProcedureCoreErrorSummarySchema.properties.role, details.role)) {
    summary.role = details.role;
  }
  if (Value.Check(Civ7ProcedureSchemaReferenceSchema, details.schemaReference)) {
    summary.schemaReference = details.schemaReference;
  }
  assignString(summary, "errorCode", details.errorCode);
  return summary;
}

export async function settleCiv7ProcedureCoreCall<TOutput = unknown>(
  call: Promise<Civ7ProcedureCoreCallResult<TOutput>>,
): Promise<Civ7ProcedureCoreCallEnvelope<TOutput>> {
  try {
    const result = await call;
    return {
      ok: true,
      output: result.output,
      diagnostics: result.diagnostics,
    };
  } catch (err) {
    const error = summarizeCiv7ProcedureCoreError(err);
    if (error === null) throw err;
    return {
      ok: false,
      error,
    };
  }
}

export async function callCiv7ProcedureCore<TInput = unknown, TOutput = unknown>(
  descriptor: Civ7ProcedureCoreDescriptor,
  schemas: Civ7ProcedureSchemaArtifactMap,
  input: unknown,
  handler: Civ7ProcedureCoreHandler<TInput, TOutput>,
  options: Civ7ProcedureCoreCallOptions = {},
): Promise<Civ7ProcedureCoreCallResult<TOutput>> {
  const valid = createCiv7ProcedureCoreDescriptor(descriptor);
  const correlationId = resolveProcedureCorrelationId(valid, options);
  const diagnostics = procedureCallDiagnostics(valid, correlationId);
  const validInput = validateCiv7ProcedureCoreInput(valid, schemas, input) as TInput;
  const context: Civ7ProcedureCoreCallContext = {
    descriptor: valid,
    procedureKey: valid.procedureKey,
    correlationId,
    proofBoundary: valid.proofBoundary,
    playerScope: valid.playerScope,
    context: valid.context,
  };

  let output: TOutput;
  try {
    output = await handler(validInput, context);
  } catch (err) {
    throw procedureCallError(valid, correlationId, err);
  }

  validateCiv7ProcedureCoreOutput(valid, schemas, output);
  return { output, diagnostics };
}

function validateProcedureCorePayload(
  descriptor: Civ7ProcedureCoreDescriptor,
  schemas: Civ7ProcedureSchemaArtifactMap,
  role: "input" | "output",
  value: unknown,
): unknown {
  const resolved = resolveCiv7ProcedureCoreSchemas(descriptor, schemas);
  const schema = role === "input" ? resolved.inputSchema : resolved.outputSchema;
  if (Value.Check(schema, value)) return value;

  const schemaReference = role === "input" ? descriptor.inputSchema : descriptor.outputSchema;
  throw procedureDescriptorError(
    `Civ7 procedure ${descriptor.procedureKey} ${role} payload does not match the resolved schema`,
    role === "input" ? "input-schema-invalid" : "output-schema-invalid",
    {
      procedureKey: resolved.procedureKey,
      role,
      schemaReference,
      errors: Array.from(Value.Errors(schema, value), procedurePayloadErrorDetails).slice(0, 8),
    },
  );
}

function validateProcedureIdentity(descriptor: Civ7ProcedureCoreDescriptor): void {
  if (!/^[a-z][a-z0-9]*(?:\.[a-z][a-z0-9]*)+$/.test(descriptor.procedureKey)) {
    throw procedureDescriptorError(
      `Civ7 procedure key must be a dotted semantic key: ${descriptor.procedureKey}`,
      "invalid-procedure-key",
      { procedureKey: descriptor.procedureKey },
    );
  }
  if (!descriptor.procedureKey.startsWith(`${descriptor.family}.`)) {
    throw procedureDescriptorError(
      `Civ7 procedure key ${descriptor.procedureKey} must start with its family ${descriptor.family}.`,
      "family-mismatch",
      { procedureKey: descriptor.procedureKey, family: descriptor.family },
    );
  }
  if (!descriptor.atomOwner.startsWith("packages/civ7-direct-control/src/")) {
    throw procedureDescriptorError(
      `Civ7 procedure atom owner must stay in @civ7/direct-control: ${descriptor.atomOwner}`,
      "atom-owner-outside-direct-control",
      { procedureKey: descriptor.procedureKey, atomOwner: descriptor.atomOwner },
    );
  }
  for (const [role, schema] of [
    ["inputSchema", descriptor.inputSchema],
    ["outputSchema", descriptor.outputSchema],
  ] as const) {
    if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(schema.exportName)) {
      throw procedureDescriptorError(
        `Civ7 procedure ${role} export must be a simple schema identifier: ${schema.exportName}`,
        "schema-export-invalid",
        { procedureKey: descriptor.procedureKey, role, exportName: schema.exportName },
      );
    }
    if (!schema.owner.startsWith("packages/civ7-direct-control/src/")) {
      throw procedureDescriptorError(
        `Civ7 procedure ${role} owner must stay in @civ7/direct-control: ${schema.owner}`,
        "schema-owner-outside-direct-control",
        { procedureKey: descriptor.procedureKey, role, owner: schema.owner },
      );
    }
  }
  if (!descriptor.consumerClasses.includes("effect-orpc-procedure-core")) {
    throw procedureDescriptorError(
      `Civ7 procedure ${descriptor.procedureKey} must include the procedure-core consumer class`,
      "missing-procedure-core-consumer",
      { procedureKey: descriptor.procedureKey, consumerClasses: descriptor.consumerClasses },
    );
  }
}

function validateSchemaTechnology(descriptor: Civ7ProcedureCoreDescriptor): void {
  if (descriptor.schemaTechnology === "typebox") return;
  throw procedureDescriptorError(
    `Civ7 procedure ${descriptor.procedureKey} cannot claim ${descriptor.schemaTechnology} schema ownership before an accepted schema-technology slice`,
    "schema-technology-unaccepted",
    {
      procedureKey: descriptor.procedureKey,
      schemaTechnology: descriptor.schemaTechnology,
      acceptedTechnology: "typebox",
      requiredDisposition: "TypeBox versus Effect Schema owner/proof acceptance",
    },
  );
}

function validateProofBoundary(descriptor: Civ7ProcedureCoreDescriptor): void {
  if (descriptor.proofBoundary !== "live-runtime-proof") return;
  throw procedureDescriptorError(
    `Civ7 procedure ${descriptor.procedureKey} cannot claim live runtime proof from the local descriptor owner`,
    "live-runtime-proof-unsupported",
    { procedureKey: descriptor.procedureKey, proofBoundary: descriptor.proofBoundary },
  );
}

function validateContextOwnership(descriptor: Civ7ProcedureCoreDescriptor): void {
  const context = new Set(descriptor.context);
  const contextOwnedInputFields = [
    context.has("endpoint-defaults") ? ["host", "hosts", "port"] : [],
    context.has("state-selection") ? ["session", "state", "stateName", "stateSelection", "tunerState"] : [],
  ].flat();
  const invalid = descriptor.inputFields.filter((field) => {
    const normalized = normalizeFieldKey(field);
    return !hasRawTunnelKey(field)
      && contextOwnedInputFields.some((reserved) => normalizeFieldKey(reserved) === normalized);
  });
  if (invalid.length === 0) return;
  throw procedureDescriptorError(
    `Civ7 procedure ${descriptor.procedureKey} keeps context-owned fields out of procedure input: ${invalid.join(", ")}`,
    "context-owned-input-field",
    {
      procedureKey: descriptor.procedureKey,
      fields: invalid,
      context: descriptor.context,
    },
  );
}

function validateNoRawCommandTunnel(descriptor: Civ7ProcedureCoreDescriptor): void {
  const fields = [
    descriptor.procedureKey,
    descriptor.atomOwner,
    descriptor.atomFunction,
    descriptor.inputSchema.owner,
    descriptor.inputSchema.exportName,
    descriptor.outputSchema.owner,
    descriptor.outputSchema.exportName,
    ...descriptor.inputFields,
    ...descriptor.outputFields,
  ];
  const rawFields = fields.filter(hasRawTunnelKey);
  if (rawFields.length > 0) {
    throw procedureDescriptorError(
      `Civ7 procedure ${descriptor.procedureKey} cannot expose raw command tunnel fields: ${rawFields.join(", ")}`,
      "raw-command-tunnel",
      { procedureKey: descriptor.procedureKey, fields: rawFields },
    );
  }
}

function validateMutationGates(descriptor: Civ7ProcedureCoreDescriptor): void {
  if (descriptor.risk !== "mutation") return;
  const missing = [
    descriptor.validatorFirst === true ? null : "validatorFirst",
    descriptor.postconditionRequired === true ? null : "postconditionRequired",
    descriptor.noRepeatAfterUnverified === true ? null : "noRepeatAfterUnverified",
  ].filter((value): value is string => value !== null);
  if (missing.length > 0) {
    throw procedureDescriptorError(
      `Civ7 mutation procedure ${descriptor.procedureKey} is missing required gates: ${missing.join(", ")}`,
      "mutation-gates-missing",
      { procedureKey: descriptor.procedureKey, missingGates: missing },
    );
  }
}

function resolveProcedureSchemaReference(
  descriptor: Civ7ProcedureCoreDescriptor,
  role: "inputSchema" | "outputSchema",
  schemas: Civ7ProcedureSchemaArtifactMap,
): TSchema {
  const reference = descriptor[role];
  const key = civ7ProcedureSchemaReferenceKey(reference);
  const schema = schemas[key];
  if (schema !== undefined) return schema;
  throw procedureDescriptorError(
    `Civ7 procedure ${role} reference is unresolved: ${key}`,
    "schema-reference-unresolved",
    {
      procedureKey: descriptor.procedureKey,
      role,
      owner: reference.owner,
      exportName: reference.exportName,
    },
  );
}

function validateSchemaFieldList(
  descriptor: Civ7ProcedureCoreDescriptor,
  role: "inputFields" | "outputFields",
  schema: TSchema,
): void {
  const schemaFields = new Set(schemaRootFields(schema));
  const missing = descriptor[role].filter((field) => !schemaFields.has(field));
  if (missing.length === 0) return;
  throw procedureDescriptorError(
    `Civ7 procedure ${role} contains fields not present on the resolved schema: ${missing.join(", ")}`,
    "schema-field-unresolved",
    {
      procedureKey: descriptor.procedureKey,
      role,
      missingFields: missing,
      schemaFields: [...schemaFields],
    },
  );
}

function schemaRootFields(schema: TSchema): string[] {
  const objectSchema = schema as TSchema & { properties?: Record<string, unknown> };
  return Object.keys(objectSchema.properties ?? {});
}

function procedureDescriptorError(
  message: string,
  reason: Civ7ProcedureCoreDescriptorErrorReason,
  details: Record<string, unknown>,
): Civ7DirectControlError {
  return new Civ7DirectControlError("procedure-descriptor-invalid", message, {
    details: { reason, ...details },
  });
}

function procedureCallDiagnostics(
  descriptor: Civ7ProcedureCoreDescriptor,
  correlationId: string,
): Civ7ProcedureCoreCallDiagnostics {
  return {
    procedureKey: descriptor.procedureKey,
    correlationId,
    proofBoundary: descriptor.proofBoundary,
    playerScope: descriptor.playerScope,
    schemaTechnology: descriptor.schemaTechnology,
    projection: descriptor.projection,
    context: descriptor.context,
    debugServiceCorrelation: descriptor.correlation.debugService === "included-in-diagnostics",
    telemetryCorrelation: descriptor.correlation.telemetry === "attached-when-procedure-telemetry-enabled",
  };
}

function resolveProcedureCorrelationId(
  descriptor: Civ7ProcedureCoreDescriptor,
  options: Civ7ProcedureCoreCallOptions,
): string {
  if (descriptor.correlation.idSource === "caller-provided-and-validated") {
    if (options.correlationId === undefined) {
      throw procedureDescriptorError(
        `Civ7 procedure ${descriptor.procedureKey} requires a caller-provided correlation id`,
        "correlation-id-missing",
        { procedureKey: descriptor.procedureKey },
      );
    }
    validateProcedureCorrelationId(descriptor, options.correlationId);
    return options.correlationId;
  }

  const createCorrelationId = options.createCorrelationId
    ?? ((procedureKey: string) => createCiv7ControlRequestId(`civ7-procedure-${procedureKey.replace(/[^a-z0-9]+/g, "-")}`));
  const correlationId = options.correlationId ?? createCorrelationId(descriptor.procedureKey);
  validateProcedureCorrelationId(descriptor, correlationId);
  return correlationId;
}

function validateProcedureCorrelationId(
  descriptor: Civ7ProcedureCoreDescriptor,
  correlationId: string,
): void {
  if (/^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$/.test(correlationId)) return;
  throw procedureDescriptorError(
    `Civ7 procedure ${descriptor.procedureKey} correlation id is invalid`,
    "correlation-id-invalid",
    { procedureKey: descriptor.procedureKey, correlationId },
  );
}

function procedureCallError(
  descriptor: Civ7ProcedureCoreDescriptor,
  correlationId: string,
  err: unknown,
): Civ7DirectControlError {
  const directControlError = err instanceof Civ7DirectControlError ? err : undefined;
  return new Civ7DirectControlError(
    "procedure-call-failed",
    `Civ7 procedure ${descriptor.procedureKey} handler failed`,
    {
      cause: err,
      details: {
        reason: "handler-failed",
        procedureKey: descriptor.procedureKey,
        correlationId,
        errorCode: directControlError?.code,
        message: err instanceof Error ? err.message : String(err),
      },
    },
  );
}

function procedurePayloadErrorDetails(error: unknown): Record<string, unknown> {
  const candidate = error as { path?: unknown; message?: unknown };
  return {
    path: typeof candidate.path === "string" ? candidate.path : "",
    message: typeof candidate.message === "string" ? candidate.message : "value failed schema validation",
  };
}

function isProcedureDetailsObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function assignString<T extends Record<string, unknown>>(
  target: T,
  key: keyof T,
  value: unknown,
): void {
  if (typeof value === "string") target[key] = value as T[keyof T];
}

function normalizeFieldKey(field: string): string {
  return field.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function hasRawTunnelKey(field: string): boolean {
  const normalized = normalizeFieldKey(field);
  const normalizedPath = field.toLowerCase().replace(/\\/g, "/");
  return FORBIDDEN_RAW_TUNNEL_OWNER_PARTS.some((ownerPart) => normalizedPath.includes(ownerPart))
    || FORBIDDEN_RAW_TUNNEL_KEYS.has(normalized)
    || normalized.includes("commandserialization")
    || normalized.includes("commandsource")
    || normalized.includes("controlcall")
    || normalized.includes("executeciv7command")
    || normalized.includes("executeciv7appuicommand")
    || normalized.includes("executeciv7tunercommand")
    || normalized.includes("rawcommand")
    || normalized.includes("rawjavascript")
    || normalized.includes("rawsql");
}
