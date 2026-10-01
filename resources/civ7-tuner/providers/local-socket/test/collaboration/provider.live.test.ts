import { Effect } from "effect";
import { expect, test } from "vitest";

import { acquireLocalSocketCiv7Tuner } from "../../index.js";

const live = process.env.CIV7_TUNER_LIVE === "1";

test.skipIf(!live)("collaborates with the supported local Civ7 Tuner", async () => {
  const acquisition = acquireLocalSocketCiv7Tuner();
  const program = acquisition.pipe(Effect.flatMap((tuner) => tuner.queryStates()));
  const scoped = Effect.scoped(program);
  const states = await Effect.runPromise(scoped);

  expect(states).toEqual(
    expect.arrayContaining([
      expect.objectContaining({ name: "App UI" }),
      expect.objectContaining({ name: "Tuner" }),
    ])
  );
});
