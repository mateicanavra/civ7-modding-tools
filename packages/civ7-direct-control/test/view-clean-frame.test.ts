import { describe, expect, test } from "vitest";
import { Civ7DirectControlError } from "../src/direct-control-error";
import {
  buildCleanFrameEnterCommand,
  buildCleanFrameExitCommand,
  buildViewManagerBridgeCommand,
  CIV7_CLEAN_FRAME_HIDDEN_WORLD_RULES,
  CIV7_CLEAN_FRAME_HIDE_UNITS_GLOBAL,
  CIV7_CLEAN_FRAME_PREVIOUS_VIEW_GLOBAL,
  CIV7_CLEAN_FRAME_VIEW_NAME,
  CIV7_VIEW_MANAGER_BRIDGE_GLOBAL,
  type CleanFrameDependencies,
  ensureCiv7ViewManagerBridge,
  enterCiv7CleanFrame,
  exitCiv7CleanFrame,
} from "../src/play/view/clean-frame";
import { jsLiteral } from "../src/runtime/command-serialization";
import type { Civ7CommandResult } from "../src/session/types";

function commandResult(payload: unknown): Civ7CommandResult {
  return {
    host: "127.0.0.1",
    port: 4318,
    state: { id: "65535", name: "App UI" },
    output: [JSON.stringify(payload)],
  };
}

function fakeDependencies(payloads: ReadonlyArray<unknown>): {
  dependencies: CleanFrameDependencies;
  commands: string[];
  slept: number[];
} {
  const commands: string[] = [];
  const slept: number[] = [];
  const queue = [...payloads];
  const dependencies: CleanFrameDependencies = {
    executeAppUiCommand: async ({ command }) => {
      commands.push(command);
      const payload = queue.shift();
      if (payload === undefined) throw new Error("fake exec exhausted");
      return commandResult(payload);
    },
    jsLiteral,
    parsePayload: <T>(result: Civ7CommandResult) => JSON.parse(result.output[0] ?? "{}") as T,
    sleep: async (ms) => {
      slept.push(ms);
    },
  };
  return { dependencies, commands, slept };
}

describe("clean-frame primitives", () => {
  test("commands drive the official ViewManager rules engine, never DOM selectors", () => {
    for (const command of [
      buildViewManagerBridgeCommand(),
      buildCleanFrameEnterCommand(false, { jsLiteral }),
      buildCleanFrameEnterCommand(true, { jsLiteral }),
      buildCleanFrameExitCommand(),
    ]) {
      expect(command).not.toContain("querySelector");
      expect(command).not.toContain("dispatchEvent");
      expect(command).not.toContain(".click(");
    }
    // The shipped VFS path — the `.chunk.js` layout of our extracted
    // resources does not resolve in the live module registry.
    expect(buildViewManagerBridgeCommand()).toContain("/core/ui/views/view-manager.js");
    expect(buildViewManagerBridgeCommand()).not.toContain(".chunk.js");

    const enter = buildCleanFrameEnterCommand(true, { jsLiteral });
    expect(enter).toContain("setCurrentByName");
    expect(enter).toContain(CIV7_CLEAN_FRAME_VIEW_NAME);
    expect(enter).toContain(CIV7_VIEW_MANAGER_BRIDGE_GLOBAL);
    expect(enter).toContain(CIV7_CLEAN_FRAME_PREVIOUS_VIEW_GLOBAL);
    // Every hide goes through the view's rules — harness plus the Cinematic
    // view's world rule set.
    expect(enter).toContain('{ name: "harness", type: U.HUD, visible: "false" }');
    for (const rule of CIV7_CLEAN_FRAME_HIDDEN_WORLD_RULES) {
      expect(enter).toContain(`{ name: ${jsLiteral(rule)}, type: U.World, visible: "false" }`);
    }
    // 3D unit visibility is guarded by the runtime flag and always restored
    // on exitView.
    expect(enter).toContain(CIV7_CLEAN_FRAME_HIDE_UNITS_GLOBAL);
    expect(enter).toContain("WorldUI.setUnitVisibility(true)");

    const exit = buildCleanFrameExitCommand();
    expect(exit).toContain("setCurrentByName");
    expect(exit).toContain(CIV7_CLEAN_FRAME_PREVIOUS_VIEW_GLOBAL);
    expect(exit).toContain('"World"');
  });

  test("hideUnits is embedded as a literal so the registered view reads the caller's choice", () => {
    expect(buildCleanFrameEnterCommand(true, { jsLiteral })).toContain(
      `globalThis[${jsLiteral(CIV7_CLEAN_FRAME_HIDE_UNITS_GLOBAL)}] = true;`
    );
    expect(buildCleanFrameEnterCommand(false, { jsLiteral })).toContain(
      `globalThis[${jsLiteral(CIV7_CLEAN_FRAME_HIDE_UNITS_GLOBAL)}] = false;`
    );
  });

  test("ensure bridge retries until the module-registry import resolves", async () => {
    const { dependencies, commands, slept } = fakeDependencies([{ ready: false }, { ready: true }]);
    await ensureCiv7ViewManagerBridge({}, dependencies);
    expect(commands).toHaveLength(2);
    expect(slept).toEqual([500]);
  });

  test("ensure bridge fails after the retry budget", async () => {
    const { dependencies } = fakeDependencies(Array.from({ length: 6 }, () => ({ ready: false })));
    await expect(ensureCiv7ViewManagerBridge({}, dependencies)).rejects.toThrow(
      Civ7DirectControlError
    );
  });

  test("enter switches into the clean-frame view and reports readback truth", async () => {
    const { dependencies, commands } = fakeDependencies([
      { ready: true },
      {
        switched: true,
        viewBefore: "World",
        view: CIV7_CLEAN_FRAME_VIEW_NAME,
        harnessHidden: true,
      },
    ]);
    const result = await enterCiv7CleanFrame({ hideUnits: true }, {}, dependencies);
    expect(result).toEqual({
      host: "127.0.0.1",
      port: 4318,
      state: { id: "65535", name: "App UI" },
      switched: true,
      viewBefore: "World",
      view: CIV7_CLEAN_FRAME_VIEW_NAME,
      harnessHidden: true,
      hideUnits: true,
    });
    expect(commands[1]).toContain("views.set");
  });

  test("exit restores the recorded previous view and reports readback truth", async () => {
    const { dependencies } = fakeDependencies([
      { ready: true },
      { switched: true, view: "World", harnessHidden: false },
    ]);
    const result = await exitCiv7CleanFrame({}, dependencies);
    expect(result).toEqual({
      host: "127.0.0.1",
      port: 4318,
      state: { id: "65535", name: "App UI" },
      switched: true,
      view: "World",
      harnessHidden: false,
    });
  });
});
