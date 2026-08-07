import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { ESLint } from "eslint";
import { describe, expect, test } from "vitest";

const repoRoot = resolve(fileURLToPath(new URL(".", import.meta.url)), "../../../..");
const probePath = resolve(repoRoot, "packages/civ7-api/src/__runtime_probe__.ts");
const eslint = new ESLint({
  cwd: repoRoot,
  overrideConfigFile: resolve(repoRoot, "eslint.boundaries.config.mjs"),
});

async function messageIds(source: string): Promise<readonly (string | null)[]> {
  const [result] = await eslint.lintText(source, { filePath: probePath });
  return result?.messages.map((message) => message.messageId ?? null) ?? [];
}

describe("Civ7 V8 project boundary", () => {
  test("admits project-local production imports", async () => {
    await expect(messageIds('export { catalog } from "./catalog.js";\n')).resolves.toEqual([]);
  });

  test("refuses workspace projects outside the V8 closure", async () => {
    await expect(messageIds('import "@civ7/map-policy";\n')).resolves.toContain(
      "onlyTagsConstraintViolation"
    );
  });

  test("refuses undeclared runtime vendors", async () => {
    await expect(messageIds('import "typebox";\n')).resolves.toContain(
      "bannedExternalImportsViolation"
    );
  });
});
