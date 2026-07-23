import assert from "node:assert/strict";
import {
  lstatSync,
  mkdirSync,
  mkdtempSync,
  realpathSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import os from "node:os";
import path from "node:path";
import { NodeContext } from "@effect/platform-node";
import {
  type HabitatDirectoryEntry,
  makeHabitatPlatformService,
} from "@habitat/cli/resources/platform/index";
import type { RuleStructureFacts } from "@habitat/cli/service/model/rules/index";
import {
  evaluateStructureCheckEffect,
  parseStructureCheckSpec,
  runStructureRulesEffect,
  type StructureCheckSpec,
} from "@habitat/cli/service/model/structure-check/index";
import { Effect, Match } from "effect";
import { describe, expect, test } from "vitest";

const repoRoot = path.join("/", "repo");
const rule = {
  id: "sample-structure-rule",
  lane: "enforced",
  message: "Fix file topology.",
  pathCoverage: [{ kind: "project-owner" as const }],
  runner: {
    name: "habitat" as const,
    mode: "structure" as const,
    files: { structure: ".habitat/sample/sample.structure.toml" },
  },
} satisfies RuleStructureFacts;

describe("structure-check TOML contract", () => {
  test("parses valid v1 TOML and rejects malformed or unsupported fields", () => {
    const defaulted = parseStructureCheckSpec(`
schemaVersion = 1

[[scopes]]
name = "root"
root = "packages/*"
kind = "directory"
mode = "open"
required = ["index.ts"]
`);
    expect(defaulted).toMatchObject({
      ok: true,
      spec: { scopes: [{ allowEmpty: false }] },
    });
    expect(
      parseStructureCheckSpec(`
schemaVersion = 1

[[scopes]]
name = "optional"
root = "packages/*"
kind = "directory"
mode = "open"
allowEmpty = true
`)
    ).toMatchObject({ ok: true, spec: { scopes: [{ allowEmpty: true }] } });

    expect(parseStructureCheckSpec("schemaVersion =")).toMatchObject({ ok: false });
    expect(
      parseStructureCheckSpec(`
schemaVersion = 1
unsupported = true

[[scopes]]
name = "root"
root = "packages/*"
kind = "directory"
mode = "open"
`)
    ).toMatchObject({ ok: false });
  });
});

describe("structure-check evaluator", () => {
  test("passes open and closed scopes with required direct children", async () => {
    const result = await runWithFs(
      {
        schemaVersion: 1,
        scopes: [
          {
            name: "closed-root",
            root: "pkg",
            kind: "directory",
            mode: "closed",
            required: ["src", "README.md"],
            allowed: ["package.json"],
          },
          {
            name: "open-source-root",
            root: "pkg/src",
            kind: "directory",
            mode: "open",
            required: ["index.ts"],
          },
        ],
      },
      fixtures()
    );

    expect(result.exitCode).toBe(0);
    expect(result.diagnostics).toEqual([]);
  });

  test("reports missing roots and wrong root kinds", async () => {
    const result = await runWithFs(
      {
        schemaVersion: 1,
        scopes: [
          { name: "missing", root: "pkg/missing", kind: "directory", mode: "open" },
          { name: "wrong-kind", root: "pkg/README.md", kind: "directory", mode: "open" },
        ],
      },
      fixtures()
    );

    expect(messages(result)).toContain("[root-missing]");
    expect(messages(result)).toContain("[wrong-root-kind]");
  });

  test("closed scopes reject unexpected direct children while open scopes allow extras", async () => {
    const closed = await runWithFs(
      {
        schemaVersion: 1,
        scopes: [
          { name: "closed", root: "pkg", kind: "directory", mode: "closed", required: ["src"] },
        ],
      },
      fixtures()
    );
    const open = await runWithFs(
      {
        schemaVersion: 1,
        scopes: [{ name: "open", root: "pkg", kind: "directory", mode: "open", required: ["src"] }],
      },
      fixtures()
    );

    expect(messages(closed)).toContain("[unexpected-child]");
    expect(open.exitCode).toBe(0);
  });

  test("forbidden direct children win over required and allowed patterns", async () => {
    const result = await runWithFs(
      {
        schemaVersion: 1,
        scopes: [
          {
            name: "forbidden-conflict",
            root: "pkg",
            kind: "directory",
            mode: "closed",
            required: ["src"],
            allowed: ["README.md"],
            forbidden: ["src"],
          },
        ],
      },
      fixtures()
    );

    expect(messages(result)).toContain("[forbidden-child]");
  });

  test("child globs match direct child names only, not grandchildren", async () => {
    const result = await runWithFs(
      {
        schemaVersion: 1,
        scopes: [
          {
            name: "no-grandchild-match",
            root: "pkg",
            kind: "directory",
            mode: "open",
            required: ["index.ts"],
          },
        ],
      },
      fixtures()
    );

    expect(messages(result)).toContain("[missing-required-child]");
  });

  test("file and directory root kinds are not conflated", async () => {
    const result = await runWithFs(
      {
        schemaVersion: 1,
        scopes: [
          { name: "file-root", root: "pkg/src/index.ts", kind: "file", mode: "open" },
          { name: "directory-as-file", root: "pkg/src", kind: "file", mode: "open" },
        ],
      },
      fixtures()
    );

    expect(messages(result)).toContain("[wrong-root-kind]");
    expect(result.diagnostics).toHaveLength(1);
  });

  test("bounds non-globstar traversal to the depth encoded by the root glob", async () => {
    const fixture = fixtures({
      files: new Map([[`${repoRoot}/pkg/alpha/src/deep/index.ts`, ""]]),
      directories: new Map([
        [`${repoRoot}/pkg`, [{ name: "alpha", kind: "directory" }]],
        [`${repoRoot}/pkg/alpha`, [{ name: "src", kind: "directory" }]],
        [`${repoRoot}/pkg/alpha/src`, [{ name: "deep", kind: "directory" }]],
        [`${repoRoot}/pkg/alpha/src/deep`, [{ name: "index.ts", kind: "file" }]],
      ]),
    });

    const result = await runWithFs(
      {
        schemaVersion: 1,
        scopes: [
          {
            name: "source-roots",
            root: "pkg/*/src",
            kind: "directory",
            mode: "open",
          },
        ],
      },
      fixture
    );

    expect(result).toEqual({ exitCode: 0, diagnostics: [] });
    expect(fixture.events.filter((event) => event.startsWith("readdir:"))).toEqual([
      `readdir:${repoRoot}/pkg`,
      `readdir:${repoRoot}/pkg/alpha`,
      `readdir:${repoRoot}/pkg/alpha/src`,
    ]);
  });

  test("does not promote double stars inside a segment or extglob to recursive globstars", async () => {
    for (const root of ["pkg/**.ts", "pkg/@(**foo|bar)"]) {
      const fixture = fixtures({
        files: new Map([
          [`${repoRoot}/pkg/bar`, ""],
          [`${repoRoot}/pkg/deep/nested.ts`, ""],
        ]),
        directories: new Map([
          [
            `${repoRoot}/pkg`,
            [
              { name: "bar", kind: "file" },
              { name: "deep", kind: "directory" },
            ],
          ],
          [`${repoRoot}/pkg/deep`, [{ name: "nested.ts", kind: "file" }]],
        ]),
      });

      await runWithFs(
        {
          schemaVersion: 1,
          scopes: [{ name: "bounded-double-star", root, kind: "file", mode: "open" }],
        },
        fixture
      );

      expect(fixture.events.filter((event) => event === `readdir:${repoRoot}/pkg/deep`)).toEqual(
        []
      );
    }
  });

  test("preserves recursive globstar root matching", async () => {
    const fixture = fixtures({
      files: new Map([[`${repoRoot}/pkg/alpha/deep/target/index.ts`, ""]]),
      directories: new Map([
        [`${repoRoot}/pkg`, [{ name: "alpha", kind: "directory" }]],
        [`${repoRoot}/pkg/alpha`, [{ name: "deep", kind: "directory" }]],
        [`${repoRoot}/pkg/alpha/deep`, [{ name: "target", kind: "directory" }]],
        [`${repoRoot}/pkg/alpha/deep/target`, [{ name: "index.ts", kind: "file" }]],
      ]),
    });

    const result = await runWithFs(
      {
        schemaVersion: 1,
        scopes: [
          {
            name: "recursive-targets",
            root: "pkg/**/target",
            kind: "directory",
            mode: "open",
            required: ["index.ts"],
          },
        ],
      },
      fixture
    );

    expect(result).toEqual({ exitCode: 0, diagnostics: [] });
    expect(fixture.events).toContain(`readdir:${repoRoot}/pkg/alpha/deep`);
  });

  test("keeps slash-bearing negative extglobs unbounded", async () => {
    const fixture = fixtures({
      files: new Map([[`${repoRoot}/pkg/deep/target/index.ts`, ""]]),
      directories: new Map([
        [`${repoRoot}/pkg`, [{ name: "deep", kind: "directory" }]],
        [`${repoRoot}/pkg/deep`, [{ name: "target", kind: "directory" }]],
        [`${repoRoot}/pkg/deep/target`, [{ name: "index.ts", kind: "file" }]],
      ]),
    });

    const result = await runWithFs(
      {
        schemaVersion: 1,
        scopes: [
          {
            name: "negative-extglob",
            root: "pkg/!(skip/nested)",
            kind: "directory",
            mode: "open",
          },
        ],
      },
      fixture
    );

    expect(messages(result)).not.toContain("[root-missing]");
    expect(fixture.events).toContain(`readdir:${repoRoot}/pkg/deep`);
  });

  test("keeps leading-negated Picomatch roots unbounded", async () => {
    const fixture = fixtures({
      files: new Map([[`${repoRoot}/pkg/deep/nested/target.ts`, ""]]),
      directories: new Map([
        [`${repoRoot}`, [{ name: "pkg", kind: "directory" }]],
        [`${repoRoot}/pkg`, [{ name: "deep", kind: "directory" }]],
        [`${repoRoot}/pkg/deep`, [{ name: "nested", kind: "directory" }]],
        [`${repoRoot}/pkg/deep/nested`, [{ name: "target.ts", kind: "file" }]],
      ]),
    });

    await runWithFs(
      {
        schemaVersion: 1,
        scopes: [
          {
            name: "leading-negation",
            root: "!pkg/skip",
            kind: "file",
            mode: "open",
          },
        ],
      },
      fixture
    );

    expect(fixture.events).toContain(`readdir:${repoRoot}/pkg/deep/nested`);
  });

  test("excludes ignored descendants from matching and traversal", async () => {
    const fixture = fixtures({
      files: new Map([[`${repoRoot}/pkg/alpha/index.ts`, ""]]),
      directories: new Map([
        [
          `${repoRoot}/pkg`,
          [
            { name: "alpha", kind: "directory" },
            { name: "ignored", kind: "directory" },
          ],
        ],
        [`${repoRoot}/pkg/alpha`, [{ name: "index.ts", kind: "file" }]],
        [`${repoRoot}/pkg/ignored`, [{ name: "nested", kind: "directory" }]],
        [`${repoRoot}/pkg/ignored/nested`, [{ name: "bad.ts", kind: "file" }]],
      ]),
      visiblePaths: trackedVisiblePaths("pkg/alpha/index.ts"),
    });

    const result = await runWithFs(
      {
        schemaVersion: 1,
        scopes: [
          {
            name: "visible-package-roots",
            root: "pkg/*",
            kind: "directory",
            mode: "open",
            required: ["index.ts"],
          },
        ],
      },
      fixture
    );

    expect(result).toEqual({ exitCode: 0, diagnostics: [] });
    expect(fixture.events.filter((event) => event.startsWith("readdir:"))).toEqual([
      `readdir:${repoRoot}/pkg`,
      `readdir:${repoRoot}/pkg/alpha`,
    ]);
  });

  test("requires at least one root by default and permits explicit optional geometries", async () => {
    const fixture = fixtures({
      files: new Map([[`${repoRoot}/pkg/index.ts`, ""]]),
      directories: new Map([
        [`${repoRoot}/pkg`, [{ name: "index.ts", kind: "file" }]],
        [`${repoRoot}/optional`, []],
      ]),
    });
    const baseScope = {
      name: "optional-kind",
      root: "optional/*",
      kind: "directory",
      mode: "open",
    } as const;

    const required = await runWithFs({ schemaVersion: 1, scopes: [baseScope] }, fixture);
    const optional = await runWithFs(
      {
        schemaVersion: 1,
        scopes: [{ ...baseScope, allowEmpty: true }],
      },
      fixture
    );

    expect(messages(required)).toContain("[root-missing]");
    expect(optional).toEqual({ exitCode: 0, diagnostics: [] });
  });

  test("fails closed when the Git-visible path inventory is unavailable", async () => {
    const fixture = fixtures();
    const result = await Effect.runPromise(
      evaluateStructureCheckEffect(
        rule,
        {
          schemaVersion: 1,
          scopes: [{ name: "root", root: "pkg", kind: "directory", mode: "open" }],
        },
        {
          repoRoot,
          fileSystem: port(fixture),
          visiblePaths: null,
        }
      ).pipe(Effect.provide(NodeContext.layer))
    );

    expect(messages(result)).toContain("[visible-path-inventory-unavailable]");
    expect(fixture.events).toEqual([]);
  });

  test("excludes tracked gitlinks before filesystem classification", async () => {
    const fixture = fixtures({
      directories: new Map([[`${repoRoot}/pkg/submodule`, []]]),
      visiblePaths: [{ mode: "160000", repoPath: "pkg/submodule" }],
    });

    const result = await runWithFs(
      {
        schemaVersion: 1,
        scopes: [
          {
            name: "gitlink",
            root: "pkg/submodule",
            kind: "directory",
            mode: "open",
          },
        ],
      },
      fixture
    );

    expect(messages(result)).toContain("[root-missing]");
    expect(fixture.events).toEqual([]);
  });

  test("does not follow directory or file symlinks", async () => {
    const temporaryRoot = guardedTemporaryDirectory("habitat-structure-symlink-");
    try {
      const actualRepoRoot = path.join(temporaryRoot, "repo");
      const packageRoot = path.join(actualRepoRoot, "pkg");
      const outsideRoot = path.join(temporaryRoot, "outside");
      mkdirSync(packageRoot, { recursive: true });
      mkdirSync(outsideRoot, { recursive: true });
      const outsideFile = path.join(outsideRoot, "outside.ts");
      writeFileSync(outsideFile, "export {};\n");
      symlinkSync(outsideRoot, path.join(packageRoot, "outside-dir"));
      symlinkSync(outsideFile, path.join(packageRoot, "outside-file.ts"));
      symlinkSync(outsideRoot, path.join(actualRepoRoot, "linked-parent"));
      const platform = makeHabitatPlatformService({ repoRoot: actualRepoRoot });
      const entries = await Effect.runPromise(
        platform.readDirectory(packageRoot).pipe(Effect.provide(NodeContext.layer))
      );

      expect([...entries].sort((left, right) => left.name.localeCompare(right.name))).toEqual([
        { name: "outside-dir", kind: "other" },
        { name: "outside-file.ts", kind: "other" },
      ]);

      const result = await Effect.runPromise(
        evaluateStructureCheckEffect(
          rule,
          {
            schemaVersion: 1,
            scopes: [
              {
                name: "directory-link",
                root: "pkg/outside-dir",
                kind: "directory",
                mode: "open",
              },
              {
                name: "file-link",
                root: "pkg/outside-file.ts",
                kind: "file",
                mode: "open",
              },
              {
                name: "intermediate-directory-link",
                root: "linked-parent/outside.ts",
                kind: "file",
                mode: "open",
              },
            ],
          },
          {
            repoRoot: actualRepoRoot,
            fileSystem: {
              isDirectory: platform.isDirectory,
              isFile: platform.isFileEffect,
              readDirectory: platform.readDirectory,
              readPathKind: platform.readPathKind,
              readText: platform.readText,
            },
            visiblePaths: trackedVisiblePaths(
              "linked-parent/outside.ts",
              "pkg/outside-dir",
              "pkg/outside-file.ts"
            ),
          }
        ).pipe(Effect.provide(NodeContext.layer))
      );

      expect(result.diagnostics).toHaveLength(3);
      expect(messages(result).match(/\[wrong-root-kind\]/gu)).toHaveLength(3);
    } finally {
      guardedRemoveTemporaryDirectory(temporaryRoot, "habitat-structure-symlink-");
    }
  });

  test("reuses one ordered glob traversal across scopes and trusts listed entry kinds", async () => {
    const fixture = fixtures({
      directories: new Map([
        [
          `${repoRoot}/pkg`,
          [
            { name: "alpha", kind: "directory" },
            { name: "socket", kind: "other" },
          ],
        ],
        [
          `${repoRoot}/pkg/alpha`,
          [
            { name: "zeta.txt", kind: "file" },
            { name: "alpha.txt", kind: "file" },
          ],
        ],
      ]),
      visiblePaths: trackedVisiblePaths("pkg/alpha/zeta.txt", "pkg/alpha/alpha.txt", "pkg/socket"),
    });
    const result = await runWithFs(
      {
        schemaVersion: 1,
        scopes: [
          {
            name: "closed-roots",
            root: "pkg/*",
            kind: "directory",
            mode: "closed",
          },
          {
            name: "forbidden-roots",
            root: "pkg/*",
            kind: "directory",
            mode: "open",
            forbidden: ["alpha.txt"],
          },
        ],
      },
      fixture
    );

    expect(result.diagnostics.map((diagnostic) => diagnostic.path)).toEqual([
      "pkg/socket",
      "pkg/alpha/zeta.txt",
      "pkg/alpha/alpha.txt",
      "pkg/socket",
      "pkg/alpha/alpha.txt",
    ]);
    expect(result.diagnostics[0]?.message).toContain("is other");
    expect(fixture.events.filter((event) => event.startsWith("readdir:"))).toEqual([
      `readdir:${repoRoot}/pkg`,
      `readdir:${repoRoot}/pkg/alpha`,
    ]);
    expect(fixture.events.filter((event) => event.startsWith("stat:"))).toEqual([
      `stat:${repoRoot}/pkg`,
      `stat:${repoRoot}/pkg/alpha`,
      `stat:${repoRoot}/pkg/socket`,
      `stat:${repoRoot}/pkg/alpha/zeta.txt`,
      `stat:${repoRoot}/pkg/alpha/alpha.txt`,
    ]);
  });

  test("keeps literal other entries non-directory regardless of scope order", async () => {
    const globScope = {
      name: "glob-roots",
      root: "pkg/*",
      kind: "directory",
      mode: "open",
    } as const;
    const literalScope = {
      name: "literal-other",
      root: "pkg/socket",
      kind: "directory",
      mode: "open",
    } as const;

    for (const scopes of [
      [globScope, literalScope],
      [literalScope, globScope],
    ]) {
      const result = await runWithFs(
        { schemaVersion: 1, scopes },
        fixtures({
          directories: new Map([[`${repoRoot}/pkg`, [{ name: "socket", kind: "other" }]]]),
          visiblePaths: trackedVisiblePaths("pkg/socket"),
        })
      );
      const rendered = messages(result);

      expect(rendered).toContain(
        'Structure scope "literal-other" expected directory root, but pkg/socket is other.'
      );
      expect(rendered).toContain(
        'Structure scope "glob-roots" expected directory root, but pkg/socket is other.'
      );
    }
  });

  test("reuses the completed in-memory walk for identical literal bases", async () => {
    const fixture = fixtures({
      directories: new Map([
        [
          `${repoRoot}/pkg`,
          [
            { name: "alpha.ts", kind: "file" },
            { name: "beta.ts", kind: "file" },
          ],
        ],
      ]),
      visiblePaths: trackedVisiblePaths("pkg/alpha.ts", "pkg/beta.ts"),
    });
    const result = await runWithFs(
      {
        schemaVersion: 1,
        scopes: [
          { name: "first-files", root: "pkg/*", kind: "file", mode: "open" },
          { name: "second-files", root: "pkg/*", kind: "file", mode: "open" },
        ],
      },
      fixture
    );

    expect(result).toEqual({ exitCode: 0, diagnostics: [] });
    expect(fixture.events.filter((event) => event === `readdir:${repoRoot}/pkg`)).toHaveLength(1);
  });

  test("starts a fresh traversal cache for each evaluator invocation", async () => {
    const fixture = fixtures({
      directories: new Map([
        [`${repoRoot}/pkg`, [{ name: "alpha", kind: "directory" }]],
        [`${repoRoot}/pkg/alpha`, []],
      ]),
      visiblePaths: trackedVisiblePaths("pkg/alpha/.gitkeep"),
    });
    const spec = {
      schemaVersion: 1,
      scopes: [{ name: "roots", root: "pkg/*", kind: "directory", mode: "open" }],
    } as const satisfies StructureCheckSpec;

    await runWithFs(spec, fixture);
    await runWithFs(spec, fixture);

    expect(fixture.events.filter((event) => event.startsWith("readdir:"))).toEqual([
      `readdir:${repoRoot}/pkg`,
      `readdir:${repoRoot}/pkg/alpha`,
      `readdir:${repoRoot}/pkg`,
      `readdir:${repoRoot}/pkg/alpha`,
    ]);
  });
});

describe("structure-check rule execution", () => {
  test("reads the structure file and returns Habitat diagnostics without command execution", async () => {
    const fixture = fixtures({
      files: new Map([
        [
          `${repoRoot}/.habitat/sample/sample.structure.toml`,
          `
schemaVersion = 1

[[scopes]]
name = "root"
root = "pkg"
kind = "directory"
mode = "open"
required = ["src"]
`,
        ],
        [`${repoRoot}/pkg/src/index.ts`, ""],
      ]),
      directories: new Map([
        [`${repoRoot}/pkg`, [{ name: "src", kind: "directory" }]],
        [`${repoRoot}/pkg/src`, [{ name: "index.ts", kind: "file" }]],
      ]),
    });

    const results = await Effect.runPromise(
      runStructureRulesEffect([rule], {
        repoRoot,
        fileSystem: port(fixture),
        visiblePaths: gitVisiblePaths(fixture),
      }).pipe(Effect.provide(NodeContext.layer))
    );

    expect(results.get(rule.id)).toEqual({ exitCode: 0, diagnostics: [] });
    expect(fixture.events).toContain(`read:${repoRoot}/.habitat/sample/sample.structure.toml`);
  });

  test("shares one rule-run walk without retaining it across executions", async () => {
    const firstRule = structureRule("first-structure-rule", ".habitat/sample/first.structure.toml");
    const secondRule = structureRule(
      "second-structure-rule",
      ".habitat/sample/second.structure.toml"
    );
    const structureToml = `
schemaVersion = 1

[[scopes]]
name = "roots"
root = "pkg/*"
kind = "directory"
mode = "open"
`;
    const fixture = fixtures({
      files: new Map([
        [`${repoRoot}/.habitat/sample/first.structure.toml`, structureToml],
        [`${repoRoot}/.habitat/sample/second.structure.toml`, structureToml],
      ]),
      directories: new Map([
        [`${repoRoot}/pkg`, [{ name: "alpha", kind: "directory" }]],
        [`${repoRoot}/pkg/alpha`, []],
      ]),
      visiblePaths: trackedVisiblePaths("pkg/alpha/.gitkeep"),
    });

    const execution = runStructureRulesEffect([firstRule, secondRule], {
      repoRoot,
      fileSystem: port(fixture),
      visiblePaths: gitVisiblePaths(fixture),
    }).pipe(Effect.provide(NodeContext.layer));
    const results = await Effect.runPromise(execution);

    expect([...results.keys()]).toEqual([firstRule.id, secondRule.id]);
    expect([...results.values()]).toEqual([
      { exitCode: 0, diagnostics: [] },
      { exitCode: 0, diagnostics: [] },
    ]);
    expect(fixture.events.filter((event) => event.startsWith("readdir:"))).toEqual([
      `readdir:${repoRoot}/pkg`,
      `readdir:${repoRoot}/pkg/alpha`,
    ]);

    const repeatedResults = await Effect.runPromise(execution);
    expect([...repeatedResults.keys()]).toEqual([firstRule.id, secondRule.id]);
    expect(fixture.events.filter((event) => event.startsWith("readdir:"))).toEqual([
      `readdir:${repoRoot}/pkg`,
      `readdir:${repoRoot}/pkg/alpha`,
      `readdir:${repoRoot}/pkg`,
      `readdir:${repoRoot}/pkg/alpha`,
    ]);
  });
});

async function runWithFs(
  spec: StructureCheckSpec,
  fixture: ReturnType<typeof fixtures>
): Promise<{
  exitCode: number;
  diagnostics: readonly { path: string; message: string }[];
}> {
  const result = await Effect.runPromise(
    evaluateStructureCheckEffect(rule, spec, {
      repoRoot,
      fileSystem: port(fixture),
      visiblePaths: gitVisiblePaths(fixture),
    }).pipe(Effect.provide(NodeContext.layer))
  );
  return result;
}

function structureRule(id: string, structure: string): RuleStructureFacts {
  return {
    ...rule,
    id,
    runner: {
      ...rule.runner,
      files: { structure },
    },
  };
}

function fixtures(
  overrides: {
    files?: ReadonlyMap<string, string>;
    directories?: ReadonlyMap<string, readonly HabitatDirectoryEntry[]>;
    visiblePaths?: readonly { readonly mode: string | null; readonly repoPath: string }[];
  } = {}
) {
  return {
    events: [] as string[],
    files:
      overrides.files ??
      new Map([
        [`${repoRoot}/pkg/README.md`, ""],
        [`${repoRoot}/pkg/package.json`, "{}"],
        [`${repoRoot}/pkg/src/index.ts`, ""],
      ]),
    directories:
      overrides.directories ??
      new Map([
        [
          `${repoRoot}/pkg`,
          [
            { name: "src", kind: "directory" },
            { name: "README.md", kind: "file" },
            { name: "package.json", kind: "file" },
          ],
        ],
        [`${repoRoot}/pkg/src`, [{ name: "index.ts", kind: "file" }]],
      ]),
    visiblePaths: overrides.visiblePaths,
  };
}

function gitVisiblePaths(
  fixture: ReturnType<typeof fixtures>
): readonly { readonly mode: string | null; readonly repoPath: string }[] {
  return (
    fixture.visiblePaths ??
    [...fixture.files.keys()]
      .filter((filePath) => filePath.startsWith(`${repoRoot}/`))
      .map((filePath) => ({ mode: "100644", repoPath: filePath.slice(repoRoot.length + 1) }))
  );
}

function trackedVisiblePaths(
  ...repoPaths: readonly string[]
): readonly { readonly mode: string; readonly repoPath: string }[] {
  return repoPaths.map((repoPath) => ({ mode: "100644", repoPath }));
}

function port(fixture: ReturnType<typeof fixtures>) {
  return {
    isDirectory: (targetPath: string) =>
      Effect.sync(() => {
        fixture.events.push(`stat:${targetPath}`);
        return fixture.directories.has(targetPath);
      }),
    isFile: (targetPath: string) =>
      Effect.sync(() => {
        fixture.events.push(`stat:${targetPath}`);
        return fixture.files.has(targetPath);
      }),
    readDirectory: (targetPath: string) =>
      Match.value(fixture.directories.get(targetPath)).pipe(
        Match.when(Match.undefined, () =>
          Effect.die(new Error(`Missing directory fixture: ${targetPath}`))
        ),
        Match.orElse((entries) =>
          Effect.sync(() => {
            fixture.events.push(`readdir:${targetPath}`);
            return [...entries];
          })
        )
      ),
    readPathKind: (targetPath: string) =>
      Effect.sync(() => {
        fixture.events.push(`stat:${targetPath}`);
        if (fixture.directories.has(targetPath)) return "directory" as const;
        if (fixture.files.has(targetPath)) return "file" as const;
        const entry = fixture.directories
          .get(path.dirname(targetPath))
          ?.find((candidate) => candidate.name === path.basename(targetPath));
        return entry?.kind ?? ("missing" as const);
      }),
    readText: (targetPath: string) =>
      Match.value(fixture.files.get(targetPath)).pipe(
        Match.when(Match.undefined, () =>
          Effect.die(new Error(`Missing file fixture: ${targetPath}`))
        ),
        Match.orElse((contents) =>
          Effect.sync(() => {
            fixture.events.push(`read:${targetPath}`);
            return contents;
          })
        )
      ),
  };
}

function messages(result: { diagnostics: readonly { message: string }[] }): string {
  return result.diagnostics.map((diagnostic) => diagnostic.message).join("\n");
}

function guardedTemporaryDirectory(prefix: string): string {
  const parent = realpathSync(os.tmpdir());
  const temporaryRoot = mkdtempSync(path.join(parent, prefix));
  assertGuardedTemporaryDirectory(temporaryRoot, prefix);
  return temporaryRoot;
}

function guardedRemoveTemporaryDirectory(temporaryRoot: string, prefix: string): void {
  assertGuardedTemporaryDirectory(temporaryRoot, prefix);
  rmSync(temporaryRoot, { force: true, recursive: true });
}

function assertGuardedTemporaryDirectory(temporaryRoot: string, prefix: string): void {
  const canonicalParent = realpathSync(os.tmpdir());
  const stat = lstatSync(temporaryRoot);
  assert.equal(realpathSync(path.dirname(temporaryRoot)), canonicalParent);
  assert.ok(path.basename(temporaryRoot).startsWith(prefix));
  assert.ok(stat.isDirectory());
  assert.ok(!stat.isSymbolicLink());
}
