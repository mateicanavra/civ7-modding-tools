import { Type, type Static, type TSchema } from "typebox";
import { Value } from "typebox/value";

import { Civ7DirectControlError } from "./direct-control-error";

export const Civ7ProcedureFamilySchema = Type.Union([
  Type.Literal("health"),
  Type.Literal("runtime"),
  Type.Literal("controller"),
  Type.Literal("notifications"),
  Type.Literal("choices"),
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

export const Civ7ProcedureSchemaReferenceSchema = Type.Object({
  owner: Type.String(),
  exportName: Type.String(),
}, { additionalProperties: false });
export type Civ7ProcedureSchemaReference = Static<typeof Civ7ProcedureSchemaReferenceSchema>;
export type Civ7ProcedureSchemaArtifactMap = Readonly<Record<string, TSchema | undefined>>;
export type Civ7ProcedureSchemaResolution = Readonly<{
  procedureKey: string;
  inputSchema: TSchema;
  outputSchema: TSchema;
}>;

export const Civ7ProcedureCoreDescriptorSchema = Type.Object({
  procedureKey: Type.String(),
  family: Civ7ProcedureFamilySchema,
  risk: Civ7ProcedureRiskSchema,
  atomOwner: Type.String(),
  atomFunction: Type.String(),
  inputSchema: Civ7ProcedureSchemaReferenceSchema,
  outputSchema: Civ7ProcedureSchemaReferenceSchema,
  inputFields: Type.Array(Type.String()),
  outputFields: Type.Array(Type.String()),
  playerScope: Civ7ProcedurePlayerScopeSchema,
  consumerClasses: Type.Array(Civ7ProcedureConsumerClassSchema),
  proofBoundary: Civ7ProcedureProofBoundarySchema,
  projection: Civ7ProcedureProjectionSchema,
  correlation: Civ7ProcedureCorrelationPolicySchema,
  approvalGate: Type.Optional(Type.Boolean()),
  validatorFirst: Type.Optional(Type.Boolean()),
  postconditionRequired: Type.Optional(Type.Boolean()),
  noRepeatAfterUnverified: Type.Optional(Type.Boolean()),
}, { additionalProperties: false });
export type Civ7ProcedureCoreDescriptor = Static<typeof Civ7ProcedureCoreDescriptorSchema>;

export type Civ7ProcedureCoreSummary = Readonly<{
  procedureKey: string;
  family: Civ7ProcedureFamily;
  risk: Civ7ProcedureRisk;
  atomOwner: string;
  atomFunction: string;
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
  mutationGates: Readonly<{
    approvalGate: boolean;
    validatorFirst: boolean;
    postconditionRequired: boolean;
    noRepeatAfterUnverified: boolean;
  }>;
}>;

export type Civ7ProcedureCoreDescriptorErrorReason =
  | "schema-mismatch"
  | "invalid-procedure-key"
  | "family-mismatch"
  | "atom-owner-outside-direct-control"
  | "schema-owner-outside-direct-control"
  | "schema-export-invalid"
  | "schema-reference-unresolved"
  | "schema-field-unresolved"
  | "missing-procedure-core-consumer"
  | "live-runtime-proof-unsupported"
  | "raw-command-tunnel"
  | "mutation-gates-missing";

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
  validateProofBoundary(valid);
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
    mutationGates: {
      approvalGate: valid.approvalGate === true,
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

function validateProofBoundary(descriptor: Civ7ProcedureCoreDescriptor): void {
  if (descriptor.proofBoundary !== "live-runtime-proof") return;
  throw procedureDescriptorError(
    `Civ7 procedure ${descriptor.procedureKey} cannot claim live runtime proof from the local descriptor owner`,
    "live-runtime-proof-unsupported",
    { procedureKey: descriptor.procedureKey, proofBoundary: descriptor.proofBoundary },
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
    descriptor.approvalGate === true ? null : "approvalGate",
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
