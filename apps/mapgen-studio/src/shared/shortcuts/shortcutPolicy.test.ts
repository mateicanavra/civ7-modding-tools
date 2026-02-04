import { describe, expect, it } from "vitest";
import { shouldIgnoreGlobalShortcutsInEditableTarget } from "./shortcutPolicy";

describe("shouldIgnoreGlobalShortcutsInEditableTarget", () => {
  it("ignores bare keys inside editable targets", () => {
    expect(
      shouldIgnoreGlobalShortcutsInEditableTarget({
        isEditableTarget: true,
        metaKey: false,
        ctrlKey: false,
        altKey: false,
      })
    ).toBe(true);
  });

  it("allows Cmd/Ctrl shortcuts inside editable targets", () => {
    expect(
      shouldIgnoreGlobalShortcutsInEditableTarget({
        isEditableTarget: true,
        metaKey: true,
        ctrlKey: false,
        altKey: false,
      })
    ).toBe(false);
    expect(
      shouldIgnoreGlobalShortcutsInEditableTarget({
        isEditableTarget: true,
        metaKey: false,
        ctrlKey: true,
        altKey: false,
      })
    ).toBe(false);
  });

  it("allows Alt shortcuts inside editable targets", () => {
    expect(
      shouldIgnoreGlobalShortcutsInEditableTarget({
        isEditableTarget: true,
        metaKey: false,
        ctrlKey: false,
        altKey: true,
      })
    ).toBe(false);
  });

  it("never ignores shortcuts outside editable targets", () => {
    expect(
      shouldIgnoreGlobalShortcutsInEditableTarget({
        isEditableTarget: false,
        metaKey: false,
        ctrlKey: false,
        altKey: false,
      })
    ).toBe(false);
  });
});

