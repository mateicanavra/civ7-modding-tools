import { describe, expect, test } from "vitest";
import GamePlayChooseTech from "../../../../src/commands/game/play/choose-tech";
import GamePlaySetTechTarget from "../../../../src/commands/game/play/set-tech-target";
import {
  progressionInvocations,
  runProgressionCommand,
  startProgressionTunerServer,
} from "../../../support/progression-tuner-server";

describe("game play technology commands", () => {
  test("keeps option discovery exclusive from node mutation inputs", async () => {
    await expect(GamePlayChooseTech.run(["--options", "--node", "11"])).rejects.toThrow(
      /options.*node|node.*options|exclusive/i
    );
  });

  test("default mode checks exact ambient-player choice and target atoms", async () => {
    const server = await startProgressionTunerServer();
    try {
      const choice = await runProgressionCommand<ProgressionCheckResult>(
        GamePlayChooseTech,
        server,
        ["--node", "11"]
      );
      const target = await runProgressionCommand<ProgressionCheckResult>(
        GamePlaySetTechTarget,
        server,
        ["--node", "41"]
      );

      expect(choice).toEqual({ node: 11, status: "available" });
      expect(target).toEqual({ node: 41, status: "available" });
      const invocations = progressionInvocations(server);
      expect(invocations.map(({ atom }) => atom)).toEqual(["checkTreeChoice", "checkTreeTarget"]);
      expect(invocations.map(({ input }) => input)).toEqual([
        { kind: "technology", node: 11 },
        { kind: "technology", node: 41 },
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
        GamePlayChooseTech,
        server,
        ["--node", "11", "--send"]
      );
      const target = await runProgressionCommand<ProgressionMutationResult>(
        GamePlaySetTechTarget,
        server,
        ["--node", "41", "--send"]
      );

      expect(choice).toMatchObject({
        node: 11,
        status: "sent-confirmed",
        postcondition: {
          classification: "choice-selected-target-cleared",
          confirmed: true,
        },
      });
      expect(target).toMatchObject({
        node: 41,
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
      expect(invocations[0]?.input).toEqual({ kind: "technology", node: 11 });
      expect(invocations[1]?.input).toMatchObject({ kind: "technology", node: 11 });
      expect(invocations[3]?.input).toMatchObject({ kind: "technology" });
      expect(invocations[4]?.input).toEqual({ kind: "technology", node: 41 });
      expect(invocations[5]?.input).toEqual({ kind: "technology", node: 41 });
      expect(invocations[6]?.input).toMatchObject({ kind: "technology", node: 41 });
      expect(invocations[7]?.input).toEqual({ kind: "technology", node: 41 });
      expect(invocations[8]?.input).toMatchObject({ kind: "technology", node: 41 });
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
