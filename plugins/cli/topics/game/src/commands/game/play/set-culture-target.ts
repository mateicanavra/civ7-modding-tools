import { createCiv7ControlOrpcServerClient } from "@civ7/control-orpc";
import { liveCiv7ControlOrpcDirectControlFacade } from "@civ7/control-orpc/runtime";
import { Command, Flags } from "@oclif/core";
import {
  buildDirectControlOptions,
  emitPlayResult,
  validatePlayOperation,
} from "../../../utils/game-play-shared";

const SET_CULTURE_TREE_TARGET_NODE = "SET_CULTURE_TREE_TARGET_NODE";

export default class GamePlaySetCultureTarget extends Command {
  static id = "game play set-culture-target";
  static summary = "Validate or set a culture tree target node";
  static description =
    "Wraps player-operation SET_CULTURE_TREE_TARGET_NODE with the official ProgressionTreeNodeType argument.";

  static examples = [
    "<%= config.bin %> game play set-culture-target --player-id 0 --node -1677668973 --json",
    "<%= config.bin %> game play set-culture-target --node -1677668973 --send --json",
  ];

  static flags = {
    host: Flags.string({
      description: "Civ7 tuner socket host",
    }),
    port: Flags.integer({
      description: "Civ7 tuner socket port",
    }),
    "player-id": Flags.integer({
      description: "Player id for read-only validation; send mode uses live local-player evidence",
    }),
    node: Flags.integer({
      description: "ProgressionTreeNodeType id from live GameInfo/progression tree reads",
      required: true,
    }),
    send: Flags.boolean({
      description: "Send SET_CULTURE_TREE_TARGET_NODE after validator success",
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
    const { flags } = await this.parse(GamePlaySetCultureTarget);
    const options = buildDirectControlOptions(flags);
    if (flags.send) {
      const result = await createCiv7ControlOrpcServerClient({
        directControl: liveCiv7ControlOrpcDirectControlFacade,
        endpointDefaults: options,
      }).progression.culture.target.request({
        node: flags.node,
      });

      emitPlayResult(this.log.bind(this), flags.json, result);
      return;
    }

    if (typeof flags["player-id"] !== "number") {
      throw new Error("game play set-culture-target requires --player-id unless --send is used");
    }
    const input = {
      operationType: SET_CULTURE_TREE_TARGET_NODE,
      playerId: flags["player-id"],
      args: {
        ProgressionTreeNodeType: flags.node,
      },
    };
    const result = await validatePlayOperation("player-operation", input, options);

    emitPlayResult(this.log.bind(this), flags.json, result);
  }
}
