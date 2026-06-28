import path from "node:path";
import { Value } from "typebox/value";
import type {
  PacketRunner,
  RuleRegistryRecordInputV1,
  RuleRegistryRecordV1,
} from "../dto/registry.schema.ts";
import {
  RuleRegistryRecordInputV1Schema,
  RuleRegistryRecordV1Schema,
} from "../dto/registry.schema.ts";

export const packetRuleFilename = "rule.json";
export const packetBaselineFilename = "baseline.json";
export const packetPatternFilename = "pattern.md";
export const packetApplyPatternFilename = "apply.pattern.md";
export const packetStructureFilename = "structure.toml";
export const packetScriptFilenames = ["check.ts", "check.mjs", "check.sh"] as const;

const packetRoleFilenames = new Set([
  packetRuleFilename,
  packetBaselineFilename,
  packetPatternFilename,
  packetApplyPatternFilename,
  packetStructureFilename,
  "check.ts",
  "check.mjs",
  "check.sh",
  "fix.mjs",
  "generate.ts",
  "generate.sh",
  "operation.md",
]);

export interface HabitatPacketLocation {
  readonly niche: string;
  readonly blueprint: string;
  readonly category: string;
  readonly artifactKind: string;
  readonly packetId: string;
  readonly packetDir: string;
}

export interface HabitatPacketRoleLocation extends HabitatPacketLocation {
  readonly roleFilename: string;
  readonly rolePath: string;
}

export function packetLocationFromArtifactPath(filePath: string): HabitatPacketRoleLocation | null {
  const normalized = toPosixPath(filePath);
  const segments = normalized.split("/").filter(Boolean);
  const blueprintsIndex = segments.lastIndexOf("blueprints");
  if (blueprintsIndex < 1 || segments.length < blueprintsIndex + 6) return null;

  const habitatIndex = segments.lastIndexOf(".habitat", blueprintsIndex);
  const nicheStart = habitatIndex >= 0 ? habitatIndex + 1 : 0;
  const nicheSegments = segments.slice(nicheStart, blueprintsIndex);
  if (nicheSegments.length === 0) return null;

  const roleFilename = segments[blueprintsIndex + 5];
  const packetSegments = segments.slice(
    habitatIndex >= 0 ? habitatIndex : nicheStart,
    blueprintsIndex + 5
  );
  return {
    niche: nicheSegments.join("/"),
    blueprint: segments[blueprintsIndex + 1],
    category: segments[blueprintsIndex + 2],
    artifactKind: segments[blueprintsIndex + 3],
    packetId: segments[blueprintsIndex + 4],
    packetDir: packetSegments.join("/"),
    roleFilename,
    rolePath: packetSegments.concat(roleFilename).join("/"),
  };
}

export function packetRolePath(location: HabitatPacketLocation, roleFilename: string): string {
  return `${location.packetDir}/${roleFilename}`;
}

export function isGenericPacketRolePath(filePath: string): boolean {
  const location = packetLocationFromArtifactPath(filePath);
  return location !== null && packetRoleFilenames.has(location.roleFilename);
}

export function isPacketRulePath(filePath: string): boolean {
  return packetLocationFromArtifactPath(filePath)?.roleFilename === packetRuleFilename;
}

export function isStalePrefixedPacketRolePath(filePath: string): boolean {
  const location = packetLocationFromArtifactPath(filePath);
  if (!location) return false;
  const prefix = `${location.packetId}.`;
  if (!location.roleFilename.startsWith(prefix)) return false;
  const suffix = location.roleFilename.slice(prefix.length);
  return packetRoleFilenames.has(suffix);
}

export function enrichPacketRuleRecord(
  rulePath: string,
  rawRecord: unknown,
  roleFilenames: readonly string[] = []
): RuleRegistryRecordV1 {
  const location = packetLocationFromArtifactPath(rulePath);
  if (!location) {
    throw new Error(
      `Rule file must live under .habitat/<niche>/blueprints/<blueprint>/<category>/<kind>/<packet>/rule.json.`
    );
  }

  const input = Value.Parse(
    RuleRegistryRecordInputV1Schema,
    rawRecord
  ) as RuleRegistryRecordInputV1;
  const runner = packetRunnerFromShape(location, input, roleFilenames);
  const record: RuleRegistryRecordV1 = {
    ...input,
    id: location.packetId,
    title: titleFromPacketId(location.packetId),
    exceptionPath: input.exceptionPath ?? "none",
    runner,
  } as RuleRegistryRecordV1;
  return Value.Parse(RuleRegistryRecordV1Schema, record) as RuleRegistryRecordV1;
}

export function packetRunnerFromShape(
  location: HabitatPacketLocation,
  input: RuleRegistryRecordInputV1,
  roleFilenames: readonly string[]
): PacketRunner {
  const roles = new Set(roleFilenames);
  const candidates: PacketRunner[] = [];

  if (roles.has(packetPatternFilename)) {
    candidates.push({
      name: "grit",
      patternPath: packetRolePath(location, packetPatternFilename),
      ...(roles.has(packetApplyPatternFilename)
        ? { applyPatternPath: packetRolePath(location, packetApplyPatternFilename) }
        : {}),
      patternName: input.patternName ?? location.packetId,
    });
  } else if (roles.has(packetApplyPatternFilename)) {
    throw new Error(`Packet '${location.packetId}' has apply.pattern.md without pattern.md.`);
  }

  if (roles.has(packetStructureFilename)) {
    candidates.push({
      name: "habitat",
      mode: "structure",
      structurePath: packetRolePath(location, packetStructureFilename),
    });
  }

  const scriptRoleFilenames = packetScriptFilenames.filter((filename) => roles.has(filename));
  if (scriptRoleFilenames.length > 1) {
    throw new Error(
      `Packet '${location.packetId}' has multiple check.* executable role files: ${scriptRoleFilenames.join(
        ", "
      )}.`
    );
  }
  const [scriptRoleFilename] = scriptRoleFilenames;
  if (scriptRoleFilename) {
    candidates.push({
      name: "habitat",
      mode: "script",
      scriptPath: packetRolePath(location, scriptRoleFilename),
      runtime: scriptRuntime(scriptRoleFilename),
    });
  }

  const fileLayerGuard = fileLayerGuardFromInput(location.packetId, input);
  if (fileLayerGuard) {
    candidates.push({ name: "habitat", mode: "file-layer", guard: fileLayerGuard });
  }

  if (input.graphTarget) {
    candidates.push({
      name: "nx",
      target: { ...input.graphTarget },
    });
  }

  if (candidates.length !== 1) {
    throw new Error(
      `Packet '${location.packetId}' must expose exactly one execution shape; found ${candidates.length}.`
    );
  }
  const runner = candidates[0] as PacketRunner;
  if (runner.name === "grit" && !input.scanRoots) {
    throw new Error(`Packet '${location.packetId}' derives grit runner but has no scanRoots.`);
  }
  return runner;
}

function scriptRuntime(roleFilename: (typeof packetScriptFilenames)[number]) {
  if (roleFilename === "check.ts") return "bun";
  if (roleFilename === "check.mjs") return "node";
  return "bash";
}

function fileLayerGuardFromInput(
  packetId: string,
  input: RuleRegistryRecordInputV1
): Extract<PacketRunner, { name: "habitat"; mode: "file-layer" }>["guard"] | undefined {
  const guards = [
    input.generatedZone ? "generated-zone" : undefined,
    input.forbiddenFileNames ? "forbidden-file-name" : undefined,
    input.hostSurfaceGuard ? "host-surface" : undefined,
  ].filter((guard): guard is "generated-zone" | "forbidden-file-name" | "host-surface" =>
    Boolean(guard)
  );
  if (guards.length > 1) {
    throw new Error(`Packet '${packetId}' has multiple file-layer guard facets.`);
  }
  return guards[0];
}

function toPosixPath(filePath: string): string {
  return filePath.split(path.sep).join("/");
}

function titleFromPacketId(packetId: string): string {
  return packetId
    .split(/[-_]/)
    .filter(Boolean)
    .map((part) => `${part.slice(0, 1).toUpperCase()}${part.slice(1)}`)
    .join(" ");
}
