import { describe, expect, it } from "bun:test";

import {
  AUTHORED_ENGINE_ADAPTER_METHODS,
  isAuthoredEngineAdapterKey,
} from "../src/engine-adapter-authority.js";

describe("authored engine adapter authority", () => {
  it("exposes one immutable registry shared by runtime admission", () => {
    expect(Object.isFrozen(AUTHORED_ENGINE_ADAPTER_METHODS)).toBe(true);
    expect(AUTHORED_ENGINE_ADAPTER_METHODS.every(isAuthoredEngineAdapterKey)).toBe(true);
  });
});
