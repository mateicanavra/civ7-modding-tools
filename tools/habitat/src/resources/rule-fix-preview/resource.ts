import type {
  DiagnosticProviderFailureKind,
  DiagnosticScanRootRefusal,
} from "@habitat/cli/service/model/diagnostics/index";
import { Context, type Effect } from "effect";

export interface RuleFixPreviewDemand {
  readonly ruleIds?: readonly [string, ...string[]];
}

export type FileImpact =
  | { readonly kind: "modify"; readonly path: string }
  | { readonly kind: "create"; readonly path: string }
  | { readonly kind: "rename"; readonly from: string; readonly to: string }
  | { readonly kind: "delete"; readonly path: string };

export type RuleFixPreviewRuleResult =
  | { readonly kind: "previewed"; readonly ruleId: string; readonly impacts: readonly FileImpact[] }
  | {
      readonly kind: "not-applicable";
      readonly ruleId: string;
      readonly reason: "no-matched-scan-roots";
    }
  | {
      readonly kind: "provider-failed";
      readonly ruleId: string;
      readonly failure: DiagnosticProviderFailureKind;
      readonly detail: string;
    }
  | {
      readonly kind: "scope-refused";
      readonly ruleId: string;
      readonly decision: DiagnosticScanRootRefusal;
      readonly detail: string;
    }
  | {
      readonly kind: "authority-refused";
      readonly ruleId: string;
      readonly undeclaredEffects: readonly [FileImpact["kind"], ...FileImpact["kind"][]];
    };

export type RuleFixPreviewResult =
  | {
      readonly kind: "selection-refused";
      readonly refusals: readonly [
        { readonly ruleId: string; readonly reason: "unknown" | "fix-not-admitted" },
        ...{ readonly ruleId: string; readonly reason: "unknown" | "fix-not-admitted" }[],
      ];
    }
  | { readonly kind: "completed"; readonly results: readonly RuleFixPreviewRuleResult[] };

type RuleFixPreviewEffect = ReturnType<typeof Effect.succeed<RuleFixPreviewResult>>;

/** Previews only explicitly admitted transformations and never writes source files. */
export interface RuleFixPreviewService {
  readonly preview: (demand: RuleFixPreviewDemand) => RuleFixPreviewEffect;
}

export class RuleFixPreview extends Context.Tag("@habitat/cli/RuleFixPreview")<
  RuleFixPreview,
  RuleFixPreviewService
>() {}
