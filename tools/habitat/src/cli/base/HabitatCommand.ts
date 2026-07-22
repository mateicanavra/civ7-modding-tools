import { createLiveHabitatServiceContext } from "@habitat/cli/runtime/service-context";
import { habitatServiceManagedRuntime } from "@habitat/cli/runtime/service-runtime";
import type { HabitatServiceContext } from "@habitat/cli/service/base";
import { habitatServiceRouter } from "@habitat/cli/service/router";
import { Command, Flags } from "@oclif/core";
import { createRouterClient } from "@orpc/server";
import { installHabitatCommandLifecycle } from "./command-lifecycle.js";

export abstract class HabitatCommand extends Command {
  static override baseFlags = {
    help: Flags.help({ char: "h" }),
  };

  private commandLifecycle: ReturnType<typeof installHabitatCommandLifecycle> | undefined;

  protected override async init(): Promise<void> {
    await super.init();
    this.commandLifecycle = installHabitatCommandLifecycle(() =>
      habitatServiceManagedRuntime.dispose()
    );
  }

  protected override async finally(error: Error | undefined): Promise<void> {
    try {
      await this.commandLifecycle?.finish();
    } finally {
      await super.finally(error);
    }
  }

  protected rawArgv(): string[] {
    return ((this as unknown as { argv?: string[] }).argv ?? []).slice();
  }

  protected exitWith(code: number): void {
    if (code !== 0) this.exit(code);
  }

  protected async habitatServiceClient() {
    return this.habitatServiceClientForContext(await this.habitatServiceContext());
  }

  protected async habitatServiceContext() {
    return createLiveHabitatServiceContext({}, this.habitatServiceCallerOptions());
  }

  protected habitatServiceClientForContext(context: HabitatServiceContext) {
    return createRouterClient(habitatServiceRouter, { context });
  }

  /** Supplies command-scoped cancellation to every local Habitat oRPC procedure call. */
  protected habitatServiceCallerOptions(): { readonly signal: AbortSignal } {
    if (!this.commandLifecycle) {
      throw new Error("Habitat command lifecycle is unavailable before oclif initialization.");
    }
    return this.commandLifecycle.callerOptions;
  }
}
