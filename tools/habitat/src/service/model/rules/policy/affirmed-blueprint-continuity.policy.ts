export interface RuleAuthoritySnapshot {
  readonly id: string;
  readonly manifestPath: string;
  readonly placementBlueprint: string;
  readonly authorityPaths: readonly string[];
}

export interface RuleRegistryAuthoritySnapshot {
  readonly paths: readonly string[];
  readonly rules: readonly RuleAuthoritySnapshot[];
}

export type AffirmedBlueprintContinuityFindingCode =
  | "blueprint-authority-demoted"
  | "blueprint-owner-changed"
  | "blueprint-placement-mismatch"
  | "blueprint-packet-incomplete"
  | "blueprint-packet-residue"
  | "duplicate-rule-id";

export interface AffirmedBlueprintContinuityFinding {
  readonly code: AffirmedBlueprintContinuityFindingCode;
  readonly ruleId: string;
  readonly path: string;
  readonly message: string;
}

/**
 * Protects stable affirmed-blueprint rule identities across HEAD and the staged index.
 *
 * A rule may move internally within its existing blueprint, or retire when its complete
 * declared authority packet retires. It may not silently move to another owner or a niche.
 */
export function evaluateAffirmedBlueprintContinuity(
  head: RuleRegistryAuthoritySnapshot,
  staged: RuleRegistryAuthoritySnapshot
): AffirmedBlueprintContinuityFinding[] {
  const findings: AffirmedBlueprintContinuityFinding[] = [];
  const stagedPaths = new Set(staged.paths.map(normalizeRepoPath));
  const stagedRulesById = rulesById(staged.rules);

  for (const [ruleId, rules] of stagedRulesById) {
    if (rules.length <= 1) continue;
    findings.push({
      code: "duplicate-rule-id",
      ruleId,
      path: rules[0]?.manifestPath ?? ".habitat",
      message: `Staged Habitat registry contains duplicate rule id ${JSON.stringify(ruleId)}.`,
    });
  }

  for (const rule of staged.rules) {
    const owner = affirmedBlueprintOwner(rule.manifestPath);
    if (!owner) continue;
    if (rule.placementBlueprint !== owner) {
      findings.push({
        code: "blueprint-placement-mismatch",
        ruleId: rule.id,
        path: rule.manifestPath,
        message:
          `Affirmed blueprint rule ${JSON.stringify(rule.id)} is physically owned by ` +
          `${JSON.stringify(owner)} but declares placement.blueprint ${JSON.stringify(rule.placementBlueprint)}.`,
      });
    }
    const missingPaths = rule.authorityPaths.filter(
      (authorityPath) => !stagedPaths.has(normalizeRepoPath(authorityPath))
    );
    if (missingPaths.length > 0) {
      findings.push({
        code: "blueprint-packet-incomplete",
        ruleId: rule.id,
        path: rule.manifestPath,
        message:
          `Affirmed blueprint rule ${JSON.stringify(rule.id)} is missing staged authority packet ` +
          `members: ${missingPaths.join(", ")}.`,
      });
    }
  }

  for (const headRule of head.rules) {
    const headOwner = affirmedBlueprintOwner(headRule.manifestPath);
    if (!headOwner) continue;
    const stagedMatches = stagedRulesById.get(headRule.id) ?? [];
    if (stagedMatches.length === 0) {
      const residue = headRule.authorityPaths.filter((authorityPath) =>
        stagedPaths.has(normalizeRepoPath(authorityPath))
      );
      if (residue.length > 0) {
        findings.push({
          code: "blueprint-packet-residue",
          ruleId: headRule.id,
          path: headRule.manifestPath,
          message:
            `Retiring affirmed blueprint rule ${JSON.stringify(headRule.id)} requires its complete ` +
            `declared authority packet; staged residue remains: ${residue.join(", ")}.`,
        });
      }
      continue;
    }
    if (stagedMatches.length !== 1) continue;

    const stagedRule = stagedMatches[0];
    if (!stagedRule) continue;
    const stagedOwner = affirmedBlueprintOwner(stagedRule.manifestPath);
    if (!stagedOwner) {
      findings.push({
        code: "blueprint-authority-demoted",
        ruleId: headRule.id,
        path: stagedRule.manifestPath,
        message:
          `Affirmed blueprint rule ${JSON.stringify(headRule.id)} cannot move from ` +
          `${JSON.stringify(headOwner)} into niche or remainder authority.`,
      });
      continue;
    }
    if (stagedOwner !== headOwner) {
      findings.push({
        code: "blueprint-owner-changed",
        ruleId: headRule.id,
        path: stagedRule.manifestPath,
        message:
          `Affirmed blueprint rule ${JSON.stringify(headRule.id)} cannot change owner from ` +
          `${JSON.stringify(headOwner)} to ${JSON.stringify(stagedOwner)}.`,
      });
      continue;
    }

    const stagedAuthorityPaths = new Set(stagedRule.authorityPaths.map(normalizeRepoPath));
    const residue = headRule.authorityPaths.filter((authorityPath) => {
      const normalized = normalizeRepoPath(authorityPath);
      return !stagedAuthorityPaths.has(normalized) && stagedPaths.has(normalized);
    });
    if (residue.length > 0) {
      findings.push({
        code: "blueprint-packet-residue",
        ruleId: headRule.id,
        path: stagedRule.manifestPath,
        message:
          `Moving affirmed blueprint rule ${JSON.stringify(headRule.id)} requires retiring replaced ` +
          `authority packet members: ${residue.join(", ")}.`,
      });
    }
  }

  return findings;
}

/** Returns the top-level affirmed blueprint owner encoded by a manifest path. */
export function affirmedBlueprintOwner(manifestPath: string): string | null {
  const normalized = normalizeRepoPath(manifestPath);
  const prefix = ".habitat/blueprints/";
  if (!normalized.startsWith(prefix)) return null;
  return normalized.slice(prefix.length).split("/")[0] || null;
}

function rulesById(
  rules: readonly RuleAuthoritySnapshot[]
): Map<string, readonly RuleAuthoritySnapshot[]> {
  const grouped = new Map<string, RuleAuthoritySnapshot[]>();
  for (const rule of rules) grouped.set(rule.id, [...(grouped.get(rule.id) ?? []), rule]);
  return grouped;
}

function normalizeRepoPath(filePath: string): string {
  return filePath.replace(/\\/g, "/").replace(/^\.\//, "");
}
