// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PresetConfirmDialog } from "../src/components/composites/PresetDialogs.js";

// Behavior lock for the E3 double-fire fix: the Cancel button used to carry
// its own `onClick={onCancel}` INSIDE a `DialogClose`, so one click fired
// `onCancel` twice — directly, and again through the Dialog's
// `onOpenChange(false)`. The rendered markup is unchanged by the fix (onClick
// never renders); this test pins the single-fire behavior.

afterEach(cleanup);

function renderDialog(overrides: Partial<Parameters<typeof PresetConfirmDialog>[0]> = {}) {
  const onCancel = vi.fn();
  const onConfirm = vi.fn();
  render(
    <PresetConfirmDialog
      open
      title="Delete config"
      message="This cannot be undone."
      confirmLabel="Delete"
      onCancel={onCancel}
      onConfirm={onConfirm}
      {...overrides}
    />
  );
  return { onCancel, onConfirm };
}

describe("PresetConfirmDialog callback firing", () => {
  it("fires onCancel exactly once per Cancel click (no DialogClose double-fire)", () => {
    const { onCancel, onConfirm } = renderDialog();
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it("fires onCancel exactly once when dismissing via Escape", () => {
    const { onCancel } = renderDialog();
    fireEvent.keyDown(document.activeElement ?? document.body, { key: "Escape" });
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it("fires onConfirm exactly once per confirm click and never onCancel", () => {
    const { onCancel, onConfirm } = renderDialog();
    fireEvent.click(screen.getByRole("button", { name: "Delete" }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(onCancel).not.toHaveBeenCalled();
  });
});
