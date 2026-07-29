import { Command, Flags } from "@oclif/core";
import { createCiv7GameControlClient } from "../../../adapters/control/service-client";
import { buildDirectControlOptions, emitPlayResult } from "../../../adapters/play/direct-control";

export default class GamePlayEndTurn extends Command {
  static summary = "Check or send Civ7 end turn";
  static description =
    "Checks native turn-completion availability through the control service, or requests it when --send is explicit.";

  static examples = [
    "<%= config.bin %> game play end-turn --json",
    "<%= config.bin %> game play end-turn --send --json",
  ];

  static flags = {
    host: Flags.string({
      description: "Civ7 tuner socket host",
    }),
    port: Flags.integer({
      description: "Civ7 tuner socket port",
    }),
    send: Flags.boolean({
      description: "Request turn completion after the service-owned native availability check",
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
    const { flags } = await this.parse(GamePlayEndTurn);
    const options = buildDirectControlOptions(flags);
    const client = createCiv7GameControlClient({
      endpointDefaults: options,
    });
    const result = flags.send
      ? await client.turn.complete.request({})
      : await client.turn.complete.check({});

    emitPlayResult(this.log.bind(this), flags.json, result);
  }
}
