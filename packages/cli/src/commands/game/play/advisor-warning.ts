import { Command, Flags } from "@oclif/core";
import { createCiv7ControlOrpcServerClient } from "@civ7/control-orpc";
import { liveCiv7ControlOrpcDirectControlFacade } from "@civ7/control-orpc/runtime";
import {
  buildDirectControlOptions,
  emitPlayResult,
  parseComponentId,
  validatePlayOperation,
} from "../../../utils/game-play-shared";

const ADVISOR_WARNING_OPERATION = "VIEWED_ADVISOR_WARNING";

export default class GamePlayAdvisorWarning extends Command {
  static id = "game play advisor-warning";
  static summary = "Validate or acknowledge an advisor warning blocker";
  static description =
    "Validates or sends a semantic advisor-warning acknowledgement for a target notification ComponentID.";

  static examples = [
    '<%= config.bin %> game play advisor-warning --player-id 0 --target \'{"owner":0,"id":65536,"type":26}\' --json',
    '<%= config.bin %> game play advisor-warning --target \'{"owner":0,"id":65536,"type":26}\' --send --json',
  ];

  static flags = {
    host: Flags.string({
      description: "Civ7 tuner socket host",
    }),
    port: Flags.integer({
      description: "Civ7 tuner socket port",
    }),
    "player-id": Flags.integer({
      description: "Player id for dry-run validation; send mode uses live local-player evidence",
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
    const { flags } = await this.parse(GamePlayAdvisorWarning);
    const target = parseComponentId(flags.target, "target");
    const options = buildDirectControlOptions(flags);

    if (flags.send) {
      const result = await createCiv7ControlOrpcServerClient({
        directControl: liveCiv7ControlOrpcDirectControlFacade,
        endpointDefaults: options,
      }).notifications.advisorWarning.viewed.request({
        target,
      });
      emitPlayResult(this.log.bind(this), flags.json, result);
      return;
    }

    if (flags["player-id"] == null) {
      throw new Error("--player-id is required when validating advisor-warning without --send");
    }

    const input = {
      operationType: ADVISOR_WARNING_OPERATION,
      playerId: flags["player-id"],
      args: {
        Target: target,
      },
    };
    const result = await validatePlayOperation("player-operation", input, options);

    emitPlayResult(this.log.bind(this), flags.json, result);
  }
}
