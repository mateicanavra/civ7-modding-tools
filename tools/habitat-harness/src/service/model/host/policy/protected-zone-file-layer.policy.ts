import type { HabitatDiagnostic } from "@internal/habitat-harness/service/model/diagnostics/index";
import type { RuleFileLayerFacts } from "@internal/habitat-harness/service/model/rules/index";
import type { StagedMutationPath } from "../dto/protected-zone.schema.js";
import {
  declarationForFileLayerRule,
  declarationForHostSurfacePath,
} from "./protected-zone-declarations.policy.js";
import {
  decisionDiagnostic,
  declarationReadinessDiagnostic,
} from "./protected-zone-diagnostics.policy.js";
import { evaluateProtectedMutationGuard } from "./protected-zone-guard.policy.js";

export function runFileLayerProtectedMutationRule(
  rule: RuleFileLayerFacts,
  context: { staged?: boolean; stagedPaths?: readonly StagedMutationPath[] } = {}
): { exitCode: number; diagnostics: HabitatDiagnostic[] } {
  if ("hostSurfaceGuard" in rule) return runHostSurfaceGuardRule(rule, context);

  const declarationState = declarationForFileLayerRule(rule);
  const readinessDiagnostic = declarationReadinessDiagnostic(rule, declarationState);
  if (readinessDiagnostic) return { exitCode: 1, diagnostics: [readinessDiagnostic] };
  if (!context.staged) return { exitCode: 0, diagnostics: [] };

  const diagnostics = evaluateProtectedMutationGuard(
    declarationState,
    context.stagedPaths ?? []
  ).flatMap((decision) => {
    const diagnostic = decisionDiagnostic(rule, decision);
    return diagnostic ? [diagnostic] : [];
  });
  return { exitCode: diagnostics.length > 0 ? 1 : 0, diagnostics };
}

function runHostSurfaceGuardRule(
  rule: RuleFileLayerFacts,
  context: { staged?: boolean; stagedPaths?: readonly StagedMutationPath[] }
): { exitCode: number; diagnostics: HabitatDiagnostic[] } {
  if (!context.staged) return { exitCode: 0, diagnostics: [] };
  const diagnostics = (context.stagedPaths ?? []).flatMap((mutation) => {
    const declarationState = declarationForHostSurfacePath(mutation.path);
    if (!declarationState) return [];
    const decision = evaluateProtectedMutationGuard(declarationState, [mutation])[0];
    const diagnostic = decision ? decisionDiagnostic(rule, decision) : null;
    return diagnostic ? [diagnostic] : [];
  });
  return { exitCode: diagnostics.length > 0 ? 1 : 0, diagnostics };
}
