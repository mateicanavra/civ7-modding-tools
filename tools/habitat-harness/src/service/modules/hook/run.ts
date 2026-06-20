import { Effect } from "effect";
import { runHook } from "../../../lib/hooks.js";
import type { HookServiceRunInput } from "./contract.js";

/**
 * Owns the `habitat hook` callable boundary. The hook runtime internals keep
 * their current behavior while the CLI and Husky enter through the service.
 */
export function runHookService(input: HookServiceRunInput = {}) {
  return Effect.sync(() => runHook(input.name, { base: input.base }));
}
