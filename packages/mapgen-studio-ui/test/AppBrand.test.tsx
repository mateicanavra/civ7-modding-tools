// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { AppBrand } from "../src/components/composites/AppBrand.js";

// Behavior locks for the E3 propification: default content renders verbatim
// (the studio strings are the prop defaults), and the info card — previously
// hover-ONLY, unreachable without a pointer — now opens on keyboard focus and
// closes when focus leaves the component.

afterEach(cleanup);

describe("AppBrand", () => {
  it("renders the default identity strings at rest, card closed", () => {
    render(<AppBrand />);
    expect(screen.getByText("MapGen Studio")).toBeTruthy();
    expect(screen.getByText("v0.1")).toBeTruthy();
    expect(screen.queryByText("View on GitHub")).toBeNull();
  });

  it("renders prop-driven content", () => {
    render(<AppBrand title="Atlas Workbench" version="v2.3" />);
    expect(screen.getByText("Atlas Workbench")).toBeTruthy();
    expect(screen.getByText("v2.3")).toBeTruthy();
  });

  it("opens the info card on keyboard focus and closes when focus leaves", () => {
    const { container } = render(<AppBrand />);
    const pill = screen.getByText("MapGen Studio").closest("div[tabindex]") as HTMLElement;
    expect(pill).toBeTruthy();

    fireEvent.focus(pill);
    expect(screen.getByText("View on GitHub")).toBeTruthy();
    expect(screen.getByText("© 2024 • MIT License")).toBeTruthy();

    // Tabbing INTO the card keeps it open (relatedTarget stays inside).
    const link = screen.getByText("View on GitHub").closest("a") as HTMLElement;
    fireEvent.blur(pill, { relatedTarget: link });
    expect(screen.getByText("View on GitHub")).toBeTruthy();

    // Focus moving outside the component closes it.
    fireEvent.blur(link, { relatedTarget: container });
    expect(screen.queryByText("View on GitHub")).toBeNull();
  });

  it("still opens on hover (pointer path unchanged)", () => {
    render(<AppBrand />);
    const root = screen.getByText("MapGen Studio").closest("div.relative") as HTMLElement;
    fireEvent.mouseEnter(root);
    expect(screen.getByText("Documentation")).toBeTruthy();
    fireEvent.mouseLeave(root);
    expect(screen.queryByText("Documentation")).toBeNull();
  });
});
