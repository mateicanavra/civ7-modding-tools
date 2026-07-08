// @vitest-environment node
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it, vi } from "vitest";

const finalizerUrl = new URL("../scripts/light-canary-result.mjs", import.meta.url).href;
const {
  collectDesignSyncObservation,
  collectStorybookObservation,
  evaluateLightCanary,
  finalizeLightCanary,
  writeLightCanaryResultAtomically,
} = await import(finalizerUrl);

const EXPECTED_PICKS = [
  { name: "Button", storyId: "primitives-button--variants", exportName: "Variants" },
  { name: "Tabs", storyId: "primitives-tabs--recipe-panel", exportName: "RecipePanel" },
];
const EXPECTED_TOKENS = ["--background"];

function validResult() {
  return {
    Button: {
      storyMarker: "primitives-button--variants",
      exportMarker: "Variants",
      sbClass: "light",
      sbTokens: { "--background": "#fff" },
      dsTokens: { "--background": "#fff" },
    },
    Tabs: {
      storyMarker: "primitives-tabs--recipe-panel",
      exportMarker: "RecipePanel",
      sbClass: "light",
      sbTokens: { "--background": "#111" },
      dsTokens: { "--background": "#111" },
    },
  };
}

function fakeCollectorPage({
  bodyClasses = [],
  globals = {},
  roots = {},
  search = "",
  tokens = { "--background": "#fff" },
}: {
  bodyClasses?: string[];
  globals?: Record<string, unknown>;
  roots?: Record<
    string,
    {
      childElementCount?: number;
      visible?: boolean;
      width?: number;
      height?: number;
    }
  >;
  search?: string;
  tokens?: Record<string, string>;
}) {
  return {
    async evaluate<TInput, TResult>(
      collector: (input: TInput) => TResult,
      input: TInput
    ): Promise<TResult> {
      const windowDescriptor = Object.getOwnPropertyDescriptor(globalThis, "window");
      const documentDescriptor = Object.getOwnPropertyDescriptor(globalThis, "document");
      const document = {
        body: { classList: { contains: (name: string) => bodyClasses.includes(name) } },
        documentElement: { className: "light" },
      };
      const window = {
        ...globals,
        location: { search },
        getComputedStyle: () => ({ getPropertyValue: (token: string) => tokens[token] ?? "" }),
      };
      Object.defineProperty(globalThis, "window", { configurable: true, value: window });
      Object.defineProperty(globalThis, "document", {
        configurable: true,
        value: document,
      });
      try {
        return collector(input);
      } finally {
        if (windowDescriptor) Object.defineProperty(globalThis, "window", windowDescriptor);
        else Reflect.deleteProperty(globalThis, "window");
        if (documentDescriptor) Object.defineProperty(globalThis, "document", documentDescriptor);
        else Reflect.deleteProperty(globalThis, "document");
      }
    },
    locator(selector: string) {
      const root = roots[selector];
      return {
        count: async () => (root ? 1 : 0),
        isVisible: async () => root?.visible ?? true,
        boundingBox: async () =>
          root ? { x: 0, y: 0, width: root.width ?? 1, height: root.height ?? 1 } : null,
        evaluate: async <TResult>(collector: (element: { childElementCount: number }) => TResult) =>
          collector({ childElementCount: root?.childElementCount ?? 1 }),
      };
    },
  };
}

function deferred() {
  let release!: () => void;
  const promise = new Promise<void>((resolve) => {
    release = resolve;
  });
  return { promise, release };
}

describe("light canary result", () => {
  it("collects observable markers with a fake page", async () => {
    const storybook = fakeCollectorPage({
      bodyClasses: ["sb-show-main"],
      roots: { "#storybook-root": {} },
      search: "?id=primitives-button--variants",
      globals: {
        __STORYBOOK_PREVIEW__: {
          selectionStore: { selection: { storyId: "primitives-button--variants" } },
          storyRenders: [{ id: "primitives-button--variants", phase: "finished" }],
        },
      },
    });
    const designSync = fakeCollectorPage({
      globals: { __dsCells: ["Sizes", "Variants"] },
      roots: { "#r0": {} },
      search: "?story=Variants",
    });

    const story = await collectStorybookObservation(storybook, {
      expectedStoryId: "primitives-button--variants",
      expectedTokens: EXPECTED_TOKENS,
    });
    const exported = await collectDesignSyncObservation(designSync, {
      expectedExport: "Variants",
      expectedTokens: EXPECTED_TOKENS,
    });

    expect(story).toMatchObject({
      storyMarker: "primitives-button--variants",
      sbClass: "light",
      tokens: { "--background": "#fff" },
    });
    expect(exported).toMatchObject({
      exportMarker: "Variants",
      tokens: { "--background": "#fff" },
    });
  });

  it("fails at the design-sync collector when the requested export is missing", async () => {
    const designSync = fakeCollectorPage({
      globals: { __dsCells: ["Sizes", "Variants"] },
      roots: { "#r0": {} },
      search: "?story=Missing",
    });

    await expect(
      collectDesignSyncObservation(designSync, {
        expectedExport: "Missing",
        expectedTokens: EXPECTED_TOKENS,
      })
    ).rejects.toThrow(
      'design-sync export "Missing" did not render successfully: the requested runtime selection did not complete (available: Sizes, Variants)'
    );
  });

  it("rejects a case-mismatched design-sync query even when the emitted export exists", async () => {
    const designSync = fakeCollectorPage({
      globals: { __dsCells: ["Sizes", "Variants"] },
      roots: { "#r0": {} },
      search: "?story=variants",
    });

    await expect(
      collectDesignSyncObservation(designSync, {
        expectedExport: "Variants",
        expectedTokens: EXPECTED_TOKENS,
      })
    ).rejects.toThrow(
      'design-sync export "Variants" did not render successfully: the requested runtime selection did not complete (available: Sizes, Variants)'
    );
  });

  it("requires the requested story/export render roots, not only runtime selection", async () => {
    const storybook = fakeCollectorPage({
      bodyClasses: ["sb-show-main"],
      search: "?id=primitives-button--variants",
      globals: {
        __STORYBOOK_PREVIEW__: {
          selectionStore: { selection: { storyId: "primitives-button--variants" } },
          storyRenders: [{ id: "primitives-button--variants", phase: "finished" }],
        },
      },
    });
    const designSync = fakeCollectorPage({
      globals: { __dsCells: ["Sizes", "Variants"] },
      search: "?story=Variants",
    });

    await expect(
      collectStorybookObservation(storybook, {
        expectedStoryId: "primitives-button--variants",
        expectedTokens: EXPECTED_TOKENS,
      })
    ).rejects.toThrow('render root "#storybook-root" is absent');
    await expect(
      collectDesignSyncObservation(designSync, {
        expectedExport: "Variants",
        expectedTokens: EXPECTED_TOKENS,
      })
    ).rejects.toThrow('render root "#r0" is absent');
  });

  it.each([
    ["empty", { childElementCount: 0 }, "is empty"],
    ["hidden", { visible: false }, "is hidden"],
    ["zero-size", { width: 0 }, "has zero rendered geometry"],
  ])("rejects a %s render root", async (_label, root, expectedProblem) => {
    const storybook = fakeCollectorPage({
      bodyClasses: ["sb-show-main"],
      roots: { "#storybook-root": root },
      search: "?id=primitives-button--variants",
      globals: {
        __STORYBOOK_PREVIEW__: {
          selectionStore: { selection: { storyId: "primitives-button--variants" } },
          storyRenders: [{ id: "primitives-button--variants", phase: "finished" }],
        },
      },
    });

    await expect(
      collectStorybookObservation(storybook, {
        expectedStoryId: "primitives-button--variants",
        expectedTokens: EXPECTED_TOKENS,
      })
    ).rejects.toThrow(expectedProblem);
  });

  it("exits cleanly only after deferred cleanup when every pick is drift-free", async () => {
    const outcome = evaluateLightCanary(validResult(), {
      expectedPicks: EXPECTED_PICKS,
      expectedTokens: EXPECTED_TOKENS,
    });
    const events: string[] = [];
    const cleanup = deferred();
    const finishing = finalizeLightCanary(
      outcome,
      async () => {
        events.push("cleanup:start");
        await cleanup.promise;
        events.push("cleanup:done");
      },
      {
        stderr: () => events.push("drift"),
        persist: async () => events.push("persist"),
        runtime: {
          set exitCode(value: number) {
            events.push(`exit:${value}`);
          },
        },
      }
    );

    await vi.waitFor(() => expect(events).toEqual(["cleanup:start"]));
    cleanup.release();
    await finishing;

    expect(events).toEqual(["cleanup:start", "cleanup:done", "persist"]);
  });

  it("reports drift and assigns exit only after deferred cleanup completes", async () => {
    const result = validResult();
    result.Tabs.dsTokens["--background"] = "#222";
    const outcome = evaluateLightCanary(result, {
      expectedPicks: EXPECTED_PICKS,
      expectedTokens: EXPECTED_TOKENS,
    });
    const events: string[] = [];
    const cleanup = deferred();
    const finishing = finalizeLightCanary(
      outcome,
      async () => {
        events.push("cleanup:start");
        await cleanup.promise;
        events.push("cleanup:done");
      },
      {
        stderr: () => events.push("drift"),
        persist: async () => events.push("persist"),
        runtime: {
          set exitCode(value: number) {
            events.push(`exit:${value}`);
          },
        },
      }
    );

    await vi.waitFor(() => expect(events).toEqual(["cleanup:start"]));
    cleanup.release();
    await finishing;

    expect(events).toEqual(["cleanup:start", "cleanup:done", "drift", "exit:1"]);
  });

  it("reports both an invalid observation and a cleanup failure", async () => {
    const outcome = evaluateLightCanary(
      {},
      {
        expectedPicks: EXPECTED_PICKS,
        expectedTokens: EXPECTED_TOKENS,
        collectionFailures: ["navigation failed"],
      }
    );
    const events: string[] = [];
    const runtime = { exitCode: 0 };

    await expect(
      finalizeLightCanary(
        outcome,
        async () => {
          throw new AggregateError([new Error("browser close failed")], "cleanup failed");
        },
        {
          stderr: (message: string) => events.push(message),
          persist: async () => events.push("persist"),
          runtime,
        }
      )
    ).rejects.toThrow("cleanup failed");

    expect(events).toEqual([
      expect.stringContaining("invalid observation: navigation failed"),
      "light-canary: cleanup failed: browser close failed",
    ]);
    expect(runtime.exitCode).toBe(1);
  });

  it("preserves the retained result when atomic replacement fails", () => {
    const directory = mkdtempSync(join(tmpdir(), "light-canary-result-"));
    const target = join(directory, "result.json");
    writeFileSync(target, '{"status":"retained"}\n');

    try {
      expect(() =>
        writeLightCanaryResultAtomically(
          target,
          { status: "replacement" },
          {
            rename: () => {
              throw new Error("rename failed");
            },
          }
        )
      ).toThrow("rename failed");
      expect(readFileSync(target, "utf8")).toBe('{"status":"retained"}\n');
    } finally {
      rmSync(directory, { recursive: true, force: true });
    }
  });

  it.each([
    ["navigation failure", validResult(), ["Button Storybook navigation failed: timeout"]],
    ["empty result", {}, []],
    ["missing expected pick", { Button: validResult().Button }, []],
    ["malformed pick", { ...validResult(), Button: null }, []],
    [
      "missing success marker",
      { ...validResult(), Button: { ...validResult().Button, exportMarker: null } },
      [],
    ],
    [
      "Storybook class mismatch",
      { ...validResult(), Button: { ...validResult().Button, sbClass: "dark" } },
      [],
    ],
    ["empty sample", { ...validResult(), Button: { ...validResult().Button, sbTokens: {} } }, []],
    [
      "missing nonempty token sample",
      {
        ...validResult(),
        Button: { ...validResult().Button, sbTokens: { "--background": "" } },
      },
      [],
    ],
  ])("fails closed before drift evaluation for %s", async (_label, result, collectionFailures) => {
    const normalize = vi.fn((value: string) => value);
    const outcome = evaluateLightCanary(result, {
      expectedPicks: EXPECTED_PICKS,
      expectedTokens: EXPECTED_TOKENS,
      normalize,
      collectionFailures,
    });

    expect(outcome.failures.length).toBeGreaterThan(0);
    expect(outcome.aggregateDrift).toEqual([]);
    expect(normalize).not.toHaveBeenCalled();

    const events: string[] = [];
    await finalizeLightCanary(outcome, async () => events.push("cleanup:done"), {
      stderr: () => events.push("invalid"),
      runtime: {
        set exitCode(value: number) {
          events.push(`exit:${value}`);
        },
      },
    });
    expect(events).toEqual(["cleanup:done", "invalid", "exit:1"]);
  });
});
