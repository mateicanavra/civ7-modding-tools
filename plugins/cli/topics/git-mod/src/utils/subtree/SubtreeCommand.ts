import { Command, Flags } from "@oclif/core";

export default abstract class SubtreeCommand extends Command {
  static baseFlags = {
    branch: Flags.string({
      description: "Branch to track",
      char: "b",
    }),
    verbose: Flags.boolean({
      description: "Show underlying git commands",
      default: false,
      char: "v",
    }),
  } as const;

  protected abstract domain: string;
}
