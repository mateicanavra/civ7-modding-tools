import { describe, expect, test } from "vitest";
import GamePlayChooseCulture from "../../../../src/commands/game/play/choose-culture";
import GamePlaySetCultureTarget from "../../../../src/commands/game/play/set-culture-target";
import {
  progressionInvocations,
  runProgressionCommand,
  startProgressionTunerServer,
} from "../../../support/progression-tuner-server";

describe("game play culture commands", () => {
  test("keeps option discovery exclusive from node mutation inputs", async () => {
    await expect(GamePlayChooseCulture.run(["--options", "--node", "21"])).rejects.toThrow(
      /options.*node|node.*options|exclusive/i
    );
  });

  test("default mode checks exact ambient-player choice and target atoms", async () => {
    const server = await startProgressionTunerServer();
    try {
      const choice = await runProgressionCommand<ProgressionCheckResult>(
        GamePlayChooseCulture,
        server,
        ["--node", "21"]
      );
      const target = await runProgressionCommand<ProgressionCheckResult>(
        GamePlaySetCultureTarget,
        server,
        ["--node", "42"]
      );

      expect(choice).toEqual({ node: 21, status: "available" });
      expect(target).toEqual({ node: 42, status: "available" });
      const invocations = progressionInvocations(server);
      expect(invocations.map(({ atom }) => atom)).toEqual(["checkTreeChoice", "checkTreeTarget"]);
      expect(invocations.map(({ input }) => input)).toEqual([
        { kind: "culture", node: 21 },
        { kind: "culture", node: 42 },
      ]);
      expect(
        invocations.every(({ message }) => message.includes("GameContext?.localPlayerID"))
      ).toBe(true);
    } finally {
      await server.close();
    }
  });

  test("--send routes choice and target through service-owned native sequences", async () => {
    const server = await startProgressionTunerServer();
    try {
      const choice = await runProgressionCommand<ProgressionMutationResult>(
        GamePlayChooseCulture,
        server,
        ["--node", "21", "--send"]
      );
      const target = await runProgressionCommand<ProgressionMutationResult>(
        GamePlaySetCultureTarget,
        server,
        ["--node", "42", "--send"]
      );

      expect(choice).toMatchObject({
        node: 21,
        status: "sent-confirmed",
        postcondition: {
          classification: "choice-selected-target-cleared",
          confirmed: true,
        },
      });
      expect(target).toMatchObject({
        node: 42,
        status: "sent-confirmed",
        postcondition: { classification: "target-selected", confirmed: true },
      });

      const invocations = progressionInvocations(server);
      expect(invocations.map(({ atom }) => atom)).toEqual([
        "checkTreeChoice",
        "sendTreeChoiceEnvelope",
        "checkTreeChoice",
        "clearTreeTargetEnvelope",
        "checkTreeTarget",
        "checkTreeChoice",
        "sendTreeChoiceEnvelope",
        "checkTreeTarget",
        "sendTreeTargetEnvelope",
      ]);
      expect(invocations[0]?.input).toEqual({ kind: "culture", node: 21 });
      expect(invocations[1]?.input).toMatchObject({ kind: "culture", node: 21 });
      expect(invocations[3]?.input).toMatchObject({ kind: "culture" });
      expect(invocations[4]?.input).toEqual({ kind: "culture", node: 42 });
      expect(invocations[5]?.input).toEqual({ kind: "culture", node: 42 });
      expect(invocations[6]?.input).toMatchObject({ kind: "culture", node: 42 });
      expect(invocations[7]?.input).toEqual({ kind: "culture", node: 42 });
      expect(invocations[8]?.input).toMatchObject({ kind: "culture", node: 42 });
    } finally {
      await server.close();
    }
  });
});

type ProgressionCheckResult = Readonly<{
  node: number;
  status: string;
}>;

type ProgressionMutationResult = Readonly<{
  node: number;
  status: string;
  postcondition: Readonly<{
    classification: string;
    confirmed: boolean;
  }>;
}>;
