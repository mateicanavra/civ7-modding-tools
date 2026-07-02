// @vitest-environment jsdom
import { cleanup, renderHook, waitFor } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useResolvedTheme } from "../src/lib/useResolvedTheme.js";

// The toast theme is an EXTERNAL store: the `<html>` theme class, read via
// useSyncExternalStore (no effect, no setState-in-render). The Toaster's
// private `useThemeFromClass` twin was DELETED (one theme hook — LEDGER
// adjudication 5); sonner.tsx now consumes `useResolvedTheme`, so these pins
// guard the store contract through THAT hook — explicit-class snapshots (both
// conventions), live re-theming, observer teardown on unmount, the class-less
// fallback, and the SSR default — so a regression to a stale first paint, a
// missed update, or a leaked observer is caught.
//
// Contract note (supersedes the old app-side pins): the hook is dark-FIRST.
// With no explicit `.dark`/`.light` class it falls back to the winning
// `color-scheme` — and where no theme CSS is loaded (this jsdom env, SSR) that
// resolves dark, the studio default. The retired app test pinned the old
// absence-means-light convention, which is exactly the ambiguity the
// dual-convention hook removed (its 3 failures were stale expectations, not
// regressions).

function ThemeProbe() {
  return <span data-theme={useResolvedTheme()} />;
}

afterEach(() => {
  cleanup();
  document.documentElement.classList.remove("dark", "light");
});

describe("toast theme store (useSyncExternalStore via useResolvedTheme)", () => {
  it("reads dark when <html> has .dark on mount (app/Storybook convention)", () => {
    document.documentElement.classList.add("dark");
    const { result } = renderHook(() => useResolvedTheme());
    expect(result.current).toBe("dark");
  });

  it("reads light when <html> has .light on mount (design-sync bundle convention)", () => {
    document.documentElement.classList.add("light");
    const { result } = renderHook(() => useResolvedTheme());
    expect(result.current).toBe("light");
  });

  it("falls back dark-first when no theme class is set and no theme CSS declares color-scheme", () => {
    const { result } = renderHook(() => useResolvedTheme());
    expect(result.current).toBe("dark");
  });

  it("tracks the live <html> class in both directions", async () => {
    document.documentElement.classList.add("light");
    const { result } = renderHook(() => useResolvedTheme());
    expect(result.current).toBe("light");

    document.documentElement.classList.remove("light");
    document.documentElement.classList.add("dark");
    await waitFor(() => expect(result.current).toBe("dark"));

    document.documentElement.classList.remove("dark");
    document.documentElement.classList.add("light");
    await waitFor(() => expect(result.current).toBe("light"));
  });

  it("disconnects the class observer on unmount (no leak)", () => {
    const disconnectSpy = vi.spyOn(MutationObserver.prototype, "disconnect");
    const { unmount } = renderHook(() => useResolvedTheme());
    unmount();
    expect(disconnectSpy).toHaveBeenCalled();
    disconnectSpy.mockRestore();
  });

  it("uses the dark server snapshot under SSR (dark-first studio)", () => {
    document.documentElement.classList.add("light");
    const html = renderToStaticMarkup(<ThemeProbe />);
    expect(html).toContain('data-theme="dark"');
  });
});
