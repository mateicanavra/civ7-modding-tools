import { Command, Flags } from "@oclif/core";

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
}
