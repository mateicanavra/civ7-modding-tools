import { type Static, Type } from "typebox";
import { runInGameSafeFailureCategory } from "../runInGamePublic.js";

const namespaceSchema = Type.Union([
  Type.Literal("autoplay"),
  Type.Literal("runInGame"),
  Type.Literal("saveDeploy"),
]);
const failureTagSchema = Type.Union([
  Type.Literal("OperationBlocked"),
  Type.Literal("InvalidRequest"),
  Type.Literal("OperationNotFound"),
  Type.Literal("OperationExpired"),
  Type.Literal("DaemonIdentityMismatch"),
  Type.Literal("RuntimeDisposed"),
  Type.Literal("UnsupportedOperationType"),
  Type.Literal("DependencyUnavailable"),
  Type.Literal("MaterializationFailed"),
  Type.Literal("DeployFailed"),
  Type.Literal("ProofFailed"),
  Type.Literal("AutoplayStartStopFailed"),
  Type.Literal("AutoplayVerificationFailed"),
]);
const reasonCodeSchema = Type.Union([
  Type.Literal("active-operation-conflict"),
  Type.Literal("daemon-identity-mismatch"),
  Type.Literal("deploy-failed"),
  Type.Literal("direct-control-unavailable"),
  Type.Literal("exact-authorship-mismatch"),
  Type.Literal("expired-operation"),
  Type.Literal("invalid-request"),
  Type.Literal("log-proof-missing"),
  Type.Literal("materialization-proof-missing"),
  Type.Literal("path-jail-rejection"),
  Type.Literal("restart-failed"),
  Type.Literal("restart-unsupported"),
  Type.Literal("rollback-failed"),
  Type.Literal("runtime-disposed"),
  Type.Literal("save-failed"),
  Type.Literal("setup-row-unavailable"),
  Type.Literal("start-failed"),
  Type.Literal("start-game-failed"),
  Type.Literal("status-not-found"),
  Type.Literal("stop-failed"),
  Type.Literal("timeout-uncertain"),
  Type.Literal("unsupported-operation-type"),
  Type.Literal("verification-failed"),
]);
export const studioRecoveryActionSchema = Type.Union([
  Type.Literal("check-dev-server"),
  Type.Literal("copy-diagnostics"),
  Type.Literal("dismiss-civ-notification-and-retry"),
  Type.Literal("edit-config"),
  Type.Literal("exit-to-shell-and-continue"),
  Type.Literal("inspect-deploy-output"),
  Type.Literal("restart-civ-process-and-retry"),
  Type.Literal("retry-run"),
  Type.Literal("retry-save-deploy"),
  Type.Literal("retry-status"),
]);
const dependencyKindSchema = Type.Union([
  Type.Literal("civ7-process"),
  Type.Literal("direct-control"),
  Type.Literal("filesystem"),
  Type.Literal("runtime"),
  Type.Literal("tuner-session"),
]);
const boundedDiagnosticValueSchema = Type.Union([
  Type.String(),
  Type.Number(),
  Type.Boolean(),
  Type.Null(),
  Type.Array(Type.String()),
]);
const diagnosticsSchema = Type.Record(Type.String(), boundedDiagnosticValueSchema);

const commonFailureFields = {
  namespace: namespaceSchema,
  message: Type.String(),
  recoveryActions: Type.Array(studioRecoveryActionSchema),
  requestId: Type.Optional(Type.String()),
  activeRequestId: Type.Optional(Type.String()),
  activePhase: Type.Optional(Type.String()),
  operationType: Type.Optional(Type.String()),
  diagnostics: Type.Optional(diagnosticsSchema),
} as const;

const baseFailureFields = {
  tag: failureTagSchema,
  reason: reasonCodeSchema,
  ...commonFailureFields,
} as const;

export const studioFailureDataSchema = Type.Object(baseFailureFields, {
  additionalProperties: false,
});

const expectedOperationDataSchema = Type.Union([
  Type.Object(
    {
      tag: Type.Literal("OperationBlocked"),
      reason: Type.Literal("active-operation-conflict"),
      ...commonFailureFields,
    },
    { additionalProperties: false }
  ),
  Type.Object(
    {
      tag: Type.Literal("InvalidRequest"),
      reason: Type.Union([Type.Literal("invalid-request"), Type.Literal("path-jail-rejection")]),
      ...commonFailureFields,
    },
    { additionalProperties: false }
  ),
  Type.Object(
    {
      tag: Type.Literal("OperationExpired"),
      reason: Type.Literal("expired-operation"),
      ...commonFailureFields,
    },
    { additionalProperties: false }
  ),
  Type.Object(
    {
      tag: Type.Literal("DaemonIdentityMismatch"),
      reason: Type.Literal("daemon-identity-mismatch"),
      ...commonFailureFields,
    },
    { additionalProperties: false }
  ),
  Type.Object(
    {
      tag: Type.Literal("UnsupportedOperationType"),
      reason: Type.Literal("unsupported-operation-type"),
      ...commonFailureFields,
    },
    { additionalProperties: false }
  ),
]);

const failedOperationDataSchema = Type.Union([
  Type.Object(
    {
      tag: Type.Literal("MaterializationFailed"),
      reason: Type.Literal("materialization-proof-missing"),
      ...commonFailureFields,
    },
    { additionalProperties: false }
  ),
  Type.Object(
    {
      tag: Type.Literal("DeployFailed"),
      reason: Type.Union([
        Type.Literal("deploy-failed"),
        Type.Literal("save-failed"),
        Type.Literal("rollback-failed"),
      ]),
      ...commonFailureFields,
    },
    { additionalProperties: false }
  ),
  Type.Object(
    {
      tag: Type.Literal("ProofFailed"),
      reason: Type.Union([
        Type.Literal("exact-authorship-mismatch"),
        Type.Literal("log-proof-missing"),
        Type.Literal("setup-row-unavailable"),
        Type.Literal("start-game-failed"),
        Type.Literal("timeout-uncertain"),
      ]),
      ...commonFailureFields,
    },
    { additionalProperties: false }
  ),
  Type.Object(
    {
      tag: Type.Literal("AutoplayStartStopFailed"),
      reason: Type.Union([Type.Literal("start-failed"), Type.Literal("stop-failed")]),
      ...commonFailureFields,
    },
    { additionalProperties: false }
  ),
  Type.Object(
    {
      tag: Type.Literal("AutoplayVerificationFailed"),
      reason: Type.Literal("verification-failed"),
      ...commonFailureFields,
    },
    { additionalProperties: false }
  ),
]);

const operationNotFoundStatusDataSchema = Type.Object(
  {
    tag: Type.Literal("OperationNotFound"),
    reason: Type.Literal("status-not-found"),
    ...commonFailureFields,
    requestId: Type.String(),
    serverInstanceId: Type.String(),
    serverStartedAt: Type.String(),
  },
  { additionalProperties: false }
);

export const statusNotFoundDataSchema = Type.Union([
  operationNotFoundStatusDataSchema,
  Type.Object(
    {
      tag: Type.Literal("OperationExpired"),
      reason: Type.Literal("expired-operation"),
      ...commonFailureFields,
      requestId: Type.String(),
      serverInstanceId: Type.String(),
      serverStartedAt: Type.String(),
    },
    { additionalProperties: false }
  ),
  Type.Object(
    {
      tag: Type.Literal("DaemonIdentityMismatch"),
      reason: Type.Literal("daemon-identity-mismatch"),
      ...commonFailureFields,
      requestId: Type.String(),
      serverInstanceId: Type.String(),
      serverStartedAt: Type.String(),
    },
    { additionalProperties: false }
  ),
]);

export const dependencyUnavailableDataSchema = Type.Union([
  Type.Object(
    {
      tag: Type.Literal("DependencyUnavailable"),
      reason: Type.Union([
        Type.Literal("direct-control-unavailable"),
        Type.Literal("restart-failed"),
        Type.Literal("restart-unsupported"),
      ]),
      ...commonFailureFields,
      dependency: Type.Optional(dependencyKindSchema),
      directControlCode: Type.Optional(Type.String()),
      causeSummary: Type.Optional(Type.String()),
    },
    { additionalProperties: false }
  ),
  Type.Object(
    {
      tag: Type.Literal("RuntimeDisposed"),
      reason: Type.Literal("runtime-disposed"),
      ...commonFailureFields,
      dependency: Type.Optional(dependencyKindSchema),
      directControlCode: Type.Optional(Type.String()),
      causeSummary: Type.Optional(Type.String()),
    },
    { additionalProperties: false }
  ),
]);

export const unexpectedDefectDataSchema = Type.Object(
  {
    tag: Type.Literal("UnexpectedDefect"),
    namespace: namespaceSchema,
    message: Type.String(),
    recoveryActions: Type.Array(studioRecoveryActionSchema),
    causeName: Type.Optional(Type.String()),
    causeMessage: Type.Optional(Type.String()),
  },
  { additionalProperties: false }
);

export const expectedFailureDataSchema = expectedOperationDataSchema;

export const expectedFailureErrorDataSchema = Type.Union([
  expectedFailureDataSchema,
  Type.Undefined(),
]);

export const unavailableFailureErrorDataSchema = Type.Union([
  dependencyUnavailableDataSchema,
  Type.Undefined(),
]);

export const failedErrorDataSchema = Type.Union([
  failedOperationDataSchema,
  dependencyUnavailableDataSchema,
  unexpectedDefectDataSchema,
  Type.Undefined(),
]);

export const statusNotFoundErrorDataSchema = Type.Union([
  statusNotFoundDataSchema,
  Type.Undefined(),
]);

export const runInGamePublicErrorDataSchema = Type.Union([
  Type.Object(
    {
      namespace: Type.Literal("runInGame"),
      recoveryActions: Type.Array(studioRecoveryActionSchema),
      safeFailureCategory: runInGameSafeFailureCategory,
      requestId: Type.Optional(Type.String()),
      serverInstanceId: Type.Optional(Type.String()),
      serverStartedAt: Type.Optional(Type.String()),
    },
    { additionalProperties: false }
  ),
  Type.Undefined(),
]);

export const runInGameStatusNotFoundErrorDataSchema = Type.Object(
  {
    namespace: Type.Literal("runInGame"),
    recoveryActions: Type.Array(studioRecoveryActionSchema),
    safeFailureCategory: runInGameSafeFailureCategory,
    requestId: Type.String(),
    serverInstanceId: Type.String(),
    serverStartedAt: Type.String(),
  },
  { additionalProperties: false }
);

export type StudioFailureData = Static<typeof studioFailureDataSchema>;
export type StatusNotFoundData = Static<typeof statusNotFoundDataSchema>;
export type DependencyUnavailableData = Static<typeof dependencyUnavailableDataSchema>;
export type UnexpectedDefectData = Static<typeof unexpectedDefectDataSchema>;
export type ExpectedFailureErrorData = Static<typeof expectedFailureErrorDataSchema>;
export type UnavailableFailureErrorData = Static<typeof unavailableFailureErrorDataSchema>;
export type FailedErrorData = Static<typeof failedErrorDataSchema>;
export type StatusNotFoundErrorData = Static<typeof statusNotFoundErrorDataSchema>;
export type RunInGamePublicErrorData = Static<typeof runInGamePublicErrorDataSchema>;
export type RunInGameStatusNotFoundErrorData = Static<
  typeof runInGameStatusNotFoundErrorDataSchema
>;
