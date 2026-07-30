import { Command, Flags } from "@oclif/core";
import { createCiv7GameControlClient } from "../../../../adapters/control/service-client";
import {
  buildDirectControlOptions,
  emitPlayResult,
  parseComponentId,
} from "../../../../adapters/play/direct-control";

export default class GamePlayNotificationsDismiss extends Command {
  static summary = "Inspect or dismiss a reviewed notification";
  static description =
    "Checks native notification dismissal through the control service and requests it only when --send is explicit.";
  static hiddenAliases = ["game:play:dismiss-notification"];

  static examples = [
    '<%= config.bin %> game play notifications dismiss --target \'{"owner":0,"id":113,"type":20}\' --json',
    '<%= config.bin %> game play notifications dismiss --target \'{"owner":0,"id":113,"type":20}\' --send --json',
  ];

  static flags = {
    host: Flags.string({
      description: "Civ7 tuner socket host",
    }),
    port: Flags.integer({
      description: "Civ7 tuner socket port",
    }),
    target: Flags.string({
      description: "Notification ComponentID JSON",
      required: true,
    }),
    send: Flags.boolean({
      description: "Dismiss the notification when canUserDismiss is true",
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
    const { flags } = await this.parse(GamePlayNotificationsDismiss);
    const input = { notificationId: parseComponentId(flags.target, "target") };
    const options = buildDirectControlOptions(flags);
    const client = createCiv7GameControlClient({
      endpointDefaults: options,
    });
    const result = flags.send
      ? await client.notifications.dismiss.request(input)
      : await client.notifications.dismiss.check(input);

    emitPlayResult(this.log.bind(this), flags.json, result);
  }
}
