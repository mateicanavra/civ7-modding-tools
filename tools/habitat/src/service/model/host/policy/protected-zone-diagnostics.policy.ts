import type { HabitatDiagnostic } from "@habitat/cli/service/model/diagnostics/index";
import type { RuleFileLayerFacts } from "@habitat/cli/service/model/rules/index";
import type {
  DeclarationReadiness,
  ProtectedMutationDecision,
} from "../dto/protected-zone.schema.js";
import { renderRecoveryInstruction } from "./protected-zone-recovery.policy.js";

export function declarationReadinessDiagnostic(
  rule: RuleFileLayerFacts,
  state: DeclarationReadiness
): HabitatDiagnostic | null {
  if (state.kind === "ready") return null;
  const subject = "zoneId" in state ? state.zoneId : rule.id;
  const subjectKind =
    "hostSurfaceGuard" in rule ? "protected surface declaration" : "generated zone";
  return {
    ruleId: rule.id,
    path: ".",
    message:
      state.kind === "blocked-declaration-conflict"
        ? `Conflicting ${subjectKind} '${subject}'. ${renderRecoveryInstruction(state.recovery)}`
        : `Unknown ${subjectKind} '${subject}'. ${renderRecoveryInstruction(state.recovery)}`,
    severity: "error",
    baselined: false,
  };
}

export function decisionDiagnostic(
  rule: RuleFileLayerFacts,
  decision: ProtectedMutationDecision
): HabitatDiagnostic | null {
  switch (decision.kind) {
    case "not-applicable":
      return null;
    case "refused-direct-generated-edit":
      return {
        ruleId: rule.id,
        path: decision.path,
        message: `${rule.message} ${renderRecoveryInstruction(decision.recovery)}`,
        severity: "error",
        baselined: false,
      };
    case "refused-direct-protected-edit":
      return {
        ruleId: rule.id,
        path: decision.path,
        message: `${rule.message} ${renderRecoveryInstruction(decision.recovery)}`,
        severity: "error",
        baselined: false,
      };
    case "refused-forbidden-file":
      return {
        ruleId: rule.id,
        path: decision.path,
        message: rule.message,
        severity: "error",
        baselined: false,
      };
    case "allowed-generator-write":
    case "allowed-host-policy-write":
    case "allowed-transaction-write":
      return null;
    case "blocked-missing-host-declaration":
      return {
        ruleId: rule.id,
        path: decision.path,
        message: `Unknown ${decisionSubjectKind(rule)} '${decision.zoneId}'. ${renderRecoveryInstruction(decision.recovery)}`,
        severity: "error",
        baselined: false,
      };
    case "blocked-declaration-conflict":
      return {
        ruleId: rule.id,
        path: decision.path,
        message: `Conflicting ${decisionSubjectKind(rule)} '${decision.zoneId}'. ${renderRecoveryInstruction(decision.recovery)}`,
        severity: "error",
        baselined: false,
      };
  }
}

function decisionSubjectKind(rule: RuleFileLayerFacts): string {
  return "hostSurfaceGuard" in rule ? "protected surface declaration" : "generated zone";
}
