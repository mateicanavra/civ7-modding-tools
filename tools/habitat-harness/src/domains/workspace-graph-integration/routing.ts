import type { WorkspaceProject } from "../../providers/nx/schema.js";
import { activeRuleRoutingFacts } from "../rule-registry/active-facts.js";
import type { RuleRoutingFacts } from "../rule-registry/index.js";
import type { RuleCoverageKind, RuleRouting } from "./schema.js";

export function rulesForPath(pathInRepo: string, owner?: WorkspaceProject): RuleRouting[] {
  return activeRuleRoutingFacts
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

function pathCoveragePatternMatches(pattern: string, pathInRepo: string): boolean {
  const normalized = pattern.replaceAll("\\", "/");
  if (!normalized.includes("*")) {
    return pathInRepo === normalized || pathInRepo.startsWith(`${normalized}/`);
  }
  return globToRegExp(normalized).test(pathInRepo);
}

function globToRegExp(pattern: string): RegExp {
  let source = "^";
  for (let index = 0; index < pattern.length; index += 1) {
    const char = pattern[index];
    const next = pattern[index + 1];
    if (char === "*" && next === "*") {
      if (pattern[index + 2] === "/") {
        source += "(?:.*/)?";
        index += 2;
        continue;
      }
      source += ".*";
      index += 1;
      continue;
    }
    if (char === "*") {
      source += "[^/]*";
      continue;
    }
    if (char === "?") {
      source += "[^/]";
      continue;
    }
    source += escapeRegExp(char);
  }
  source += "$";
  return new RegExp(source);
}

function escapeRegExp(char: string) {
  return /[\\^$+?.()|[\]{}]/.test(char) ? `\\${char}` : char;
}
