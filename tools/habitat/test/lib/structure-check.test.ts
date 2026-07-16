import type { HabitatDirectoryEntry } from "@habitat/cli/resources/platform/index";
import type { RuleStructureFacts } from "@habitat/cli/service/model/rules/index";
import {
  evaluateStructureCheckEffect,
  parseStructureCheckSpec,
  runStructureRulesEffect,
  type StructureCheckSpec,
} from "@habitat/cli/service/model/structure-check/index";
import { Effect } from "effect";
import { describe, expect, test } from "vitest";

const repoRoot = "/repo";
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
      })
    );

    expect(results.get(rule.id)).toEqual({ exitCode: 0, diagnostics: [] });
    expect(fixture.events).toContain(`read:${repoRoot}/.habitat/sample/sample.structure.toml`);
  });
});

async function runWithFs(
  spec: StructureCheckSpec,
  fixture: ReturnType<typeof fixtures>
): Promise<{ exitCode: number; diagnostics: readonly { message: string }[] }> {
  return Effect.runPromise(
    evaluateStructureCheckEffect(rule, spec, {
      repoRoot,
      fileSystem: port(fixture),
    })
  );
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
      fixture.directories.has(targetPath)
        ? Effect.sync(() => {
            fixture.events.push(`readdir:${targetPath}`);
            return fixture.directories.get(targetPath) ?? [];
          })
        : Effect.fail(new Error(`Missing directory fixture: ${targetPath}`)),
    readText: (targetPath: string) =>
      fixture.files.has(targetPath)
        ? Effect.sync(() => {
            fixture.events.push(`read:${targetPath}`);
            return fixture.files.get(targetPath) ?? "";
          })
        : Effect.fail(new Error(`Missing file fixture: ${targetPath}`)),
  };
}

function messages(result: { diagnostics: readonly { message: string }[] }): string {
  return result.diagnostics.map((diagnostic) => diagnostic.message).join("\n");
}
