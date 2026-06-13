import { Command, Flags } from "@oclif/core";
import { createCiv7ControlOrpcServerClient } from "@civ7/control-orpc";
import { liveCiv7ControlOrpcDirectControlFacade } from "@civ7/control-orpc/runtime";
import {
  buildDirectControlOptions,
  emitPlayResult,
  executePlayOperationSequence,
  validatePlayOperation,
} from "../../../utils/game-play-shared";

const CHANGE_TRADITION = "CHANGE_TRADITION";
const CONSIDER_ASSIGN_TRADITIONS = "CONSIDER_ASSIGN_TRADITIONS";

export default class GamePlayChangeTradition extends Command {
  static id = "game play change-tradition";
  static summary = "Validate or change an active tradition";
  static description =
    "Wraps player-operation CHANGE_TRADITION with a live TraditionType and action enum value.";

  static examples = [
    "<%= config.bin %> game play change-tradition --player-id 0 --tradition-type 2057145683 --action 1318334332 --json",
    "<%= config.bin %> game play change-tradition --tradition-type -331546976 --action -1326475004 --send --json",
    "<%= config.bin %> game play change-tradition --tradition-type -331546976 --action -1326475004 --send --closeout --json",
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
    "tradition-type": Flags.integer({
      description: "TraditionType id from live traditions UI/GameInfo",
      required: true,
    }),
    action: Flags.integer({
      description: "Tradition action enum value from the live traditions UI",
      required: true,
    }),
    send: Flags.boolean({
      description: "Send CHANGE_TRADITION after validator success",
      default: false,
    }),
    closeout: Flags.boolean({
      description: "Also run CONSIDER_ASSIGN_TRADITIONS as part of the same caller-level workflow",
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
    const { flags } = await this.parse(GamePlayChangeTradition);
    const options = buildDirectControlOptions(flags);
    if (flags.send) {
      const client = createCiv7ControlOrpcServerClient({
        directControl: liveCiv7ControlOrpcDirectControlFacade,
        endpointDefaults: options,
      });
      const change = await client.progression.tradition.change.request({
        traditionType: flags["tradition-type"],
        action: flags.action,
      });
      if (flags.closeout) {
        const review =
          change.status === "not-sent"
            ? null
            : await client.progression.tradition.review.request({});
        emitPlayResult(
          this.log.bind(this),
          flags.json,
          progressionPlayerChoiceWorkflow([
            { label: "change tradition", result: change },
            ...(review === null ? [] : [{ label: "close tradition review", result: review }]),
          ])
        );
        return;
      }

      emitPlayResult(this.log.bind(this), flags.json, change);
      return;
    }

    if (typeof flags["player-id"] !== "number") {
      throw new Error("game play change-tradition requires --player-id unless --send is used");
    }
    const input = {
      operationType: CHANGE_TRADITION,
      playerId: flags["player-id"],
      args: {
        TraditionType: flags["tradition-type"],
        Action: flags.action,
      },
    };
    if (flags.closeout) {
      const result = await executePlayOperationSequence(
        [
          {
            label: "change tradition",
            family: "player-operation",
            input,
          },
          {
            label: "close tradition review",
            family: "player-operation",
            input: {
              operationType: CONSIDER_ASSIGN_TRADITIONS,
              playerId: flags["player-id"],
              args: {},
            },
          },
        ],
        options,
        { send: flags.send }
      );

      emitPlayResult(this.log.bind(this), flags.json, result);
      return;
    }

    const result = await validatePlayOperation("player-operation", input, options);

    emitPlayResult(this.log.bind(this), flags.json, result);
  }
}

function progressionPlayerChoiceWorkflow(steps: Array<{ label: string; result: unknown }>) {
  return {
    mode: "send",
    stepCount: steps.length,
    status: steps.some(
      (step) =>
        typeof step.result === "object" &&
        step.result !== null &&
        "status" in step.result &&
        step.result.status === "sent-unverified"
    )
      ? "sent-unverified"
      : "not-sent",
    steps,
    nextSteps: [
      {
        kind: "do-not-repeat",
        source: "progression.tradition.change.request",
        label: "Do not repeat this tradition workflow until fresh attention evidence is read.",
      },
    ],
  };
}
