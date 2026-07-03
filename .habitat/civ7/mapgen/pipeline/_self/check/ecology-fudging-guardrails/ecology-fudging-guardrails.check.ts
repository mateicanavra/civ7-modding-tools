#!/usr/bin/env bun
import { execFileSync } from "node:child_process";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";

type Finding = Readonly<{
  file: string;
  line: number;
  pattern: string;
  text: string;
}>;

const repoRoot = execFileSync("git", ["rev-parse", "--show-toplevel"], {
  encoding: "utf8",
}).trim();
const modRoot = path.join(repoRoot, "mods/mod-swooper-maps");

function walkFiles(rootDir: string, exts: readonly string[]): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(rootDir, { withFileTypes: true })) {
    const abs = path.join(rootDir, entry.name);
    if (entry.isDirectory()) {
      out.push(...walkFiles(abs, exts));
    } else if (entry.isFile() && exts.some((ext) => abs.endsWith(ext))) {
      out.push(abs);
    }
  }
  return out.sort((a, b) => a.localeCompare(b));
}

function scanFile(
  absFile: string,
  workspaceRoot: string,
  patterns: readonly { name: string; re: RegExp }[]
): Finding[] {
  const text = readFileSync(absFile, "utf8");
  const lines = text.split(/\r?\n/u);
  const relFile = path.relative(workspaceRoot, absFile);
  const findings: Finding[] = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i] ?? "";
    for (const { name, re } of patterns) {
      if (re.test(line)) findings.push({ file: relFile, line: i + 1, pattern: name, text: line.trim() });
    }
  }
  return findings;
}

const ecologyRoots = [
  path.join(modRoot, "src/domain/ecology"),
  path.join(modRoot, "src/recipes/standard/stages/ecology"),
  path.join(modRoot, "src/recipes/standard/stages/ecology-pedology"),
  path.join(modRoot, "src/recipes/standard/stages/ecology-biomes"),
  path.join(modRoot, "src/recipes/standard/stages/ecology-features"),
  path.join(modRoot, "src/recipes/standard/stages/map-ecology"),
];
const ecologyPatterns = [
  { name: "rollPercent", re: /\brollPercent\b/u },
  { name: "coverageChance", re: /\bcoverageChance\b/u },
  { name: "chance", re: /\bchance\b/iu },
  { name: "multiplier", re: /\bmultiplier\b/iu },
];

const scopedRuntimeRoots = [
  path.join(modRoot, "src/domain/ecology/ops/classify-biomes/layers"),
  path.join(modRoot, "src/domain/ecology/ops/classify-biomes/rules"),
  path.join(modRoot, "src/domain/ecology/ops/features-plan-vegetation/strategies"),
  path.join(modRoot, "src/domain/ecology/ops/features-plan-wetlands/strategies"),
  path.join(modRoot, "src/domain/ecology/ops/features-plan-reefs/strategies"),
  path.join(modRoot, "src/domain/ecology/ops/features-plan-ice/strategies"),
];
const scopedRuntimePatterns = [
  { name: "createLabelRng", re: /\bcreateLabelRng\b/u },
  { name: "rngCall", re: /\brng\s*\(/u },
  { name: "bandpass", re: /\bbandpass\b/iu },
  { name: "rampUp01", re: /\brampUp01\s*\(/u },
  { name: "rampDown01", re: /\brampDown01\s*\(/u },
  { name: "window01", re: /\bwindow01\s*\(/u },
  { name: "bonusTerm", re: /\bbonus\b/iu },
  { name: "penaltyTerm", re: /\bpenalty\b/iu },
  { name: "minScoreGate", re: /\bminScore01\b.*[<>]=?|[<>]=?.*\bminScore01\b/u },
];

const hydrologyPlacementRoots = [
  path.join(modRoot, "src/domain/hydrology/ops/plan-lakes"),
  path.join(modRoot, "src/domain/placement"),
  path.join(modRoot, "src/recipes/standard/stages/map-hydrology/steps"),
  path.join(modRoot, "src/recipes/standard/stages/map-rivers/steps"),
  path.join(modRoot, "src/recipes/standard/stages/placement"),
];
const hydrologyPlacementPatterns = [
  { name: "createLabelRng", re: /\bcreateLabelRng\b/u },
  { name: "rngCall", re: /\brng\s*\(/u },
  { name: "rollPercent", re: /\brollPercent\b/u },
  { name: "coverageChance", re: /\bcoverageChance\b/u },
  { name: "legacy.addNaturalWonders", re: /\baddNaturalWonders\s*\(/u },
  { name: "legacy.generateResources", re: /\bgenerateResources\s*\(/u },
  { name: "legacy.generateDiscoveries", re: /\bgenerateDiscoveries\s*\(/u },
  { name: "legacy.naturalWonderModule", re: /natural-wonder-generator\.js/u },
  { name: "legacy.resourceModule", re: /resource-generator\.js/u },
  { name: "legacy.discoveryModule", re: /discovery-generator\.js/u },
];

const findings = [
  ...ecologyRoots.flatMap((root) => walkFiles(root, [".ts", ".json"])).flatMap((file) =>
    scanFile(file, modRoot, ecologyPatterns)
  ),
  ...scopedRuntimeRoots
    .flatMap((root) => walkFiles(root, [".ts"]))
    .filter((file) => !file.endsWith(".schema.ts"))
    .flatMap((file) => scanFile(file, modRoot, scopedRuntimePatterns)),
  ...hydrologyPlacementRoots
    .flatMap((root) => walkFiles(root, [".ts"]))
    .flatMap((file) => scanFile(file, repoRoot, hydrologyPlacementPatterns)),
];

if (findings.length > 0) {
  console.error(
    findings
      .sort((a, b) => `${a.file}:${a.line}`.localeCompare(`${b.file}:${b.line}`))
      .map((finding) => `${finding.file}:${finding.line} [${finding.pattern}] ${finding.text}`)
      .join("\n")
  );
  process.exit(1);
}
