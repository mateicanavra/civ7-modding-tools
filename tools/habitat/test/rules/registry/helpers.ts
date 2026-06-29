import type {
  parseRuleRegistryDocument,
  RuleRegistryRecordV1,
  RuleRunner,
} from "@habitat/cli/service/model/rules/index";
import { expect } from "vitest";

export function registryDocument(rules: unknown[]): unknown {
  return {
    schemaVersion: 1,
    ownerRoots: {
      habitat: "tools/habitat",
      "mod-swooper-maps": "mods/mod-swooper-maps",
    },
    rules,
  };
}

export function expectInvalid(
  result: ReturnType<typeof parseRuleRegistryDocument>,
  code: "registry-schema-invalid" | "registry-duplicate-rule-id" | "registry-json-invalid"
): void {
  expect(result.ok).toBe(false);
  if (!result.ok) expect(result.issues.some((issue) => issue.code === code)).toBe(true);
}

export function baseRule(overrides: Record<string, unknown> = {}): RuleRegistryRecordV1 {
  const rule = {
    id: "sample-rule",
    schemaVersion: 1,
    title: "Sample Rule",
    placement: {
      niche: "fixtures",
      blueprint: "_self",
      category: "quality",
      artifactKind: "check",
    },
    ownerProject: "habitat",
    lane: "enforced",
    forbids: "broken structure",
    why: "Keeps the workspace structurally coherent.",
    remediate: null,
    message: "Fix the structural issue.",
    pathCoverage: [{ kind: "project-owner" }],
    artifacts: {
      baseline: ".habitat/fixtures/blueprints/_self/quality/check/sample-rule/baseline.json",
    },
    runner: habitatScriptRunner("sample-rule"),
  } satisfies RuleRegistryRecordV1;
  return { ...rule, ...overrides } as RuleRegistryRecordV1;
}

export function habitatScriptRunner(
  id: string,
  runtime: "bun" | "node" | "bash" = "node"
): RuleRunner {
  const filename = runtime === "bash" ? "check.sh" : runtime === "bun" ? "check.ts" : "check.mjs";
  return {
    name: "habitat",
    mode: "script",
    files: { script: `.habitat/fixtures/blueprints/_self/quality/check/${id}/${filename}` },
    runtime,
  };
}

export function gritRunner(id: string): RuleRunner {
  return {
    name: "grit",
    files: { pattern: `.habitat/fixtures/blueprints/_self/quality/check/${id}/pattern.md` },
    patternName: id,
  };
}

export function habitatStructureRunner(id: string): RuleRunner {
  return {
    name: "habitat",
    mode: "structure",
    files: { structure: `.habitat/fixtures/blueprints/_self/structure/check/${id}/structure.toml` },
  };
}

export function habitatFileLayerRunner(
  guard: "generated-zone" | "forbidden-file-name" | "host-surface"
): RuleRunner {
  return { name: "habitat", mode: "file-layer", guard };
}

export function nxRunner(project = "habitat", target = "test"): RuleRunner {
  return { name: "nx", target: { project, target } };
}
