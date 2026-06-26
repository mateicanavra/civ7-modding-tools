import type {
  parseRuleRegistryDocument,
  RuleRegistryRecordV1,
} from "@internal/habitat-harness/core/domains/rule-registry/index";
import { expect } from "vitest";

export function registryDocument(rules: unknown[]): unknown {
  return {
    schemaVersion: 1,
    ownerRoots: {
      "@internal/habitat-harness": "tools/habitat-harness",
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
    ownerTool: "command-check",
    ownerProject: "@internal/habitat-harness",
    lane: "enforced",
    scope: "workspace",
    forbids: "broken structure",
    why: "Keeps the workspace structurally coherent.",
    detect: ["habitat", "check", "--rule", "sample-rule"],
    remediate: null,
    message: "Fix the structural issue.",
    exceptionPath: "none",
    pathCoverage: [{ kind: "project-owner" }],
  } satisfies RuleRegistryRecordV1;
  return { ...rule, ...overrides } as RuleRegistryRecordV1;
}
