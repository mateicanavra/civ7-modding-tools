const { writeJson } = require("@nx/devkit");

async function patternGenerator(tree, rawOptions) {
  const options = normalizeOptions(rawOptions);
  validateNoActiveRegistrationCollision(tree, options);

  if (options.lifecycle !== "candidate") {
    throw new Error(
      `Registered pattern generation for '${options.ruleId}' is blocked until ` +
        "Pattern Authority Manifest validation, baseline-manifest consumption, " +
        "current-tree proof, and the registered-promotion Effect decision are accepted."
    );
  }

  const candidatePaths = candidateArtifactPaths(options);
  if (tree.exists(candidatePaths.patternPath)) {
    throw new Error(`Pattern candidate already exists: ${candidatePaths.patternPath}`);
  }
  if (tree.exists(candidatePaths.manifestPath)) {
    throw new Error(`Pattern Authority Manifest candidate already exists: ${candidatePaths.manifestPath}`);
  }

  tree.write(candidatePaths.patternPath, candidatePatternMarkdown(options));
  writeJson(tree, candidatePaths.manifestPath, candidateManifest(options, candidatePaths));
}

function normalizeOptions(rawOptions) {
  const ruleId = kebabLike(rawOptions.ruleId);
  const patternName = snakeLike(rawOptions.patternName ?? ruleId.replace(/^grit-/, ""));
  return {
    ruleId,
    patternName,
    lifecycle: normalizeLifecycle(rawOptions.lifecycle ?? "candidate"),
    identifier: identifierFor(patternName),
    ownerProject: rawOptions.ownerProject ?? "@internal/habitat-harness",
    openspecChangeId: rawOptions.openspecChangeId ?? "candidate-draft",
  };
}

function normalizeLifecycle(value) {
  const lifecycle = String(value);
  if (
    lifecycle !== "candidate" &&
    lifecycle !== "registered-advisory" &&
    lifecycle !== "registered-enforced"
  ) {
    throw new Error(`Unsupported pattern lifecycle '${lifecycle}'.`);
  }
  return lifecycle;
}

function validateNoActiveRegistrationCollision(tree, options) {
  const activePatternPath = `.grit/patterns/habitat/checks/${options.patternName}.md`;
  const baselinePath = `tools/habitat-harness/baselines/${options.ruleId}.json`;
  const rulesPath = "tools/habitat-harness/src/rules/rules.json";

  if (tree.exists(activePatternPath)) throw new Error(`Grit pattern already exists: ${activePatternPath}`);
  if (tree.exists(baselinePath)) throw new Error(`Baseline already exists: ${baselinePath}`);

  const rulesText = tree.read(rulesPath, "utf8");
  const rulesJson = JSON.parse(rulesText);
  if (rulesJson.rules.some((rule) => rule.id === options.ruleId)) {
    throw new Error(`Habitat rule already exists: ${options.ruleId}`);
  }
}

function candidateArtifactPaths(options) {
  const root = "tools/habitat-harness/src/rules/pattern-authority/candidates";
  return {
    patternPath: `${root}/${options.patternName}.md`,
    manifestPath: `${root}/${options.ruleId}.json`,
  };
}

function candidateManifest(options, paths) {
  return {
    schemaVersion: 1,
    ruleId: options.ruleId,
    patternName: options.patternName,
    lifecycle: "candidate",
    openspecChangeId: options.openspecChangeId,
    ownerProject: options.ownerProject,
    ownerTool: "grit-check",
    candidateArtifacts: {
      patternPath: paths.patternPath,
      manifestPath: paths.manifestPath,
    },
    registration: {
      accepted: false,
      reason:
        "candidate-only generation: not a Habitat rule, not an active Grit check, not hook-scoped, and not baselined",
    },
    requiredForRegistration: [
      "accepted authority source",
      "accepted proving source",
      "concrete scan roots and exclusions",
      "fixture strategy",
      "false-positive model",
      "current-tree scan result",
      "baseline rule-introduction manifest",
      "apply-safety disposition",
      "hook-scope decision",
    ],
  };
}

function candidatePatternMarkdown(options) {
  return `---\nlevel: info\ntags:\n  - habitat-candidate\n---\n# ${titleize(options.ruleId)} Candidate\n\nThis file is a non-enforcing Habitat candidate pattern draft. It is not loaded by the active Habitat Grit check catalog, is not registered in \`rules.json\`, and has no baseline or hook scope.\n\n\`\`\`grit\nlanguage js(typescript)\n\n\`${options.identifier}($value)\`\n\`\`\`\n\n## Matches fixture draft\n\n\`\`\`typescript\n${options.identifier}(\"violation\");\n\`\`\`\n\n\`\`\`typescript\n${options.identifier}(\"violation\");\n\`\`\`\n\n## Ignores fixture draft\n\n\`\`\`typescript\nconst allowed = \"${options.identifier}\";\n\`\`\`\n`;
}

function kebabLike(value) {
  const slug = String(value ?? "")
    .trim()
    .replace(/_/g, "-")
    .replace(/[^a-zA-Z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
  if (!slug) throw new Error("ruleId must contain at least one alphanumeric character.");
  return slug;
}

function snakeLike(value) {
  return kebabLike(value).replace(/-/g, "_");
}

function identifierFor(value) {
  return `__habitat_forbidden_${snakeLike(value)}`.replace(/[^a-zA-Z0-9_]/g, "_");
}

function titleize(value) {
  return kebabLike(value)
    .split("-")
    .map((part) => part.slice(0, 1).toUpperCase() + part.slice(1))
    .join(" ");
}

module.exports = {
  candidateArtifactPaths,
  patternGenerator,
  default: patternGenerator,
};
