import { Command, Flags } from "@oclif/core";
import { createCiv7GameControlClient } from "../../../../adapters/control/service-client";
import {
  buildDirectControlOptions,
  emitPlayResult,
  parseComponentId,
} from "../../../../adapters/play/direct-control";

export default class GamePlayNotificationsAdvisorWarning extends Command {
  static hiddenAliases = ["game:play:advisor-warning"];
  static summary = "Check or acknowledge an advisor warning blocker";
  static description =
    "Checks or requests a semantic advisor-warning acknowledgement for a target notification ComponentID.";

  static examples = [
    '<%= config.bin %> game play notifications advisor-warning --target \'{"owner":0,"id":65536,"type":26}\' --json',
    '<%= config.bin %> game play notifications advisor-warning --target \'{"owner":0,"id":65536,"type":26}\' --send --json',
  ];

  static flags = {
    host: Flags.string({
      description: "Civ7 tuner socket host",
    }),
    port: Flags.integer({
      description: "Civ7 tuner socket port",
    }),
    target: Flags.string({
      description: "Advisor warning notification ComponentID JSON",
      required: true,
    }),
    send: Flags.boolean({
      description: "Acknowledge the advisor warning through the notifications service",
      default: false,
    }),
    "timeout-ms": Flags.integer({
      description: "Socket timeout",
      default: 45_000,
    }),
    json: Flags.boolean({
      description: "Emit machine-readable JSON",
      default: false,
    }),
  };

  public async run(): Promise<void> {
    const { flags } = await this.parse(GamePlayNotificationsAdvisorWarning);
    const target = parseComponentId(flags.target, "target");
    const options = buildDirectControlOptions(flags);
    const client = createCiv7GameControlClient({ endpointDefaults: options });
    const input = { target };
    const result = flags.send
      ? await client.notifications.advisorWarning.viewed.request(input)
      : await client.notifications.advisorWarning.viewed.check(input);

    emitPlayResult(this.log.bind(this), flags.json, result);
  }
}
