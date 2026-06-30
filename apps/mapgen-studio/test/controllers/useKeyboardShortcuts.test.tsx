// @vitest-environment jsdom
import { renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  useKeyboardShortcuts,
  type KeyboardShortcutContext,
} from "../../src/app/hooks/useKeyboardShortcuts";
import { shouldIgnoreGlobalShortcutsInEditableTarget } from "../../src/shared/shortcuts/shortcutPolicy";
import "./_setup";

// --- Fixtures ---------------------------------------------------------------
// The nav logic only reads `.value`; labels/index/category are filler.
const stage = (value: string): KeyboardShortcutContext["stages"][number] => ({
  value,
  label: value,
  index: 0,
});
const step = (value: string): KeyboardShortcutContext["steps"][number] => ({
  value,
  label: value,
  category: "c",
});
const dataType = (value: string): KeyboardShortcutContext["dataTypeOptions"][number] => ({
  value,
  label: value,
});

function makeContext(over: Partial<KeyboardShortcutContext> = {}): KeyboardShortcutContext {
  return {
    stages: [stage("s0"), stage("s1"), stage("s2")],
    steps: [step("p0"), step("p1"), step("p2")],
    dataTypeOptions: [dataType("d0"), dataType("d1"), dataType("d2")],
    selectedStageId: "s1",
    selectedStepId: "p1",
    selectedDataTypeId: "d1",
    handleStageChange: vi.fn(),
    setSelectedStepId: vi.fn(),
    handleDataTypeChange: vi.fn(),
    run: vi.fn(),
    reroll: vi.fn(),
    toggleRightPanel: vi.fn(),
    toggleLeftPanel: vi.fn(),
    ...over,
  };
}

const createdNodes: Element[] = [];
afterEach(() => {
  for (const node of createdNodes.splice(0)) node.remove();
});

/** Dispatch a real keydown that bubbles to the window listener. */
function fireKey(init: KeyboardEventInit, target?: Element): KeyboardEvent {
  const event = new KeyboardEvent("keydown", { bubbles: true, cancelable: true, ...init });
  (target ?? window).dispatchEvent(event);
  return event;
}

/** An input mounted in the document so `event.target` is an editable element. */
function mountedInput(): HTMLInputElement {
  const input = document.createElement("input");
  document.body.appendChild(input);
  createdNodes.push(input);
  return input;
}

describe("useKeyboardShortcuts — editable-target suppression (KB-3)", () => {
  it("policy fires modifier shortcuts in editable targets but suppresses bare keys", () => {
    // Pure truth table — the falsifier (returning `isEditableTarget` alone)
    // would make the meta/ctrl/alt rows true (suppressed) instead of false.
    const f = shouldIgnoreGlobalShortcutsInEditableTarget;
    expect(f({ isEditableTarget: true, metaKey: false, ctrlKey: false, altKey: false })).toBe(true);
    expect(f({ isEditableTarget: true, metaKey: true, ctrlKey: false, altKey: false })).toBe(false);
    expect(f({ isEditableTarget: true, metaKey: false, ctrlKey: true, altKey: false })).toBe(false);
    expect(f({ isEditableTarget: true, metaKey: false, ctrlKey: false, altKey: true })).toBe(false);
    expect(f({ isEditableTarget: false, metaKey: false, ctrlKey: false, altKey: false })).toBe(
      false
    );
  });

  it("Cmd+Enter still runs from inside an input, but bare Enter does not", () => {
    const ctx = makeContext();
    renderHook(() => useKeyboardShortcuts(ctx));
    const input = mountedInput();

    fireKey({ key: "Enter", metaKey: true }, input);
    expect(ctx.run).toHaveBeenCalledTimes(1);

    fireKey({ key: "Enter" }, input); // bare key in editable → suppressed
    expect(ctx.run).toHaveBeenCalledTimes(1);
  });
});

describe("useKeyboardShortcuts — run / re-roll (KB-4 repeat guard)", () => {
  it("Cmd+Enter runs, Cmd+Shift+Enter re-rolls, and held repeats are ignored", () => {
    const ctx = makeContext();
    renderHook(() => useKeyboardShortcuts(ctx));

    fireKey({ key: "Enter", metaKey: true });
    expect(ctx.run).toHaveBeenCalledTimes(1);
    expect(ctx.reroll).not.toHaveBeenCalled();

    fireKey({ key: "Enter", metaKey: true, shiftKey: true });
    expect(ctx.reroll).toHaveBeenCalledTimes(1);

    // event.repeat short-circuits AFTER preventDefault — the action must not fire.
    const repeated = fireKey({ key: "Enter", metaKey: true, repeat: true });
    expect(ctx.run).toHaveBeenCalledTimes(1);
    expect(repeated.defaultPrevented).toBe(true);
  });
});

describe("useKeyboardShortcuts — stage/step/layer navigation clamps at boundaries (KB-4)", () => {
  it("Cmd+Down advances a stage mid-list but clamps at the last", () => {
    const ctx = makeContext({ selectedStageId: "s1" });
    const { rerender } = renderHook((c: KeyboardShortcutContext) => useKeyboardShortcuts(c), {
      initialProps: ctx,
    });

    fireKey({ key: "ArrowDown", metaKey: true });
    expect(ctx.handleStageChange).toHaveBeenCalledExactlyOnceWith("s2");

    const atLast = makeContext({ selectedStageId: "s2" });
    rerender(atLast);
    fireKey({ key: "ArrowDown", metaKey: true });
    expect(atLast.handleStageChange).not.toHaveBeenCalled();
  });

  it("Cmd+Up clamps at the first stage", () => {
    const ctx = makeContext({ selectedStageId: "s0" });
    renderHook(() => useKeyboardShortcuts(ctx));
    fireKey({ key: "ArrowUp", metaKey: true });
    expect(ctx.handleStageChange).not.toHaveBeenCalled();
  });

  it("Cmd+Shift+Down advances a step but clamps at the last", () => {
    const mid = makeContext({ selectedStepId: "p1" });
    const { rerender } = renderHook((c: KeyboardShortcutContext) => useKeyboardShortcuts(c), {
      initialProps: mid,
    });
    fireKey({ key: "ArrowDown", metaKey: true, shiftKey: true });
    expect(mid.setSelectedStepId).toHaveBeenCalledExactlyOnceWith("p2");

    const last = makeContext({ selectedStepId: "p2" });
    rerender(last);
    fireKey({ key: "ArrowDown", metaKey: true, shiftKey: true });
    expect(last.setSelectedStepId).not.toHaveBeenCalled();
  });

  it("Opt+Up changes the layer but clamps at the first data type", () => {
    const mid = makeContext({ selectedDataTypeId: "d1" });
    const { rerender } = renderHook((c: KeyboardShortcutContext) => useKeyboardShortcuts(c), {
      initialProps: mid,
    });
    fireKey({ key: "ArrowUp", altKey: true });
    expect(mid.handleDataTypeChange).toHaveBeenCalledExactlyOnceWith("d0");

    const first = makeContext({ selectedDataTypeId: "d0" });
    rerender(first);
    fireKey({ key: "ArrowUp", altKey: true });
    expect(first.handleDataTypeChange).not.toHaveBeenCalled();
  });
});

describe("useKeyboardShortcuts — render-phase latest-ref freshness (KB-1 / KB-2)", () => {
  it("dispatches into the LATEST context after a re-render, not the mount-time one", () => {
    const first = makeContext();
    const { rerender } = renderHook((c: KeyboardShortcutContext) => useKeyboardShortcuts(c), {
      initialProps: first,
    });

    // Swap in a brand-new context (new run/handler spies). A stale closure
    // capture (deps not `[]`, or no render-phase ref write) would call the
    // mount-time spies instead.
    const next = makeContext({ selectedStageId: "s1" });
    rerender(next);

    fireKey({ key: "Enter", metaKey: true });
    expect(next.run).toHaveBeenCalledTimes(1);
    expect(first.run).not.toHaveBeenCalled();

    fireKey({ key: "ArrowDown", metaKey: true });
    expect(next.handleStageChange).toHaveBeenCalledExactlyOnceWith("s2");
    expect(first.handleStageChange).not.toHaveBeenCalled();
  });

  it("removes the global listener on unmount", () => {
    const ctx = makeContext();
    const { unmount } = renderHook(() => useKeyboardShortcuts(ctx));
    unmount();
    fireKey({ key: "Enter", metaKey: true });
    expect(ctx.run).not.toHaveBeenCalled();
  });
});
