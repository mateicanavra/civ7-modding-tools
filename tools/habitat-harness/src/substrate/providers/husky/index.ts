import { Context, Layer } from "effect";

export type HuskyHookName = "pre-commit" | "pre-push";

export interface HuskyDelegator {
  hook: HuskyHookName;
  argv: readonly string[];
}

export interface HuskyProviderService {
  readonly delegator: (hook: HuskyHookName) => HuskyDelegator;
}

export class HuskyProvider extends Context.Tag("@internal/habitat-harness/HuskyProvider")<
  HuskyProvider,
  HuskyProviderService
>() {}

export const HuskyProviderLive = Layer.succeed(HuskyProvider, {
  delegator: huskyDelegator,
});

export function makeFakeHuskyProviderLayer(
  service: HuskyProviderService = { delegator: huskyDelegator }
) {
  return Layer.succeed(HuskyProvider, service);
}

export function huskyDelegator(hook: HuskyHookName): HuskyDelegator {
  return {
    hook,
    argv: ["bun", "run", "habitat", "hook", hook],
  };
}
