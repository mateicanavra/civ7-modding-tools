import type { WorkspaceProject } from "@internal/habitat-harness/providers/nx/schema";
import type {
  RuleCoverageKind,
  RuleRouting,
} from "@internal/habitat-harness/service/model/classify/index";
import type { RuleRoutingFacts } from "@internal/habitat-harness/service/model/rules/index";
import { pathCoveragePatternMatches } from "@internal/habitat-harness/service/model/rules/policy/path-coverage.policy";

export function rulesForPath(
  pathInRepo: string,
  rules: readonly RuleRoutingFacts[],
  owner?: WorkspaceProject
): RuleRouting[] {
  return rules
    .map((rule) => routeRule(rule, pathInRepo, owner))
    .filter((rule): rule is RuleRouting => Boolean(rule))
    .sort((a, b) => a.ruleId.localeCompare(b.ruleId));
}

function routeRule(
  rule: RuleRoutingFacts,
  pathInRepo: string,
  owner?: WorkspaceProject
): RuleRouting | undefined {
  for (const coverage of rule.pathCoverage) {
    if (coverage.kind === "exact-path") {
      const matchedPattern = coverage.patterns.find((pattern) =>
        pathCoveragePatternMatches(pattern, pathInRepo)
      );
      if (matchedPattern) {
        return routingFact(
          rule,
          "exact-path",
          `Path matches rule pathCoverage pattern ${matchedPattern}.`
        );
      }
      continue;
    }
    if (coverage.kind === "project-owner" && owner && rule.ownerProject === owner.name) {
      return routingFact(rule, "project-owner", `Rule owner project matches ${owner.name}.`);
    }
    if (coverage.kind === "workspace-gate") {
      return routingFact(
        rule,
        "workspace-gate",
        "Workspace-level Habitat gate relevant beyond a single owning project."
      );
    }
    if (coverage.kind === "unresolved-metadata" && owner && rule.ownerProject === owner.name) {
      return routingFact(rule, "unresolved-metadata", coverage.reason);
    }
  }

  return undefined;
}

function routingFact(
  rule: RuleRoutingFacts,
  coverageKind: RuleCoverageKind,
  reason: string
): RuleRouting {
  return {
    ruleId: rule.id,
    ownerTool: rule.ownerTool,
    ownerProject: rule.ownerProject,
    coverageKind,
    reason,
  };
}
