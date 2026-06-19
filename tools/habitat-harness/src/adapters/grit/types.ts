import { type Static, Type } from "typebox";
import {
  DiagnosticAdapterFailureKindSchema,
  DiagnosticCommandObservationSchema,
  DiagnosticCompletedCommandObservationSchema,
  DiagnosticScanRootRefusalSchema,
  NativeGritCheckRequestSchema,
} from "../../lib/diagnostic-catalog/index.js";

export const GritPositionSchema = Type.Object(
  {
    line: Type.Optional(Type.Number()),
    col: Type.Optional(Type.Number()),
    offset: Type.Optional(Type.Number()),
  },
  { additionalProperties: false }
);

export const GritResultExtraSchema = Type.Object(
  {
    message: Type.Optional(Type.Union([Type.String(), Type.Null()])),
    severity: Type.Optional(Type.String()),
  },
  { additionalProperties: false }
);

export const GritResultSchema = Type.Object(
  {
    check_id: Type.Optional(Type.String()),
    local_name: Type.Optional(Type.String()),
    path: Type.Optional(Type.String()),
    start: Type.Optional(GritPositionSchema),
    end: Type.Optional(GritPositionSchema),
    extra: Type.Optional(GritResultExtraSchema),
  },
  { additionalProperties: false }
);

export const GritWireReportSchema = Type.Object(
  {
    paths: Type.Optional(Type.Array(Type.String())),
    results: Type.Array(GritResultSchema),
  },
  { additionalProperties: false }
);

export const GritReportSchema = Type.Object(
  {
    paths: Type.Array(Type.String()),
    results: Type.Array(GritResultSchema),
  },
  { additionalProperties: false }
);

export const GritParseFailureStatusSchema = Type.Union([
  Type.Literal("unparsed"),
  Type.Literal("no-json"),
  Type.Literal("malformed"),
  Type.Literal("schema-drift"),
  Type.Literal("unsupported-mode"),
]);

export const GritDiagnosticAcquisitionSchema = Type.Union([
  Type.Object(
    {
      kind: Type.Literal("parsed"),
      request: NativeGritCheckRequestSchema,
      report: GritReportSchema,
      parseStatus: Type.Literal("parsed"),
      command: DiagnosticCompletedCommandObservationSchema,
    },
    { additionalProperties: false }
  ),
  Type.Object(
    {
      kind: Type.Literal("adapter-failed"),
      request: NativeGritCheckRequestSchema,
      failure: DiagnosticAdapterFailureKindSchema,
      parseStatus: GritParseFailureStatusSchema,
      message: Type.String(),
      command: DiagnosticCommandObservationSchema,
    },
    { additionalProperties: false }
  ),
  Type.Object(
    {
      kind: Type.Literal("scan-root-refused"),
      decision: DiagnosticScanRootRefusalSchema,
      message: Type.String(),
      command: Type.Object(
        {
          kind: Type.Literal("not-run"),
          reason: Type.Literal("scan-root-refused"),
        },
        { additionalProperties: false }
      ),
    },
    { additionalProperties: false }
  ),
]);

export type GritPosition = Static<typeof GritPositionSchema>;
export type GritResult = Static<typeof GritResultSchema>;
export type GritWireReport = Static<typeof GritWireReportSchema>;
export type GritReport = Static<typeof GritReportSchema>;
export type GritParseFailureStatus = Static<typeof GritParseFailureStatusSchema>;
export type GritDiagnosticAcquisition = Static<typeof GritDiagnosticAcquisitionSchema>;

export interface GritCheckOptions {
  cacheMode?: GritCheckCacheMode;
  requireObservableCacheStatus?: boolean;
  allowDocsRoot?: boolean;
  outputFormat?: GritCheckOutputFormat;
}

export type GritCheckCacheMode = "workspace" | "fresh";
export type GritCheckOutputFormat = "json" | "text";

export interface GritCheckRequestOptions {
  cacheDir?: string;
  observableCacheStatus?: "unknown" | "fresh" | "cache-hit" | "replay";
  outputFormat?: GritCheckOutputFormat;
}

export interface GritDiagnosticOptions {
  requirePatternFinding?: boolean;
  rejectUnexpectedPatternIdentity?: boolean;
}
