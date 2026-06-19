import { type Static, Type } from "typebox";
import type { DiagnosticAdapterFailureKind } from "../../lib/diagnostic-catalog/index.js";
import type {
  GritParseStatus,
  HabitatCommandResult,
} from "../../lib/habitat-process.js";

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

export type GritPosition = Static<typeof GritPositionSchema>;
export type GritResult = Static<typeof GritResultSchema>;
export type GritWireReport = Static<typeof GritWireReportSchema>;

export interface GritReport {
  paths: string[];
  results: GritResult[];
}

export type GritCheckParseResult =
  | {
      ok: true;
      report: GritReport;
      parseStatus: Extract<GritParseStatus, "parsed">;
      commandResult: HabitatCommandResult;
    }
  | {
      ok: false;
      failureTag: DiagnosticAdapterFailureKind;
      parseStatus: Exclude<GritParseStatus, "parsed">;
      message: string;
      commandResult?: HabitatCommandResult;
    };

export interface GritCheckOptions {
  cacheMode?: GritCheckCacheMode;
  requireObservableCacheStatus?: boolean;
  allowInjectedProbeRoot?: boolean;
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

export interface GritProjectionOptions {
  requirePatternFinding?: boolean;
  rejectUnexpectedPatternIdentity?: boolean;
}
