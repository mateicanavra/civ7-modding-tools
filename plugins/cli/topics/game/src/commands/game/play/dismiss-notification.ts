import { createCiv7ControlOrpcServerClient } from "@civ7/control-orpc";
import { liveCiv7ControlOrpcDirectControlFacade } from "@civ7/control-orpc/runtime";
import { getCiv7NotificationDismissal } from "@civ7/direct-control";
import { Command, Flags } from "@oclif/core";
import {
  buildDirectControlOptions,
  emitPlayResult,
  parseComponentId,
} from "../../../utils/game-play-shared";

export default class GamePlayDismissNotification extends Command {
  static id = "game play dismiss-notification";
  static summary = "Inspect or dismiss a reviewed notification";
  static description =
    "Reads a notification through App UI state and optionally dismisses it through the native control-oRPC notification procedure when --send is explicit.";

  static examples = [
    '<%= config.bin %> game play dismiss-notification --target \'{"owner":0,"id":113,"type":20}\' --json',
    '<%= config.bin %> game play dismiss-notification --target \'{"owner":0,"id":113,"type":20}\' --send --json',
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
    const { flags } = await this.parse(GamePlayDismissNotification);
    const input = { notificationId: parseComponentId(flags.target, "target") };
    const options = buildDirectControlOptions(flags);
    const result = flags.send
      ? await createCiv7ControlOrpcServerClient({
          directControl: liveCiv7ControlOrpcDirectControlFacade,
          endpointDefaults: options,
        }).notifications.dismiss.request(input)
      : await getCiv7NotificationDismissal(input, options);

    emitPlayResult(this.log.bind(this), flags.json, result);
  }
}
