import { Command, Flags } from "@oclif/core";
import { createCiv7ControlOrpcServerClient } from "@civ7/control-orpc";
import { liveCiv7ControlOrpcDirectControlFacade } from "@civ7/control-orpc/runtime";
import {
  buildDirectControlOptions,
  emitPlayResult,
  executePlayOperationSequence,
  validatePlayOperation,
} from "../../../utils/game-play-shared";

const BUY_ATTRIBUTE_TREE_NODE = "BUY_ATTRIBUTE_TREE_NODE";
const CONSIDER_ASSIGN_ATTRIBUTE = "CONSIDER_ASSIGN_ATTRIBUTE";

export default class GamePlayBuyAttribute extends Command {
  static id = "game play buy-attribute";
  static summary = "Validate or buy an attribute tree node";
  static description =
    "Wraps player-operation BUY_ATTRIBUTE_TREE_NODE with the official ProgressionTreeNodeType argument.";

  static examples = [
    "<%= config.bin %> game play buy-attribute --player-id 0 --node 20 --json",
    "<%= config.bin %> game play buy-attribute --node 20 --send --json",
    "<%= config.bin %> game play buy-attribute --node 20 --send --closeout --json",
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
      description: "ProgressionTreeNodeType id from live attribute tree reads",
      required: true,
    }),
    send: Flags.boolean({
      description: "Send BUY_ATTRIBUTE_TREE_NODE after validator success",
      default: false,
    }),
    closeout: Flags.boolean({
      description: "Also run CONSIDER_ASSIGN_ATTRIBUTE as part of the same caller-level workflow",
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
    const { flags } = await this.parse(GamePlayBuyAttribute);
    const options = buildDirectControlOptions(flags);
    if (flags.send) {
      const client = createCiv7ControlOrpcServerClient({
        directControl: liveCiv7ControlOrpcDirectControlFacade,
        endpointDefaults: options,
      });
      const purchase = await client.progression.attribute.purchase.request({
        node: flags.node,
      });
      if (flags.closeout) {
        const review =
          purchase.status === "not-sent"
            ? null
            : await client.progression.attribute.review.request({});
        emitPlayResult(
          this.log.bind(this),
          flags.json,
          progressionPlayerChoiceWorkflow([
            { label: "buy attribute", result: purchase },
            ...(review === null ? [] : [{ label: "close attribute review", result: review }]),
          ])
        );
        return;
      }

      emitPlayResult(this.log.bind(this), flags.json, purchase);
      return;
    }

    if (typeof flags["player-id"] !== "number") {
      throw new Error("game play buy-attribute requires --player-id unless --send is used");
    }
    const input = {
      operationType: BUY_ATTRIBUTE_TREE_NODE,
      playerId: flags["player-id"],
      args: {
        ProgressionTreeNodeType: flags.node,
      },
    };
    if (flags.closeout) {
      const result = await executePlayOperationSequence(
        [
          {
            label: "buy attribute",
            family: "player-operation",
            input,
          },
          {
            label: "close attribute review",
            family: "player-operation",
            input: {
              operationType: CONSIDER_ASSIGN_ATTRIBUTE,
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
        source: "progression.attribute.purchase.request",
        label: "Do not repeat this attribute workflow until fresh attention evidence is read.",
      },
    ],
  };
}
