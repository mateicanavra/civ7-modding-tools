import path from "node:path";
import { NodeContext } from "@effect/platform-node";
import type { HabitatDirectoryEntry } from "@habitat/cli/resources/platform/index";
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
    expect(
      parseStructureCheckSpec(`
schemaVersion = 1

[[scopes]]
name = "root"
root = "packages/*"
kind = "directory"
mode = "open"
required = ["index.ts"]
`)
    ).toMatchObject({ ok: true });

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
    ]);
  });

  test("keeps literal other entries missing regardless of scope order", async () => {
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
        })
      );
      const rendered = messages(result);

      expect(rendered).toContain(
        'Structure scope "literal-other" matched no directory roots for pkg/socket.'
      );
      expect(rendered).toContain(
        'Structure scope "glob-roots" expected directory root, but pkg/socket is other.'
      );
    }
  });

  test("reuses the completed in-memory walk for identical literal bases", async () => {
    let entryAccesses = 0;
    const observeEntryAccess = () => {
      entryAccesses += 1;
    };
    const fixture = fixtures({
      directories: new Map([
        [
          `${repoRoot}/pkg`,
          [
            observedDirectoryEntry("alpha.ts", "file", observeEntryAccess),
            observedDirectoryEntry("beta.ts", "file", observeEntryAccess),
          ],
        ],
      ]),
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
    expect(entryAccesses).toBe(4);
  });

  test("starts a fresh traversal cache for each evaluator invocation", async () => {
    const fixture = fixtures({
      directories: new Map([
        [`${repoRoot}/pkg`, [{ name: "alpha", kind: "directory" }]],
        [`${repoRoot}/pkg/alpha`, []],
      ]),
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
    });

    const execution = runStructureRulesEffect([firstRule, secondRule], {
      repoRoot,
      fileSystem: port(fixture),
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

function observedDirectoryEntry(
  name: string,
  kind: HabitatDirectoryEntry["kind"],
  onAccess: () => void
): HabitatDirectoryEntry {
  return {
    get name() {
      onAccess();
      return name;
    },
    get kind() {
      onAccess();
      return kind;
    },
  };
}

function fixtures(
  overrides: {
    files?: ReadonlyMap<string, string>;
    directories?: ReadonlyMap<string, readonly HabitatDirectoryEntry[]>;
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
  };
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
