import { Effect } from "effect";
import { describe, expect, test, vi } from "vitest";

const mockRunHook = vi.hoisted(() => vi.fn());

vi.mock("../../src/lib/hooks.js", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../../src/lib/hooks.js")>();
  return {
    ...actual,
    runHook: mockRunHook,
  };
});

describe("Habitat hook service", () => {
  test("runs owned hook orchestration from service input", async () => {
    const { runHookService } = await import("../../src/service/modules/hook/run.js");
    mockRunHook.mockReturnValueOnce({ exitCode: 0, stdout: "hook ok\n", stderr: "" });

    const result = await Effect.runPromise(runHookService({ name: "pre-push", base: "HEAD~1" }));

    expect(result).toEqual({ exitCode: 0, stdout: "hook ok\n", stderr: "" });
    expect(mockRunHook).toHaveBeenCalledWith("pre-push", { base: "HEAD~1" });
  });

  test("preserves unknown hook stream behavior", async () => {
    const { runHookService } = await import("../../src/service/modules/hook/run.js");
    mockRunHook.mockReturnValueOnce({
      exitCode: 2,
      stdout: "",
      stderr: "Unknown Habitat hook '(missing)'. Expected pre-commit or pre-push.\n",
    });

    const result = await Effect.runPromise(runHookService({}));

    expect(result).toEqual({
      exitCode: 2,
      stdout: "",
      stderr: "Unknown Habitat hook '(missing)'. Expected pre-commit or pre-push.\n",
    });
    expect(mockRunHook).toHaveBeenCalledWith(undefined, { base: undefined });
  });

  test("preserves empty base as hook runtime input", async () => {
    const { runHookService } = await import("../../src/service/modules/hook/run.js");
    mockRunHook.mockReturnValueOnce({ exitCode: 0, stdout: "resolved default base\n", stderr: "" });

    const result = await Effect.runPromise(runHookService({ name: "pre-push", base: "" }));

    expect(result).toEqual({ exitCode: 0, stdout: "resolved default base\n", stderr: "" });
    expect(mockRunHook).toHaveBeenCalledWith("pre-push", { base: "" });
  });
});
