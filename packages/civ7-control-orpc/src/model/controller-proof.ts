import { Type, type Static } from "typebox";
import { Value } from "typebox/value";

export const Civ7ControllerMutationProofSchema = Type.Object(
  {
    lifecycle: Type.Object(
      {
        source: Type.Literal("controller-runtime"),
        status: Type.Literal("game-controller-ready"),
      },
      { additionalProperties: false }
    ),
    localPlayer: Type.Object(
      {
        source: Type.Literal("GameContext.localPlayerID"),
        playerId: Type.Integer({ minimum: 0, maximum: 255 }),
      },
      { additionalProperties: false }
    ),
    hotseat: Type.Object(
      {
        source: Type.Literal("controller-runtime"),
        status: Type.Literal("single-local-player"),
      },
      { additionalProperties: false }
    ),
  },
  { additionalProperties: false }
);
export type Civ7ControllerMutationProof = Static<typeof Civ7ControllerMutationProofSchema>;

export function isCiv7ControllerMutationProof(
  proof: unknown
): proof is Civ7ControllerMutationProof {
  return Value.Check(Civ7ControllerMutationProofSchema, proof);
}
