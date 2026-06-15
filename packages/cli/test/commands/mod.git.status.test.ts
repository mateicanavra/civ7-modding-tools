import { beforeEach, describe, expect, test, vi } from "vitest";

vi.mock("../../src/utils/git", () => ({
  findRemoteNameForSlug: vi.fn().mockResolvedValue("cfg-remote"),
  getRemotePushConfig: vi.fn(),
  logRemotePushConfig: vi.fn(),
}));

vi.mock("@civ7/plugin-mods", () => ({
  getModStatus: vi
    .fn()
    .mockResolvedValue({ repoRoot: "/tmp", modsPrefix: "mods/foo", remoteName: "cfg-remote" }),
}));

import { getModStatus } from "@civ7/plugin-mods";
import ModGitStatus from "../../src/commands/mod/git/status";

describe("mod git status command", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("invokes getModStatus for slug", async () => {
    await ModGitStatus.run(["foo"]);
    expect(getModStatus).toHaveBeenCalledWith({ slug: "foo", branch: undefined, verbose: false });
  });
});
