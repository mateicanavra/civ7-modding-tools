const { readJson, writeJson } = require("@nx/devkit");
const { Context, Data, Effect, Layer } = require("effect");
const {
  patternAuthorityManifestPath,
  patternAuthorityRuleReferenceFromRule,
  validatePatternAuthorityManifest,
} = require("../../rules/pattern-authority/manifest.ts");

class PatternPromotionStore extends Context.Tag(
  "@internal/habitat-harness/PatternPromotionStore"
)() {}

class PatternPromotionFailure extends Data.TaggedError("PatternPromotionFailure") {}

function makeNxTreePatternPromotionStoreLayer(tree) {
  return Layer.succeed(PatternPromotionStore, {
    exists: (path) => Effect.sync(() => tree.exists(path)),
    readJson: (path) =>
      Effect.try({
        try: () => readJson(tree, path),
        catch: (error) =>
          new PatternPromotionFailure({
            reason: "manifest-unreadable",
            message: `Required promotion JSON '${path}' is not readable: ${errorMessage(error)}`,
          }),
      }),
    writeText: (path, text) => Effect.sync(() => tree.write(path, text)),
    writeJson: (path, value) => Effect.sync(() => writeJson(tree, path, value)),
  });
}

function registeredPatternPromotionProgram(input) {
  return Effect.gen(function* () {
    const store = yield* PatternPromotionStore;
    if (!input.manifestPath) {
      return yield* fail("missing-manifest-path", input.ruleId, "requires --manifestPath");
    }

    const manifestValue = yield* store.readJson(input.manifestPath);
    const validation = validatePatternAuthorityManifest(manifestValue, {
      manifestPath: input.manifestPath,
      requireRuleReference: true,
      ruleReferences: [
        patternAuthorityRuleReferenceFromRule({
          id: input.ruleId,
          gritPattern: input.patternName,
          manifestPath: input.manifestPath,
          ownerTool: "grit-check",
          lane: input.lifecycle === "registered-enforced" ? "enforced" : "advisory",
          localFeedback: input.hookScope === "pre-commit" ? { preCommit: true } : undefined,
        }),
      ],
    });
    if (!validation.ok) {
      return yield* fail(
        "manifest-rejected",
        input.ruleId,
        `refused by Pattern Authority Manifest: ${validation.issues
          .map((issue) => `${issue.reason} at ${issue.path}: ${issue.message}`)
          .join("; ")}`
      );
    }

    const manifest = validation.manifest;
    yield* validateRegisteredBaselineContract(store, manifest);

    const activePatternPath = `.grit/patterns/habitat/checks/${input.patternName}.md`;
    yield* failIfExists(
      store,
      activePatternPath,
      input.ruleId,
      "active Grit pattern already exists"
    );
    yield* failIfExists(
      store,
      `tools/habitat-harness/src/rules/pattern-authority/candidates/${input.ruleId}.json`,
      input.ruleId,
      "candidate manifest already exists for registered rule"
    );
    yield* failIfExists(
      store,
      `tools/habitat-harness/src/rules/pattern-authority/candidates/${input.patternName}.md`,
      input.ruleId,
      "candidate pattern already exists for registered rule"
    );

    const rulesPath = "tools/habitat-harness/src/rules/rules.json";
    const rulesFile = yield* store.readJson(rulesPath);
    const rulesJson = normalizeRulesJson(rulesFile, input.ruleId);
    const ruleEntry = registeredRuleEntry(input, manifest);
    yield* store.writeText(activePatternPath, registeredPatternMarkdown(input, manifest));
    yield* store.writeJson(rulesPath, {
      ...rulesJson,
      rules: [...rulesJson.rules, ruleEntry],
    });

    return {
      writtenPaths: [activePatternPath, rulesPath],
      ruleId: input.ruleId,
      patternName: input.patternName,
      lifecycle: input.lifecycle,
    };
  });
}

function registeredRuleEntry(input, manifest) {
  const lane = input.lifecycle === "registered-enforced" ? "enforced" : "advisory";
  return {
    id: input.ruleId,
    ownerTool: "grit-check",
    ownerProject: manifest.ownerProject,
    lane,
    scope: `include: ${manifest.scanRoots.include.join(", ")}; exclude: ${manifest.scanRoots.exclude.join(", ")}`,
    forbids: `Matches generated Grit pattern '${input.patternName}' under the accepted Pattern Authority Manifest.`,
    why: manifest.normativeSources.map((source) => source.claim).join(" "),
    detect: ["habitat", "check", "--tool", "grit-check"],
    remediate: null,
    message: `Review Pattern Authority Manifest ${input.manifestPath}.`,
    exceptionPath: "none",
    gritPattern: input.patternName,
    scanRoots: [...manifest.scanRoots.include],
    manifestPath: input.manifestPath,
    ...(manifest.hookScope.decision === "pre-commit"
      ? { localFeedback: { preCommit: true } }
      : {}),
  };
}

function registeredPatternMarkdown(input, manifest) {
  const identifier = `__habitat_forbidden_${input.patternName}`.replace(/[^a-zA-Z0-9_]/g, "_");
  const lane = input.lifecycle === "registered-enforced" ? "enforced" : "advisory";
  return `---\nlevel: error\ntags:\n  - habitat-generated\n  - habitat-${lane}\n---\n# ${titleize(input.ruleId)}\n\nGenerated registered ${lane} pattern. Habitat authority is stored in \`${manifest.baselineContract.ruleIntroductionManifest}\` and \`${input.manifestPath}\`; Grit prose is not the authority source.\n\n\`\`\`grit\nlanguage ${manifest.language.gritLanguage}\n\n\`${identifier}($value)\`\n\`\`\`\n\n## Matches fixture\n\n\`\`\`typescript\n${identifier}(\"violation\");\n\`\`\`\n\n\`\`\`typescript\n${identifier}(\"violation\");\n\`\`\`\n\n## Ignores fixture\n\n\`\`\`typescript\nconst allowed = \"${identifier}\";\n\`\`\`\n`;
}

function normalizeRulesJson(value, ruleId) {
  if (!value || typeof value !== "object" || !Array.isArray(value.rules)) {
    throw new PatternPromotionFailure({
      reason: "manifest-unreadable",
      message: "tools/habitat-harness/src/rules/rules.json must contain a rules array.",
    });
  }
  if (value.rules.some((rule) => rule && typeof rule === "object" && rule.id === ruleId)) {
    throw new PatternPromotionFailure({
      reason: "unexpected-collision",
      message: `Habitat rule already exists: ${ruleId}`,
    });
  }
  return value;
}

function validateRegisteredBaselineContract(store, manifest) {
  return Effect.gen(function* () {
    const baseline = manifest.baselineContract;
    const expectedBaselinePath = `tools/habitat-harness/baselines/${manifest.ruleId}.json`;
    if (baseline.baselinePath !== expectedBaselinePath) {
      return yield* fail(
        "baseline-contract-rejected",
        manifest.ruleId,
        `baseline path must be '${expectedBaselinePath}'`
      );
    }
    if (baseline.baselineAction === "blocked") {
      return yield* fail(
        "baseline-contract-rejected",
        manifest.ruleId,
        "blocked baseline action cannot be registered"
      );
    }

    const [baselineExists, introductionManifestExists] = yield* Effect.all([
      store.exists(baseline.baselinePath),
      store.exists(baseline.ruleIntroductionManifest),
    ]);
    if (!baselineExists) {
      return yield* fail(
        "baseline-contract-rejected",
        manifest.ruleId,
        `baseline file '${baseline.baselinePath}' must already exist before registered promotion`
      );
    }
    if (!introductionManifestExists) {
      return yield* fail(
        "baseline-contract-rejected",
        manifest.ruleId,
        `rule-introduction baseline manifest '${baseline.ruleIntroductionManifest}' must already exist before registered promotion`
      );
    }

    const [baselineJson, introductionManifest] = yield* Effect.all([
      store.readJson(baseline.baselinePath),
      store.readJson(baseline.ruleIntroductionManifest),
    ]);
    if (!Array.isArray(baselineJson) || baselineJson.some((key) => typeof key !== "string")) {
      return yield* fail(
        "baseline-contract-rejected",
        manifest.ruleId,
        `baseline file '${baseline.baselinePath}' must contain a JSON string array`
      );
    }
    if (baseline.baselineAction === "committed-empty" && baselineJson.length > 0) {
      return yield* fail(
        "baseline-contract-rejected",
        manifest.ruleId,
        "committed-empty baseline action requires an explicit empty baseline file"
      );
    }
    const sortedBaselineKeys = [...baselineJson].sort();
    const sortedManifestKeys = [...(introductionManifest.initialBaselineKeys ?? [])].sort();
    if (
      introductionManifest.ruleId !== manifest.ruleId ||
      introductionManifest.ownerProject !== manifest.ownerProject ||
      introductionManifest.ownerTool !== manifest.ownerTool ||
      introductionManifest.baselinePath !== baseline.baselinePath ||
      !Array.isArray(introductionManifest.initialBaselineKeys) ||
      sortedBaselineKeys.length !== sortedManifestKeys.length ||
      sortedBaselineKeys.some((key, index) => key !== sortedManifestKeys[index]) ||
      typeof introductionManifest.changeId !== "string" ||
      typeof introductionManifest.comparisonBase !== "string"
    ) {
      return yield* fail(
        "baseline-contract-rejected",
        manifest.ruleId,
        `rule-introduction baseline manifest '${baseline.ruleIntroductionManifest}' does not match the requested registration`
      );
    }
  });
}

function failIfExists(store, path, ruleId, message) {
  return store
    .exists(path)
    .pipe(
      Effect.flatMap((exists) =>
        exists ? fail("unexpected-collision", ruleId, `${message}: ${path}`) : Effect.void
      )
    );
}

function fail(reason, ruleId, message) {
  return Effect.fail(
    new PatternPromotionFailure({
      reason,
      message: `Registered pattern generation for '${ruleId}' ${message}.`,
    })
  );
}

function titleize(value) {
  return value
    .split("-")
    .map((part) => part.slice(0, 1).toUpperCase() + part.slice(1))
    .join(" ");
}

function errorMessage(error) {
  return error instanceof Error ? error.message : String(error);
}

module.exports = {
  makeNxTreePatternPromotionStoreLayer,
  PatternPromotionFailure,
  registeredPatternPromotionProgram,
};
