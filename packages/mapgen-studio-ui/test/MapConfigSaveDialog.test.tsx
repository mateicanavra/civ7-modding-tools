// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { MapConfigSaveDialog } from "../src/components/composites/MapConfigSaveDialog.js";

afterEach(cleanup);

describe("MapConfigSaveDialog", () => {
  it("associates its fields with accessible labels and submits trimmed values", () => {
    const onConfirm = vi.fn();
    render(<MapConfigSaveDialog open initialName="" onCancel={vi.fn()} onConfirm={onConfirm} />);

    const name = screen.getByRole("textbox", { name: "Name" });
    const description = screen.getByRole("textbox", { name: "Description (optional)" });
    const save = screen.getByRole("button", { name: "Save" });
    expect(save).toHaveProperty("disabled", true);

    fireEvent.change(name, { target: { value: "  My Config  " } });
    fireEvent.change(description, { target: { value: "  A saved map  " } });
    fireEvent.click(save);

    expect(onConfirm).toHaveBeenCalledWith({
      name: "My Config",
      description: "A saved map",
    });
  });
});
