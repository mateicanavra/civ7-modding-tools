import path from "node:path";
import { Value } from "typebox/value";
import type {
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

export function packetRolePath(
  location: HabitatPacketLocation,
  roleFilename: string
): string {
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
  rawRecord: unknown
): RuleRegistryRecordV1 {
  const location = packetLocationFromArtifactPath(rulePath);
  if (!location) {
    throw new Error(
      `Rule file must live under .habitat/<niche>/blueprints/<blueprint>/<category>/<kind>/<packet>/rule.json.`
    );
  }

  const input = Value.Parse(RuleRegistryRecordInputV1Schema, rawRecord) as RuleRegistryRecordInputV1;
  const record: RuleRegistryRecordV1 = {
    ...input,
    id: location.packetId,
    title: titleFromPacketId(location.packetId),
    exceptionPath: input.exceptionPath ?? "none",
    ...(input.ownerTool === "structure-check"
      ? { structureFile: packetRolePath(location, packetStructureFilename) }
      : {}),
    ...(input.ownerTool === "source-check" || input.ownerTool === "grit-check"
      ? { patternName: input.patternName ?? location.packetId }
      : {}),
  } as RuleRegistryRecordV1;
  return Value.Parse(RuleRegistryRecordV1Schema, record) as RuleRegistryRecordV1;
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
