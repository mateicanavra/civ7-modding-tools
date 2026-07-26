import {
  evaluateAffirmedBlueprintContinuity,
  type RuleAuthoritySnapshot,
  type RuleRegistryAuthoritySnapshot,
} from "@habitat/cli/service/model/rules/index";
import { describe, expect, test } from "vitest";

describe("affirmed blueprint continuity", () => {
  test("allows an atomic internal move within the same affirmed blueprint", () => {
    const headRule = rule("source-topology", "domain", "old-packet");
    const stagedRule = rule("source-topology", "domain", "new-packet");

    expect(
      evaluateAffirmedBlueprintContinuity(snapshot([headRule]), snapshot([stagedRule]))
    ).toEqual([]);
  });

  test("rejects moving a stable rule identity across affirmed blueprint owners", () => {
    const headRule = rule("source-topology", "domain", "source-topology");
    const stagedRule = rule("source-topology", "recipe", "source-topology");

    expect(codes(snapshot([headRule]), snapshot([stagedRule]))).toContain(
      "blueprint-owner-changed"
    );
  });

  test("rejects demoting a stable rule identity into niche authority", () => {
    const headRule = rule("source-topology", "domain", "source-topology");
    const stagedRule = {
      ...rule("source-topology", "domain", "source-topology"),
      manifestPath: ".habitat/civ7/mapgen/domains/rules/source-topology/rule.json",
      authorityPaths: [
        ".habitat/civ7/mapgen/domains/rules/source-topology/rule.json",
        ".habitat/civ7/mapgen/domains/rules/source-topology/structure.toml",
      ],
    };

    expect(codes(snapshot([headRule]), snapshot([stagedRule]))).toContain(
      "blueprint-authority-demoted"
    );
  });

  test("allows retiring a complete declared authority packet", () => {
    expect(evaluateAffirmedBlueprintContinuity(snapshot([rule()]), snapshot([]))).toEqual([]);
  });

  test("rejects deleting a manifest while leaving declared packet members", () => {
    const headRule = rule();
    const staged = snapshot([], [headRule.authorityPaths[1] ?? ""]);

    expect(codes(snapshot([headRule]), staged)).toContain("blueprint-packet-residue");
  });

  test("rejects retaining a manifest while deleting declared packet members", () => {
    const headRule = rule();
    const staged = snapshot([headRule], [headRule.manifestPath]);

    expect(codes(snapshot([headRule]), staged)).toContain("blueprint-packet-incomplete");
  });

  test("correlates delete and add by stable id rather than rename metadata", () => {
    const deleted = rule("source-topology", "domain", "source-topology");
    const added = rule("source-topology", "artifact", "source-topology");

    expect(codes(snapshot([deleted]), snapshot([added]))).toContain("blueprint-owner-changed");
  });

  test("requires physical affirmed ownership to match placement metadata", () => {
    const headRule = rule();
    const stagedRule = { ...headRule, placementBlueprint: "recipe" };

    expect(codes(snapshot([headRule]), snapshot([stagedRule]))).toContain(
      "blueprint-placement-mismatch"
    );
  });
});

function rule(
  id = "source-topology",
  blueprint = "domain",
  packet = "source-topology"
): RuleAuthoritySnapshot {
  const root = `.habitat/blueprints/${blueprint}/${packet}`;
  return {
    id,
    manifestPath: `${root}/rule.json`,
    placementBlueprint: blueprint,
    authorityPaths: [`${root}/rule.json`, `${root}/structure.toml`],
  };
}

function snapshot(
  rules: readonly RuleAuthoritySnapshot[],
  paths = rules.flatMap((candidate) => candidate.authorityPaths)
): RuleRegistryAuthoritySnapshot {
  return { rules, paths };
}

function codes(
  head: RuleRegistryAuthoritySnapshot,
  staged: RuleRegistryAuthoritySnapshot
): string[] {
  return evaluateAffirmedBlueprintContinuity(head, staged).map((finding) => finding.code);
}
