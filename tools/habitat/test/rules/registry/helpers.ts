import type {
  PacketRunner,
  parseRuleRegistryDocument,
  RuleRegistryRecordV1,
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
    ownerProject: "habitat",
    lane: "enforced",
    forbids: "broken structure",
    why: "Keeps the workspace structurally coherent.",
    remediate: null,
    message: "Fix the structural issue.",
    exceptionPath: "none",
    pathCoverage: [{ kind: "project-owner" }],
    runner: habitatScriptRunner("sample-rule"),
  } satisfies RuleRegistryRecordV1;
  return { ...rule, ...overrides } as RuleRegistryRecordV1;
}

export function habitatScriptRunner(
  id: string,
  runtime: "bun" | "node" | "bash" = "node"
): PacketRunner {
  const filename = runtime === "bash" ? "check.sh" : runtime === "bun" ? "check.ts" : "check.mjs";
  return {
    name: "habitat",
    mode: "script",
    scriptPath: `.habitat/fixtures/blueprints/_self/quality/check/${id}/${filename}`,
    runtime,
  };
}

export function gritRunner(id: string): PacketRunner {
  return {
    name: "grit",
    patternPath: `.habitat/fixtures/blueprints/_self/quality/check/${id}/pattern.md`,
    patternName: id,
  };
}

export function habitatStructureRunner(id: string): PacketRunner {
  return {
    name: "habitat",
    mode: "structure",
    structurePath: `.habitat/fixtures/blueprints/_self/structure/check/${id}/structure.toml`,
  };
}

export function habitatFileLayerRunner(
  guard: "generated-zone" | "forbidden-file-name" | "host-surface"
): PacketRunner {
  return { name: "habitat", mode: "file-layer", guard };
}

export function nxRunner(project = "habitat", target = "test"): PacketRunner {
  return { name: "nx", target: { project, target } };
}
