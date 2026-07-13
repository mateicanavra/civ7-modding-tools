import type {
  DiagnosticProviderFailureKind,
  DiagnosticScanRootRefusal,
} from "@habitat/cli/service/model/diagnostics/index";
import type { ObservedGritDiagnosticIdentity } from "./identity.js";

export interface DiagnosticFinding {
  readonly kind: "diagnostic-finding";
  readonly ruleId: string;
  readonly path: string;
  readonly line?: number;
  readonly message: string;
  readonly severity: "error" | "advisory";
  readonly baselineState: "unbaselined" | "baseline-covered" | "baseline-owned-by-d5";
}

export type DiagnosticRunOutcome =
  | {
      readonly kind: "clean";
      readonly ruleId: string;
      readonly diagnostics: readonly [];
    }
  | {
      readonly kind: "findings";
      readonly ruleId: string;
      readonly diagnostics: readonly [DiagnosticFinding, ...DiagnosticFinding[]];
    }
  | {
      readonly kind: "provider-failed";
      readonly ruleId: string;
      readonly failure: DiagnosticProviderFailureKind;
      readonly detail: string;
    }
  | {
      readonly kind: "scan-root-refused";
      readonly ruleId: string;
      readonly decision: DiagnosticScanRootRefusal;
      readonly detail: string;
    }
  | {
      readonly kind: "not-applicable";
      readonly ruleId: string;
      readonly reason: "no-matched-scan-roots";
    }
  | {
      readonly kind: "unexpected-diagnostic-identity";
      readonly ruleId: string;
      readonly unexpectedIdentity: ObservedGritDiagnosticIdentity;
    };
