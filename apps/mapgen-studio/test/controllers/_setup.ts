/**
 * Shared setup for controller-hook tests (jsdom environment).
 *
 * jsdom (the DOM env used by `// @vitest-environment jsdom` controller tests)
 * does not implement `ResizeObserver`, which `useViewportLayout`'s container
 * measurement effect relies on. Import this module at the top of any controller
 * test that mounts a hook touching the DOM (`import "./_setup"`).
 *
 * It also registers React Testing Library's `cleanup` after each test so mounted
 * hooks/components are unmounted between cases (RTL relies on a global afterEach;
 * we register it explicitly rather than depend on vitest `globals`).
 */
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

afterEach(() => {
  cleanup();
});

class ResizeObserverStub implements ResizeObserver {
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
}

if (typeof globalThis.ResizeObserver === "undefined") {
  globalThis.ResizeObserver = ResizeObserverStub as unknown as typeof ResizeObserver;
}
