// @vitest-environment jsdom
import { cleanup, renderHook, waitFor } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useThemeFromClass } from "../../src/components/ui/sonner";

// The toast theme is an EXTERNAL store: the `<html>` `.dark` class, read via
// useSyncExternalStore (no effect, no setState-in-render). These pins guard the
// store contract THROUGH the public hook — initial snapshot (both modes), live
// re-theming, observer teardown on unmount, and the SSR default — so a regression
// to a stale first paint, a missed update, or a leaked observer is caught.

function ThemeProbe() {
  return <span data-theme={useThemeFromClass()} />;
}

afterEach(() => {
  cleanup();
  document.documentElement.classList.remove("dark");
});

describe("sonner theme store (useSyncExternalStore via useThemeFromClass)", () => {
  it("reads light when <html> has no .dark class", () => {
    document.documentElement.classList.remove("dark");
    const { result } = renderHook(() => useThemeFromClass());
    expect(result.current).toBe("light");
  });

  it("reads dark when <html> already has .dark on mount", () => {
    document.documentElement.classList.add("dark");
    const { result } = renderHook(() => useThemeFromClass());
    expect(result.current).toBe("dark");
  });

  it("tracks the live <html> class in both directions", async () => {
    document.documentElement.classList.remove("dark");
    const { result } = renderHook(() => useThemeFromClass());
    expect(result.current).toBe("light");

    document.documentElement.classList.add("dark");
    await waitFor(() => expect(result.current).toBe("dark"));

    document.documentElement.classList.remove("dark");
    await waitFor(() => expect(result.current).toBe("light"));
  });

  it("disconnects the class observer on unmount (no leak)", () => {
    const disconnectSpy = vi.spyOn(MutationObserver.prototype, "disconnect");
    const { unmount } = renderHook(() => useThemeFromClass());
    unmount();
    expect(disconnectSpy).toHaveBeenCalled();
    disconnectSpy.mockRestore();
  });

  it("uses the light server snapshot under SSR even when .dark is set", () => {
    document.documentElement.classList.add("dark");
    const html = renderToStaticMarkup(<ThemeProbe />);
    expect(html).toContain('data-theme="light"');
  });
});
