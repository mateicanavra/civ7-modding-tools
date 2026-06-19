import { readJson, writeJson, type Tree } from "@nx/devkit";
import { Context, Data, Effect, Layer } from "effect";
import { type Static, Type } from "typebox";
import { Value } from "typebox/value";
import {
  type PatternAuthorityManifest,
  patternAuthorityManifestPath,
  patternAuthorityRuleReferenceFromRule,
  validatePatternAuthorityManifest,
} from "../../rules/pattern-authority/manifest.js";
import {
  parseRuleRegistryDocument,
  type RuleRegistryIssue,
} from "../../rules/registry/load.js";

export interface PatternPromotionInput {
  ruleId: string;
  patternName: string;
  lifecycle: "registered-advisory" | "registered-enforced";
  manifestPath?: string;
}

interface PatternPromotionStoreService {
  exists: (path: string) => Effect.Effect<boolean>;
  readJson: (path: string) => Effect.Effect<unknown, PatternPromotionFailure>;
  writeText: (path: string, text: string) => Effect.Effect<void>;
  writeJson: (path: string, value: unknown) => Effect.Effect<void>;
}

const RuleIntroductionBaselineManifestSchema = Type.Object(
  {
    ruleId: Type.String({ minLength: 1 }),
    ownerProject: Type.String({ minLength: 1 }),
    ownerTool: Type.String({ minLength: 1 }),
    baselinePath: Type.String({ minLength: 1 }),
    initialBaselineKeys: Type.Array(Type.String()),
    changeId: Type.String({ minLength: 1 }),
    comparisonBase: Type.String({ minLength: 1 }),
  },
  { additionalProperties: false }
);

const BaselineKeyArraySchema = Type.Array(Type.String());

type RuleIntroductionBaselineManifest = Static<
  typeof RuleIntroductionBaselineManifestSchema
>;

class PatternPromotionStore extends Context.Tag(
  "@internal/habitat-harness/PatternPromotionStore"
)<PatternPromotionStore, PatternPromotionStoreService>() {}

export class PatternPromotionFailure extends Data.TaggedError("PatternPromotionFailure")<{
  reason: string;
  message: string;
}> {}

export function makeNxTreePatternPromotionStoreLayer(
  tree: Tree
): Layer.Layer<PatternPromotionStore> {
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
    writeJson: (path, value) => Effect.sync(() => writeJson(tree, path, value as object)),
  });
}

export function registeredPatternPromotionProgram(input: PatternPromotionInput) {
  return Effect.gen(function* () {
    const store = yield* PatternPromotionStore;
    if (!input.manifestPath) {
      return yield* fail("missing-manifest-path", input.ruleId, "requires --manifestPath");
    }
    const inputWithManifest = { ...input, manifestPath: input.manifestPath };

    const manifestValue = yield* store.readJson(inputWithManifest.manifestPath);
    const validation = validatePatternAuthorityManifest(manifestValue, {
      manifestPath: inputWithManifest.manifestPath,
      requireRuleReference: true,
      ruleReferences: [
        patternAuthorityRuleReferenceFromRule({
          id: input.ruleId,
          gritPattern: input.patternName,
          manifestPath: inputWithManifest.manifestPath,
          ownerTool: "grit-check",
          lane: input.lifecycle === "registered-enforced" ? "enforced" : "advisory",
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
    if (manifest.lifecycle === "candidate") {
      return yield* fail(
        "manifest-rejected",
        input.ruleId,
        "requires a registered manifest lifecycle"
      );
    }
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
    const ruleEntry = registeredRuleEntry(inputWithManifest, manifest);
    yield* store.writeText(activePatternPath, registeredPatternMarkdown(inputWithManifest, manifest));
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

function registeredRuleEntry(
  input: PatternPromotionInput & { manifestPath: string },
  manifest: PatternAuthorityManifest & {
    lifecycle: "registered-advisory" | "registered-enforced";
  }
) {
  const lane = input.lifecycle === "registered-enforced" ? "enforced" : "advisory";
  return {
    id: input.ruleId,
    ownerTool: "grit-check",
    ownerProject: manifest.ownerProject,
    lane,
    scope: `include: ${manifest.scanRoots.include.join(", ")}; exclude: ${manifest.scanRoots.exclude.join(", ")}`,
    forbids: `Matches generated Grit pattern '${input.patternName}' under the accepted Pattern Authority Manifest.`,
    why: manifest.normativeSources.map((source) => source.summary).join(" "),
    detect: ["habitat", "check", "--tool", "grit-check"],
    remediate: null,
    message: `Review Pattern Authority Manifest ${input.manifestPath}.`,
    exceptionPath: "none",
    pathCoverage: manifest.scanRoots.include.map((pattern) => ({
      kind: "exact-path",
      patterns: [pattern],
    })),
    gritPattern: input.patternName,
    scanRoots: [...manifest.scanRoots.include],
    manifestPath: input.manifestPath,
  };
}

function registeredPatternMarkdown(
  input: PatternPromotionInput & { manifestPath: string },
  manifest: PatternAuthorityManifest & {
    lifecycle: "registered-advisory" | "registered-enforced";
  }
): string {
  const identifier = `__habitat_forbidden_${input.patternName}`.replace(/[^a-zA-Z0-9_]/g, "_");
  const lane = input.lifecycle === "registered-enforced" ? "enforced" : "advisory";
  return `---\nlevel: error\ntags:\n  - habitat-generated\n  - habitat-${lane}\n---\n# ${titleize(input.ruleId)}\n\nGenerated registered ${lane} pattern. Habitat authority is stored in \`${manifest.baselineContract.ruleIntroductionManifest}\` and \`${input.manifestPath}\`; Grit prose is not the authority source.\n\n\`\`\`grit\nlanguage ${manifest.language.gritLanguage}\n\n\`${identifier}($value)\`\n\`\`\`\n\n## Matches fixture\n\n\`\`\`typescript\n${identifier}(\"violation\");\n\`\`\`\n\n\`\`\`typescript\n${identifier}(\"violation\");\n\`\`\`\n\n## Ignores fixture\n\n\`\`\`typescript\nconst allowed = \"${identifier}\";\n\`\`\`\n`;
}

function normalizeRulesJson(value: unknown, ruleId: string) {
  const rulesParse = parseRuleRegistryDocument(value, "tools/habitat-harness/src/rules/rules.json");
  if (!rulesParse.ok) {
    throw new PatternPromotionFailure({
      reason: "manifest-unreadable",
      message: `tools/habitat-harness/src/rules/rules.json is invalid: ${rulesParse.issues
        .map((issue: RuleRegistryIssue) => issue.message)
        .join("; ")}`,
    });
  }
  const rulesJson = rulesParse.document;
  if (rulesJson.rules.some((rule) => rule.id === ruleId)) {
    throw new PatternPromotionFailure({
      reason: "unexpected-collision",
      message: `Habitat rule already exists: ${ruleId}`,
    });
  }
  return rulesJson;
}

function validateRegisteredBaselineContract(
  store: PatternPromotionStoreService,
  manifest: PatternAuthorityManifest & {
    lifecycle: "registered-advisory" | "registered-enforced";
  }
) {
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
    if (!Value.Check(BaselineKeyArraySchema, baselineJson)) {
      return yield* fail(
        "baseline-contract-rejected",
        manifest.ruleId,
        `baseline file '${baseline.baselinePath}' must contain a JSON string array`
      );
    }
    if (!Value.Check(RuleIntroductionBaselineManifestSchema, introductionManifest)) {
      return yield* fail(
        "baseline-contract-rejected",
        manifest.ruleId,
        `rule-introduction baseline manifest '${baseline.ruleIntroductionManifest}' must be a structured JSON object`
      );
    }
    const baselineKeys = Value.Parse(BaselineKeyArraySchema, baselineJson);
    const typedIntroductionManifest = Value.Parse(
      RuleIntroductionBaselineManifestSchema,
      introductionManifest
    );
    if (baseline.baselineAction === "committed-empty" && baselineJson.length > 0) {
      return yield* fail(
        "baseline-contract-rejected",
        manifest.ruleId,
        "committed-empty baseline action requires an explicit empty baseline file"
      );
    }
    const sortedBaselineKeys = [...baselineKeys].sort();
    const sortedManifestKeys = [...typedIntroductionManifest.initialBaselineKeys].sort();
    if (
      typedIntroductionManifest.ruleId !== manifest.ruleId ||
      typedIntroductionManifest.ownerProject !== manifest.ownerProject ||
      typedIntroductionManifest.ownerTool !== manifest.ownerTool ||
      typedIntroductionManifest.baselinePath !== baseline.baselinePath ||
      sortedBaselineKeys.length !== sortedManifestKeys.length ||
      sortedBaselineKeys.some((key, index) => key !== sortedManifestKeys[index]) ||
      typedIntroductionManifest.changeId.length === 0 ||
      typedIntroductionManifest.comparisonBase.length === 0
    ) {
      return yield* fail(
        "baseline-contract-rejected",
        manifest.ruleId,
        `rule-introduction baseline manifest '${baseline.ruleIntroductionManifest}' does not match the requested registration`
      );
    }
  });
}

function failIfExists(
  store: PatternPromotionStoreService,
  path: string,
  ruleId: string,
  message: string
) {
  return store
    .exists(path)
    .pipe(
      Effect.flatMap((exists) =>
        exists ? fail("unexpected-collision", ruleId, `${message}: ${path}`) : Effect.void
      )
    );
}

function fail(reason: string, ruleId: string, message: string) {
  return Effect.fail(
    new PatternPromotionFailure({
      reason,
      message: `Registered pattern generation for '${ruleId}' ${message}.`,
    })
  );
}

function titleize(value: string): string {
  return value
    .split("-")
    .map((part) => part.slice(0, 1).toUpperCase() + part.slice(1))
    .join(" ");
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
