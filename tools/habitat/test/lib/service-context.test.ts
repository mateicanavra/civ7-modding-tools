import { describe, expect, test, vi } from "vitest";

const mockRunPromise = vi.hoisted(() => vi.fn());

vi.mock("../../src/runtime/service-runtime.js", () => ({
  habitatServiceManagedRuntime: { runPromise: mockRunPromise },
}));

import { createLiveHabitatServiceContext } from "@habitat/cli/runtime/service-context";

describe("live Habitat service context", () => {
  test("interrupts runtime dependency acquisition with the command AbortSignal", async () => {
    mockRunPromise.mockImplementationOnce(
      (_effect: unknown, options: { readonly signal?: AbortSignal }) =>
        new Promise((_resolve, reject) => {
          options.signal?.addEventListener(
            "abort",
            () => reject(new Error("runtime acquisition aborted")),
            { once: true }
          );
        })
    );
    const controller = new AbortController();

    const pending = createLiveHabitatServiceContext({}, { signal: controller.signal });
    controller.abort();

    await expect(pending).rejects.toThrow("runtime acquisition aborted");
    expect(mockRunPromise).toHaveBeenCalledWith(expect.anything(), {
      signal: controller.signal,
    });
  });
});
