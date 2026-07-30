import { describe, expect, test } from "vitest";
import GamePlayBuyAttribute from "../../../../src/commands/game/play/buy-attribute";
import GamePlayChangeTradition from "../../../../src/commands/game/play/change-tradition";
import GamePlayConsiderAttributes from "../../../../src/commands/game/play/consider-attributes";
import GamePlayConsiderTraditions from "../../../../src/commands/game/play/consider-traditions";
import {
  progressionInvocations,
  runProgressionCommand,
  startProgressionTunerServer,
} from "../../../support/progression-tuner-server";

describe("game play attribute and tradition commands", () => {
  test("refuses review closeout outside send mode", async () => {
    await expect(GamePlayBuyAttribute.run(["--node", "51", "--closeout"])).rejects.toThrow(
      /closeout.*send|depends on.*send/i
    );
    await expect(
      GamePlayChangeTradition.run([
        "--tradition-type",
        "61",
        "--action",
        "deactivate",
        "--closeout",
      ])
    ).rejects.toThrow(/closeout.*send|depends on.*send/i);
  });

  test("attribute purchase defaults to check and keeps closeReview in the service", async () => {
    const server = await startProgressionTunerServer();
    try {
      const checked = await runProgressionCommand<NodeCheckResult>(GamePlayBuyAttribute, server, [
        "--node",
        "51",
      ]);
      const requested = await runProgressionCommand<MutationResult>(GamePlayBuyAttribute, server, [
        "--node",
        "51",
        "--send",
        "--closeout",
      ]);

      expect(checked).toEqual({ node: 51, status: "available" });
      expect(requested).toMatchObject({
        node: 51,
        status: "sent-confirmed",
        postcondition: {
          classification: "attribute-purchased-review-closed",
          confirmed: true,
        },
      });

      const invocations = progressionInvocations(server);
      expect(invocations.map(({ atom }) => atom)).toEqual([
        "checkAttributeNodePurchase",
        "checkAttributeNodePurchase",
        "sendAttributeNodePurchaseEnvelope",
        "checkAttributeReview",
        "sendAttributeReviewEnvelope",
        "checkAttributeReview",
      ]);
      expect(invocations[0]?.input).toEqual({ node: 51 });
      expect(invocations[2]?.input).toMatchObject({ node: 51 });
      expect(invocations[2]?.input).not.toHaveProperty("closeReview");
      expect(
        invocations.every(({ message }) => message.includes("GameContext?.localPlayerID"))
      ).toBe(true);
    } finally {
      await server.close();
    }
  });

  test("attribute review defaults to check and --send uses its exact native atom", async () => {
    const server = await startProgressionTunerServer();
    try {
      const checked = await runProgressionCommand<StatusResult>(
        GamePlayConsiderAttributes,
        server,
        []
      );
      const requested = await runProgressionCommand<MutationResult>(
        GamePlayConsiderAttributes,
        server,
        ["--send"]
      );

      expect(checked).toEqual({ status: "available" });
      expect(requested).toMatchObject({
        status: "sent-confirmed",
        postcondition: { classification: "review-closed", confirmed: true },
      });
      expect(progressionInvocations(server).map(({ atom }) => atom)).toEqual([
        "checkAttributeReview",
        "checkAttributeReview",
        "sendAttributeReviewEnvelope",
        "checkAttributeReview",
      ]);
    } finally {
      await server.close();
    }
  });

  test("tradition change forwards activate|deactivate semantics and service-owned closeReview", async () => {
    const server = await startProgressionTunerServer();
    try {
      const checked = await runProgressionCommand<TraditionCheckResult>(
        GamePlayChangeTradition,
        server,
        ["--tradition-type", "62", "--action", "activate"]
      );
      const requested = await runProgressionCommand<TraditionMutationResult>(
        GamePlayChangeTradition,
        server,
        ["--tradition-type", "61", "--action", "deactivate", "--send", "--closeout"]
      );

      expect(checked).toEqual({
        traditionType: 62,
        action: "activate",
        status: "available",
      });
      expect(requested).toMatchObject({
        traditionType: 61,
        action: "deactivate",
        status: "sent-confirmed",
        postcondition: {
          classification: "tradition-changed-review-closed",
          confirmed: true,
        },
      });

      const invocations = progressionInvocations(server);
      expect(invocations.map(({ atom }) => atom)).toEqual([
        "checkTraditionAssignmentChange",
        "checkTraditionAssignmentChange",
        "sendTraditionAssignmentChangeEnvelope",
        "checkTraditionAssignmentReview",
        "sendTraditionAssignmentReviewEnvelope",
        "checkTraditionAssignmentReview",
      ]);
      expect(invocations[0]?.input).toEqual({ traditionType: 62, action: "activate" });
      expect(invocations[1]?.input).toEqual({ traditionType: 61, action: "deactivate" });
      expect(invocations[2]?.input).toMatchObject({
        traditionType: 61,
        action: "deactivate",
      });
      expect(invocations[2]?.input).not.toHaveProperty("closeReview");
      expect(invocations[2]?.message).toContain("PlayerOperationParameters?.[name]");
    } finally {
      await server.close();
    }
  });

  test("tradition review defaults to check and --send uses its exact native atom", async () => {
    const server = await startProgressionTunerServer();
    try {
      const checked = await runProgressionCommand<StatusResult>(
        GamePlayConsiderTraditions,
        server,
        []
      );
      const requested = await runProgressionCommand<MutationResult>(
        GamePlayConsiderTraditions,
        server,
        ["--send"]
      );

      expect(checked).toEqual({ status: "available" });
      expect(requested).toMatchObject({
        status: "sent-confirmed",
        postcondition: { classification: "review-closed", confirmed: true },
      });
      expect(progressionInvocations(server).map(({ atom }) => atom)).toEqual([
        "checkTraditionAssignmentReview",
        "checkTraditionAssignmentReview",
        "sendTraditionAssignmentReviewEnvelope",
        "checkTraditionAssignmentReview",
      ]);
    } finally {
      await server.close();
    }
  });
});

type StatusResult = Readonly<{ status: string }>;
type NodeCheckResult = StatusResult & Readonly<{ node: number }>;
type TraditionCheckResult = StatusResult &
  Readonly<{ traditionType: number; action: "activate" | "deactivate" }>;
type MutationResult = StatusResult &
  Readonly<{
    node?: number;
    postcondition: Readonly<{ classification: string; confirmed: boolean }>;
  }>;
type TraditionMutationResult = MutationResult &
  Readonly<{ traditionType: number; action: "activate" | "deactivate" }>;
