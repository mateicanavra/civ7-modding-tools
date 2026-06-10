import { describe, expect, test } from "vitest";

import { isStudioServerRpcPath } from "../../src/server/studioServer/rpcPath";

describe("Studio server RPC path gate", () => {
  test("matches the full /rpc path before Connect can strip the mount prefix", () => {
    expect(isStudioServerRpcPath("/rpc/studio/serverInfo")).toBe(true);
    expect(isStudioServerRpcPath("/rpc")).toBe(true);
  });

  test("leaves legacy API and Vite app paths for later middleware", () => {
    expect(isStudioServerRpcPath("/api/studio/server-info")).toBe(false);
    expect(isStudioServerRpcPath("/")).toBe(false);
    expect(isStudioServerRpcPath(undefined)).toBe(false);
  });
});
