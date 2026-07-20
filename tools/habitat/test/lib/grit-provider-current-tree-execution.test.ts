import { createHash } from "node:crypto";
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  realpathSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { NodeContext } from "@effect/platform-node";
import { makeGitStateProviderLayer } from "@habitat/cli/providers/git/index";
import { CommandRunnerLive, type HabitatCommandResult } from "@habitat/cli/resources/command/index";
import { makeHabitatConfig, makeHabitatConfigLayer } from "@habitat/cli/resources/config/index";
import { repoRoot as workspaceRepoRoot } from "@habitat/cli/resources/paths";
import {
  type GritApplyDryRunProviderRequest,
  type GritCheckProviderRequest,
  type GritCommandService,
  GritReportSchema,
  makeGritCommandService,
  pinnedGritNativePath,
  runGritDiagnosticOutcomesEffect,
} from "@habitat/cli/resources/rule-diagnostics/providers/grit/index";
import type { DiagnosticRunOutcome } from "@habitat/cli/resources/rule-diagnostics/providers/grit/outcome";
import { parseGritJsonText } from "@habitat/cli/resources/rule-diagnostics/providers/grit/types";
import type { RuleGritFacts } from "@habitat/cli/service/model/rules/index";
import { Effect, Layer } from "effect";
import { Value } from "typebox/value";
import { afterEach, describe, expect, test } from "vitest";

const fixtureRoots: string[] = [];

afterEach(() => {
  for (const fixtureRoot of fixtureRoots.splice(0)) {
    rmSync(fixtureRoot, { recursive: true, force: true });
  }
});

const LiveGritPrerequisites = Layer.mergeAll(
  NodeContext.layer,
  CommandRunnerLive,
  makeHabitatConfigLayer(makeHabitatConfig({ repoRoot: workspaceRepoRoot })),
  makeGitStateProviderLayer(workspaceRepoRoot)
);

describe("generic Grit current-tree execution", () => {
  test("preflights and executes the installed pinned native without ambient config", async () => {
    const fixture = checkFixture("const value = forbidden_fixture_marker;\n", true);
    const before = treeDigest(fixture.repoRoot);
    const execution = await executeFixture(fixture);

    expect(execution.outcomes.get(fixture.rule.id)).toMatchObject({
      kind: "findings",
      diagnostics: [{ path: "scan/subject.ts", line: 1 }],
    });
    const request = required(execution.observation.checkRequest, "check request");
    expect(request.scanRoots).toEqual([realpathSync(fixture.scanPath)]);
    expect(request.scanRoots.every(path.isAbsolute)).toBe(true);
    expect(request.cwd).toBe(path.dirname(request.gritDir));
    expect(existsSync(path.join(request.gritDir, "grit.yaml"))).toBe(false);
    const command = required(execution.observation.checkCommand, "check command");
    expect(command.executable).toBe(pinnedGritNativePath(workspaceRepoRoot));
    expect(command.argv).toEqual([
      "--json",
      "check",
      "--level",
      "error",
      "--no-cache",
      "--grit-dir",
      request.gritDir,
      realpathSync(fixture.scanPath),
    ]);
    expect(command.envDelta).toMatchObject({
      GRIT_DOWNLOADS_DISABLED: { value: "true", redacted: false },
      GRIT_TELEMETRY_DISABLED: { value: "true", redacted: false },
      GRIT_MAX_FILE_SIZE_BYTES: { value: "0", redacted: false },
    });
    expect(treeDigest(fixture.repoRoot)).toBe(before);
  });

  test("reports clean only after top-level paths prove the target was processed", async () => {
    const fixture = checkFixture("const value = accepted_fixture_marker;\n");
    const execution = await executeFixture(fixture);

    expect(execution.outcomes.get(fixture.rule.id)).toMatchObject({
      kind: "clean",
      diagnostics: [],
    });
    expect(execution.observation.checkCommand?.stderr.text).toContain(fixture.subjectPath);
  });

  test("proves mixed clean and matching check coverage from top-level paths", async () => {
    const fixture = checkFixture("const clean = accepted_fixture_marker;\n");
    const matchingPath = path.join(fixture.scanPath, "matching.ts");
    writeFileSync(matchingPath, "const value = forbidden_fixture_marker;\n");
    const execution = await executeFixture(fixture);

    expect(execution.outcomes.get(fixture.rule.id)).toMatchObject({
      kind: "findings",
      diagnostics: [{ path: "scan/matching.ts" }],
    });
    const wire = Value.Parse(
      GritReportSchema,
      parseGritJsonText(required(execution.observation.checkCommand, "check command").stderr.text)
    );
    expect(wire.paths.sort()).toEqual(
      [realpathSync(fixture.subjectPath), realpathSync(matchingPath)].sort()
    );
  });

  test("keeps an empty eligible root parsed-incomplete rather than clean", async () => {
    const fixture = checkFixture("", false, false);
    const execution = await executeFixture(fixture);

    expect(execution.outcomes.get(fixture.rule.id)).toMatchObject({
      kind: "provider-failed",
      failure: "DiagnosticOutputIncomplete",
      detail: expect.stringContaining("no-processed-paths"),
    });
  });

  test("keeps invalid selected catalog acquisition distinct from parse failure", async () => {
    const fixture = checkFixture("const value = 1;\n", false, true, invalidCheckPattern);
    const execution = await executeFixture(fixture);

    expect(execution.outcomes.get(fixture.rule.id)).toMatchObject({
      kind: "provider-failed",
      failure: "DiagnosticCommandFailed",
    });
  });

  test("observes the docs portability rewrite without mutating the fixture", async () => {
    const fixture = docsFixture();
    const before = treeDigest(fixture.repoRoot);
    const execution = await executeFixture(fixture);

    expect(execution.outcomes.get(fixture.rule.id)).toMatchObject({
      kind: "findings",
      diagnostics: [{ path: "docs/subject.md" }],
    });
    expect(execution.observation.applyRequest).toMatchObject({
      commandId: `grit-diagnostic-apply-dry-run-${fixture.rule.id}`,
      patternPath: realpathSync(
        path.join(fixture.repoRoot, ".habitat/patterns/docs-portability.md")
      ),
      scanRoots: [realpathSync(fixture.scanPath)],
      output: "compact",
      serialization: "jsonl",
      cacheMode: "isolated",
    });
    expect(execution.observation.applyCommand?.argv.slice(0, 3)).toEqual([
      "--jsonl",
      "apply",
      realpathSync(path.join(fixture.repoRoot, ".habitat/patterns/docs-portability.md")),
    ]);
    expect(execution.applyStdout).toContain('"ranges":[]');
    expect(treeDigest(fixture.repoRoot)).toBe(before);
  });

  test("observes pinned multi-range Match and Rewrite cardinality without mutation", async () => {
    for (const [pattern, patternName] of [
      [checkPattern, "fixture_marker"],
      [rewritePattern, "rewrite_fixture"],
    ] as const) {
      const fixture = checkFixture(
        "const first = forbidden_fixture_marker;\nconst second = forbidden_fixture_marker;\n",
        false,
        true,
        pattern
      );
      const rule = sourceRule(
        `apply-${patternName}`,
        patternName,
        ".habitat/patterns/fixture.md",
        ["scan"],
        "apply-dry-run"
      );
      const applyFixture = { ...fixture, rule };
      const before = treeDigest(applyFixture.repoRoot);
      const execution = await executeFixture(applyFixture);

      expect(execution.outcomes.get(rule.id)?.kind).toBe("findings");
      expect(execution.applyStdout).toContain('"found":2');
      expect(execution.applyStdout).toContain('"ranges":[{');
      expect(treeDigest(applyFixture.repoRoot)).toBe(before);
    }
  });

  test("accepts a clean pinned apply terminal only after processing evidence", async () => {
    const fixture = checkFixture("const clean = accepted_fixture_marker;\n");
    const applyFixture = {
      ...fixture,
      rule: sourceRule(
        "clean-apply",
        "fixture_marker",
        ".habitat/patterns/fixture.md",
        ["scan"],
        "apply-dry-run"
      ),
    };
    const execution = await executeFixture(applyFixture);

    expect(execution.outcomes.get("clean-apply")).toMatchObject({ kind: "clean" });
    expect(execution.applyStdout).toContain('"processed":1');
    expect(execution.applyStdout).toContain('"found":0');
  });

  test("establishes CreateFile cardinality but blocks ambiguous path completion without mutation", async () => {
    const fixture = createFileFixture();
    const before = treeDigest(fixture.repoRoot);
    const execution = await executeFixture(fixture);

    expect(execution.applyStdout).toContain('"__typename":"CreateFile"');
    expect(execution.outcomes.get(fixture.rule.id)).toMatchObject({
      kind: "provider-failed",
      failure: "DiagnosticOutputIncomplete",
      detail: expect.stringContaining("create-file-path-base-ambiguous"),
    });
    expect(treeDigest(fixture.repoRoot)).toBe(before);
    expect(existsSync(path.join(fixture.scanPath, "testStuff.test.js"))).toBe(false);
  });

  test.runIf(process.platform === "darwin" && process.arch === "arm64")(
    "pins the installed Darwin/arm64 executable digest used by this proof",
    () => {
      const executable = pinnedGritNativePath(workspaceRepoRoot);
      expect(statSync(executable).size).toBe(84_376_600);
      expect(createHash("sha256").update(readFileSync(executable)).digest("hex")).toBe(
        "ce6f216eb60f5652f5f60156e411d136ce600cb29d9616e5e2018a38fdde0cb7"
      );
    }
  );
});

interface Fixture {
  readonly repoRoot: string;
  readonly rule: RuleGritFacts;
  readonly scanPath: string;
  readonly subjectPath: string;
}

interface BoundaryObservation {
  checkRequest?: GritCheckProviderRequest;
  checkCommand?: HabitatCommandResult;
  applyRequest?: GritApplyDryRunProviderRequest;
  applyCommand?: HabitatCommandResult;
}

async function executeFixture(fixture: Fixture): Promise<{
  readonly outcomes: ReadonlyMap<string, DiagnosticRunOutcome>;
  readonly observation: BoundaryObservation;
  readonly applyStdout: string;
}> {
  const observation: BoundaryObservation = {};
  const outcomes = await Effect.runPromise(
    Effect.gen(function* () {
      const liveGrit = yield* makeGritCommandService(workspaceRepoRoot);
      return yield* runGritDiagnosticOutcomesEffect([fixture.rule], {
        repoRoot: fixture.repoRoot,
        grit: observingGrit(liveGrit, observation),
      });
    }).pipe(Effect.provide(LiveGritPrerequisites))
  );
  return {
    outcomes,
    observation,
    applyStdout: observation.applyCommand?.stdout.text ?? "",
  };
}

function observingGrit(
  live: GritCommandService,
  observation: BoundaryObservation
): GritCommandService {
  return {
    ...live,
    check: (request) => {
      observation.checkRequest = request;
      return live.check(request).pipe(
        Effect.tap((command) =>
          Effect.sync(() => {
            observation.checkCommand = command;
          })
        )
      );
    },
    applyDryRun: (request) => {
      observation.applyRequest = request;
      return live.applyDryRun(request).pipe(
        Effect.tap((command) =>
          Effect.sync(() => {
            observation.applyCommand = command;
          })
        )
      );
    },
  };
}

function checkFixture(
  contents: string,
  hostileAmbient = false,
  writeSubject = true,
  pattern = checkPattern
): Fixture {
  const fixtureRoot = createFixtureRoot("habitat-grit-check-");
  const patternPath = path.join(fixtureRoot, ".habitat/patterns/fixture.md");
  const scanPath = path.join(fixtureRoot, "scan");
  const subjectPath = path.join(scanPath, "subject.ts");
  mkdirSync(path.dirname(patternPath), { recursive: true });
  mkdirSync(scanPath, { recursive: true });
  writeFileSync(patternPath, pattern);
  [
    { enabled: writeSubject, write: () => writeFileSync(subjectPath, contents) },
    {
      enabled: hostileAmbient,
      write: () => {
        mkdirSync(path.join(fixtureRoot, ".grit"));
        writeFileSync(path.join(fixtureRoot, ".grit/grit.yaml"), "this is not a valid catalog: [");
      },
    },
  ]
    .filter(({ enabled }) => enabled)
    .forEach(({ write }) => write());
  return {
    repoRoot: fixtureRoot,
    scanPath,
    subjectPath,
    rule: sourceRule(
      "fixture-check",
      "fixture_marker",
      ".habitat/patterns/fixture.md",
      ["scan"],
      "check"
    ),
  };
}

function docsFixture(): Fixture {
  const fixtureRoot = createFixtureRoot("habitat-grit-docs-");
  const patternPath = path.join(fixtureRoot, ".habitat/patterns/docs-portability.md");
  const scanPath = path.join(fixtureRoot, "docs");
  const subjectPath = path.join(scanPath, "subject.md");
  mkdirSync(path.dirname(patternPath), { recursive: true });
  mkdirSync(scanPath, { recursive: true });
  writeFileSync(patternPath, readFileSync(docsPortabilityPatternSourcePath));
  writeFileSync(
    subjectPath,
    "See `/Users/alice/dev/worktrees/demo/docs/PROCESS.md` for details.\n"
  );
  return {
    repoRoot: fixtureRoot,
    scanPath,
    subjectPath,
    rule: sourceRule(
      "portable-docs",
      "docs_local_checkout_paths",
      ".habitat/patterns/docs-portability.md",
      ["docs"],
      "apply-dry-run"
    ),
  };
}

function createFileFixture(): Fixture {
  const fixture = checkFixture("function testStuff() {}\n", false, true, createFilePattern);
  return {
    ...fixture,
    rule: sourceRule(
      "create-file-observation",
      "create_file_fixture",
      ".habitat/patterns/fixture.md",
      ["scan"],
      "apply-dry-run"
    ),
  };
}

function sourceRule(
  id: string,
  patternName: string,
  pattern: string,
  scanRoots: readonly string[],
  acquisition: "check" | "apply-dry-run"
): RuleGritFacts {
  return {
    id,
    patternName,
    lane: "enforced",
    message: `${id} finding`,
    pathCoverage: [{ kind: "exact-path", patterns: scanRoots.map((root) => `${root}/**`) }],
    runner: { name: "grit", files: { pattern }, patternName },
    diagnosticAcquisition: { kind: acquisition },
    scanRoots: [...scanRoots],
  };
}

function createFixtureRoot(prefix: string): string {
  const fixtureRoot = mkdtempSync(path.join(tmpdir(), prefix));
  fixtureRoots.push(fixtureRoot);
  return fixtureRoot;
}

function treeDigest(root: string): string {
  const hash = createHash("sha256");
  const visit = (directory: string) => {
    for (const name of readdirSync(directory).sort()) {
      const candidate = path.join(directory, name);
      const relative = path.relative(root, candidate);
      const stat = statSync(candidate);
      hash.update(relative);
      if (stat.isDirectory()) visit(candidate);
      else hash.update(readFileSync(candidate));
    }
  };
  visit(root);
  return hash.digest("hex");
}

function required<T>(value: T | undefined, label: string): T {
  if (value === undefined) throw new Error(`Expected ${label}.`);
  return value;
}

const checkPattern = `\`\`\`grit
language js

\`forbidden_fixture_marker\`
\`\`\`
`;

const invalidCheckPattern = `\`\`\`grit
language js

\`unterminated
\`\`\`
`;

const createFilePattern = `\`\`\`grit
language js

\`function $functionName($_) {$_}\` as $f where {
  $functionName <: r"test.*",
  $f => .,
  $new_file_name = \`$functionName.test.js\`,
  $new_files += file(name = $new_file_name, body = $f)
}
\`\`\`
`;

const rewritePattern = `\`\`\`grit
language js

\`forbidden_fixture_marker\` => \`accepted_fixture_marker\`
\`\`\`
`;

const docsPortabilityPatternSourcePath = path.join(
  workspaceRepoRoot,
  ".habitat/docs/rules/ensure_docs_checkout_paths_are_portable/pattern.md"
);
