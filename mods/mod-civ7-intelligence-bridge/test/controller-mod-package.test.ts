import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { describe, expect, test } from "vitest";

import {
  CIV7_INTELLIGENCE_BRIDGE_UI_SCRIPT,
  renderCiv7IntelligenceBridgeModinfo,
} from "../src/modinfo";

const packageRoot = new URL("..", import.meta.url);

describe("Civ7 intelligence bridge mod package", () => {
  test("declares a game-scoped UIScript entry for the controller bootstrap", () => {
    const modinfo = renderCiv7IntelligenceBridgeModinfo();

    expect(modinfo).toContain('<ActionGroup id="game-civ7-intelligence-bridge" scope="game" criteria="always">');
    expect(modinfo).toContain("<UIScripts>");
    expect(modinfo).toContain(`<Item>${CIV7_INTELLIGENCE_BRIDGE_UI_SCRIPT}</Item>`);
    expect(modinfo).not.toContain("<Scripts>");
    expect(modinfo).not.toContain("scope=\"shell\"");
  });

  test("keeps the UI bootstrap on the narrow game-ui package entry", async () => {
    const source = await readFile(
      join(packageRoot.pathname, "src/ui/civ7-intelligence-bridge.ts"),
      "utf8",
    );

    expect(source).toContain("@civ7/control-orpc/game-ui");
    expect(source).toContain("installCiv7GameUiIntelligenceBridge");
    expect(source).not.toContain("@civ7/control-orpc\";");
    expect(source).not.toContain("RPCHandler");
    expect(source).not.toContain("RPCLink");
  });

  test("keeps the generated UI bundle free of Node and direct-control runtime code", async () => {
    const bundle = await readFile(
      join(packageRoot.pathname, "mod/ui/civ7-intelligence-bridge.js"),
      "utf8",
    );

    expect(bundle).not.toContain("from \"net\"");
    expect(bundle).not.toContain("from \"os\"");
    expect(bundle).not.toContain("from \"path\"");
    expect(bundle).not.toContain("@civ7/direct-control");
    expect(bundle).not.toContain("encodeCiv7TunerRequest");
    expect(bundle).not.toContain("withCiv7DirectControlSession");
    expect(bundle).not.toContain("executeCiv7Command");
    expect(bundle).not.toContain("DEFAULT_CIV7_TUNER_HOST");
    expect(bundle).not.toContain("RPCHandler");
    expect(bundle).not.toContain("RPCLink");
  });
});
