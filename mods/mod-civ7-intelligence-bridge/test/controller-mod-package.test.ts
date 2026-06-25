import { readFile } from "node:fs/promises";
import { builtinModules } from "node:module";
import { join } from "node:path";
import { describe, expect, test } from "vitest";

import {
  CIV7_INTELLIGENCE_BRIDGE_UI_SCRIPT,
  renderCiv7IntelligenceBridgeModinfo,
} from "../src/modinfo";

const packageRoot = new URL("..", import.meta.url);
const forbiddenBundleRuntimeTokens = [
  "@civ7/direct-control",
  "encodeCiv7TunerRequest",
  "withCiv7DirectControlSession",
  "executeCiv7Command",
  "DEFAULT_CIV7_TUNER_HOST",
  "RPCHandler",
  "RPCLink",
] as const;

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const forbiddenBundleNodeSources = Array.from(
  new Set(
    builtinModules.flatMap((source) =>
      source.startsWith("node:") ? [source] : [source, `node:${source}`]
    )
  )
).sort((left, right) => right.length - left.length);
const forbiddenBundleNodeImportPattern = new RegExp(
  String.raw`(?:\bfrom\s*["']|\bimport\s*(?:\(\s*)?["']|\brequire\s*\(\s*["'])(?:${forbiddenBundleNodeSources
    .map(escapeRegExp)
    .join("|")})["']`,
  "g"
);

describe("Civ7 intelligence bridge mod package", () => {
  test("declares a game-scoped UIScript entry for the controller bootstrap", () => {
    const modinfo = renderCiv7IntelligenceBridgeModinfo();

    expect(modinfo).toContain(
      '<ActionGroup id="game-civ7-intelligence-bridge" scope="game" criteria="always">'
    );
    expect(modinfo).toContain("<UIScripts>");
    expect(modinfo).toContain(`<Item>${CIV7_INTELLIGENCE_BRIDGE_UI_SCRIPT}</Item>`);
    expect(modinfo).not.toContain("<Scripts>");
    expect(modinfo).not.toContain('scope="shell"');
  });

  test("keeps the generated UI bundle free of Node and direct-control runtime code", async () => {
    const bundle = await readFile(
      join(packageRoot.pathname, "mod/ui/civ7-intelligence-bridge.js"),
      "utf8"
    );

    expect(Array.from(new Set(bundle.match(forbiddenBundleNodeImportPattern) ?? []))).toEqual([]);
    for (const token of forbiddenBundleRuntimeTokens) {
      expect(bundle).not.toContain(token);
    }
  });
});
