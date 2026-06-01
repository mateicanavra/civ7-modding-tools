import { describe, expect, it } from "bun:test";
import { readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const SRC_ROOT = fileURLToPath(new URL("../../src", import.meta.url));

const RUNTIME_BOUNDARY_PATTERNS: readonly RegExp[] = [
  /^import(?!\s+type).*["@']@civ7\/adapter/m,
  /["@']@civ7\/adapter\/civ7["@']/,
  /\bcreateCiv7Adapter\b/,
  /\bGameplayMap\b/,
  /\bengine\s+as\s+unknown\b/,
];

function collectProductionSourceFiles(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    const rel = relative(SRC_ROOT, path);
    if (rel === "dev" || rel.startsWith(`dev/`)) continue;
    if (entry.isDirectory()) {
      out.push(...collectProductionSourceFiles(path));
    } else if (entry.isFile() && path.endsWith(".ts")) {
      out.push(path);
    }
  }
  return out;
}

describe("core runtime boundary", () => {
  it("keeps production mapgen-core free of Civ7 runtime values", () => {
    const violations = collectProductionSourceFiles(SRC_ROOT).flatMap((file) => {
      const text = readFileSync(file, "utf8");
      return RUNTIME_BOUNDARY_PATTERNS.filter((pattern) => pattern.test(text)).map((pattern) => ({
        file: relative(SRC_ROOT, file),
        pattern: String(pattern),
      }));
    });

    expect(violations).toEqual([]);
  });
});
