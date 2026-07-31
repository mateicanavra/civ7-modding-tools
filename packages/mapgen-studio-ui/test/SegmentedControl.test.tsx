// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { SegmentedControl } from "../src/components/composites/SegmentedControl.js";

afterEach(cleanup);

describe("SegmentedControl", () => {
  it("reports one selected option through native pressed buttons", () => {
    const onValueChange = vi.fn();
    render(
      <SegmentedControl
        aria-label="View"
        value="map"
        onValueChange={onValueChange}
        items={[
          { value: "map", label: "Map", children: "Map" },
          { value: "pipeline", label: "Pipeline", children: "Pipeline" },
        ]}
      />
    );

    expect(screen.getByRole("group", { name: "View" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Map" }).getAttribute("aria-pressed")).toBe("true");
    expect(screen.getByRole("button", { name: "Pipeline" }).getAttribute("aria-pressed")).toBe(
      "false"
    );

    fireEvent.click(screen.getByRole("button", { name: "Pipeline" }));
    expect(onValueChange).toHaveBeenCalledWith("pipeline");
  });
});
