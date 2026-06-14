const { writeJson } = require("@nx/devkit");

async function patternGenerator(tree, rawOptions) {
  const options = normalizeOptions(rawOptions);
  const patternPath = `.grit/patterns/habitat/checks/${options.patternName}.md`;
  const baselinePath = `tools/habitat-harness/baselines/${options.ruleId}.json`;
  const rulesPath = "tools/habitat-harness/src/rules/rules.json";

  if (tree.exists(patternPath)) throw new Error(`Grit pattern already exists: ${patternPath}`);
  if (tree.exists(baselinePath)) throw new Error(`Baseline already exists: ${baselinePath}`);

  const rulesText = tree.read(rulesPath, "utf8");
  const rulesJson = JSON.parse(rulesText);
  if (rulesJson.rules.some((rule) => rule.id === options.ruleId)) {
    throw new Error(`Habitat rule already exists: ${options.ruleId}`);
  }

  tree.write(patternPath, patternMarkdown(options));
  writeJson(tree, baselinePath, []);
  tree.write(rulesPath, insertRule(rulesText, ruleEntry(options)));
}

function normalizeOptions(rawOptions) {
  const ruleId = kebabLike(rawOptions.ruleId);
  const patternName = snakeLike(rawOptions.patternName ?? ruleId.replace(/^grit-/, ""));
  return {
    ruleId,
    patternName,
    identifier: identifierFor(patternName),
    ownerProject: rawOptions.ownerProject ?? "@internal/habitat-harness",
    scope: rawOptions.scope ?? "generated scaffold scope",
    forbids: rawOptions.forbids ?? "generated scaffold forbidden shape",
    why:
      rawOptions.why ??
      "Generated rule scaffold; replace with the architectural rationale before merging production use.",
    message: rawOptions.message ?? "Generated Habitat Grit rule scaffold matched.",
  };
}

function ruleEntry(options) {
  return {
    id: options.ruleId,
    ownerTool: "grit-check",
    ownerProject: options.ownerProject,
    lane: "enforced",
    scope: options.scope,
    forbids: options.forbids,
    why: options.why,
    detect: ["habitat", "check", "--tool", "grit-check"],
    remediate: null,
    message: options.message,
    exceptionPath: "none",
    gritPattern: options.patternName,
    hookScope: "pre-commit",
  };
}

function insertRule(rulesText, rule) {
  const marker = "\n  ]\n}\n";
  if (!rulesText.endsWith(marker)) {
    throw new Error("Could not locate the Habitat rules array terminator.");
  }
  return `${rulesText.slice(0, -marker.length)},\n${renderRule(rule)}${marker}`;
}

function renderRule(rule) {
  return `    {\n      "id": "${escapeJson(rule.id)}",\n      "ownerTool": "grit-check",\n      "ownerProject": "${escapeJson(rule.ownerProject)}",\n      "lane": "enforced",\n      "scope": "${escapeJson(rule.scope)}",\n      "forbids": "${escapeJson(rule.forbids)}",\n      "why": "${escapeJson(rule.why)}",\n      "detect": ["habitat", "check", "--tool", "grit-check"],\n      "remediate": null,\n      "message": "${escapeJson(rule.message)}",\n      "exceptionPath": "none",\n      "gritPattern": "${escapeJson(rule.gritPattern)}",\n      "hookScope": "pre-commit"\n    }`;
}

function patternMarkdown(options) {
  return `---\nlevel: error\n---\n# ${titleize(options.ruleId)}\n\n${options.why}\n\n\`\`\`grit\nlanguage js(typescript)\n\n\`${options.identifier}($value)\`\n\`\`\`\n\n## Matches fixture\n\n\`\`\`typescript\n${options.identifier}(\"violation\");\n\`\`\`\n\n\`\`\`typescript\n${options.identifier}(\"violation\");\n\`\`\`\n\n## Ignores fixture\n\n\`\`\`typescript\nconst allowed = \"${options.identifier}\";\n\`\`\`\n`;
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

function escapeJson(value) {
  return String(value).replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

module.exports = {
  patternGenerator,
  default: patternGenerator,
};
