import { createLiveHabitatServiceContext } from "@internal/habitat-harness/runtime/service-context";
import type { HabitatServiceContext } from "@internal/habitat-harness/service/base";
import { habitatServiceRouter } from "@internal/habitat-harness/service/router";
import { Command, Flags } from "@oclif/core";
import { createRouterClient } from "@orpc/server";

export abstract class HabitatCommand extends Command {
  static override baseFlags = {
    help: Flags.help({ char: "h" }),
  };

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
    return createLiveHabitatServiceContext();
  }

  protected habitatServiceClientForContext(context: HabitatServiceContext) {
    return createRouterClient(habitatServiceRouter, { context });
  }
}
